const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ectecnoponto-default-rtdb.firebaseio.com',
});

const middlewares = jsonServer.defaults();

server.use(middlewares);

server.use(
  jsonServer.rewriter({
    "/*": "/$1",
  })
);

// Função para ajustar a hora para Brasília (GMT-3)
function ajustarHoraParaBrasilia(data) {
  const dataBrasilia = new Date(data);
  dataBrasilia.setHours(dataBrasilia.getHours() - 3); // Ajuste para GMT-3
  return dataBrasilia;
}

// Defina a rota para recuperar dados de batidas de ponto por funcionário, mês e dia
// Defina a rota para recuperar todas as batidas de um mês específico
server.get('/batidas_de_ponto/:usuario/:ano/:mes', (req, res) => {
  const usuario = req.params.usuario;
  const ano = parseInt(req.params.ano);
  const mes = parseInt(req.params.mes);

  if (!usuario || !ano || !mes) {
    return res.status(400).json({ error: 'Parâmetros inválidos na URL' });
  }

  const db = admin.database();
  const ref = db.ref(`batidas_de_ponto/${usuario}/${ano}/${mes}`);

  ref.once('value', (snapshot) => {
    const data = snapshot.val();
    res.json(data);
  });
});

server.get('/registrar_ponto', (req, res) => {
  const usuario = req.query.usuario; // ID do funcionário
  const dataHoraBrasilia = ajustarHoraParaBrasilia(new Date());
  const hora = dataHoraBrasilia.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const ano = dataHoraBrasilia.getFullYear();
  const mes = dataHoraBrasilia.getMonth() + 1; // Mês começa em 0
  const dia = dataHoraBrasilia.getDate();

  if (!usuario) {
    return res.status(400).json({ error: 'Parâmetro "usuario" é obrigatório na URL' });
  }

  const db = admin.database();
  const refUsuario = db.ref(`funcionario/${usuario}`); // Referência ao usuário

  // Verifique o status do usuário
  refUsuario.once('value', (snapshotUsuario) => {
    const usuarioData = snapshotUsuario.val();

    if (!usuarioData) {
      return res.status(400).json({ error: 'Usuário não encontrado.' });
    }

    const statusUsuario = usuarioData.status;

    if (statusUsuario !== 'Ativo') {
      return res.status(400).json({ error: 'Usuário inativo. Não é possível registrar ponto.' });
    }

    const ref = db.ref(`batidas_de_ponto/${usuario}/${ano}/${mes}/${dia}`);

    // Verifique o número de batidas já registradas para o dia
    ref.once('value', (snapshot) => {
      const batidasDoDia = snapshot.numChildren();

      if (batidasDoDia >= 10) {
        return res.status(400).json({ error: 'Limite de batidas de ponto para o dia atingido (máximo 10).' });
      }

      // Determine o nome da variável para a nova batida
      const nomeVariavelNovaBatida = `batida${batidasDoDia + 1}`;
      const horaAtual = hora;

      const novaBatida = {
        data_hora: horaAtual,
      };

      // Use `child` para definir a nova batida
      ref.child(nomeVariavelNovaBatida).set(novaBatida, (error) => {
        if (error) {
          console.error('Erro ao registrar ponto:', error);
          res.status(500).json({ error: 'Erro interno do servidor' });
        } else {
          res.json({ message: 'Batida de ponto registrada com sucesso!' });
        }
      });
    });
  });
});

// Defina a rota para listar todos os funcionários com seus nomes e IDs
server.get('/funcionario', (req, res) => {
  const db = admin.database();
  const ref = db.ref('funcionario'); // Use o nome correto da tabela, que é 'funcionario'.

  ref.once('value', (snapshot) => {
    const funcionarios = snapshot.val();
    if (!funcionarios) {
      return res.status(404).json({ error: 'Nenhum funcionário encontrado.' });
    }

    const funcionariosList = Object.values(funcionarios).map(funcionario => ({
      id: funcionario.tag, // Use o campo 'tag' como o ID
      name: funcionario.name
    }));

    res.json(funcionariosList);
  });
});

server.get('/funcionario/:usuario', (req, res) => {
  const usuario = req.params.usuario;
  if (!usuario) {
    return res.status(400).json({ error: 'Parâmetro "usuario" é obrigatório na URL' });
  }

  const db = admin.database();
  const ref = db.ref('funcionario'); // Use o nome correto da tabela, que é 'funcionario'.

  ref.once('value', (snapshot) => {
    const funcionarios = snapshot.val();
    if (!funcionarios) {
      return res.status(404).json({ error: 'Nenhum funcionário encontrado.' });
    }

    const funcionario = funcionarios[usuario];

    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado.' });
    }

    res.json(funcionario);
  });
});


server.use(router);

server.listen(3000, () => {
  console.log("JSON Server is running");
});
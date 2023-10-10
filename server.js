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

// Defina a rota para registrar ponto
server.get('/registrar_ponto', (req, res) => {
  const usuario = req.query.usuario; // ID do funcionário
  const dataHoraBrasilia = ajustarHoraParaBrasilia(new Date());
  const ano = dataHoraBrasilia.getFullYear();
  const mes = dataHoraBrasilia.getMonth() + 1; // Mês começa em 0
  const dia = dataHoraBrasilia.getDate();

  if (!usuario) {
    return res.status(400).json({ error: 'Parâmetro "usuario" é obrigatório na URL' });
  }

  const db = admin.database();
  const ref = db.ref(`batidas_de_ponto/${usuario}/${ano}/${mes}/${dia}`);

  // Verifique o número de batidas já registradas para o dia
  ref.once('value', (snapshot) => {
    const batidasDoDia = snapshot.numChildren();

    if (batidasDoDia >= 4) {
      return res.status(400).json({ error: 'Limite de batidas de ponto para o dia atingido (máximo 4).' });
    }

    if (batidasDoDia > 0) {
      // Se já houver pelo menos uma batida registrada, verifique o tempo entre a última batida e a atual
      snapshot.forEach((childSnapshot) => {
        const batida = childSnapshot.val();
        const horaRegistrada = new Date(batida.data_hora);
        const diferencaMinutos = Math.abs((dataHoraBrasilia - horaRegistrada) / 60000);

        if (diferencaMinutos < 5) {
          return res.status(400).json({ error: 'Tempo mínimo entre batidas não atingido (mínimo 5 minutos).' });
        }
      });
    }

    const horaFormatada = dataHoraBrasilia.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dataFormatada = dataHoraBrasilia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const horaAtual = `${horaFormatada} - ${dataFormatada}`;

    // Determine o nome da variável para a nova batida
    const nomeVariavelNovaBatida = `data_hora${batidasDoDia + 1}`;

    const novaBatida = {
      [nomeVariavelNovaBatida]: horaAtual,
    };

    ref.push(novaBatida, (error) => {
      if (error) {
        console.error('Erro ao registrar ponto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
      } else {
        res.json({ message: 'Batida de ponto registrada com sucesso!' });
      }
    });
  });
});

server.use(router);

server.listen(3000, () => {
  console.log("JSON Server is running");
});

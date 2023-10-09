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
  const usuario = req.query.usuario;

  if (!usuario) {
    return res.status(400).json({ error: 'Parâmetro "usuario" é obrigatório na URL' });
  }

  const db = admin.database();
  const ref = db.ref('batidas_de_ponto');

  const dataHoraBrasilia = ajustarHoraParaBrasilia(new Date());
  const horaFormatada = dataHoraBrasilia.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dataFormatada = dataHoraBrasilia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const horaAtual = `${horaFormatada} - ${dataFormatada}`;

  const novaBatida = {
    usuario,
    data_hora: horaAtual,
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

server.use(router);

server.listen(3000, () => {
  console.log("JSON Server is running");
});

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

// Função para obter a hora atual formatada no fuso horário de Brasília
function obterHoraFormatadaBrasilia() {
  const dataAtual = new Date();
  const options = {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  return dataAtual.toLocaleString('pt-BR', options);
}

// Defina a rota para registrar ponto
server.post('/registrar_ponto', (req, res) => {
  const { usuario } = req.body;

  if (!usuario) {
    return res.status(400).json({ error: 'Parâmetro "usuario" é obrigatório no corpo da solicitação' });
  }

  const db = admin.database();
  const ref = db.ref('batidas_de_ponto');

  const horaAtualBrasilia = obterHoraFormatadaBrasilia();

  const novaBatida = {
    usuario,
    data_hora: horaAtualBrasilia,
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

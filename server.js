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

// Função para formatar a data e hora no fuso horário de Brasília
function getHoraBrasilia() {
  const now = new Date();
  const hora = now.getHours().toString().padStart(2, '0');
  const minutos = now.getMinutes().toString().padStart(2, '0');
  const dia = now.getDate().toString().padStart(2, '0');
  const mes = (now.getMonth() + 1).toString().padStart(2, '0'); // Os meses começam em 0
  const ano = now.getFullYear();
  return `${hora}:${minutos} - ${dia}/${mes}/${ano}`;
}

// Defina a rota para registrar ponto
server.get('/registrar_ponto', (req, res) => {
  const usuario = req.query.usuario;

  if (!usuario) {
    return res.status(400).json({ error: 'Parâmetro "usuario" é obrigatório na URL' });
  }

  const db = admin.database();
  const ref = db.ref('batidas_de_ponto');

  const horaAtual = getHoraBrasilia();

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

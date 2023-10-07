const express = require('express');
const admin = require('firebase-admin');
const jsonServer = require('json-server');
const serviceAccount = require('./serviceAccountKey.json'); // Substitua pelo caminho para seu arquivo de chave de serviço do Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ectecnoponto-default-rtdb.firebaseio.com', // Substitua pelo URL do seu banco de dados Firebase
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Rota para registrar uma batida de ponto via URL
app.get('/registrar_ponto', (req, res) => {
  const usuario = req.query.usuario; // Lê o parâmetro 'usuario' da URL

  if (!usuario) {
    return res.status(400).json({ error: 'Parâmetro "usuario" é obrigatório na URL' });
  }

  const db = admin.database();
  const ref = db.ref('batidas_de_ponto');

  const novaBatida = {
    usuario,
    data_hora: new Date().toString(),
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

// Configuração do JSON Server
const serverJson = jsonServer.create();
const routerJson = jsonServer.router('db.json');
const middlewaresJson = jsonServer.defaults();

serverJson.use(middlewaresJson);
serverJson.use(jsonServer.rewriter({
  "/*": "/$1",
}));
serverJson.use(routerJson);

// Inicie ambos os servidores
app.listen(port, () => {
  console.log(`Servidor Express rodando na porta ${port}`);
});

serverJson.listen(3001, () => {
  console.log('JSON Server está rodando na porta 3001');
});

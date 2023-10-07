const express = require('express');
const admin = require('firebase-admin');
const app = express();

const serviceAccount = require('./serviceAccountKey.json'); // Substitua pelo caminho para seu arquivo de chave de serviço do Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ectecnoponto-default-rtdb.firebaseio.com', // Substitua pelo URL do seu banco de dados Firebase
});


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

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

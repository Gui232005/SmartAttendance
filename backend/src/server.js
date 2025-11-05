// src/server.js
require('dotenv').config();
const express = require('express');
const db = require('./models');

const app = express();

app.use(express.json());

// Rotas
const funcionarioRoutes = require('./routes/funcionario');
const eventoRoutes = require('./routes/evento');

app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/eventos', eventoRoutes);

// Rota simples de teste
app.get('/', (req, res) => {
  res.send('API Sistemas-Embebidos online 🚀');
});

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    console.log('🔌 A ligar à base de dados...');
    await db.sequelize.authenticate();
    console.log('✅ Ligado à base de dados!');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor a ouvir na porta ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar o servidor:', err);
  }
}

start();

// src/server.js
require('dotenv').config();
const express = require('express');
const db = require('./models');

const app = express();

// Middleware base
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('API Sistemas-Embebidos online 🚀');
});

// Porta: Render dá sempre process.env.PORT
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    console.log('🔌 A ligar à base de dados...');
    await db.sequelize.authenticate();
    console.log('✅ Ligado à base de dados!');

    // Se quiseres, podes remover o sync em produção
    // await db.sequelize.sync();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor a ouvir na porta ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar o servidor:', err);
  }
}

start();

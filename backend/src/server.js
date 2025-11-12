// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors"); 
const db = require("./models");

const app = express();

// CORS – permite pedidos do teu frontend (localhost e, no futuro, produção)
app.use(
  cors({
    origin: [
      "http://localhost:5173", // frontend em dev
      // 'https://o-teu-front-end-em-produção.com'  <- quando tiveres
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// Rotas
const funcionarioRoutes = require("./routes/funcionario");
const eventoRoutes = require("./routes/evento");

app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/eventos", eventoRoutes);

// Rota simples de teste
app.get("/", (req, res) => {
  res.send("API Sistemas-Embebidos online 🚀");
});

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    console.log("🔌 A ligar à base de dados...");
    await db.sequelize.authenticate();
    console.log("✅ Ligado à base de dados!");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor a ouvir na porta ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar o servidor:", err);
  }
}

start();

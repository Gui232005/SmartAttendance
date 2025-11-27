// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models");

const app = express();

// ==========================================================
//  FIX ABSOLUTO DE CORS PARA RENDER
// ==========================================================
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(cors());
app.use(express.json());

// Rotas
const funcionarioRoutes = require("./routes/funcionario");
const eventoRoutes = require("./routes/evento");

app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/eventos", eventoRoutes);

app.get("/", (req, res) => {
  res.send("API Sistemas-Embebidos online 🚀");
});

// Início do servidor
const PORT = process.env.PORT || 3001;

async function start() {
  try {
    console.log("🔌 A ligar à base de dados...");
    await db.sequelize.authenticate();
    console.log("✅ Ligado à base de dados!");

    await db.sequelize.sync(); // garantir que tudo está sincronizado

    app.listen(PORT, () => {
      console.log(`🚀 Servidor a ouvir na porta ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Erro ao iniciar o servidor:", err);
  }
}

start();

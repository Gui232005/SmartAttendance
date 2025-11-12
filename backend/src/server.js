// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors"); 
const db = require("./models");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sistemas-embebidos-zpfi.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

const funcionarioRoutes = require("./routes/funcionario");
const eventoRoutes = require("./routes/evento");

app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/eventos", eventoRoutes);

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

// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models");

const app = express();

/* ============================================================
   CORS — TEM QUE VIR ANTES DE TUDO!
   ============================================================ */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sistemas-embebidos-borrachoes.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Responde automaticamente às requisições OPTIONS (pré-flight CORS)
app.options("*", cors());

/* ============================================================
   Middlewares
   ============================================================ */
app.use(express.json());

/* ============================================================
   Rotas
   ============================================================ */
const funcionarioRoutes = require("./routes/funcionario");
const eventoRoutes = require("./routes/evento");

app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/eventos", eventoRoutes);

app.get("/", (req, res) => {
  res.send("API Sistemas-Embebidos online 🚀");
});

/* ============================================================
   Iniciar Servidor
   ============================================================ */
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

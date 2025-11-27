// src/routes/evento.js
const express = require('express');
const cors = require('cors');
const router = express.Router();

router.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sistemas-embebidos-borrachoes.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

const eventoController = require('../controllers/eventocontroller');

router.get('/', eventoController.listarEventos);
router.get('/:id', eventoController.obterEvento);
router.post('/', eventoController.criarEvento);
router.put('/:id', eventoController.atualizarEvento);
router.delete('/:id', eventoController.apagarEvento);

module.exports = router;

// src/routes/funcionario.js
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

const funcionarioController = require('../controllers/funcionariocontroller');

router.get('/', funcionarioController.listarFuncionarios);
router.get('/:id', funcionarioController.obterFuncionario);
router.post('/', funcionarioController.criarFuncionario);
router.put('/:id', funcionarioController.atualizarFuncionario);
router.delete('/:id', funcionarioController.apagarFuncionario);

module.exports = router;
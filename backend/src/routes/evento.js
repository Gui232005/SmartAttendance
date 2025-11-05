// src/routes/evento.js
const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventocontroller');

router.get('/', eventoController.listarEventos);
router.get('/:id', eventoController.obterEvento);
router.post('/', eventoController.criarEvento);
router.put('/:id', eventoController.atualizarEvento);
router.delete('/:id', eventoController.apagarEvento);

module.exports = router;

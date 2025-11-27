const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionariocontroller');

router.get('/', funcionarioController.listarFuncionarios);
router.get('/:id', funcionarioController.obterFuncionario);
router.post('/', funcionarioController.criarFuncionario);
router.put('/:id', funcionarioController.atualizarFuncionario);
router.delete('/:id', funcionarioController.apagarFuncionario);

module.exports = router;
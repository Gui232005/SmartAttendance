// src/controllers/funcionariocontroller.js
const { Funcionario } = require('../models');

// GET /api/funcionarios
async function listarFuncionarios(req, res) {
  try {
    const funcionarios = await Funcionario.findAll({
      order: [['id', 'ASC']]
    });
    res.json(funcionarios);
  } catch (err) {
    console.error('Erro ao listar funcionários:', err);
    res.status(500).json({ error: 'Erro ao listar funcionários' });
  }
}

// GET /api/funcionarios/:id
async function obterFuncionario(req, res) {
  try {
    const { id } = req.params;
    const funcionario = await Funcionario.findByPk(id);

    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(funcionario);
  } catch (err) {
    console.error('Erro ao obter funcionário:', err);
    res.status(500).json({ error: 'Erro ao obter funcionário' });
  }
}

// POST /api/funcionarios
async function criarFuncionario(req, res) {
  try {
    const { nome, email, ativo } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const novo = await Funcionario.create({
      nome,
      email,
      ativo: ativo !== undefined ? ativo : true
    });

    res.status(201).json(novo);
  } catch (err) {
    console.error('Erro ao criar funcionário:', err);

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Já existe um funcionário com esse email' });
    }

    res.status(500).json({ error: 'Erro ao criar funcionário' });
  }
}

// PUT /api/funcionarios/:id
async function atualizarFuncionario(req, res) {
  try {
    const { id } = req.params;
    const { nome, email, ativo } = req.body;

    const funcionario = await Funcionario.findByPk(id);
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    funcionario.nome = nome ?? funcionario.nome;
    funcionario.email = email ?? funcionario.email;
    if (ativo !== undefined) funcionario.ativo = ativo;

    await funcionario.save();

    res.json(funcionario);
  } catch (err) {
    console.error('Erro ao atualizar funcionário:', err);
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
}

// DELETE /api/funcionarios/:id
async function apagarFuncionario(req, res) {
  try {
    const { id } = req.params;

    const funcionario = await Funcionario.findByPk(id);
    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    await funcionario.destroy();

    res.json({ message: 'Funcionário apagado com sucesso' });
  } catch (err) {
    console.error('Erro ao apagar funcionário:', err);
    res.status(500).json({ error: 'Erro ao apagar funcionário' });
  }
}

module.exports = {
  listarFuncionarios,
  obterFuncionario,
  criarFuncionario,
  atualizarFuncionario,
  apagarFuncionario
};

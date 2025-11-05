// src/controllers/eventocontroller.js
const { Evento, Funcionario } = require('../models');

// GET /api/eventos
// opcional: ?funcionario_id=1 para filtrar por funcionário
async function listarEventos(req, res) {
  try {
    const { funcionario_id } = req.query;

    const where = {};
    if (funcionario_id) {
      where.funcionario_id = funcionario_id;
    }

    const eventos = await Evento.findAll({
      where,
      order: [['instante', 'DESC']],
      include: [
        {
          model: Funcionario,
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    res.json(eventos);
  } catch (err) {
    console.error('Erro ao listar eventos:', err);
    res.status(500).json({ error: 'Erro ao listar eventos' });
  }
}

// GET /api/eventos/:id
async function obterEvento(req, res) {
  try {
    const { id } = req.params;

    const evento = await Evento.findByPk(id, {
      include: [
        {
          model: Funcionario,
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json(evento);
  } catch (err) {
    console.error('Erro ao obter evento:', err);
    res.status(500).json({ error: 'Erro ao obter evento' });
  }
}

// POST /api/eventos
async function criarEvento(req, res) {
  try {
    const { funcionario_id, tipo, origem, conf, observacoes } = req.body;

    if (!tipo) {
      return res.status(400).json({ error: 'Tipo de evento é obrigatório' });
    }

    const novo = await Evento.create({
      funcionario_id: funcionario_id || null,
      tipo,
      origem: origem || 'EDGE',
      conf: conf ?? null,
      observacoes: observacoes || null
    });

    res.status(201).json(novo);
  } catch (err) {
    console.error('Erro ao criar evento:', err);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
}

// PUT /api/eventos/:id
async function atualizarEvento(req, res) {
  try {
    const { id } = req.params;
    const { funcionario_id, tipo, origem, conf, revisto, observacoes } = req.body;

    const evento = await Evento.findByPk(id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (funcionario_id !== undefined) evento.funcionario_id = funcionario_id;
    if (tipo !== undefined) evento.tipo = tipo;
    if (origem !== undefined) evento.origem = origem;
    if (conf !== undefined) evento.conf = conf;
    if (revisto !== undefined) evento.revisto = revisto;
    if (observacoes !== undefined) evento.observacoes = observacoes;

    await evento.save();

    res.json(evento);
  } catch (err) {
    console.error('Erro ao atualizar evento:', err);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
}

// DELETE /api/eventos/:id
async function apagarEvento(req, res) {
  try {
    const { id } = req.params;

    const evento = await Evento.findByPk(id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    await evento.destroy();

    res.json({ message: 'Evento apagado com sucesso' });
  } catch (err) {
    console.error('Erro ao apagar evento:', err);
    res.status(500).json({ error: 'Erro ao apagar evento' });
  }
}

module.exports = {
  listarEventos,
  obterEvento,
  criarEvento,
  atualizarEvento,
  apagarEvento
};

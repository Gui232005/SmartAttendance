const express = require("express");
const router = express.Router();
const Evento = require("../models/evento");

router.get("/", async (_req, res) =>
  res.json(await Evento.findAll({ order: [["timestamp", "DESC"]] }))
);
router.post("/", async (req, res) =>
  res.status(201).json(await Evento.create(req.body))
);

module.exports = router;

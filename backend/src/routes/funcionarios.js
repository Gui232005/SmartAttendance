const express = require("express");
const router = express.Router();
const Funcionario = require("../models/funcionario");

router.get("/", async (_req, res) => res.json(await Funcionario.findAll()));
router.post("/", async (req, res) =>
  res.status(201).json(await Funcionario.create(req.body))
);

module.exports = router;

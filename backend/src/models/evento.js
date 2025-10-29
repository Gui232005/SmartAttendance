const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const Evento = sequelize.define("Evento", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  funcionario_id: { type: DataTypes.INTEGER, allowNull: false },
  tipo: { type: DataTypes.STRING, allowNull: false }, // ENTRADA/SAIDA/...
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  conf: { type: DataTypes.FLOAT },
  origem: { type: DataTypes.STRING },
  revisto: { type: DataTypes.BOOLEAN, defaultValue: false },
  observacoes: { type: DataTypes.STRING },
});
module.exports = Evento;

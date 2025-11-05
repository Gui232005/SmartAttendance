// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// Importar modelos
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Funcionario = require('./funcionario')(sequelize, DataTypes);
db.FaceTemplate = require('./facetemplate')(sequelize, DataTypes);
db.Evento = require('./evento')(sequelize, DataTypes);
db.UtilizadorApp = require('./utilizadorapp')(sequelize, DataTypes);

// Criar associações
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;

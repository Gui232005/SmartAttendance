const { DataTypes } = require('sequelize'); const { sequelize } = require('../db');
const Funcionario = sequelize.define('Funcionario', {
  id:{type:DataTypes.INTEGER,autoIncrement:true,primaryKey:true},
  nome:{type:DataTypes.STRING,allowNull:false},
  email:{type:DataTypes.STRING,unique:true},
  ativo:{type:DataTypes.BOOLEAN,defaultValue:true}
});
module.exports = Funcionario;

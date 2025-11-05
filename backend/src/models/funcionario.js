// models/funcionario.js
module.exports = (sequelize, DataTypes) => {
  const Funcionario = sequelize.define('Funcionario', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    criado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    atualizado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'funcionario',
    timestamps: false
  });

  Funcionario.associate = models => {
    Funcionario.hasMany(models.FaceTemplate, { foreignKey: 'funcionario_id' });
    Funcionario.hasMany(models.Evento, { foreignKey: 'funcionario_id' });
    Funcionario.hasOne(models.UtilizadorApp, { foreignKey: 'funcionario_id' });
  };

  return Funcionario;
};

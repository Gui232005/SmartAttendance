// models/utilizadorapp.js
module.exports = (sequelize, DataTypes) => {
  const UtilizadorApp = sequelize.define('UtilizadorApp', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    perfil: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    funcionario_id: {
      type: DataTypes.INTEGER
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
    tableName: 'utilizador_app',
    timestamps: false
  });

  UtilizadorApp.associate = models => {
    UtilizadorApp.belongsTo(models.Funcionario, { foreignKey: 'funcionario_id' });
  };

  return UtilizadorApp;
};

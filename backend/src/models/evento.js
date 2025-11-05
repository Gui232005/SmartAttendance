// models/evento.js
module.exports = (sequelize, DataTypes) => {
  const Evento = sequelize.define('Evento', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    funcionario_id: {
      type: DataTypes.INTEGER
    },
    tipo: {
      type: DataTypes.ENUM('ENTRADA', 'SAIDA', 'ALMOCO_IN', 'ALMOCO_OUT', 'CORRECAO'),
      allowNull: false
    },
    instante: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    origem: {
      type: DataTypes.STRING(30),
      defaultValue: 'EDGE'
    },
    conf: {
      type: DataTypes.FLOAT
    },
    revisto: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    observacoes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'evento',
    timestamps: false
  });

  Evento.associate = models => {
    Evento.belongsTo(models.Funcionario, { foreignKey: 'funcionario_id' });
  };

  return Evento;
};

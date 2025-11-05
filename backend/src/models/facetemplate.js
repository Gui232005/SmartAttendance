// models/facetemplate.js
module.exports = (sequelize, DataTypes) => {
  const FaceTemplate = sequelize.define('FaceTemplate', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    funcionario_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    embedding_vector: {
      type: DataTypes.ARRAY(DataTypes.DOUBLE),
      allowNull: false
    },
    qualidade: {
      type: DataTypes.FLOAT
    },
    thumbnail_path: {
      type: DataTypes.TEXT
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    criado_em: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'face_template',
    timestamps: false
  });

  FaceTemplate.associate = models => {
    FaceTemplate.belongsTo(models.Funcionario, { foreignKey: 'funcionario_id' });
  };

  return FaceTemplate;
};

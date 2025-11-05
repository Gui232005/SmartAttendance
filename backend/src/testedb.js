// testdb.js
const db = require('./models');

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Ligação à base de dados com sucesso.');
    await db.sequelize.sync({ alter: true }); // cria as tabelas se não existirem
    console.log('📦 Sincronização completa.');
  } catch (error) {
    console.error('❌ Erro na ligação:', error);
  } finally {
    await db.sequelize.close();
  }
})();

const sequelize = require("../src/config/connection");

jest.setTimeout(30000);

beforeAll(async () => {
  try {

    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    await sequelize.sync({ force: true });
    console.log('Tabelas sincronizadas para testes.');
  } catch (error) {
    console.error('Erro ao configurar banco de dados para testes:', error);
  }
});


afterEach(async () => {
  try {

    const models = Object.values(sequelize.models);
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    for (const model of models) {
      await model.destroy({ 
        where: {},
        truncate: true,
        cascade: true 
      });
    }
    
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (error) {
    console.error('Erro ao limpar dados de teste:', error);
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
    console.log('Conexão com banco de dados fechada.');
  } catch (error) {
    console.error('Erro ao fechar conexão:', error);
  }
});
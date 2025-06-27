const sequelize = require("../config/connection");
const models = require("../models"); // <-- Isso importa o index.js automaticamente

(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Tabelas sincronizadas com sucesso!");
  } catch (error) {
    console.error("Erro ao sincronizar:", error);
  } finally {
    await sequelize.close();
  }
})();

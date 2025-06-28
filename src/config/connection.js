const { Sequelize } = require("sequelize")
require("dotenv").config();

const connection = new Sequelize({
    dialect: "mysql",
    database: process.env.DB_NAME || "projeto_backend",
    host: process.env.DB_HOST || "localhost",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "2607",
    port: 3306
})

module.exports = connection;
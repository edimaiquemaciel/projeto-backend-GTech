const { Sequelize } = require("sequelize")
require("dotenv").config();

const connection = new Sequelize({
    dialect: "mysql",
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: 3306
})

module.exports = connection;
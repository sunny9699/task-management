const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();
console.log( process.env.DB_PASSWORD, ' process.env.DB_PASSWORD');

const connection = new Sequelize({
    database: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
});

module.exports = connection;
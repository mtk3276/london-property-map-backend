const { Client } = require("pg");
require("dotenv").config();

const dbUser = process.env.DB_USER;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbPassword = process.env.DB_PASSWORD;

const client = new Client({
    user: dbUser,
    host: dbHost,
    database: dbName,
    password: dbPassword,
    port: 5432,
    idleTimeoutMillis: 60000,
});

client.connect()
    .then(() => console.log("Connected to PostgreSQL database"))
    .catch(err => console.error("Connection error: ", err.stack));

module.exports = client;
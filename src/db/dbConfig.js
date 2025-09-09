const { Pool } = require("pg");
require("dotenv").config();

const dbUser = process.env.DB_USER;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;
const dbSsl = process.env.DB_SSL;

// Configure SSL properly
const sslConfig = dbSsl === 'true' ? { rejectUnauthorized: false } : false;

const pool = new Pool({
    user: dbUser,
    host: dbHost,
    database: dbName,
    password: dbPassword,
    port: dbPort,
    ssl: sslConfig,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10, // Maximum number of clients in pool
    min: 2,  // Minimum number of clients in pool
    acquireTimeoutMillis: 60000,
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Database pool error:', err);
});

pool.on('connect', () => {
    console.log(`Connected to PostgreSQL database ${dbName} on ${dbHost}`);
});

// Test the connection
pool.connect()
    .then(client => {
        console.log('Database connection pool established successfully');
        client.release();
    })
    .catch(err => {
        console.error("Connection error: ", err.stack);
        process.exit(1);
    });

module.exports = pool;
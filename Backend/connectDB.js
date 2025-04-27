const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from Backend folder
dotenv.config({ path: path.join(__dirname, '.env') });

// Safe check: Make sure all required env variables are loaded
const requiredEnv = ['MYSQL_HOST', 'MYSQL_USERNAME', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];

requiredEnv.forEach((name) => {
    if (!process.env[name]) {
        console.error(`❌ Missing required environment variable: ${name}`);
        process.exit(1); // Force exit if something missing
    }
});

// Debugging: Check loaded environment variables
// console.log('🔎 ENV Variables:', {
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USERNAME,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE
// });

// Create database connection
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Connect to database
connection.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        throw err;
    }
    console.log(`✅ Connected to DB: ${process.env.MYSQL_DATABASE}`);
});

module.exports = connection;

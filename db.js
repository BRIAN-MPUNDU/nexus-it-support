const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing. Check your .env file.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : false
});

module.exports = pool;
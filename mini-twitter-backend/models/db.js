const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
 port: Number(process.env.DB_PORT),  // 👈 Convert to number
 ssl: {
    rejectUnauthorized: false // ✅ Accept Amazon RDS self-signed cert
  }
});

// 🔍 Add this test connection and error logger
pool.connect()
  .then(() => console.log("✅ DB connected successfully"))
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);  // Force exit if DB fails
  });

module.exports = pool;

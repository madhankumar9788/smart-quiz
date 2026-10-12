const mysql = require('mysql2/promise');
require('dotenv').config();

// Create MySQL connection pool matching XAMPP smart_quiz database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_quiz',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection helper
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] Connected successfully to MySQL database: "${process.env.DB_NAME || 'smart_quiz'}"`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[DB] Connection failed: ', error.message);
    console.error('[DB] Tip: Make sure XAMPP MySQL is running and verify DB credentials in .env');
    return false;
  }
};

module.exports = {
  pool,
  query: (sql, params) => pool.execute(sql, params),
  testConnection
};

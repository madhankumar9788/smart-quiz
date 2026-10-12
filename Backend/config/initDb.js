const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const initDatabase = async () => {
  const dbName = process.env.DB_NAME || 'smart_quiz';
  console.log(`[DB Init] Initializing database "${dbName}"...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
    });

    // Check users
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('[DB Init] Seeding demo admin and student accounts...');
      const adminPass = await bcrypt.hash('admin123', 10);
      const studentPass = await bcrypt.hash('student123', 10);

      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
        [
          'Admin User', 'admin@smartquiz.com', adminPass, 'admin',
          'John Student', 'student@smartquiz.com', studentPass, 'student'
        ]
      );
    }

    console.log('[DB Init] Verified tables & baseline accounts.');
  } catch (error) {
    console.error('[DB Init] Error: ', error.message);
  } finally {
    if (connection) await connection.end();
  }
};

if (require.main === module) {
  initDatabase().then(() => process.exit(0));
}

module.exports = initDatabase;

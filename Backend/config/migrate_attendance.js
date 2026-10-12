const { query } = require('./db');

async function migrate() {
  try {
    await query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'teacher', 'student') DEFAULT 'student'");
    console.log('[Migration] users.role ENUM updated to include teacher.');
  } catch (err) {
    console.error('[Migration] users.role error:', err.message);
  }

  try {
    await query("ALTER TABLE users ADD COLUMN class_name VARCHAR(50) DEFAULT 'CSE-III'");
    console.log('[Migration] users.class_name added.');
  } catch (err) {
    console.log('[Migration] users.class_name note:', err.message);
  }

  try {
    await query("ALTER TABLE users ADD COLUMN section VARCHAR(20) DEFAULT 'A'");
    console.log('[Migration] users.section added.');
  } catch (err) {
    console.log('[Migration] users.section note:', err.message);
  }

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_name VARCHAR(50) DEFAULT 'CSE-III',
        section VARCHAR(20) DEFAULT 'A',
        date DATE NOT NULL,
        status ENUM('Present', 'Absent', 'Late') DEFAULT 'Present',
        remarks VARCHAR(255) DEFAULT '',
        marked_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_student_date (student_id, date),
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('[Migration] attendance table created successfully.');
  } catch (err) {
    console.error('[Migration] attendance error:', err.message);
  }

  // Update existing students with sample classes and sections if null or default
  try {
    await query("UPDATE users SET class_name = 'CSE-III', section = 'A' WHERE (class_name IS NULL OR class_name = '') AND role = 'student'");
    console.log('[Migration] Existing student classes initialized.');
  } catch (err) {
    console.log('[Migration] update error:', err.message);
  }

  process.exit(0);
}

migrate();

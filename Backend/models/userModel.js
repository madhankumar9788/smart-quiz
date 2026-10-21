const { query } = require('../config/db');

const UserModel = {
  // Find user by email
  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = String(email).trim().toLowerCase();
    const [rows] = await query('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?', [cleanEmail]);
    return rows[0] || null;
  },

  // Find user by ID (excludes password)
  async findById(id) {
    const [rows] = await query(
      'SELECT id, name, email, role, class_name, section, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Create new user in users table (name, email, password, role, class_name, section)
  async create({ name, email, password, role = 'student', class_name = 'CSE-III', section = 'A' }) {
    const validRole = ['admin', 'teacher', 'student'].includes(role) ? role : 'student';
    const [result] = await query(
      'INSERT INTO users (name, email, password, role, class_name, section) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, validRole, class_name || 'CSE-III', section || 'A']
    );
    return {
      id: result.insertId,
      name,
      email,
      role: validRole,
      class_name: class_name || 'CSE-III',
      section: section || 'A'
    };
  },

  // Get all users (admin & teacher overview)
  async findAll() {
    const [rows] = await query(
      'SELECT id, name, email, role, class_name, section, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  },

  // Update user details
  async update(id, { name, role, class_name, section }) {
    const [result] = await query(
      'UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role), class_name = COALESCE(?, class_name), section = COALESCE(?, section) WHERE id = ?',
      [name, role, class_name, section, id]
    );
    return result.affectedRows > 0;
  },

  // Delete user by ID
  async delete(id) {
    const [result] = await query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = UserModel;

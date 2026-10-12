const { query } = require('../config/db');

const QuizModel = {
  // Get all quizzes with creator name and extra fields
  async findAll({ category } = {}) {
    let sql = `
      SELECT 
        q.id,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        q.duration,
        q.total_questions,
        q.passing_percentage,
        q.status,
        q.created_by,
        q.created_at,
        u.name AS creator_name,
        COUNT(ques.id) AS actual_questions_count
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.id
      LEFT JOIN questions ques ON q.id = ques.quiz_id
    `;
    const params = [];

    if (category && category !== 'All') {
      sql += ' WHERE q.category = ?';
      params.push(category);
    }

    sql += ' GROUP BY q.id ORDER BY q.created_at DESC';

    const [rows] = await query(sql, params);
    return rows;
  },

  // Get single quiz by ID with full fields
  async findById(id) {
    const sql = `
      SELECT 
        q.id,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        q.duration,
        q.total_questions,
        q.passing_percentage,
        q.status,
        q.created_by,
        q.created_at,
        u.name AS creator_name,
        COUNT(ques.id) AS actual_questions_count
      FROM quizzes q
      LEFT JOIN users u ON q.created_by = u.id
      LEFT JOIN questions ques ON q.id = ques.quiz_id
      WHERE q.id = ?
      GROUP BY q.id
    `;
    const [rows] = await query(sql, [id]);
    return rows[0] || null;
  },

  // Create new quiz with extra fields (difficulty, passing_percentage, status)
  async create({
    title,
    description,
    category = 'General',
    difficulty = 'Beginner',
    duration = 10,
    total_questions = 0,
    passing_percentage = 40,
    status = 'Active',
    created_by
  }) {
    const [result] = await query(
      `INSERT INTO quizzes 
        (title, description, category, difficulty, duration, total_questions, passing_percentage, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        category,
        difficulty,
        duration,
        total_questions,
        passing_percentage,
        status,
        created_by
      ]
    );
    return {
      id: result.insertId,
      title,
      description,
      category,
      difficulty,
      duration,
      total_questions,
      passing_percentage,
      status,
      created_by
    };
  },

  // Update quiz
  async update(id, updates) {
    const { title, description, category, difficulty, duration, total_questions, passing_percentage, status } = updates;
    const [result] = await query(
      `UPDATE quizzes 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           category = COALESCE(?, category),
           difficulty = COALESCE(?, difficulty),
           duration = COALESCE(?, duration),
           total_questions = COALESCE(?, total_questions),
           passing_percentage = COALESCE(?, passing_percentage),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [title, description, category, difficulty, duration, total_questions, passing_percentage, status, id]
    );
    return result.affectedRows > 0;
  },

  // Delete quiz
  async delete(id) {
    const [result] = await query('DELETE FROM quizzes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = QuizModel;

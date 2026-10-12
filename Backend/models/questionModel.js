const { query } = require('../config/db');

const QuestionModel = {
  // Find questions by quiz ID.
  async findByQuizId(quizId, includeAnswer = false) {
    const fields = includeAnswer
      ? 'id, quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, marks, explanation'
      : 'id, quiz_id, question, option_a, option_b, option_c, option_d, marks';

    const [rows] = await query(
      `SELECT ${fields} FROM questions WHERE quiz_id = ? ORDER BY id ASC`,
      [quizId]
    );
    return rows;
  },

  // Find question by ID
  async findById(id) {
    const [rows] = await query('SELECT * FROM questions WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Create question matching schema
  async create({ quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, marks = 1, explanation = '' }) {
    const [result] = await query(
      `INSERT INTO questions 
        (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, marks, explanation) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [quiz_id, question, option_a, option_b, option_c, option_d, correct_answer.toUpperCase(), marks, explanation]
    );

    // Update total_questions count in quizzes table
    await query('UPDATE quizzes SET total_questions = (SELECT COUNT(*) FROM questions WHERE quiz_id = ?) WHERE id = ?', [quiz_id, quiz_id]);

    return {
      id: result.insertId,
      quiz_id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer: correct_answer.toUpperCase(),
      marks,
      explanation
    };
  },

  // Update question
  async update(id, { question, option_a, option_b, option_c, option_d, correct_answer, marks, explanation }) {
    const [result] = await query(
      `UPDATE questions 
       SET question = COALESCE(?, question),
           option_a = COALESCE(?, option_a),
           option_b = COALESCE(?, option_b),
           option_c = COALESCE(?, option_c),
           option_d = COALESCE(?, option_d),
           correct_answer = COALESCE(?, correct_answer),
           marks = COALESCE(?, marks),
           explanation = COALESCE(?, explanation)
       WHERE id = ?`,
      [
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer ? correct_answer.toUpperCase() : null,
        marks,
        explanation,
        id
      ]
    );
    return result.affectedRows > 0;
  },

  // Delete question
  async delete(id) {
    const question = await this.findById(id);
    const [result] = await query('DELETE FROM questions WHERE id = ?', [id]);
    if (question && question.quiz_id) {
      await query('UPDATE quizzes SET total_questions = (SELECT COUNT(*) FROM questions WHERE quiz_id = ?) WHERE id = ?', [question.quiz_id, question.quiz_id]);
    }
    return result.affectedRows > 0;
  }
};

module.exports = QuestionModel;

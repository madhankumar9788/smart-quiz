const { query } = require('../config/db');

const AttemptModel = {
  // Create quiz attempt record in attempts table
  async create({ quiz_id, student_id, score, total_questions, started_at, submitted_at }) {
    const [result] = await query(
      `INSERT INTO attempts (quiz_id, student_id, score, total_questions, started_at, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        quiz_id,
        student_id,
        score,
        total_questions,
        started_at || new Date(),
        submitted_at || new Date()
      ]
    );
    return result.insertId;
  },

  // Check if student has already completed a quiz (1 attempt rule)
  async findByStudentAndQuiz(studentId, quizId) {
    const [rows] = await query(
      `SELECT a.*, ROUND((a.score / NULLIF(a.total_questions, 0)) * 100, 2) AS percentage 
       FROM attempts a 
       WHERE a.student_id = ? AND a.quiz_id = ? 
       ORDER BY a.submitted_at DESC LIMIT 1`,
      [studentId, quizId]
    );
    return rows[0] || null;
  },

  // Insert answers breakdown in answers table
  async insertAnswers(attemptId, answers) {
    if (!answers || answers.length === 0) return;

    for (const a of answers) {
      if (a.question_id && a.selected_answer) {
        await query(
          'INSERT INTO answers (attempt_id, question_id, selected_answer) VALUES (?, ?, ?)',
          [attemptId, a.question_id, a.selected_answer]
        );
      }
    }
  },

  // Get single attempt by ID with questions & answers breakdown
  async findById(attemptId) {
    const [attemptRows] = await query(
      `SELECT a.*, q.title AS quiz_title, u.name AS student_name, u.email AS student_email
       FROM attempts a
       JOIN quizzes q ON a.quiz_id = q.id
       JOIN users u ON a.student_id = u.id
       WHERE a.id = ?`,
      [attemptId]
    );

    if (attemptRows.length === 0) return null;

    const attempt = attemptRows[0];

    // Fetch answer details
    const [answerRows] = await query(
      `SELECT ans.id, ans.question_id, ans.selected_answer,
              ques.question, ques.option_a, ques.option_b, ques.option_c, ques.option_d, ques.correct_answer,
              (ans.selected_answer = ques.correct_answer) AS is_correct
       FROM answers ans
       JOIN questions ques ON ans.question_id = ques.id
       WHERE ans.attempt_id = ?`,
      [attemptId]
    );

    attempt.answers = answerRows;
    return attempt;
  },

  // Get attempts by student ID
  async findByStudentId(studentId) {
    const [rows] = await query(
      `SELECT a.id, a.quiz_id, a.score, a.total_questions, a.started_at, a.submitted_at,
              q.title AS quiz_title, q.category AS quiz_category,
              ROUND((a.score / NULLIF(a.total_questions, 0)) * 100, 2) AS percentage
       FROM attempts a
       JOIN quizzes q ON a.quiz_id = q.id
       WHERE a.student_id = ?
       ORDER BY a.submitted_at DESC`,
      [studentId]
    );
    return rows;
  },

  // Get leaderboard for a specific quiz
  async getLeaderboard(quizId, limit = 10) {
    const [rows] = await query(
      `SELECT a.id, a.student_id, u.name AS student_name, a.score, a.total_questions,
              ROUND((a.score / NULLIF(a.total_questions, 0)) * 100, 2) AS percentage,
              a.submitted_at
       FROM attempts a
       JOIN users u ON a.student_id = u.id
       WHERE a.quiz_id = ?
       ORDER BY percentage DESC, a.submitted_at ASC
       LIMIT ?`,
      [quizId, Number(limit)]
    );
    return rows;
  },

  // Overall Departmental Monthly Leaderboard (Aggregated performance)
  async getOverallLeaderboard(limit = 25) {
    const [rows] = await query(
      `SELECT u.id AS student_id, u.name AS student_name, u.email AS student_email,
              COUNT(a.id) AS quizzes_attempted,
              COALESCE(SUM(a.score), 0) AS total_score,
              COALESCE(SUM(a.total_questions), 0) AS total_questions,
              ROUND(AVG((a.score / NULLIF(a.total_questions, 0)) * 100), 2) AS avg_percentage,
              MAX(a.submitted_at) AS last_active
       FROM attempts a
       JOIN users u ON a.student_id = u.id
       GROUP BY u.id, u.name, u.email
       ORDER BY avg_percentage DESC, total_score DESC, last_active ASC
       LIMIT ?`,
      [Number(limit)]
    );
    return rows;
  },

  // Admin stats: get all recent attempts across all quizzes
  async getAllRecent(limit = 20) {
    const [rows] = await query(
      `SELECT a.id, a.quiz_id, q.title AS quiz_title, a.student_id, u.name AS student_name,
              a.score, a.total_questions,
              ROUND((a.score / NULLIF(a.total_questions, 0)) * 100, 2) AS percentage,
              a.submitted_at
       FROM attempts a
       JOIN quizzes q ON a.quiz_id = q.id
       JOIN users u ON a.student_id = u.id
       ORDER BY a.submitted_at DESC
       LIMIT ?`,
      [Number(limit)]
    );
    return rows;
  }
};

module.exports = AttemptModel;

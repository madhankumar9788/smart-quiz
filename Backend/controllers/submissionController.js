const AttemptModel = require('../models/submissionModel');
const QuestionModel = require('../models/questionModel');
const QuizModel = require('../models/quizModel');

// Submit quiz answers, evaluate against correct_answer, and save to attempts & answers tables
const submitQuiz = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { answers = [], started_at } = req.body;
    const studentId = req.user.id;

    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    // College examination rule: 1 attempt per student
    const existingAttempt = await AttemptModel.findByStudentAndQuiz(studentId, quizId);
    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this examination. Only 1 attempt is allowed.'
      });
    }

    // Retrieve questions with correct answers for grading
    const questions = await QuestionModel.findByQuizId(quizId, true);
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This quiz has no questions available.'
      });
    }

    // Map student's chosen answers
    const answerMap = new Map();
    answers.forEach((item) => {
      const qId = Number(item.questionId || item.question_id);
      const choice = item.selectedAnswer || item.selected_answer || item.selectedOption;
      if (qId && choice) {
        answerMap.set(qId, choice.toString().toUpperCase());
      }
    });

    let earnedScore = 0;
    const answerRecords = [];
    const breakdown = [];

    // Grade each question
    for (const q of questions) {
      const selected = answerMap.get(q.id) || null;
      const isCorrect = selected === q.correct_answer;

      if (isCorrect) {
        earnedScore += 1;
      }

      answerRecords.push({
        question_id: q.id,
        selected_answer: selected || 'A' // default option fallback for DB enum
      });

      breakdown.push({
        question_id: q.id,
        question: q.question,
        selected_answer: selected,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation || ''
      });
    }

    const totalQuestions = questions.length;
    const percentage = Number(((earnedScore / totalQuestions) * 100).toFixed(2));
    const isPassed = percentage >= (quiz.passing_percentage || 40);

    // Save into attempts table
    const attemptId = await AttemptModel.create({
      quiz_id: Number(quizId),
      student_id: studentId,
      score: earnedScore,
      total_questions: totalQuestions,
      started_at: started_at ? new Date(started_at) : new Date(),
      submitted_at: new Date()
    });

    // Save into answers table
    await AttemptModel.insertAnswers(attemptId, answerRecords);

    res.status(201).json({
      success: true,
      message: 'Quiz submitted and evaluated successfully.',
      result: {
        attempt_id: attemptId,
        quiz_id: Number(quizId),
        quiz_title: quiz.title,
        score: earnedScore,
        total_questions: totalQuestions,
        percentage,
        passed: isPassed,
        passing_percentage: quiz.passing_percentage || 40,
        breakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// Student's attempt history
const getMyHistory = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const history = await AttemptModel.findByStudentId(studentId);

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    next(error);
  }
};

// Check if current user attempted a specific quiz
const checkQuizAttempt = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { quizId } = req.params;
    const attempt = await AttemptModel.findByStudentAndQuiz(studentId, quizId);

    res.status(200).json({
      success: true,
      has_attempted: Boolean(attempt),
      attempt: attempt || null
    });
  } catch (error) {
    next(error);
  }
};

// Single attempt details
const getAttemptDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attempt = await AttemptModel.findById(id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found.'
      });
    }

    if (req.user.role !== 'admin' && attempt.student_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to view this attempt.'
      });
    }

    res.status(200).json({
      success: true,
      attempt
    });
  } catch (error) {
    next(error);
  }
};

// Quiz leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const { limit = 10 } = req.query;

    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    const leaderboard = await AttemptModel.getLeaderboard(quizId, limit);

    res.status(200).json({
      success: true,
      quiz_id: Number(quizId),
      quiz_title: quiz.title,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// Overall Monthly Department Leaderboard
const getOverallLeaderboard = async (req, res, next) => {
  try {
    const { limit = 25 } = req.query;
    const leaderboard = await AttemptModel.getOverallLeaderboard(limit);

    // Calculate current month cycle
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysLeft = Math.max(0, endOfMonth.getDate() - now.getDate());

    res.status(200).json({
      success: true,
      cycle: {
        month: monthName,
        resetsInDays: daysLeft,
        description: 'Monthly Departmental Standings — Evaluated across HTML5, CSS3 & JavaScript modules'
      },
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};

// Admin: get all attempts across all students (admin role only)
const getAllAttempts = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin access only.' });
    }

    const { limit = 200, quiz_id, student_search } = req.query;
    const { query } = require('../config/db');

    let sql = `
      SELECT a.id, a.quiz_id, q.title AS quiz_title, q.category AS quiz_category,
             a.student_id, u.name AS student_name, u.email AS student_email,
             a.score, a.total_questions,
             ROUND((a.score / NULLIF(a.total_questions, 0)) * 100, 2) AS percentage,
             CASE WHEN ROUND((a.score / NULLIF(a.total_questions, 0)) * 100, 2) >= q.passing_percentage THEN 'Passed' ELSE 'Failed' END AS status,
             a.submitted_at
      FROM attempts a
      JOIN quizzes q ON a.quiz_id = q.id
      JOIN users u ON a.student_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (quiz_id) {
      sql += ' AND a.quiz_id = ?';
      params.push(Number(quiz_id));
    }

    if (student_search) {
      sql += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${student_search}%`, `%${student_search}%`);
    }

    sql += ' ORDER BY a.submitted_at DESC LIMIT ?';
    params.push(Number(limit));

    const [rows] = await query(sql, params);

    res.status(200).json({
      success: true,
      count: rows.length,
      attempts: rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitQuiz,
  getMyHistory,
  getAllAttempts,
  checkQuizAttempt,
  getAttemptDetails,
  getLeaderboard,
  getOverallLeaderboard
};

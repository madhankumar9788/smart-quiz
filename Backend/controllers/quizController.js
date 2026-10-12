const QuizModel = require('../models/quizModel');
const { query } = require('../config/db');

// Get all quizzes (with dynamic per-student attempt status)
const getAllQuizzes = async (req, res, next) => {
  try {
    const { category } = req.query;
    const quizzes = await QuizModel.findAll({ category });

    let attemptsMap = new Map();
    if (req.user && req.user.id) {
      const [userAttempts] = await query(
        `SELECT id, quiz_id, score, total_questions, ROUND((score / NULLIF(total_questions, 0)) * 100, 2) AS percentage 
         FROM attempts WHERE student_id = ?`,
        [req.user.id]
      );
      userAttempts.forEach(a => attemptsMap.set(a.quiz_id, a));
    }

    const enrichedQuizzes = quizzes.map(q => {
      const att = attemptsMap.get(q.id);
      return {
        ...q,
        is_attempted: Boolean(att),
        my_attempt: att || null
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedQuizzes.length,
      quizzes: enrichedQuizzes
    });
  } catch (error) {
    next(error);
  }
};

// Get single quiz by ID (with dynamic attempt status)
const getQuizById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quiz = await QuizModel.findById(id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    let myAttempt = null;
    if (req.user && req.user.id) {
      const [userAttempts] = await query(
        `SELECT id, quiz_id, score, total_questions, ROUND((score / NULLIF(total_questions, 0)) * 100, 2) AS percentage 
         FROM attempts WHERE student_id = ? AND quiz_id = ? LIMIT 1`,
        [req.user.id, id]
      );
      if (userAttempts.length > 0) {
        myAttempt = userAttempts[0];
      }
    }

    res.status(200).json({
      success: true,
      quiz: {
        ...quiz,
        is_attempted: Boolean(myAttempt),
        my_attempt: myAttempt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new quiz
const createQuiz = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, duration, passing_percentage, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Quiz title is required.'
      });
    }

    const newQuiz = await QuizModel.create({
      title,
      description: description || '',
      category: category || 'Programming',
      difficulty: difficulty || 'Beginner',
      duration: duration ? Number(duration) : 15,
      total_questions: 0,
      passing_percentage: passing_percentage ? Number(passing_percentage) : 40,
      status: status || 'Active',
      created_by: req.user ? req.user.id : null
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully.',
      quiz: newQuiz
    });
  } catch (error) {
    next(error);
  }
};

// Update existing quiz
const updateQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, duration, total_questions, passing_percentage, status } = req.body;

    const existingQuiz = await QuizModel.findById(id);
    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    if (req.user.role !== 'admin' && existingQuiz.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to modify this quiz.'
      });
    }

    await QuizModel.update(id, {
      title,
      description,
      category,
      difficulty,
      duration,
      total_questions,
      passing_percentage,
      status
    });

    const updatedQuiz = await QuizModel.findById(id);

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully.',
      quiz: updatedQuiz
    });
  } catch (error) {
    next(error);
  }
};

// Delete quiz
const deleteQuiz = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingQuiz = await QuizModel.findById(id);
    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found.'
      });
    }

    if (req.user.role !== 'admin' && existingQuiz.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to delete this quiz.'
      });
    }

    await QuizModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz
};

const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const questionController = require('../controllers/questionController');
const submissionController = require('../controllers/submissionController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// Quiz CRUD routes
router.get('/', optionalAuth, quizController.getAllQuizzes);
router.get('/:id', optionalAuth, quizController.getQuizById);
router.post('/', authenticateToken, quizController.createQuiz);
router.put('/:id', authenticateToken, quizController.updateQuiz);
router.delete('/:id', authenticateToken, quizController.deleteQuiz);

// Quiz Questions routes
router.get('/:quizId/questions', optionalAuth, questionController.getQuestionsForQuiz);
router.post('/:quizId/questions', authenticateToken, questionController.addQuestionToQuiz);
router.post('/:quizId/questions/bulk', authenticateToken, questionController.bulkAddQuestionsToQuiz);

// Quiz Submission & Leaderboard routes
router.post('/:quizId/submit', authenticateToken, submissionController.submitQuiz);
router.get('/:quizId/check-attempt', authenticateToken, submissionController.checkQuizAttempt);
router.get('/:quizId/leaderboard', submissionController.getLeaderboard);

module.exports = router;

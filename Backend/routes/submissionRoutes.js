const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Admin: get ALL attempts across all students (admin only)
router.get('/', authenticateToken, submissionController.getAllAttempts);

// Overall Monthly Department Leaderboard (Public / Student view)
router.get('/overall-leaderboard', submissionController.getOverallLeaderboard);

// Student's quiz attempt history
router.get('/my-history', authenticateToken, submissionController.getMyHistory);

// Detailed view of a past attempt
router.get('/:id', authenticateToken, submissionController.getAttemptDetails);

module.exports = router;

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Update question by ID
router.put('/:id', authenticateToken, questionController.updateQuestion);

// Delete question by ID
router.delete('/:id', authenticateToken, questionController.deleteQuestion);

module.exports = router;

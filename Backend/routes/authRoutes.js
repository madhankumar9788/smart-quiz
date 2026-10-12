const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

// Admin User Management routes
router.get('/users', authenticateToken, authController.getAllUsers);
router.post('/users', authenticateToken, authController.createUserByAdmin);
router.put('/users/:id', authenticateToken, authController.updateUserByAdmin);
router.post('/users/bulk', authenticateToken, authController.bulkCreateUsersByAdmin);
router.delete('/users/:id', authenticateToken, authController.deleteUserByAdmin);

module.exports = router;

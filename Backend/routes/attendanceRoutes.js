const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protected Attendance Routes (Admin & Teacher)
router.get('/', authenticateToken, attendanceController.getAttendance);
router.post('/', authenticateToken, attendanceController.markAttendance);
router.get('/summary', authenticateToken, attendanceController.getAttendanceSummary);

module.exports = router;

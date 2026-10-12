const AttendanceModel = require('../models/attendanceModel');

// Get attendance for a specific date, class, and section
const getAttendance = async (req, res, next) => {
  try {
    const { date, class_name, section } = req.query;
    const today = date || new Date().toISOString().split('T')[0];

    const records = await AttendanceModel.getByDate({
      date: today,
      class_name: class_name || 'All',
      section: section || 'All'
    });

    res.status(200).json({
      success: true,
      date: today,
      count: records.length,
      records
    });
  } catch (error) {
    next(error);
  }
};

// Mark / Submit attendance (supports single or array batch)
const markAttendance = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only administrators can mark attendance.'
      });
    }

    const { records, student_id, date, status, class_name, section, remarks } = req.body;

    if (Array.isArray(records) && records.length > 0) {
      const count = await AttendanceModel.bulkMark({
        records,
        marked_by: req.user.id
      });
      return res.status(200).json({
        success: true,
        message: `Attendance submitted for ${count} students successfully.`,
        count
      });
    }

    if (!student_id || !date) {
      return res.status(400).json({
        success: false,
        message: 'student_id and date are required.'
      });
    }

    await AttendanceModel.mark({
      student_id,
      date,
      status: status || 'Present',
      class_name: class_name || 'CSE-III',
      section: section || 'A',
      remarks: remarks || '',
      marked_by: req.user.id
    });

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get attendance summary report
const getAttendanceSummary = async (req, res, next) => {
  try {
    const { class_name, section } = req.query;

    const summary = await AttendanceModel.getSummary({
      class_name: class_name || 'All',
      section: section || 'All'
    });

    res.status(200).json({
      success: true,
      count: summary.length,
      summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  markAttendance,
  getAttendanceSummary
};

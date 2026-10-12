const { query } = require('../config/db');

const AttendanceModel = {
  // Get attendance by date, class, and section
  async getByDate({ date, class_name, section }) {
    let sql = `
      SELECT 
        u.id as student_id,
        u.name as student_name,
        u.email as student_email,
        COALESCE(a.class_name, u.class_name, '') as class_name,
        COALESCE(a.section, u.section, 'A') as section,
        a.id as attendance_id,
        COALESCE(a.date, ?) as date,
        COALESCE(a.status, 'Present') as status,
        COALESCE(a.remarks, '') as remarks,
        a.created_at
      FROM users u
      LEFT JOIN attendance a ON u.id = a.student_id AND a.date = ?
      WHERE u.role = 'student'
    `;
    const params = [date, date];

    if (class_name && class_name !== 'All') {
      sql += ` AND (u.class_name = ? OR a.class_name = ?)`;
      params.push(class_name, class_name);
    }

    if (section && section !== 'All') {
      sql += ` AND (u.section = ? OR a.section = ?)`;
      params.push(section, section);
    }

    sql += ` ORDER BY u.name ASC`;

    const [rows] = await query(sql, params);
    return rows;
  },

  // Mark/Upsert single attendance record
  async mark({ student_id, date, status = 'Present', class_name = '', section = 'A', remarks = '', marked_by }) {
    const validStatus = ['Present', 'Absent', 'Late'].includes(status) ? status : 'Present';
    const [result] = await query(
      `INSERT INTO attendance (student_id, date, status, class_name, section, remarks, marked_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         status = VALUES(status),
         class_name = VALUES(class_name),
         section = VALUES(section),
         remarks = VALUES(remarks),
         marked_by = VALUES(marked_by)`,
      [student_id, date, validStatus, class_name, section, remarks, marked_by || null]
    );
    return result;
  },

  // Bulk mark attendance for entire roster
  async bulkMark({ records, marked_by }) {
    let successCount = 0;
    for (const rec of records) {
      if (!rec.student_id || !rec.date) continue;
      await this.mark({
        student_id: rec.student_id,
        date: rec.date,
        status: rec.status || 'Present',
        class_name: rec.class_name || '',
        section: rec.section || 'A',
        remarks: rec.remarks || '',
        marked_by
      });
      successCount++;
    }
    return successCount;
  },

  // Get attendance statistical summary by class
  async getSummary({ class_name, section }) {
    let sql = `
      SELECT 
        u.id as student_id,
        u.name as student_name,
        u.email as student_email,
        u.class_name,
        u.section,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) as late_days,
        ROUND(
          (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id), 0)) * 100, 
          1
        ) as attendance_percentage
      FROM users u
      LEFT JOIN attendance a ON u.id = a.student_id
      WHERE u.role = 'student'
    `;
    const params = [];

    if (class_name && class_name !== 'All') {
      sql += ` AND u.class_name = ?`;
      params.push(class_name);
    }
    if (section && section !== 'All') {
      sql += ` AND u.section = ?`;
      params.push(section);
    }

    sql += ` GROUP BY u.id ORDER BY u.name ASC`;
    const [rows] = await query(sql, params);
    return rows;
  }
};

module.exports = AttendanceModel;

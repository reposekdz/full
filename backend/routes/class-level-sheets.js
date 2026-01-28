const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/classes', async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT 
        c.id,
        c.class_name,
        c.trade_name,
        c.level,
        COUNT(DISTINCT s.id) as total_students
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id AND s.status = 'active'
      GROUP BY c.id, c.class_name, c.trade_name, c.level
      ORDER BY c.trade_name, c.level
    `);
    
    res.json({ success: true, classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch classes' });
  }
});

router.get('/classes/:classId/sheet', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const [students] = await db.query(`
      SELECT 
        s.*,
        AVG(COALESCE(g.score, 0)) as average_score
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id
      WHERE s.class_id = ? AND s.status != 'graduated'
      GROUP BY s.id
      ORDER BY s.last_name, s.first_name
    `, [classId]);
    
    const [columns] = await db.query(`
      SELECT * FROM class_sheet_columns
      WHERE class_id = ?
      ORDER BY display_order, created_at
    `, [classId]);
    
    const [customData] = await db.query(`
      SELECT * FROM class_sheet_data
      WHERE class_id = ?
    `, [classId]);
    
    const dataMap = {};
    customData.forEach(item => {
      if (!dataMap[item.student_id]) {
        dataMap[item.student_id] = {};
      }
      dataMap[item.student_id][item.column_name] = item.value;
    });
    
    students.forEach(student => {
      student.custom_data = dataMap[student.id] || {};
    });
    
    res.json({ success: true, students, columns });
  } catch (error) {
    console.error('Error fetching class sheet:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch class sheet' });
  }
});

router.get('/classes/:classId/statistics', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT s.id) as total_students,
        SUM(CASE WHEN s.gender = 'M' THEN 1 ELSE 0 END) as male_students,
        SUM(CASE WHEN s.gender = 'F' THEN 1 ELSE 0 END) as female_students,
        AVG(COALESCE(g.score, 0)) as average_performance,
        COUNT(DISTINCT g.id) as total_assessments,
        COALESCE(SUM(sp.amount_paid), 0) as total_fees_collected,
        COALESCE(SUM(sp.total_fees - sp.amount_paid), 0) as total_fees_pending,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as total_present,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as total_absent
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id
      LEFT JOIN student_payments sp ON s.id = sp.student_id
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE s.class_id = ? AND s.status != 'graduated'
    `, [classId]);
    
    res.json({ 
      success: true, 
      statistics: stats[0] || {
        total_students: 0,
        male_students: 0,
        female_students: 0,
        average_performance: 0,
        total_assessments: 0,
        total_fees_collected: 0,
        total_fees_pending: 0,
        total_present: 0,
        total_absent: 0
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

router.post('/classes/:classId/students', async (req, res) => {
  try {
    const { classId } = req.params;
    const studentData = req.body;
    
    const [result] = await db.query(`
      INSERT INTO students (
        student_id, first_name, last_name, email, phone,
        date_of_birth, gender, address, parent_phone, parent_email,
        class_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `, [
      studentData.student_id,
      studentData.first_name,
      studentData.last_name,
      studentData.email,
      studentData.phone,
      studentData.date_of_birth,
      studentData.gender,
      studentData.address,
      studentData.parent_phone,
      studentData.parent_email,
      classId
    ]);
    
    res.json({ success: true, message: 'Student added successfully', studentId: result.insertId });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ success: false, message: 'Failed to add student' });
  }
});

router.delete('/classes/:classId/students/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    await db.query(`
      UPDATE students SET status = 'inactive' WHERE id = ?
    `, [studentId]);
    
    res.json({ success: true, message: 'Student removed successfully' });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ success: false, message: 'Failed to remove student' });
  }
});

router.post('/classes/:classId/students/:studentId/graduate', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { graduation_date, archived_by_role, archived_by_id } = req.body;
    
    await db.query(`
      UPDATE students 
      SET status = 'graduated', 
          graduation_date = ?,
          archived_by_role = ?,
          archived_by_id = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [graduation_date, archived_by_role, archived_by_id, studentId]);
    
    res.json({ success: true, message: 'Student graduated successfully' });
  } catch (error) {
    console.error('Error graduating student:', error);
    res.status(500).json({ success: false, message: 'Failed to graduate student' });
  }
});

router.post('/classes/:classId/columns', async (req, res) => {
  try {
    const { classId } = req.params;
    const { column_name, column_type, is_calculated, calculation_formula, added_by_role } = req.body;
    
    const [result] = await db.query(`
      INSERT INTO class_sheet_columns (
        class_id, column_name, column_type, is_calculated,
        calculation_formula, added_by_role, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [classId, column_name, column_type, is_calculated, calculation_formula, added_by_role]);
    
    res.json({ success: true, message: 'Column added successfully', columnId: result.insertId });
  } catch (error) {
    console.error('Error adding column:', error);
    res.status(500).json({ success: false, message: 'Failed to add column' });
  }
});

router.put('/classes/:classId/students/:studentId/data', async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const { data } = req.body;
    
    for (const [columnName, value] of Object.entries(data)) {
      await db.query(`
        INSERT INTO class_sheet_data (
          class_id, student_id, column_name, value, updated_at
        ) VALUES (?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()
      `, [classId, studentId, columnName, value, value]);
    }
    
    res.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ success: false, message: 'Failed to update data' });
  }
});

router.post('/classes/:classId/bulk-payment', async (req, res) => {
  try {
    const { classId } = req.params;
    const { fee_amount, payment_type } = req.body;
    
    const [students] = await db.query(`
      SELECT id FROM students WHERE class_id = ? AND status = 'active'
    `, [classId]);
    
    for (const student of students) {
      await db.query(`
        INSERT INTO student_payments (
          student_id, total_fees, amount_paid, payment_type, created_at
        ) VALUES (?, ?, 0, ?, NOW())
        ON DUPLICATE KEY UPDATE total_fees = total_fees + ?
      `, [student.id, fee_amount, payment_type, fee_amount]);
    }
    
    res.json({ success: true, message: 'Bulk payment assignment successful' });
  } catch (error) {
    console.error('Error assigning bulk payment:', error);
    res.status(500).json({ success: false, message: 'Failed to assign bulk payment' });
  }
});

router.get('/classes/:classId/export', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const [students] = await db.query(`
      SELECT 
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        AVG(COALESCE(g.score, 0)) as average_score
      FROM students s
      LEFT JOIN grades g ON s.id = g.student_id
      WHERE s.class_id = ? AND s.status != 'graduated'
      GROUP BY s.id
      ORDER BY s.last_name, s.first_name
    `, [classId]);
    
    res.json({ success: true, students });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ success: false, message: 'Failed to export data' });
  }
});

module.exports = router;

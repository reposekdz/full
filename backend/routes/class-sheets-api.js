const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get class sheet by class ID
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const [sheet] = await db.query(`
      SELECT cs.*, c.name as class_name, co.name as course_name, co.code as trade_code
      FROM class_sheets cs
      JOIN classes c ON cs.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      WHERE cs.class_id = ? AND cs.status = 'active'
      ORDER BY cs.sheet_number ASC
    `, [req.params.classId]);

    const [classInfo] = await db.query(`
      SELECT c.*, co.name as course_name, co.code as trade_code
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      WHERE c.id = ?
    `, [req.params.classId]);

    res.json({ 
      success: true, 
      sheet,
      classInfo: classInfo[0],
      totalStudents: sheet.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all class sheets
router.get('/all', authenticateToken, requireRole(['admin', 'headmaster', 'dos', 'dod']), async (req, res) => {
  try {
    const [sheets] = await db.query(`
      SELECT c.id as class_id, c.name as class_name, co.name as course_name, co.code as trade_code,
             COUNT(cs.id) as student_count, c.capacity
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      LEFT JOIN class_sheets cs ON c.id = cs.class_id AND cs.status = 'active'
      GROUP BY c.id
      ORDER BY co.name, c.name
    `);

    res.json({ success: true, sheets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student in sheet
router.put('/student/:id', authenticateToken, requireRole(['admin', 'headmaster', 'dos', 'dod']), async (req, res) => {
  try {
    const { first_name, last_name, parent_phone, location, date_of_birth, gender, status } = req.body;

    await db.query(
      `UPDATE class_sheets 
       SET first_name=?, last_name=?, parent_phone=?, location=?, date_of_birth=?, gender=?, status=?
       WHERE id=?`,
      [first_name, last_name, parent_phone, location, date_of_birth, gender, status, req.params.id]
    );

    // Also update users table
    const [sheet] = await db.query('SELECT student_id FROM class_sheets WHERE id=?', [req.params.id]);
    if (sheet.length > 0) {
      await db.query(
        'UPDATE users SET first_name=?, last_name=?, parent_phone=?, address=?, date_of_birth=?, gender=? WHERE id=?',
        [first_name, last_name, parent_phone, location, date_of_birth, gender, sheet[0].student_id]
      );
    }

    res.json({ success: true, message: 'Student updated in sheet' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove student from sheet
router.delete('/student/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('UPDATE class_sheets SET status = "removed" WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Student removed from sheet' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export class sheet to CSV
router.get('/class/:classId/export', authenticateToken, async (req, res) => {
  try {
    const [sheet] = await db.query(`
      SELECT sheet_number, serial_code, first_name, last_name, parent_phone, location, 
             date_of_birth, gender, enrollment_date, status
      FROM class_sheets
      WHERE class_id = ?
      ORDER BY sheet_number ASC
    `, [req.params.classId]);

    res.json({ success: true, data: sheet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sheet statistics
router.get('/class/:classId/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_count,
        COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN status = 'removed' THEN 1 END) as removed_count
      FROM class_sheets
      WHERE class_id = ?
    `, [req.params.classId]);

    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search in sheet
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    const [results] = await db.query(`
      SELECT cs.*, c.name as class_name, co.name as course_name
      FROM class_sheets cs
      JOIN classes c ON cs.class_id = c.id
      JOIN courses co ON c.course_id = co.id
      WHERE (cs.serial_code LIKE ? OR cs.first_name LIKE ? OR cs.last_name LIKE ? OR cs.parent_phone LIKE ?)
      AND cs.status = 'active'
      ORDER BY cs.sheet_number ASC
      LIMIT 50
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update sheet numbers (reorder)
router.put('/class/:classId/reorder', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { students } = req.body; // Array of {id, sheet_number}

    for (const student of students) {
      await db.query(
        'UPDATE class_sheets SET sheet_number = ? WHERE id = ?',
        [student.sheet_number, student.id]
      );
    }

    res.json({ success: true, message: 'Sheet reordered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Print sheet (formatted for printing)
router.get('/class/:classId/print', authenticateToken, async (req, res) => {
  try {
    const [classInfo] = await db.query(`
      SELECT c.name as class_name, co.name as course_name, co.code as trade_code,
             c.capacity, c.current_enrollment
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      WHERE c.id = ?
    `, [req.params.classId]);

    const [sheet] = await db.query(`
      SELECT sheet_number, serial_code, first_name, last_name, parent_phone, 
             location, date_of_birth, gender, enrollment_date
      FROM class_sheets
      WHERE class_id = ? AND status = 'active'
      ORDER BY sheet_number ASC
    `, [req.params.classId]);

    res.json({ 
      success: true, 
      classInfo: classInfo[0],
      sheet,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

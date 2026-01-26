const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Generate unique serial code based on trade and class
async function generateSerialCode(tradeCode, classId) {
  const year = new Date().getFullYear();
  let serialCode;
  let isUnique = false;
  
  while (!isUnique) {
    const random = Math.floor(1000 + Math.random() * 9000);
    serialCode = `${tradeCode}${year}${classId}${random}`;
    const [existing] = await db.query('SELECT id FROM users WHERE serial_code = ?', [serialCode]);
    if (existing.length === 0) isUnique = true;
  }
  
  return serialCode;
}

// Get all students
router.get('/students', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT u.id, u.serial_code, u.student_id, u.parent_phone, u.address, u.is_active, u.created_at,
             c.name as class_name, co.name as course_name, co.code as trade_code
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student')
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student by ID
router.get('/students/:id', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT u.*, c.name as class_name, co.name as course_name, co.code as trade_code
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id AND e.status = 'active'
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN courses co ON c.course_id = co.id
      WHERE u.id = ? AND u.role_id = (SELECT id FROM roles WHERE name = 'student')
    `, [req.params.id]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    res.json({ success: true, student: students[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new student to class (auto-generates serial code and adds to sheet)
router.post('/students', authenticateToken, requireRole(['admin', 'headmaster', 'dos', 'dod']), async (req, res) => {
  try {
    const { class_id, first_name, last_name, parent_phone, location, date_of_birth, gender, default_password } = req.body;

    if (!class_id || !first_name || !last_name || !parent_phone || !location) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class ID, first name, last name, parent phone, and location are required' 
      });
    }

    // Get class and trade info
    const [classes] = await db.query(`
      SELECT c.id, c.name, co.code as trade_code, co.name as course_name
      FROM classes c
      JOIN courses co ON c.course_id = co.id
      WHERE c.id = ?
    `, [class_id]);

    if (classes.length === 0) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const classInfo = classes[0];
    
    // Generate unique serial code
    const serialCode = await generateSerialCode(classInfo.trade_code, class_id);

    // Hash default password
    const password = default_password || serialCode;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get student role ID
    const [roleResult] = await db.query('SELECT id FROM roles WHERE name = ?', ['student']);
    const roleId = roleResult[0].id;

    // Create user account
    const [userResult] = await db.query(
      `INSERT INTO users (serial_code, first_name, last_name, password_hash, parent_phone, address, date_of_birth, gender, role_id, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
      [serialCode, first_name, last_name, hashedPassword, parent_phone, location, date_of_birth, gender, roleId]
    );

    const studentId = userResult.insertId;

    // Get current academic year
    const [academicYear] = await db.query('SELECT id FROM academic_years WHERE is_active = true LIMIT 1');
    const academicYearId = academicYear[0]?.id;

    // Enroll student in class
    if (academicYearId) {
      await db.query(
        `INSERT INTO enrollments (student_id, class_id, academic_year_id, enrollment_date, status) 
         VALUES (?, ?, ?, CURDATE(), 'active')`,
        [studentId, class_id, academicYearId]
      );
    }

    // Get next sheet number for this class
    const [sheetCount] = await db.query(
      'SELECT COUNT(*) as count FROM class_sheets WHERE class_id = ?',
      [class_id]
    );
    const sheetNumber = sheetCount[0].count + 1;

    // Add to class sheet
    await db.query(
      `INSERT INTO class_sheets (class_id, student_id, sheet_number, serial_code, first_name, last_name, 
        parent_phone, location, date_of_birth, gender, enrollment_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'active')`,
      [class_id, studentId, sheetNumber, serialCode, first_name, last_name, parent_phone, location, date_of_birth, gender]
    );

    // Update class enrollment count
    await db.query(
      'UPDATE classes SET current_enrollment = current_enrollment + 1 WHERE id = ?',
      [class_id]
    );

    res.json({ 
      success: true, 
      message: 'Student added successfully and added to class sheet',
      student: {
        id: studentId,
        sheet_number: sheetNumber,
        serial_code: serialCode,
        first_name,
        last_name,
        default_password: password,
        class_name: classInfo.name,
        course_name: classInfo.course_name,
        parent_phone,
        location
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update student
router.put('/students/:id', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { parent_phone, location, is_active } = req.body;

    await db.query(
      'UPDATE users SET parent_phone = ?, address = ?, is_active = ? WHERE id = ?',
      [parent_phone, location, is_active, req.params.id]
    );

    res.json({ success: true, message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Transfer student to another class
router.put('/students/:id/transfer', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { new_class_id } = req.body;

    if (!new_class_id) {
      return res.status(400).json({ success: false, message: 'New class ID is required' });
    }

    // Get current enrollment
    const [currentEnrollment] = await db.query(
      'SELECT class_id FROM enrollments WHERE student_id = ? AND status = "active"',
      [req.params.id]
    );

    if (currentEnrollment.length === 0) {
      return res.status(404).json({ success: false, message: 'Student enrollment not found' });
    }

    const oldClassId = currentEnrollment[0].class_id;

    // Update enrollment
    await db.query(
      'UPDATE enrollments SET class_id = ? WHERE student_id = ? AND status = "active"',
      [new_class_id, req.params.id]
    );

    // Update class counts
    await db.query('UPDATE classes SET current_enrollment = current_enrollment - 1 WHERE id = ?', [oldClassId]);
    await db.query('UPDATE classes SET current_enrollment = current_enrollment + 1 WHERE id = ?', [new_class_id]);

    res.json({ success: true, message: 'Student transferred successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete student (soft delete)
router.delete('/students/:id', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    await db.query('UPDATE users SET is_active = false WHERE id = ?', [req.params.id]);
    await db.query('UPDATE enrollments SET status = "dropped" WHERE student_id = ? AND status = "active"', [req.params.id]);
    
    res.json({ success: true, message: 'Student deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset student password
router.put('/students/:id/reset-password', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { new_password } = req.body;

    // Get student serial code
    const [students] = await db.query('SELECT serial_code FROM users WHERE id = ?', [req.params.id]);
    
    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Use provided password or serial code as default
    const password = new_password || students[0].serial_code;
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.params.id]);

    res.json({ 
      success: true, 
      message: 'Password reset successfully',
      new_password: password
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get students by class
router.get('/classes/:classId/students', authenticateToken, requireRole(['admin', 'headmaster', 'dos', 'teacher']), async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT u.id, u.serial_code, u.parent_phone, u.address, u.is_active, e.enrollment_date
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      WHERE e.class_id = ? AND e.status = 'active'
      ORDER BY u.serial_code ASC
    `, [req.params.classId]);

    res.json({ success: true, students, count: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get students by trade/course
router.get('/courses/:courseId/students', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT u.id, u.serial_code, u.parent_phone, u.address, u.is_active, 
             c.name as class_name, e.enrollment_date
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      JOIN classes c ON e.class_id = c.id
      WHERE c.course_id = ? AND e.status = 'active'
      ORDER BY c.name, u.serial_code ASC
    `, [req.params.courseId]);

    res.json({ success: true, students, count: students.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk add students
router.post('/students/bulk', authenticateToken, requireRole(['admin', 'headmaster', 'dos']), async (req, res) => {
  try {
    const { class_id, students } = req.body;

    if (!class_id || !students || !Array.isArray(students)) {
      return res.status(400).json({ success: false, message: 'Class ID and students array required' });
    }

    // Get class info
    const [classes] = await db.query(`
      SELECT c.id, co.code as trade_code FROM classes c
      JOIN courses co ON c.course_id = co.id
      WHERE c.id = ?
    `, [class_id]);

    if (classes.length === 0) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const classInfo = classes[0];
    const [roleResult] = await db.query('SELECT id FROM roles WHERE name = ?', ['student']);
    const roleId = roleResult[0].id;
    const [academicYear] = await db.query('SELECT id FROM academic_years WHERE is_active = true LIMIT 1');
    const academicYearId = academicYear[0]?.id;

    const addedStudents = [];

    for (const student of students) {
      const { parent_phone, location } = student;
      
      if (!parent_phone || !location) continue;

      const serialCode = await generateSerialCode(classInfo.trade_code, class_id);
      const hashedPassword = await bcrypt.hash(serialCode, 10);

      const [userResult] = await db.query(
        `INSERT INTO users (serial_code, password_hash, parent_phone, address, role_id, is_active) 
         VALUES (?, ?, ?, ?, ?, true)`,
        [serialCode, hashedPassword, parent_phone, location, roleId]
      );

      if (academicYearId) {
        await db.query(
          `INSERT INTO enrollments (student_id, class_id, academic_year_id, enrollment_date, status) 
           VALUES (?, ?, ?, CURDATE(), 'active')`,
          [userResult.insertId, class_id, academicYearId]
        );
      }

      addedStudents.push({
        id: userResult.insertId,
        serial_code: serialCode,
        default_password: serialCode,
        parent_phone,
        location
      });
    }

    // Update class enrollment count
    await db.query(
      'UPDATE classes SET current_enrollment = current_enrollment + ? WHERE id = ?',
      [addedStudents.length, class_id]
    );

    res.json({ 
      success: true, 
      message: `${addedStudents.length} students added successfully`,
      students: addedStudents
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

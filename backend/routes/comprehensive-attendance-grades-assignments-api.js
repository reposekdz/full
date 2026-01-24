const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/assignments');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'submission-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/attendance', async (req, res) => {
  try {
    const { userId, classId, dateFrom, dateTo, status, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, 
             CONCAT(u.first_name, ' ', u.last_name) as student_name,
             u.student_id, u.email,
             c.name as class_name,
             s.name as subject_name
      FROM attendance a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN subjects s ON a.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (userId) {
      query += ' AND a.student_id = ?';
      params.push(userId);
    }

    if (classId) {
      query += ' AND a.class_id = ?';
      params.push(classId);
    }

    if (dateFrom) {
      query += ' AND a.date >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND a.date <= ?';
      params.push(dateTo);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT [\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    query += ' ORDER BY a.attendance_date DESC, a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [records] = await pool.query(query, params);

    res.json({
      success: true,
      data: records,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance', error: error.message });
  }
});

router.post('/attendance', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { userId, classId, subjectId, date, status, notes, markedBy } = req.body;

    if (!userId || !date || !status) {
      return res.status(400).json({ success: false, message: 'User ID, date, and status are required' });
    }

    const [existing] = await connection.query(
      'SELECT id FROM attendance WHERE user_id = ? AND date = ? AND class_id = ? AND subject_id = ?',
      [userId, date, classId || null, subjectId || null]
    );

    let result;
    if (existing.length > 0) {
      await connection.query(
        'UPDATE attendance SET status = ?, notes = ?, marked_by = ? WHERE id = ?',
        [status, notes, markedBy, existing[0].id]
      );
      result = { insertId: existing[0].id };
    } else {
      [result] = await connection.query(`
        INSERT INTO attendance (user_id, class_id, subject_id, date, status, notes, marked_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [userId, classId, subjectId, date, status, notes, markedBy]);
    }

    await connection.commit();

    const [record] = await connection.query(`
      SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM attendance a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: record[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error recording attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to record attendance', error: error.message });
  } finally {
    connection.release();
  }
});

router.post('/attendance/bulk', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { classId, subjectId, date, attendanceData, markedBy } = req.body;

    if (!date || !Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({ success: false, message: 'Date and attendance data are required' });
    }

    const results = [];

    for (const record of attendanceData) {
      const { userId, status, notes } = record;

      const [existing] = await connection.query(
        'SELECT id FROM attendance WHERE user_id = ? AND date = ? AND class_id = ? AND subject_id = ?',
        [userId, date, classId || null, subjectId || null]
      );

      if (existing.length > 0) {
        await connection.query(
          'UPDATE attendance SET status = ?, notes = ?, marked_by = ? WHERE id = ?',
          [status, notes, markedBy, existing[0].id]
        );
        results.push({ userId, action: 'updated' });
      } else {
        await connection.query(`
          INSERT INTO attendance (user_id, class_id, subject_id, date, status, notes, marked_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [userId, classId, subjectId, date, status, notes, markedBy]);
        results.push({ userId, action: 'created' });
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Attendance recorded for ${results.length} students`,
      data: results
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error recording bulk attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to record bulk attendance', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/attendance/statistics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { dateFrom, dateTo } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count,
        (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100) as attendance_percentage
      FROM attendance
      WHERE user_id = ?
    `;
    const params = [userId];

    if (dateFrom) {
      query += ' AND date >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      query += ' AND date <= ?';
      params.push(dateTo);
    }

    const [stats] = await pool.query(query, params);

    const [byMonth] = await pool.query(`
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM attendance
      WHERE user_id = ?
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, [userId]);

    res.json({
      success: true,
      data: {
        overall: stats[0],
        byMonth
      }
    });
  } catch (error) {
    console.error('Error fetching attendance statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
});

router.get('/grades', async (req, res) => {
  try {
    const { studentId, classId, subjectId, examType, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT g.*, 
             CONCAT(u.first_name, ' ', u.last_name) as student_name,
             u.student_id,
             c.name as class_name,
             s.name as subject_name,
             CONCAT(t.first_name, ' ', t.last_name) as teacher_name
      FROM grades g
      LEFT JOIN users u ON g.student_id = u.id
      LEFT JOIN classes c ON g.class_id = c.id
      LEFT JOIN subjects s ON g.subject_id = s.id
      LEFT JOIN users t ON g.teacher_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (studentId) {
      query += ' AND g.student_id = ?';
      params.push(studentId);
    }

    if (classId) {
      query += ' AND g.class_id = ?';
      params.push(classId);
    }

    if (subjectId) {
      query += ' AND g.subject_id = ?';
      params.push(subjectId);
    }

    if (examType) {
      query += ' AND g.exam_type = ?';
      params.push(examType);
    }

    const countQuery = query.replace(/SELECT [\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    query += ' ORDER BY g.assessment_date DESC, g.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [grades] = await pool.query(query, params);

    res.json({
      success: true,
      data: grades,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch grades', error: error.message });
  }
});

router.post('/grades', async (req, res) => {
  try {
    const { studentId, classId, subjectId, examType, examDate, grade, maxGrade, percentage, comments, teacherId } = req.body;

    if (!studentId || !subjectId || !grade) {
      return res.status(400).json({ success: false, message: 'Student ID, subject ID, and grade are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO grades (student_id, class_id, subject_id, exam_type, exam_date, grade, max_grade, percentage, comments, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [studentId, classId, subjectId, examType, examDate, grade, maxGrade, percentage, comments, teacherId]);

    const [newGrade] = await pool.query(`
      SELECT g.*, 
             CONCAT(u.first_name, ' ', u.last_name) as student_name,
             s.name as subject_name
      FROM grades g
      LEFT JOIN users u ON g.student_id = u.id
      LEFT JOIN subjects s ON g.subject_id = s.id
      WHERE g.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Grade recorded successfully',
      data: newGrade[0]
    });
  } catch (error) {
    console.error('Error recording grade:', error);
    res.status(500).json({ success: false, message: 'Failed to record grade', error: error.message });
  }
});

router.put('/grades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, maxGrade, percentage, comments } = req.body;

    const [existing] = await pool.query('SELECT * FROM grades WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Grade not found' });
    }

    const updates = [];
    const params = [];

    if (grade !== undefined) { updates.push('grade = ?'); params.push(grade); }
    if (maxGrade !== undefined) { updates.push('max_grade = ?'); params.push(maxGrade); }
    if (percentage !== undefined) { updates.push('percentage = ?'); params.push(percentage); }
    if (comments !== undefined) { updates.push('comments = ?'); params.push(comments); }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE grades SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query(`
      SELECT g.*, 
             CONCAT(u.first_name, ' ', u.last_name) as student_name,
             s.name as subject_name
      FROM grades g
      LEFT JOIN users u ON g.student_id = u.id
      LEFT JOIN subjects s ON g.subject_id = s.id
      WHERE g.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Grade updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ success: false, message: 'Failed to update grade', error: error.message });
  }
});

router.get('/grades/student/:studentId/report', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { examType, academicYearId } = req.query;

    let query = `
      SELECT g.*, 
             s.name as subject_name, s.code as subject_code, s.credits,
             c.name as class_name
      FROM grades g
      LEFT JOIN subjects s ON g.subject_id = s.id
      LEFT JOIN classes c ON g.class_id = c.id
      WHERE g.student_id = ?
    `;
    const params = [studentId];

    if (examType) {
      query += ' AND g.exam_type = ?';
      params.push(examType);
    }

    if (academicYearId) {
      query += ' AND c.academic_year_id = ?';
      params.push(academicYearId);
    }

    query += ' ORDER BY s.name ASC';

    const [grades] = await pool.query(query, params);

    const totalGrade = grades.reduce((sum, g) => sum + parseFloat(g.grade || 0), 0);
    const avgGrade = grades.length > 0 ? totalGrade / grades.length : 0;
    const avgPercentage = grades.reduce((sum, g) => sum + parseFloat(g.percentage || 0), 0) / grades.length || 0;

    res.json({
      success: true,
      data: {
        grades,
        summary: {
          totalGrades: grades.length,
          averageGrade: avgGrade.toFixed(2),
          averagePercentage: avgPercentage.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching grade report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch grade report', error: error.message });
  }
});

router.get('/assignments', async (req, res) => {
  try {
    const { classId, subjectId, teacherId, status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, 
             c.name as class_name,
             s.name as subject_name,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM assignments a
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN subjects s ON a.subject_id = s.id
      LEFT JOIN users u ON a.teacher_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (classId) {
      query += ' AND a.class_id = ?';
      params.push(classId);
    }

    if (subjectId) {
      query += ' AND a.subject_id = ?';
      params.push(subjectId);
    }

    if (teacherId) {
      query += ' AND a.teacher_id = ?';
      params.push(teacherId);
    }

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT a\.\*,[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    query += ' ORDER BY a.due_date DESC, a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [assignments] = await pool.query(query, params);

    res.json({
      success: true,
      data: assignments,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: error.message });
  }
});

router.post('/assignments', async (req, res) => {
  try {
    const { title, description, classId, subjectId, teacherId, dueDate, maxScore, attachments, instructions, status } = req.body;

    if (!title || !classId || !subjectId || !teacherId || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, class ID, subject ID, teacher ID, and due date are required' });
    }

    const [result] = await pool.query(`
      INSERT INTO assignments (title, description, class_id, subject_id, teacher_id, due_date, max_score, attachments, instructions, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, classId, subjectId, teacherId, dueDate, maxScore, JSON.stringify(attachments), instructions, status || 'active']);

    const [newAssignment] = await pool.query(`
      SELECT a.*, 
             c.name as class_name,
             s.name as subject_name,
             CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM assignments a
      LEFT JOIN classes c ON a.class_id = c.id
      LEFT JOIN subjects s ON a.subject_id = s.id
      LEFT JOIN users u ON a.teacher_id = u.id
      WHERE a.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: newAssignment[0]
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ success: false, message: 'Failed to create assignment', error: error.message });
  }
});

router.get('/assignments/:id/submissions', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT asub.*, 
             CONCAT(u.first_name, ' ', u.last_name) as student_name,
             u.student_id, u.email
      FROM assignment_submissions asub
      LEFT JOIN users u ON asub.student_id = u.id
      WHERE asub.assignment_id = ?
    `;
    const params = [id];

    if (status) {
      query += ' AND asub.status = ?';
      params.push(status);
    }

    const countQuery = query.replace(/SELECT [\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0] ? countResult[0].total : 0;

    query += ' ORDER BY asub.submitted_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [submissions] = await pool.query(query, params);

    res.json({
      success: true,
      data: submissions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching assignment submissions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
  }
});

router.post('/assignments/:id/submit', upload.single('file'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { studentId, content, notes } = req.body;

    if (!studentId) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    const [assignment] = await connection.query('SELECT * FROM assignments WHERE id = ?', [id]);
    if (assignment.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const attachmentPath = req.file ? `/uploads/assignments/${req.file.filename}` : null;

    const [existing] = await connection.query(
      'SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
      [id, studentId]
    );

    let result;
    if (existing.length > 0) {
      await connection.query(`
        UPDATE assignment_submissions 
        SET content = ?, attachment = ?, notes = ?, submitted_at = NOW(), status = 'submitted'
        WHERE id = ?
      `, [content, attachmentPath, notes, existing[0].id]);
      result = { insertId: existing[0].id };
    } else {
      [result] = await connection.query(`
        INSERT INTO assignment_submissions (assignment_id, student_id, content, attachment, notes, submitted_at, status)
        VALUES (?, ?, ?, ?, ?, NOW(), 'submitted')
      `, [id, studentId, content, attachmentPath, notes]);
    }

    await connection.commit();

    const [submission] = await connection.query(`
      SELECT asub.*, CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM assignment_submissions asub
      LEFT JOIN users u ON asub.student_id = u.id
      WHERE asub.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission[0]
    });
  } catch (error) {
    await connection.rollback();
    if (req.file) fs.unlinkSync(req.file.path);
    console.error('Error submitting assignment:', error);
    res.status(500).json({ success: false, message: 'Failed to submit assignment', error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/assignments/submissions/:id/grade', async (req, res) => {
  try {
    const { id } = req.params;
    const { score, feedback, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM assignment_submissions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const updates = [];
    const params = [];

    if (score !== undefined) { updates.push('score = ?'); params.push(score); }
    if (feedback !== undefined) { updates.push('feedback = ?'); params.push(feedback); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (updates.length > 0) {
      updates.push('graded_at = NOW()');
      params.push(id);
      await pool.query(`UPDATE assignment_submissions SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [updated] = await pool.query(`
      SELECT asub.*, CONCAT(u.first_name, ' ', u.last_name) as student_name
      FROM assignment_submissions asub
      LEFT JOIN users u ON asub.student_id = u.id
      WHERE asub.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ success: false, message: 'Failed to grade submission', error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/teacher_materials';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Upload Teacher Materials
router.post('/upload-material', upload.single('file'), async (req, res) => {
  try {
    const { teacher_id, class_id, subject_id, title, description, material_type } = req.body;
    const file_path = req.file ? req.file.path : null;
    const file_type = req.file ? req.file.mimetype : null;

    const [result] = await pool.query(`
      INSERT INTO teacher_materials (teacher_id, class_id, subject_id, title, description, material_type, file_path, file_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [teacher_id, class_id, subject_id, title, description, material_type, file_path, file_type]);

    res.json({ success: true, message: 'Ibikoresho byo kwiga byashyizweho neza', material_id: result.insertId });
  } catch (error) {
    console.error('Upload material error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add Study Link (Enhanced)
router.post('/add-study-link', async (req, res) => {
  try {
    const { teacher_id, class_id, subject_id, title, url, description, category, is_featured, tags } = req.body;

    const [result] = await pool.query(`
      INSERT INTO study_links (teacher_id, class_id, subject_id, title, url, description, category, is_featured, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [teacher_id, class_id, subject_id, title, url, description, category || 'general', is_featured || 0, tags || '']);

    res.json({ success: true, message: 'Ihuza ryo kwiga ryashyizweho neza', link_id: result.insertId });
  } catch (error) {
    console.error('Add study link error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/study-links', async (req, res) => {
  try {
    const { teacher_id, class_id, subject_id } = req.query;
    
    let query = `
      SELECT sl.*, CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        c.name as class_name, s.name as subject_name
      FROM study_links sl
      LEFT JOIN users u ON sl.teacher_id = u.id
      LEFT JOIN classes c ON sl.class_id = c.id
      LEFT JOIN subjects s ON sl.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];
    
    if (teacher_id) {
      query += ' AND sl.teacher_id = ?';
      params.push(teacher_id);
    }
    if (class_id) {
      query += ' AND sl.class_id = ?';
      params.push(class_id);
    }
    if (subject_id) {
      query += ' AND sl.subject_id = ?';
      params.push(subject_id);
    }
    
    query += ' ORDER BY sl.created_at DESC';
    
    const [links] = await pool.query(query, params);
    res.json({ success: true, links });
  } catch (error) {
    console.error('Get study links error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Study Link
router.put('/study-link/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, description, is_featured, category } = req.body;
    
    await pool.query(`
      UPDATE study_links SET 
        title = ?, url = ?, description = ?, is_featured = ?, category = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, url, description, is_featured || 0, category || 'general', id]);
    
    res.json({ success: true, message: 'Ihuza ryavuguruwe neza' });
  } catch (error) {
    console.error('Update study link error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Study Link
router.delete('/study-link/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM study_links WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Ihuza ryasibwe neza' });
  } catch (error) {
    console.error('Delete study link error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk Add Study Links
router.post('/bulk-study-links', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { teacher_id, class_id, subject_id, links } = req.body;
    // links: [{ title, url, description, category }]
    
    await connection.beginTransaction();
    
    for (const link of links) {
      await connection.query(`
        INSERT INTO study_links (teacher_id, class_id, subject_id, title, url, description, category)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [teacher_id, class_id, subject_id, link.title, link.url, link.description, link.category || 'general']);
    }
    
    await connection.commit();
    res.json({ success: true, message: `${links.length} amahurizo yashyizweho neza` });
  } catch (error) {
    await connection.rollback();
    console.error('Bulk add study links error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Get Study Link Analytics
router.get('/study-links-analytics', async (req, res) => {
  try {
    const { teacher_id } = req.query;
    
    const [[stats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_links,
        COUNT(CASE WHEN category = 'video' THEN 1 END) as video_links,
        COUNT(CASE WHEN category = 'document' THEN 1 END) as document_links,
        COUNT(CASE WHEN category = 'tutorial' THEN 1 END) as tutorial_links,
        COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_links,
        AVG(click_count) as avg_clicks
      FROM study_links
      WHERE teacher_id = ?
    `, [teacher_id]);
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Study links analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit and Auto-Calculate Grades
router.post('/submit-grades-advanced', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { class_id, subject_id, assessment_name, assessment_type, assessment_date, teacher_id, grades } = req.body;
    // grades: [{ student_id, obtained_marks, max_marks }]

    await connection.beginTransaction();

    for (const g of grades) {
      const percentage = (g.obtained_marks / g.max_marks) * 100;
      
      // Auto-calculate grade letter
      let grade_letter = 'F';
      if (percentage >= 90) grade_letter = 'A';
      else if (percentage >= 80) grade_letter = 'B';
      else if (percentage >= 70) grade_letter = 'C';
      else if (percentage >= 60) grade_letter = 'D';
      else if (percentage >= 50) grade_letter = 'E';

      await connection.query(`
        INSERT INTO grades (student_id, subject_id, class_id, assessment_type, assessment_name, max_marks, obtained_marks, percentage, grade_letter, assessment_date, teacher_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [g.student_id, subject_id, class_id, assessment_type, assessment_name, g.max_marks, g.obtained_marks, percentage, grade_letter, assessment_date, teacher_id]);
    }

    // Auto-calculate ranking for this assessment in this class
    const [rows] = await connection.query(`
      SELECT id, percentage FROM grades 
      WHERE class_id = ? AND subject_id = ? AND assessment_name = ?
      ORDER BY percentage DESC
    `, [class_id, subject_id, assessment_name]);

    for (let i = 0; i < rows.length; i++) {
      await connection.query('UPDATE grades SET ranking = ? WHERE id = ?', [i + 1, rows[i].id]);
    }

    await connection.commit();
    res.json({ success: true, message: 'Amanota yashyizweho kandi ranking yabazwe neza' });
  } catch (error) {
    await connection.rollback();
    console.error('Submit grades error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// Get Class Sheet (Student list with marks and ranking)
router.get('/class-sheet/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { subject_id, assessment_name } = req.query;

    const [students] = await pool.query(`
      SELECT u.id, u.student_id, u.serial_code, CONCAT(u.first_name, ' ', u.last_name) as name,
        g.obtained_marks, g.max_marks, g.percentage, g.grade_letter, g.ranking
      FROM users u
      LEFT JOIN grades g ON u.id = g.student_id AND g.class_id = ? AND g.subject_id = ? AND g.assessment_name = ?
      JOIN enrollments e ON u.id = e.student_id
      WHERE e.class_id = ?
      ORDER BY g.ranking ASC, u.last_name ASC
    `, [classId, subject_id, assessment_name, classId]);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Get class sheet error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Teacher's Weekly Schedule
router.get('/my-schedule/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    // 1. Get Timetable
    const [timetable] = await pool.query(`
      SELECT t.*, c.name as class_name, s.name as subject_name
      FROM timetable_entries t
      JOIN classes c ON t.class_id = c.id
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.teacher_id = ?
      ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"), start_time
    `, [teacherId]);

    // 2. Check if this teacher is a Class Teacher (Form Teacher)
    const [formClasses] = await pool.query(`
      SELECT id, name as class_name, level, section
      FROM classes 
      WHERE teacher_id = ?
    `, [teacherId]);

    res.json({
      success: true,
      schedule: timetable,
      is_class_teacher: formClasses.length > 0,
      assigned_classes: formClasses
    });
  } catch (error) {
    console.error('Schedule fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get My Students across all assigned classes
router.get('/my-students/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;

    const [students] = await pool.query(`
      SELECT DISTINCT u.id, u.student_id, CONCAT(u.first_name, ' ', u.last_name) as name,
             c.name as class_name, c.id as class_id
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      JOIN classes c ON e.class_id = c.id
      JOIN timetable_entries t ON c.id = t.class_id
      WHERE t.teacher_id = ? AND e.status = 'active'
      ORDER BY c.name, u.last_name
    `, [teacherId]);

    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Track Link Click
router.post('/track-click/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('UPDATE study_links SET click_count = click_count + 1 WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Click tracked' });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Featured Links
router.get('/featured-links', async (req, res) => {
  try {
    const { class_id, subject_id, limit = 10 } = req.query;
    
    let query = `
      SELECT sl.*, CONCAT(u.first_name, ' ', u.last_name) as teacher_name
      FROM study_links sl
      LEFT JOIN users u ON sl.teacher_id = u.id
      WHERE sl.is_featured = 1
    `;
    const params = [];
    
    if (class_id) {
      query += ' AND sl.class_id = ?';
      params.push(class_id);
    }
    if (subject_id) {
      query += ' AND sl.subject_id = ?';
      params.push(subject_id);
    }
    
    query += ' ORDER BY sl.click_count DESC, sl.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [links] = await pool.query(query, params);
    res.json({ success: true, links });
  } catch (error) {
    console.error('Get featured links error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search Links
router.get('/search-links', async (req, res) => {
  try {
    const { q, category, teacher_id, class_id, subject_id } = req.query;
    
    let query = `
      SELECT sl.*, CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
        c.name as class_name, s.name as subject_name
      FROM study_links sl
      LEFT JOIN users u ON sl.teacher_id = u.id
      LEFT JOIN classes c ON sl.class_id = c.id
      LEFT JOIN subjects s ON sl.subject_id = s.id
      WHERE 1=1
    `;
    const params = [];
    
    if (q) {
      query += ' AND (sl.title LIKE ? OR sl.description LIKE ? OR sl.tags LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (category) {
      query += ' AND sl.category = ?';
      params.push(category);
    }
    
    if (teacher_id) {
      query += ' AND sl.teacher_id = ?';
      params.push(teacher_id);
    }
    
    if (class_id) {
      query += ' AND sl.class_id = ?';
      params.push(class_id);
    }
    
    if (subject_id) {
      query += ' AND sl.subject_id = ?';
      params.push(subject_id);
    }
    
    query += ' ORDER BY sl.is_featured DESC, sl.click_count DESC, sl.created_at DESC';
    
    const [links] = await pool.query(query, params);
    res.json({ success: true, links });
  } catch (error) {
    console.error('Search links error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;
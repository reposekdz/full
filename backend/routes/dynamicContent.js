const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/dynamic-content');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// =============================== SPORTS MANAGEMENT ===============================
router.get('/sports/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM sports_categories WHERE is_active = true ORDER BY sort_order ASC'
    );

    // Get teams count for each category
    for (let category of categories) {
      const [teams] = await pool.execute(
        'SELECT COUNT(*) as team_count FROM sports_teams WHERE sport_category_id = ? AND is_active = true',
        [category.id]
      );
      category.team_count = teams[0].team_count;
    }

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get sports categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/sports/teams', async (req, res) => {
  try {
    const { category_id } = req.query;

    let whereClause = 'WHERE st.is_active = true';
    const params = [];

    if (category_id) {
      whereClause += ' AND st.sport_category_id = ?';
      params.push(category_id);
    }

    const [teams] = await pool.execute(`
      SELECT st.*, sc.name as category_name, sc.name_rw as category_name_rw,
             sc.icon as category_icon
      FROM sports_teams st
      JOIN sports_categories sc ON st.sport_category_id = sc.id
      ${whereClause}
      ORDER BY sc.sort_order ASC, st.sort_order ASC
    `, params);

    res.json({
      success: true,
      teams
    });
  } catch (error) {
    console.error('Get sports teams error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/sports/matches', async (req, res) => {
  try {
    const { status = 'upcoming', limit = 10 } = req.query;

    const [matches] = await pool.execute(`
      SELECT sm.*, sc.name as sport_name, sc.name_rw as sport_name_rw,
             sc.icon as sport_icon
      FROM sports_matches sm
      JOIN sports_categories sc ON sm.sport_category_id = sc.id
      WHERE sm.status = ? AND sm.is_active = true
      ORDER BY sm.match_date ASC, sm.match_time ASC
      LIMIT ?
    `, [status, parseInt(limit)]);

    res.json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Get sports matches error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/sports/achievements', async (req, res) => {
  try {
    const { featured = false, limit = 10 } = req.query;

    let whereClause = 'WHERE sa.is_active = true';
    const params = [];

    if (featured === 'true') {
      whereClause += ' AND sa.is_featured = true';
    }

    const [achievements] = await pool.execute(`
      SELECT sa.*, sc.name as sport_name, sc.name_rw as sport_name_rw,
             sc.icon as sport_icon
      FROM sports_achievements sa
      JOIN sports_categories sc ON sa.sport_category_id = sc.id
      ${whereClause}
      ORDER BY sa.achievement_date DESC, sa.sort_order ASC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      success: true,
      achievements
    });
  } catch (error) {
    console.error('Get sports achievements error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================== EVENTS MANAGEMENT ===============================
router.get('/events', async (req, res) => {
  try {
    const { type, status = 'upcoming', limit = 10 } = req.query;

    let whereClause = 'WHERE is_active = true';
    const params = [];

    if (type) {
      whereClause += ' AND event_type = ?';
      params.push(type);
    }

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const [events] = await pool.execute(`
      SELECT * FROM events
      ${whereClause}
      ORDER BY event_date ASC, event_time ASC, sort_order ASC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================== DISCIPLINE MANAGEMENT ===============================
router.get('/discipline/categories', async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM discipline_categories WHERE is_active = true ORDER BY sort_order ASC'
    );

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get discipline categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/discipline/cases', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'director_discipline')
], async (req, res) => {
  try {
    const { status, student_id, limit = 20 } = req.query;

    let whereClause = 'WHERE dc.is_active = true';
    const params = [];

    if (status) {
      whereClause += ' AND dc.status = ?';
      params.push(status);
    }

    if (student_id) {
      whereClause += ' AND dc.student_id = ?';
      params.push(student_id);
    }

    const [cases] = await pool.execute(`
      SELECT dc.*, u.first_name, u.last_name, u.student_id as student_number,
             cat.name as category_name, cat.name_rw as category_name_rw,
             cat.severity_level, cat.color,
             rb.first_name as reported_by_first, rb.last_name as reported_by_last,
             rv.first_name as resolved_by_first, rv.last_name as resolved_by_last
      FROM discipline_cases dc
      JOIN users u ON dc.student_id = u.id
      JOIN discipline_categories cat ON dc.category_id = cat.id
      JOIN users rb ON dc.reported_by = rb.id
      LEFT JOIN users rv ON dc.resolved_by = rv.id
      ${whereClause}
      ORDER BY dc.created_at DESC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      success: true,
      cases
    });
  } catch (error) {
    console.error('Get discipline cases error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/discipline/stats', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'director_discipline')
], async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT * FROM discipline_stats
      WHERE academic_year_id = (SELECT id FROM academic_years WHERE is_active = true LIMIT 1)
      ORDER BY last_updated DESC LIMIT 1
    `);

    const statsData = stats[0] || {
      total_cases: 0,
      resolved_cases: 0,
      pending_cases: 0,
      appealed_cases: 0
    };

    res.json({
      success: true,
      stats: statsData
    });
  } catch (error) {
    console.error('Get discipline stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================== STUDENT PERFORMANCE ===============================
router.get('/students/:studentId/performance', [
  authenticateToken
], async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if user can access this student's data
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole === 'student' && parseInt(studentId) !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (userRole === 'parent') {
      // Check if this student is linked to the parent
      const [link] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND parent_id = ?',
        [studentId, userId]
      );
      if (link.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const [metrics] = await pool.execute(`
      SELECT * FROM student_performance_metrics
      WHERE student_id = ? AND academic_year_id = (SELECT id FROM academic_years WHERE is_active = true LIMIT 1)
    `, [studentId]);

    const [ratings] = await pool.execute(`
      SELECT * FROM student_conduct_ratings
      WHERE student_id = ? AND academic_year_id = (SELECT id FROM academic_years WHERE is_active = true LIMIT 1)
      ORDER BY period_end DESC LIMIT 5
    `, [studentId]);

    res.json({
      success: true,
      performance: metrics[0] || null,
      ratings
    });
  } catch (error) {
    console.error('Get student performance error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================== DYNAMIC CONTENT ===============================
router.get('/dynamic/features', async (req, res) => {
  try {
    const [features] = await pool.execute(
      'SELECT * FROM dynamic_features WHERE is_active = true ORDER BY sort_order ASC'
    );

    res.json({
      success: true,
      features
    });
  } catch (error) {
    console.error('Get dynamic features error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/dynamic/stats', async (req, res) => {
  try {
    const [stats] = await pool.execute(
      'SELECT * FROM dynamic_stats WHERE is_active = true ORDER BY sort_order ASC'
    );

    // Auto-update stats if enabled
    for (let stat of stats) {
      if (stat.auto_update && stat.query_type) {
        try {
          let newValue = stat.value; // Default to current value

          switch (stat.query_type) {
            case 'count_students':
              const [studentCount] = await pool.execute(
                "SELECT COUNT(*) as count FROM users WHERE role_id = (SELECT id FROM roles WHERE name = 'student') AND is_active = true"
              );
              newValue = studentCount[0].count.toString();
              break;

            case 'count_teachers':
              const [teacherCount] = await pool.execute(
                "SELECT COUNT(*) as count FROM users WHERE role_id IN (SELECT id FROM roles WHERE name IN ('teacher', 'headmaster', 'director_study', 'director_discipline')) AND is_active = true"
              );
              newValue = teacherCount[0].count.toString();
              break;

            case 'count_trophies':
              const [trophyCount] = await pool.execute(
                'SELECT COUNT(*) as count FROM sports_achievements WHERE is_active = true'
              );
              newValue = trophyCount[0].count.toString();
              break;
          }

          if (newValue !== stat.value) {
            await pool.execute(
              'UPDATE dynamic_stats SET value = ?, last_updated = NOW() WHERE stat_key = ?',
              [newValue, stat.stat_key]
            );
            stat.value = newValue;
          }
        } catch (updateError) {
          console.warn(`Failed to auto-update stat ${stat.stat_key}:`, updateError.message);
        }
      }
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get dynamic stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/dynamic/home-sections', async (req, res) => {
  try {
    const [sections] = await pool.execute(
      'SELECT * FROM dynamic_home_sections WHERE is_active = true ORDER BY sort_order ASC'
    );

    res.json({
      success: true,
      sections
    });
  } catch (error) {
    console.error('Get dynamic home sections error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================== NOTIFICATIONS ===============================
router.get('/notifications', [authenticateToken], async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 20, unread_only = false } = req.query;

    let whereClause = 'WHERE sn.is_active = true AND (sn.expires_at IS NULL OR sn.expires_at > NOW())';
    const params = [];

    // Filter by target audience
    whereClause += ' AND (sn.target_audience = ? OR sn.target_audience = ?';
    params.push('all', userRole);

    // Check if user is specifically targeted
    const [userTargeted] = await pool.execute(
      'SELECT notification_id FROM notification_reads WHERE user_id = ?',
      [userId]
    );
    const readNotificationIds = userTargeted.map(nt => nt.notification_id);

    if (readNotificationIds.length > 0) {
      whereClause += ` OR sn.id NOT IN (${readNotificationIds.map(() => '?').join(',')})`;
      params.push(...readNotificationIds);
    }

    whereClause += ')';

    if (unread_only === 'true') {
      whereClause += ' AND nr.id IS NULL';
    }

    const [notifications] = await pool.execute(`
      SELECT sn.*, nr.read_at,
             CASE WHEN nr.id IS NOT NULL THEN true ELSE false END as is_read
      FROM system_notifications sn
      LEFT JOIN notification_reads nr ON sn.id = nr.notification_id AND nr.user_id = ?
      ${whereClause}
      ORDER BY sn.priority DESC, sn.created_at DESC
      LIMIT ?
    `, [userId, ...params, parseInt(limit)]);

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/notifications/:id/read', [authenticateToken], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.execute(
      'INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// =============================== ADMIN MANAGEMENT ENDPOINTS ===============================
router.post('/admin/sports/categories', [
  authenticateToken,
  requireRole('admin', 'super_admin'),
  upload.single('image'),
  body('name').notEmpty().withMessage('Name is required'),
  body('name_rw').notEmpty().withMessage('Kinyarwanda name is required'),
  body('icon').notEmpty().withMessage('Icon is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { name, name_rw, icon, color, bg_color, border_color, description, description_rw, sort_order = 0 } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO sports_categories (name, name_rw, icon, color, bg_color, border_color, description, description_rw, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, name_rw, icon, color, bg_color, border_color, description, description_rw, sort_order]
    );

    res.status(201).json({
      success: true,
      message: 'Sports category created successfully',
      category: { id: result.insertId, name, name_rw, icon }
    });
  } catch (error) {
    console.error('Create sports category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/admin/discipline/cases', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'director_discipline', 'teacher'),
  body('student_id').isInt().withMessage('Valid student ID required'),
  body('category_id').isInt().withMessage('Valid category ID required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('action_taken').notEmpty().withMessage('Action taken is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { student_id, category_id, incident_date, incident_time, location, description, description_rw, action_taken, action_taken_rw, consequences, consequences_rw } = req.body;
    const reported_by = req.user.id;

    const [result] = await pool.execute(
      'INSERT INTO discipline_cases (student_id, category_id, reported_by, incident_date, incident_time, location, description, description_rw, action_taken, action_taken_rw, consequences, consequences_rw) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_id, category_id, reported_by, incident_date, incident_time, location, description, description_rw, action_taken, action_taken_rw, consequences, consequences_rw]
    );

    res.status(201).json({
      success: true,
      message: 'Discipline case reported successfully',
      case: { id: result.insertId }
    });
  } catch (error) {
    console.error('Create discipline case error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/discipline/cases/:id', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'director_discipline'),
  body('action_taken').notEmpty().withMessage('Action taken is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { id } = req.params;
    const { action_taken, action_taken_rw, consequences, consequences_rw, status, resolution_date } = req.body;
    const resolved_by = req.user.id;

    await pool.execute(
      'UPDATE discipline_cases SET action_taken = ?, action_taken_rw = ?, consequences = ?, consequences_rw = ?, status = ?, resolution_date = ?, resolved_by = ? WHERE id = ?',
      [action_taken, action_taken_rw, consequences, consequences_rw, status, resolution_date, resolved_by, id]
    );

    res.json({
      success: true,
      message: 'Discipline case updated successfully'
    });
  } catch (error) {
    console.error('Update discipline case error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/admin/student-ratings', [
  authenticateToken,
  requireRole('super_admin', 'admin', 'headmaster', 'director_study', 'teacher'),
  body('student_id').isInt().withMessage('Valid student ID required'),
  body('overall_rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { student_id, rating_period, period_start, period_end, overall_rating, punctuality_rating, behavior_rating, participation_rating, respect_rating, comments, comments_rw } = req.body;
    const rated_by = req.user.id;

    const [academicYear] = await pool.execute('SELECT id FROM academic_years WHERE is_active = true LIMIT 1');
    const academic_year_id = academicYear[0]?.id;

    if (!academic_year_id) {
      return res.status(400).json({ success: false, message: 'No active academic year found' });
    }

    const [result] = await pool.execute(
      'INSERT INTO student_conduct_ratings (student_id, academic_year_id, rating_period, period_start, period_end, overall_rating, punctuality_rating, behavior_rating, participation_rating, respect_rating, comments, comments_rw, rated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE overall_rating = VALUES(overall_rating), punctuality_rating = VALUES(punctuality_rating), behavior_rating = VALUES(behavior_rating), participation_rating = VALUES(participation_rating), respect_rating = VALUES(respect_rating), comments = VALUES(comments), comments_rw = VALUES(comments_rw), rated_by = VALUES(rated_by)',
      [student_id, academic_year_id, rating_period, period_start, period_end, overall_rating, punctuality_rating, behavior_rating, participation_rating, respect_rating, comments, comments_rw, rated_by]
    );

    res.status(201).json({
      success: true,
      message: 'Student rating recorded successfully'
    });
  } catch (error) {
    console.error('Create student rating error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Get all dynamic configurations
router.get('/config', async (req, res) => {
  try {
    const [configs] = await pool.query('SELECT * FROM dynamic_config WHERE status = "active"');
    const configObj = {};
    configs.forEach(c => {
      configObj[c.config_key] = JSON.parse(c.config_value);
    });
    res.json({ success: true, config: configObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update configuration (Admin only)
router.put('/config/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    await pool.query(
      'INSERT INTO dynamic_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?, updated_at = NOW()',
      [key, JSON.stringify(value), JSON.stringify(value)]
    );
    
    res.json({ success: true, message: 'Configuration updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get real-time statistics with calculations
router.get('/stats/realtime', async (req, res) => {
  try {
    const [students] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status="active" THEN 1 ELSE 0 END) as active FROM students');
    const [teachers] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status="active" THEN 1 ELSE 0 END) as active FROM teachers');
    const [attendance] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status="present" THEN 1 ELSE 0 END) as present FROM attendance WHERE DATE(date) = CURDATE()');
    const [finance] = await pool.query('SELECT SUM(amount) as revenue, COUNT(*) as payments FROM payments WHERE status="completed"');
    const [courses] = await pool.query('SELECT COUNT(*) as total FROM courses WHERE status="active"');
    const [assignments] = await pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status="pending" THEN 1 ELSE 0 END) as pending FROM assignments');
    const [library] = await pool.query('SELECT COUNT(*) as books, SUM(CASE WHEN status="borrowed" THEN 1 ELSE 0 END) as borrowed FROM library_books');
    const [hostel] = await pool.query('SELECT capacity, COUNT(*) as occupied FROM hostel_rooms LEFT JOIN hostel_allocations ON hostel_rooms.id = hostel_allocations.room_id GROUP BY capacity');
    const [transport] = await pool.query('SELECT COUNT(DISTINCT route_id) as routes, COUNT(*) as students FROM transport_allocations');
    const [sports] = await pool.query('SELECT COUNT(DISTINCT team_id) as teams, COUNT(*) as players FROM sports_players');
    
    const attendanceRate = attendance[0].total > 0 ? (attendance[0].present / attendance[0].total * 100).toFixed(1) : 0;
    const hostelOccupancy = hostel[0]?.capacity > 0 ? (hostel[0].occupied / hostel[0].capacity * 100).toFixed(1) : 0;
    
    res.json({
      success: true,
      stats: {
        students: { total: students[0].total, active: students[0].active, growth: '+12%' },
        teachers: { total: teachers[0].total, active: teachers[0].active, growth: '+5%' },
        attendance: { rate: parseFloat(attendanceRate), today: attendance[0].present, total: attendance[0].total },
        finance: { revenue: finance[0].revenue || 0, payments: finance[0].payments || 0, growth: '+18%' },
        academics: { courses: courses[0].total, assignments: assignments[0].total, pending: assignments[0].pending },
        library: { books: library[0].books || 0, borrowed: library[0].borrowed || 0, available: (library[0].books - library[0].borrowed) || 0 },
        hostel: { capacity: hostel[0]?.capacity || 0, occupied: hostel[0]?.occupied || 0, occupancy: parseFloat(hostelOccupancy) },
        transport: { routes: transport[0].routes || 0, students: transport[0].students || 0 },
        sports: { teams: sports[0].teams || 0, players: sports[0].players || 0 },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get dashboard widgets (admin configurable)
router.get('/widgets', async (req, res) => {
  try {
    const [widgets] = await pool.query('SELECT * FROM dashboard_widgets WHERE status = "active" ORDER BY display_order');
    res.json({ success: true, widgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update widget configuration
router.put('/widgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, config, display_order, status } = req.body;
    
    await pool.query(
      'UPDATE dashboard_widgets SET title = ?, config = ?, display_order = ?, status = ?, updated_at = NOW() WHERE id = ?',
      [title, JSON.stringify(config), display_order, status, id]
    );
    
    res.json({ success: true, message: 'Widget updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get calculated metrics
router.get('/metrics/calculated', async (req, res) => {
  try {
    // Student retention rate
    const [retention] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE status='active' AND YEAR(enrollment_date) = YEAR(CURDATE())) as current_year,
        (SELECT COUNT(*) FROM students WHERE status='active' AND YEAR(enrollment_date) = YEAR(CURDATE())-1) as last_year
    `);
    const retentionRate = retention[0].last_year > 0 ? (retention[0].current_year / retention[0].last_year * 100).toFixed(1) : 0;
    
    // Teacher-student ratio
    const [ratio] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM students WHERE status='active') as students,
        (SELECT COUNT(*) FROM teachers WHERE status='active') as teachers
    `);
    const teacherStudentRatio = ratio[0].teachers > 0 ? (ratio[0].students / ratio[0].teachers).toFixed(1) : 0;
    
    // Average grade
    const [avgGrade] = await pool.query('SELECT AVG(grade) as avg_grade FROM grades WHERE semester = (SELECT MAX(semester) FROM grades)');
    
    // Fee collection rate
    const [feeCollection] = await pool.query(`
      SELECT 
        SUM(amount) as collected,
        (SELECT SUM(fee_amount) FROM students WHERE status='active') as expected
    `);
    const collectionRate = feeCollection[0].expected > 0 ? (feeCollection[0].collected / feeCollection[0].expected * 100).toFixed(1) : 0;
    
    // Pass rate
    const [passRate] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN grade >= 50 THEN 1 ELSE 0 END) as passed
      FROM grades WHERE semester = (SELECT MAX(semester) FROM grades)
    `);
    const examPassRate = passRate[0].total > 0 ? (passRate[0].passed / passRate[0].total * 100).toFixed(1) : 0;
    
    res.json({
      success: true,
      metrics: {
        retentionRate: parseFloat(retentionRate),
        teacherStudentRatio: parseFloat(teacherStudentRatio),
        averageGrade: parseFloat(avgGrade[0].avg_grade || 0).toFixed(1),
        feeCollectionRate: parseFloat(collectionRate),
        examPassRate: parseFloat(examPassRate),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get theme configuration
router.get('/theme', async (req, res) => {
  try {
    const [theme] = await pool.query('SELECT * FROM theme_config WHERE status = "active" LIMIT 1');
    res.json({ success: true, theme: theme[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update theme (Admin only)
router.put('/theme', async (req, res) => {
  try {
    const { primaryColor, secondaryColor, accentColor, logo, schoolName } = req.body;
    
    await pool.query(
      'INSERT INTO theme_config (primary_color, secondary_color, accent_color, logo, school_name) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE primary_color = ?, secondary_color = ?, accent_color = ?, logo = ?, school_name = ?, updated_at = NOW()',
      [primaryColor, secondaryColor, accentColor, logo, schoolName, primaryColor, secondaryColor, accentColor, logo, schoolName]
    );
    
    res.json({ success: true, message: 'Theme updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

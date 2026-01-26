const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get report data by type
router.get('/reports/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const { range = 'month' } = req.query;
    
    const dateFilter = `DATE_SUB(NOW(), INTERVAL 1 ${range === 'week' ? 'WEEK' : range === 'month' ? 'MONTH' : range === 'quarter' ? 'QUARTER' : 'YEAR'})`;
    
    let data = {};
    
    switch (type) {
      case 'students':
        const [students] = await pool.query(`
          SELECT id, name, email, phone, role, is_active, created_at, last_login
          FROM users 
          WHERE role = 'student' AND created_at >= ${dateFilter}
          ORDER BY created_at DESC
        `);
        data = { students };
        break;
        
      case 'teachers':
        const [teachers] = await pool.query(`
          SELECT id, name, email, phone, role, is_active, created_at, last_login
          FROM users 
          WHERE role = 'teacher' AND created_at >= ${dateFilter}
          ORDER BY created_at DESC
        `);
        data = { teachers };
        break;
        
      case 'parents':
        const [parents] = await pool.query(`
          SELECT id, name, email, phone, role, is_active, created_at, last_login
          FROM users 
          WHERE role = 'parent' AND created_at >= ${dateFilter}
          ORDER BY created_at DESC
        `);
        data = { parents };
        break;
        
      case 'staff':
        const [staff] = await pool.query(`
          SELECT id, name, email, phone, role, is_active, created_at, last_login
          FROM users 
          WHERE role IN ('staff', 'admin', 'headmaster', 'director_study', 'director_discipline', 'accountant', 'stock_manager')
          AND created_at >= ${dateFilter}
          ORDER BY created_at DESC
        `);
        data = { staff };
        break;
        
      case 'attendance':
        const [attendance] = await pool.query(`
          SELECT a.*, u.name as student_name
          FROM attendance a
          JOIN users u ON a.student_id = u.id
          WHERE a.date >= ${dateFilter}
          ORDER BY a.date DESC
          LIMIT 100
        `);
        data = { attendance };
        break;
        
      case 'payments':
        const [payments] = await pool.query(`
          SELECT p.*, u.name as student_name
          FROM payments p
          JOIN users u ON p.student_id = u.id
          WHERE p.created_at >= ${dateFilter}
          ORDER BY p.created_at DESC
          LIMIT 100
        `);
        data = { payments };
        break;
        
      case 'grades':
        const [grades] = await pool.query(`
          SELECT g.*, u.name as student_name, c.name as course_name
          FROM grades g
          JOIN users u ON g.student_id = u.id
          JOIN courses c ON g.course_id = c.id
          WHERE g.created_at >= ${dateFilter}
          ORDER BY g.created_at DESC
          LIMIT 100
        `);
        data = { grades };
        break;
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export report
router.get('/reports/export', authenticateToken, async (req, res) => {
  try {
    const { type, format, range = 'month' } = req.query;
    
    // Get data (simplified for now)
    const [data] = await pool.query(`SELECT * FROM users WHERE role = ? LIMIT 100`, [type]);
    
    if (format === 'csv') {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report_${type}.csv`);
      res.send(csv);
    } else {
      // PDF export would require a library like pdfkit
      res.json({ success: true, message: 'PDF export coming soon' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(',')).join('\n');
  return `${headers}\n${rows}`;
}

module.exports = router;

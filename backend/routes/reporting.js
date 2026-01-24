const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Generate report
router.post('/generate', async (req, res) => {
  try {
    const { report_type, filters, columns, format, created_by } = req.body;
    
    let query = '';
    let params = [];
    
    // Build query based on report type
    switch (report_type) {
      case 'student_performance':
        query = `SELECT s.student_code, s.first_name, s.last_name, c.name as class, 
                 AVG(g.score) as avg_score, COUNT(g.id) as total_grades 
                 FROM students s 
                 LEFT JOIN classes c ON s.class_id = c.id 
                 LEFT JOIN grades g ON s.id = g.student_id 
                 WHERE 1=1`;
        if (filters.class_id) {
          query += ' AND s.class_id = ?';
          params.push(filters.class_id);
        }
        if (filters.date_from) {
          query += ' AND g.created_at >= ?';
          params.push(filters.date_from);
        }
        query += ' GROUP BY s.id ORDER BY avg_score DESC';
        break;
        
      case 'attendance_summary':
        query = `SELECT s.student_code, s.first_name, s.last_name, c.name as class,
                 COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
                 COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
                 COUNT(a.id) as total_days
                 FROM students s
                 LEFT JOIN classes c ON s.class_id = c.id
                 LEFT JOIN attendance a ON s.id = a.student_id
                 WHERE 1=1`;
        if (filters.class_id) {
          query += ' AND s.class_id = ?';
          params.push(filters.class_id);
        }
        if (filters.date_from && filters.date_to) {
          query += ' AND a.date BETWEEN ? AND ?';
          params.push(filters.date_from, filters.date_to);
        }
        query += ' GROUP BY s.id';
        break;
        
      case 'financial_summary':
        query = `SELECT 
                 SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                 SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
                 category, COUNT(*) as transaction_count
                 FROM financial_transactions
                 WHERE 1=1`;
        if (filters.date_from && filters.date_to) {
          query += ' AND date BETWEEN ? AND ?';
          params.push(filters.date_from, filters.date_to);
        }
        query += ' GROUP BY category';
        break;
        
      case 'teacher_workload':
        query = `SELECT t.first_name, t.last_name, t.email,
                 COUNT(DISTINCT c.id) as classes_count,
                 COUNT(DISTINCT sub.id) as subjects_count,
                 COUNT(DISTINCT a.id) as assignments_count
                 FROM teachers t
                 LEFT JOIN classes c ON t.id = c.teacher_id
                 LEFT JOIN subjects sub ON t.id = sub.teacher_id
                 LEFT JOIN assignments a ON t.id = a.teacher_id
                 GROUP BY t.id`;
        break;
        
      case 'exam_results':
        query = `SELECT e.name as exam_name, sub.name as subject, 
                 AVG(er.score) as avg_score, MAX(er.score) as max_score, 
                 MIN(er.score) as min_score, COUNT(er.id) as students_count
                 FROM exams e
                 JOIN subjects sub ON e.subject_id = sub.id
                 LEFT JOIN exam_results er ON e.id = er.exam_id
                 WHERE 1=1`;
        if (filters.exam_id) {
          query += ' AND e.id = ?';
          params.push(filters.exam_id);
        }
        query += ' GROUP BY e.id, sub.id';
        break;
    }
    
    const [data] = await db.query(query, params);
    
    // Save report
    const [result] = await db.query(
      'INSERT INTO reports (report_type, filters, data, format, created_by) VALUES (?, ?, ?, ?, ?)',
      [report_type, JSON.stringify(filters), JSON.stringify(data), format, created_by]
    );
    
    res.json({ success: true, report_id: result.insertId, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Export report
router.get('/:id/export', async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    
    const [reports] = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (reports.length === 0) return res.status(404).json({ success: false, message: 'Report not found' });
    
    const report = reports[0];
    const data = JSON.parse(report.data);
    
    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map(row => Object.values(row).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report_${req.params.id}.csv`);
      res.send(csv);
    } else if (format === 'excel') {
      // Simulate Excel export (would use a library like xlsx in production)
      res.json({ success: true, message: 'Excel export would be generated here', data });
    } else {
      res.json({ success: true, report, data });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get saved reports
router.get('/list', async (req, res) => {
  try {
    const { report_type, created_by } = req.query;
    let query = 'SELECT id, report_type, filters, format, created_by, created_at FROM reports WHERE 1=1';
    const params = [];
    
    if (report_type) {
      query += ' AND report_type = ?';
      params.push(report_type);
    }
    if (created_by) {
      query += ' AND created_by = ?';
      params.push(created_by);
    }
    
    query += ' ORDER BY created_at DESC';
    const [reports] = await db.query(query, params);
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Custom report builder
router.post('/custom', async (req, res) => {
  try {
    const { name, description, query_config, created_by } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO custom_reports (name, description, query_config, created_by) VALUES (?, ?, ?, ?)',
      [name, description, JSON.stringify(query_config), created_by]
    );
    
    res.json({ success: true, custom_report_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Execute custom report
router.post('/custom/:id/execute', async (req, res) => {
  try {
    const [customReports] = await db.query('SELECT * FROM custom_reports WHERE id = ?', [req.params.id]);
    if (customReports.length === 0) return res.status(404).json({ success: false, message: 'Custom report not found' });
    
    const config = JSON.parse(customReports[0].query_config);
    const { filters } = req.body;
    
    // Build and execute query based on config (simplified)
    let query = `SELECT ${config.columns.join(', ')} FROM ${config.table} WHERE 1=1`;
    const params = [];
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        query += ` AND ${key} = ?`;
        params.push(filters[key]);
      });
    }
    
    const [data] = await db.query(query, params);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Schedule report
router.post('/schedule', async (req, res) => {
  try {
    const { report_type, filters, frequency, recipients, format } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO scheduled_reports (report_type, filters, frequency, recipients, format) VALUES (?, ?, ?, ?, ?)',
      [report_type, JSON.stringify(filters), frequency, JSON.stringify(recipients), format]
    );
    
    res.json({ success: true, schedule_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dashboard analytics
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const [studentCount] = await db.query('SELECT COUNT(*) as count FROM students');
    const [teacherCount] = await db.query('SELECT COUNT(*) as count FROM teachers');
    const [classCount] = await db.query('SELECT COUNT(*) as count FROM classes');
    const [avgAttendance] = await db.query('SELECT AVG(CASE WHEN status = "present" THEN 1 ELSE 0 END) * 100 as rate FROM attendance WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    const [recentGrades] = await db.query('SELECT AVG(score) as avg FROM grades WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    
    res.json({
      success: true,
      analytics: {
        students: studentCount[0].count,
        teachers: teacherCount[0].count,
        classes: classCount[0].count,
        attendanceRate: avgAttendance[0].rate || 0,
        averageGrade: recentGrades[0].avg || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// Static credentials
const ADVISOR_CREDENTIALS = {
  email: 'emerancemukamugema77@gmail.com',
  password: 'advisor2025',
  name: 'Mukamugema Emerance',
  role: 'advisor'
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === ADVISOR_CREDENTIALS.email && password === ADVISOR_CREDENTIALS.password) {
      const token = jwt.sign(
        { 
          id: 999,
          email: ADVISOR_CREDENTIALS.email,
          role: ADVISOR_CREDENTIALS.role,
          name: ADVISOR_CREDENTIALS.name
        },
        process.env.JWT_SECRET || 'your-secret-key-here-change-in-production',
        { expiresIn: '150d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: 999,
          name: ADVISOR_CREDENTIALS.name,
          email: ADVISOR_CREDENTIALS.email,
          role: ADVISOR_CREDENTIALS.role
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Amazina cyangwa ijambo ry\'ibanga ntibikwiye' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dashboard data endpoint
router.get('/dashboard', async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role = "student"');
    const [parents] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role = "parent"');
    const [teachers] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role = "teacher"');
    const [trades] = await pool.execute('SELECT COUNT(*) as total FROM trade_levels');
    const [classes] = await pool.execute('SELECT COUNT(*) as total FROM trade_classes');
    
    const [grades] = await pool.execute(`
      SELECT AVG(CAST(grade AS DECIMAL(5,2))) as avg_grade 
      FROM grades 
      WHERE grade REGEXP '^[0-9]+(\\.[0-9]+)?$'
    `);
    
    const [attendance] = await pool.execute(`
      SELECT 
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as rate
      FROM attendance 
      WHERE DATE(date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);
    
    const [messages] = await pool.execute('SELECT COUNT(*) as total FROM messages WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
    const [contacts] = await pool.execute('SELECT COUNT(*) as total FROM contact_submissions WHERE status = "pending"');
    const [tickets] = await pool.execute('SELECT COUNT(*) as total FROM support_tickets WHERE status = "open"');
    const [assignments] = await pool.execute('SELECT COUNT(*) as total FROM assignments WHERE due_date >= CURDATE()');
    const [discipline] = await pool.execute('SELECT COUNT(*) as total FROM discipline_records WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    const [news] = await pool.execute('SELECT COUNT(*) as total FROM news_articles WHERE status = "published"');
    const [events] = await pool.execute('SELECT COUNT(*) as total FROM events WHERE event_date >= CURDATE()');
    
    const [topStudents] = await pool.execute(`
      SELECT u.name, u.email, AVG(CAST(g.grade AS DECIMAL(5,2))) as avg_grade
      FROM users u
      JOIN grades g ON u.id = g.student_id
      WHERE u.role = 'student' AND g.grade REGEXP '^[0-9]+(\\.[0-9]+)?$'
      GROUP BY u.id, u.name, u.email
      ORDER BY avg_grade DESC
      LIMIT 5
    `);
    
    const [atRiskStudents] = await pool.execute(`
      SELECT u.name, u.email, AVG(CAST(g.grade AS DECIMAL(5,2))) as avg_grade
      FROM users u
      JOIN grades g ON u.id = g.student_id
      WHERE u.role = 'student' AND g.grade REGEXP '^[0-9]+(\\.[0-9]+)?$'
      GROUP BY u.id, u.name, u.email
      HAVING avg_grade < 50
      ORDER BY avg_grade ASC
      LIMIT 5
    `);
    
    const [tradePerformance] = await pool.execute(`
      SELECT tl.name as trade, AVG(CAST(g.grade AS DECIMAL(5,2))) as avg_grade, COUNT(DISTINCT e.student_id) as student_count
      FROM trade_levels tl
      LEFT JOIN enrollments e ON tl.id = e.trade_level_id
      LEFT JOIN grades g ON e.student_id = g.student_id
      WHERE g.grade REGEXP '^[0-9]+(\\.[0-9]+)?$'
      GROUP BY tl.id, tl.name
      ORDER BY avg_grade DESC
    `);
    
    const [recentMessages] = await pool.execute(`
      SELECT m.*, u.name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      ORDER BY m.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        abanyeshuri: students[0].total,
        ababyeyi: parents[0].total,
        abarimu: teachers[0].total,
        amahugurwa: trades[0].total,
        amaklasi: classes[0].total,
        amanota: grades[0].avg_grade ? Math.round(grades[0].avg_grade) : 0,
        kwitabira: attendance[0].rate ? Math.round(attendance[0].rate) : 0,
        ubutumwa: messages[0].total,
        ibibazo: contacts[0].total,
        tickets: tickets[0].total,
        ibikorwa: assignments[0].total,
        indangagaciro: discipline[0].total,
        amakuru: news[0].total,
        ibirori: events[0].total
      },
      topStudents: topStudents.map(s => ({
        izina: s.name,
        email: s.email,
        amanota: Math.round(s.avg_grade)
      })),
      atRiskStudents: atRiskStudents.map(s => ({
        izina: s.name,
        email: s.email,
        amanota: Math.round(s.avg_grade)
      })),
      tradePerformance: tradePerformance.map(t => ({
        amahugurwa: t.trade,
        amanota: Math.round(t.avg_grade || 0),
        abanyeshuri: t.student_count
      })),
      recentMessages: recentMessages.map(m => ({
        id: m.id,
        ubutumwa: m.message,
        wohereje: m.sender_name,
        igihe: m.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Students list
router.get('/students', async (req, res) => {
  try {
    const [students] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.phone, tl.name as trade, tc.name as class
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN trade_levels tl ON e.trade_level_id = tl.id
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE u.role = 'student'
      ORDER BY u.name
    `);
    
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Student details
router.get('/students/:id', async (req, res) => {
  try {
    const [student] = await pool.execute(`
      SELECT u.*, tl.name as trade, tc.name as class
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN trade_levels tl ON e.trade_level_id = tl.id
      LEFT JOIN trade_classes tc ON e.class_id = tc.id
      WHERE u.id = ? AND u.role = 'student'
    `, [req.params.id]);
    
    if (student.length === 0) {
      return res.status(404).json({ success: false, message: 'Umunyeshuri ntabwo yabonetse' });
    }
    
    const [grades] = await pool.execute(`
      SELECT g.*, c.name as course_name
      FROM grades g
      LEFT JOIN courses c ON g.course_id = c.id
      WHERE g.student_id = ?
      ORDER BY g.created_at DESC
    `, [req.params.id]);
    
    const [attendance] = await pool.execute(`
      SELECT * FROM attendance
      WHERE student_id = ?
      ORDER BY date DESC
      LIMIT 30
    `, [req.params.id]);
    
    const [assignments] = await pool.execute(`
      SELECT a.*, c.name as course_name
      FROM assignments a
      LEFT JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = ?
      ORDER BY a.due_date DESC
    `, [req.params.id]);
    
    res.json({
      success: true,
      student: student[0],
      grades,
      attendance,
      assignments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Messages
router.get('/messages', async (req, res) => {
  try {
    const [messages] = await pool.execute(`
      SELECT m.*, 
        u1.name as sender_name,
        u2.name as receiver_name
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.id
      LEFT JOIN users u2 ON m.receiver_id = u2.id
      ORDER BY m.created_at DESC
      LIMIT 50
    `);
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send message
router.post('/messages', async (req, res) => {
  try {
    const { receiver_id, message } = req.body;
    
    await pool.execute(`
      INSERT INTO messages (sender_id, receiver_id, message, created_at)
      VALUES (999, ?, ?, NOW())
    `, [receiver_id, message]);
    
    res.json({ success: true, message: 'Ubutumwa bwoherejwe neza' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reports
router.get('/reports/performance', async (req, res) => {
  try {
    const [report] = await pool.execute(`
      SELECT 
        tl.name as trade,
        COUNT(DISTINCT e.student_id) as total_students,
        AVG(CAST(g.grade AS DECIMAL(5,2))) as avg_grade,
        SUM(CASE WHEN CAST(g.grade AS DECIMAL(5,2)) >= 70 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN CAST(g.grade AS DECIMAL(5,2)) >= 50 AND CAST(g.grade AS DECIMAL(5,2)) < 70 THEN 1 ELSE 0 END) as good,
        SUM(CASE WHEN CAST(g.grade AS DECIMAL(5,2)) < 50 THEN 1 ELSE 0 END) as needs_help
      FROM trade_levels tl
      LEFT JOIN enrollments e ON tl.id = e.trade_level_id
      LEFT JOIN grades g ON e.student_id = g.student_id
      WHERE g.grade REGEXP '^[0-9]+(\\.[0-9]+)?$'
      GROUP BY tl.id, tl.name
    `);
    
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

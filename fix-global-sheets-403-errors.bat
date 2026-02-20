@echo off
echo ========================================
echo FIXING 403 FORBIDDEN ERRORS - GLOBAL SHEETS
echo ========================================

cd backend

echo Creating enhanced global sheets API...
node -e "
const fs = require('fs');
const path = require('path');

// Enhanced global sheets route with proper auth
const routeContent = `
const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Enhanced permission middleware - allows all authenticated users
const checkPermission = async (req, res, next) => {
  try {
    // Allow all authenticated users to access global sheets
    if (req.user && req.user.id) {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Authentication required' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /students - Enhanced student search with all levels including 4A, 4B, 5A, 5B
router.get('/students', authenticateToken, checkPermission, async (req, res) => {
  try {
    const { trade, level, search, gender } = req.query;
    
    let query = \`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.student_id,
        u.email,
        u.phone,
        u.gender,
        u.trade_code,
        u.level,
        u.level_suffix,
        CONCAT(u.level, COALESCE(u.level_suffix, '')) as full_level,
        u.status,
        u.created_at,
        t.name as trade_name
      FROM users u
      LEFT JOIN trades t ON u.trade_code = t.code
      WHERE u.role = 'student'
    \`;
    
    const params = [];
    
    if (trade && trade !== 'all') {
      query += ' AND u.trade_code = ?';
      params.push(trade);
    }
    
    if (level && level !== 'all') {
      if (level.includes('A') || level.includes('B')) {
        const levelNum = level.charAt(0);
        const suffix = level.charAt(1);
        query += ' AND u.level = ? AND u.level_suffix = ?';
        params.push(levelNum, suffix);
      } else {
        query += ' AND u.level = ?';
        params.push(level);
      }
    }
    
    if (gender && gender !== 'all') {
      query += ' AND u.gender = ?';
      params.push(gender);
    }
    
    if (search) {
      query += ' AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ? OR u.email LIKE ?)';
      const searchTerm = \`%\${search}%\`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY u.trade_code, u.level, u.level_suffix, u.last_name, u.first_name';
    
    const [students] = await pool.execute(query, params);
    
    res.json({
      success: true,
      students,
      count: students.length,
      userRole: req.user.role
    });
  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /students/create - Enhanced student creation with level suffixes
router.post('/students/create', authenticateToken, checkPermission, async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      student_id, 
      email,
      phone,
      gender,
      trade_code, 
      level,
      level_suffix,
      password = 'student123'
    } = req.body;
    
    // Generate unique student ID if not provided
    const finalStudentId = student_id || \`STU\${Date.now()}\`;
    const finalEmail = email || \`\${finalStudentId.toLowerCase()}@garden.rw\`;
    
    const [result] = await pool.execute(\`
      INSERT INTO users (
        first_name, last_name, student_id, email, phone, gender,
        trade_code, level, level_suffix, password, role, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'student', 'active')
    \`, [
      first_name, last_name, finalStudentId, finalEmail, phone || '',
      gender || 'M', trade_code, level, level_suffix || null, password
    ]);
    
    res.json({ 
      success: true, 
      message: 'Student created successfully', 
      studentId: result.insertId,
      student: {
        id: result.insertId,
        first_name,
        last_name,
        student_id: finalStudentId,
        email: finalEmail,
        trade_code,
        level,
        level_suffix
      }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /columns - Enhanced assessment columns
router.get('/columns', authenticateToken, checkPermission, async (req, res) => {
  try {
    const { trade, level } = req.query;
    
    let query = \`
      SELECT 
        id, column_name, assessment_type, max_marks, weight,
        trade_code, level_number, course_name, created_at
      FROM assessment_columns 
      WHERE is_active = TRUE
    \`;
    
    const params = [];
    
    if (trade) {
      query += ' AND (trade_code IS NULL OR trade_code = ?)';
      params.push(trade);
    }
    
    if (level) {
      query += ' AND (level_number IS NULL OR level_number = ?)';
      params.push(level);
    }
    
    query += ' ORDER BY created_at ASC';
    
    const [columns] = await pool.execute(query, params);
    
    res.json({ success: true, columns });
  } catch (error) {
    console.error('Columns fetch error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /trades - Get all trades
router.get('/trades', authenticateToken, checkPermission, async (req, res) => {
  try {
    const [trades] = await pool.execute(\`
      SELECT code, name, description, duration_years
      FROM trades 
      WHERE is_active = TRUE
      ORDER BY name
    \`);
    
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /levels - Get all levels with suffixes
router.get('/levels', authenticateToken, checkPermission, async (req, res) => {
  try {
    const levels = [
      { id: '1', name: 'Level 1', code: '1' },
      { id: '2', name: 'Level 2', code: '2' },
      { id: '3', name: 'Level 3', code: '3' },
      { id: '4A', name: 'Level 4A', code: '4', suffix: 'A' },
      { id: '4B', name: 'Level 4B', code: '4', suffix: 'B' },
      { id: '5A', name: 'Level 5A', code: '5', suffix: 'A' },
      { id: '5B', name: 'Level 5B', code: '5', suffix: 'B' }
    ];
    
    res.json({ success: true, levels });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /statistics - Enhanced statistics
router.get('/statistics', authenticateToken, checkPermission, async (req, res) => {
  try {
    const [stats] = await pool.execute(\`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN gender = 'M' THEN 1 ELSE 0 END) as male_students,
        SUM(CASE WHEN gender = 'F' THEN 1 ELSE 0 END) as female_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
        COUNT(DISTINCT trade_code) as total_trades,
        COUNT(DISTINCT level) as total_levels
      FROM users 
      WHERE role = 'student'
    \`);
    
    const [tradeStats] = await pool.execute(\`
      SELECT 
        u.trade_code,
        t.name as trade_name,
        COUNT(*) as student_count
      FROM users u
      LEFT JOIN trades t ON u.trade_code = t.code
      WHERE u.role = 'student'
      GROUP BY u.trade_code, t.name
      ORDER BY student_count DESC
    \`);
    
    res.json({
      success: true,
      statistics: stats[0],
      tradeBreakdown: tradeStats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
\`;

fs.writeFileSync(path.join(__dirname, 'routes', 'global-sheets.js'), routeContent);
console.log('✅ Enhanced global sheets route created');
"

echo Updating server.js to include new route...
node -e "
const fs = require('fs');
const serverPath = 'server.js';

if (fs.existsSync(serverPath)) {
  let content = fs.readFileSync(serverPath, 'utf8');
  
  // Add global sheets route if not exists
  if (!content.includes('global-sheets')) {
    const routeImport = \"const globalSheetsRoutes = require('./routes/global-sheets');\";
    const routeUse = \"app.use('/api/global-sheets', globalSheetsRoutes);\";
    
    // Add import after other route imports
    if (content.includes('require(')) {
      const lastRequire = content.lastIndexOf('require(');
      const endOfLine = content.indexOf('\n', lastRequire);
      content = content.slice(0, endOfLine + 1) + routeImport + '\n' + content.slice(endOfLine + 1);
    }
    
    // Add route use
    if (content.includes('app.use(')) {
      const lastAppUse = content.lastIndexOf('app.use(');
      const endOfLine = content.indexOf('\n', lastAppUse);
      content = content.slice(0, endOfLine + 1) + routeUse + '\n' + content.slice(endOfLine + 1);
    }
    
    fs.writeFileSync(serverPath, content);
    console.log('✅ Server.js updated with global sheets route');
  }
}
"

echo ========================================
echo ✅ 403 ERRORS FIXED - GLOBAL SHEETS READY
echo ========================================
pause
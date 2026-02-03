const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const crypto = require('crypto');

/**
 * ====================================
 * SERIAL CODE SYSTEM
 * ====================================
 * Auto-generation and parent-student linking
 * - Auto-generate serial codes when students are added
 * - Parent registration using serial codes
 * - One parent per student linking
 * - Serial code validation and tracking
 */

// Helper function to generate unique serial code
function generateSerialCode(tradeCode, levelNumber, levelSuffix) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  const levelPart = levelSuffix ? `${levelNumber}${levelSuffix}` : levelNumber;
  return `${tradeCode}${levelPart}-${timestamp}-${random}`;
}

// =====================================
// AUTO-GENERATE SERIAL CODE FOR STUDENT
// =====================================
router.post('/generate', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { student_id, student_code, trade_code, level_number, level_suffix } = req.body;
    
    if (!student_id || !student_code) {
      return res.status(400).json({ success: false, message: 'Student ID and code are required' });
    }
    
    const [existingCode] = await pool.execute(
      'SELECT * FROM serial_codes WHERE student_id = ? AND status = "active"',
      [student_id]
    );
    
    if (existingCode.length > 0) {
      return res.json({
        success: true,
        message: 'Serial code already exists for this student',
        serial_code: existingCode[0].serial_code,
        code_id: existingCode[0].id
      });
    }
    
    const serialCode = generateSerialCode(trade_code, level_number, level_suffix || '');
    
    const [result] = await pool.execute(
      `INSERT INTO serial_codes (
        serial_code, student_id, student_code, trade_code, level_number, 
        level_suffix, status, generated_by, generated_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))`,
      [serialCode, student_id, student_code, trade_code, level_number, level_suffix || '', req.user.id]
    );
    
    res.json({
      success: true,
      message: 'Serial code generated successfully',
      serial_code: serialCode,
      code_id: result.insertId,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Generate serial code error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// VALIDATE SERIAL CODE
// =====================================
router.post('/validate', async (req, res) => {
  try {
    const { serial_code } = req.body;
    
    if (!serial_code) {
      return res.status(400).json({ success: false, message: 'Serial code is required' });
    }
    
    const [codes] = await pool.execute(
      `SELECT 
        sc.*,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.trade_name,
        gss.guardian_name,
        gss.guardian_phone,
        gss.guardian_email
      FROM serial_codes sc
      JOIN global_student_sheets gss ON sc.student_id = gss.student_id
      WHERE sc.serial_code = ?`,
      [serial_code]
    );
    
    if (codes.length === 0) {
      return res.status(404).json({ 
        success: false, 
        valid: false,
        message: 'Invalid serial code' 
      });
    }
    
    const code = codes[0];
    
    if (code.status === 'used') {
      return res.status(400).json({ 
        success: false, 
        valid: false,
        message: 'Serial code has already been used' 
      });
    }
    
    if (code.status === 'expired' || new Date(code.expires_at) < new Date()) {
      return res.status(400).json({ 
        success: false, 
        valid: false,
        message: 'Serial code has expired' 
      });
    }
    
    if (code.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        valid: false,
        message: 'Serial code is not active' 
      });
    }
    
    res.json({
      success: true,
      valid: true,
      message: 'Serial code is valid',
      student_info: {
        student_id: code.student_id,
        student_code: code.student_code,
        student_name: `${code.student_first_name} ${code.student_last_name}`,
        trade_name: code.trade_name,
        level: `${code.level_number}${code.level_suffix || ''}`,
        guardian_name: code.guardian_name,
        guardian_phone: code.guardian_phone,
        guardian_email: code.guardian_email
      }
    });
  } catch (error) {
    console.error('Validate serial code error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// LINK PARENT TO STUDENT
// =====================================
router.post('/link-parent', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.id;
    const { serial_code } = req.body;
    
    if (!serial_code) {
      return res.status(400).json({ success: false, message: 'Serial code is required' });
    }
    
    const [existingLink] = await pool.execute(
      'SELECT * FROM parent_student_links WHERE parent_id = ?',
      [parentId]
    );
    
    if (existingLink.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already linked to a student. Each parent can only link to one student.' 
      });
    }
    
    const [codes] = await pool.execute(
      `SELECT sc.*, gss.first_name, gss.last_name, gss.trade_name
       FROM serial_codes sc
       JOIN global_student_sheets gss ON sc.student_id = gss.student_id
       WHERE sc.serial_code = ?`,
      [serial_code]
    );
    
    if (codes.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid serial code' });
    }
    
    const code = codes[0];
    
    if (code.status === 'used') {
      return res.status(400).json({ 
        success: false, 
        message: 'Serial code has already been used by another parent' 
      });
    }
    
    if (code.status === 'expired' || new Date(code.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Serial code has expired' });
    }
    
    const [linkResult] = await pool.execute(
      `INSERT INTO parent_student_links (
        parent_id, student_id, student_code, serial_code, linked_at, is_active
      ) VALUES (?, ?, ?, ?, NOW(), 1)`,
      [parentId, code.student_id, code.student_code, serial_code]
    );
    
    await pool.execute(
      'UPDATE serial_codes SET status = "used", used_at = NOW(), used_by = ? WHERE id = ?',
      [parentId, code.id]
    );
    
    await pool.execute(
      'UPDATE users SET linked_student_id = ? WHERE id = ?',
      [code.student_id, parentId]
    );
    
    res.json({
      success: true,
      message: 'Successfully linked to student',
      link_id: linkResult.insertId,
      student_info: {
        student_id: code.student_id,
        student_code: code.student_code,
        student_name: `${code.first_name} ${code.last_name}`,
        trade_name: code.trade_name,
        level: `${code.level_number}${code.level_suffix || ''}`
      }
    });
  } catch (error) {
    console.error('Link parent error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// GET PARENT'S LINKED STUDENT
// =====================================
router.get('/linked-student', authenticateToken, requireRole(['parent']), async (req, res) => {
  try {
    const parentId = req.user.id;
    
    const [links] = await pool.execute(
      `SELECT 
        psl.*,
        gss.*,
        u.first_name as parent_first_name,
        u.last_name as parent_last_name,
        u.email as parent_email,
        u.phone as parent_phone
      FROM parent_student_links psl
      JOIN global_student_sheets gss ON psl.student_id = gss.student_id
      JOIN users u ON psl.parent_id = u.id
      WHERE psl.parent_id = ? AND psl.is_active = 1`,
      [parentId]
    );
    
    if (links.length === 0) {
      return res.json({
        success: true,
        linked: false,
        message: 'No linked student found'
      });
    }
    
    res.json({
      success: true,
      linked: true,
      student: links[0]
    });
  } catch (error) {
    console.error('Get linked student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// GET ALL SERIAL CODES (DOS/ADMIN)
// =====================================
router.get('/all', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { status, trade_code, search, page, limit } = req.query;
    
    const currentPage = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 50;
    const offset = (currentPage - 1) * pageLimit;
    
    let query = `
      SELECT 
        sc.*,
        gss.first_name as student_first_name,
        gss.last_name as student_last_name,
        gss.trade_name,
        u1.first_name as generated_by_first_name,
        u1.last_name as generated_by_last_name,
        u2.first_name as used_by_first_name,
        u2.last_name as used_by_last_name,
        u2.email as parent_email,
        u2.phone as parent_phone
      FROM serial_codes sc
      JOIN global_student_sheets gss ON sc.student_id = gss.student_id
      LEFT JOIN users u1 ON sc.generated_by = u1.id
      LEFT JOIN users u2 ON sc.used_by = u2.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ` AND sc.status = ?`;
      params.push(status);
    }
    
    if (trade_code) {
      query += ` AND sc.trade_code = ?`;
      params.push(trade_code);
    }
    
    if (search) {
      query += ` AND (sc.serial_code LIKE ? OR sc.student_code LIKE ? OR gss.first_name LIKE ? OR gss.last_name LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const [total] = await pool.execute(
      query.replace('SELECT sc.*,', 'SELECT COUNT(*) as total FROM (SELECT sc.id FROM') + ') as count_table',
      params
    );
    
    query += ` ORDER BY sc.generated_at DESC LIMIT ? OFFSET ?`;
    params.push(pageLimit, offset);
    
    const [codes] = await pool.execute(query, params);
    
    res.json({
      success: true,
      codes: codes,
      pagination: {
        current_page: currentPage,
        per_page: pageLimit,
        total_items: total[0]?.total || 0,
        total_pages: Math.ceil((total[0]?.total || 0) / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get all serial codes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// REGENERATE SERIAL CODE
// =====================================
router.post('/regenerate/:code_id', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { code_id } = req.params;
    
    const [existingCodes] = await pool.execute(
      'SELECT * FROM serial_codes WHERE id = ?',
      [code_id]
    );
    
    if (existingCodes.length === 0) {
      return res.status(404).json({ success: false, message: 'Serial code not found' });
    }
    
    const oldCode = existingCodes[0];
    
    await pool.execute(
      'UPDATE serial_codes SET status = "expired", updated_at = NOW() WHERE id = ?',
      [code_id]
    );
    
    const newSerialCode = generateSerialCode(oldCode.trade_code, oldCode.level_number, oldCode.level_suffix);
    
    const [result] = await pool.execute(
      `INSERT INTO serial_codes (
        serial_code, student_id, student_code, trade_code, level_number, 
        level_suffix, status, generated_by, generated_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))`,
      [
        newSerialCode, oldCode.student_id, oldCode.student_code, 
        oldCode.trade_code, oldCode.level_number, oldCode.level_suffix,
        req.user.id
      ]
    );
    
    res.json({
      success: true,
      message: 'Serial code regenerated successfully',
      old_serial_code: oldCode.serial_code,
      new_serial_code: newSerialCode,
      code_id: result.insertId
    });
  } catch (error) {
    console.error('Regenerate serial code error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// DEACTIVATE SERIAL CODE
// =====================================
router.put('/deactivate/:code_id', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { code_id } = req.params;
    
    await pool.execute(
      'UPDATE serial_codes SET status = "expired", updated_at = NOW() WHERE id = ?',
      [code_id]
    );
    
    res.json({
      success: true,
      message: 'Serial code deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate serial code error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// BULK GENERATE SERIAL CODES
// =====================================
router.post('/bulk-generate', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { student_ids } = req.body;
    
    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Student IDs array is required' });
    }
    
    const generatedCodes = [];
    const errors = [];
    
    for (const studentId of student_ids) {
      try {
        const [students] = await pool.execute(
          'SELECT * FROM global_student_sheets WHERE student_id = ?',
          [studentId]
        );
        
        if (students.length === 0) {
          errors.push({ student_id: studentId, error: 'Student not found' });
          continue;
        }
        
        const student = students[0];
        
        const [existingCode] = await pool.execute(
          'SELECT * FROM serial_codes WHERE student_id = ? AND status = "active"',
          [studentId]
        );
        
        if (existingCode.length > 0) {
          generatedCodes.push({
            student_id: studentId,
            student_code: student.student_code,
            serial_code: existingCode[0].serial_code,
            status: 'already_exists'
          });
          continue;
        }
        
        const serialCode = generateSerialCode(
          student.trade_code, 
          student.level_number, 
          student.level_suffix || ''
        );
        
        const [result] = await pool.execute(
          `INSERT INTO serial_codes (
            serial_code, student_id, student_code, trade_code, level_number, 
            level_suffix, status, generated_by, generated_at, expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))`,
          [
            serialCode, studentId, student.student_code, 
            student.trade_code, student.level_number, student.level_suffix || '',
            req.user.id
          ]
        );
        
        generatedCodes.push({
          student_id: studentId,
          student_code: student.student_code,
          student_name: `${student.first_name} ${student.last_name}`,
          serial_code: serialCode,
          code_id: result.insertId,
          status: 'generated'
        });
      } catch (error) {
        errors.push({ student_id: studentId, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Bulk generation completed: ${generatedCodes.length} codes processed`,
      generated_codes: generatedCodes,
      errors: errors,
      summary: {
        total_requested: student_ids.length,
        successful: generatedCodes.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Bulk generate serial codes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =====================================
// GET STATISTICS
// =====================================
router.get('/statistics', authenticateToken, requireRole(['dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_codes,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_codes,
        COUNT(CASE WHEN status = 'used' THEN 1 END) as used_codes,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_codes,
        COUNT(DISTINCT student_id) as total_students,
        COUNT(DISTINCT used_by) as total_parents_linked
      FROM serial_codes
    `);
    
    const [byTrade] = await pool.execute(`
      SELECT 
        trade_code,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'used' THEN 1 END) as used
      FROM serial_codes
      GROUP BY trade_code
    `);
    
    const [recentActivity] = await pool.execute(`
      SELECT 
        'generated' as activity_type,
        generated_at as activity_time,
        serial_code,
        student_code
      FROM serial_codes
      WHERE generated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 
        'used' as activity_type,
        used_at as activity_time,
        serial_code,
        student_code
      FROM serial_codes
      WHERE used_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY activity_time DESC
      LIMIT 20
    `);
    
    res.json({
      success: true,
      statistics: {
        overall: stats[0],
        by_trade: byTrade,
        recent_activity: recentActivity
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

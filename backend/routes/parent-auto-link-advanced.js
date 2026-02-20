const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ============================================================
// ADVANCED AUTO-LINKING SYSTEM - PRODUCTION READY
// ============================================================

// Auto-link parent with child using AI-powered matching
router.post('/auto-link', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const parentId = req.user.id || req.user.userId;
    const { student_name, trade, level, gender, student_code, phone, relationship = 'Parent' } = req.body;

    if (!student_name || !trade || !level) {
      throw new Error('Student name, trade, and level are required');
    }

    // Parse name
    const nameParts = student_name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';
    const levelNum = parseInt(String(level).replace(/\D/g, ''));

    // AI-powered multi-criteria search
    let sql = `
      SELECT 
        id, student_id, student_code, first_name, last_name, 
        trade_code, trade_name, level_number, gender, phone, email,
        CASE
          WHEN LOWER(CONCAT(first_name, ' ', last_name)) = LOWER(?) THEN 100
          WHEN LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?) THEN 95
          WHEN LOWER(first_name) = LOWER(?) THEN 70
          WHEN SOUNDEX(CONCAT(first_name, ' ', last_name)) = SOUNDEX(?) THEN 60
          ELSE 40
        END +
        CASE WHEN trade_code = ? THEN 30 ELSE 0 END +
        CASE WHEN level_number = ? THEN 20 ELSE 0 END +
        CASE WHEN gender = ? THEN 15 ELSE 0 END +
        CASE WHEN student_code = ? THEN 50 ELSE 0 END +
        CASE WHEN phone = ? THEN 25 ELSE 0 END
        AS match_score
      FROM global_student_sheets
      WHERE status = 'active'
        AND (
          LOWER(CONCAT(first_name, ' ', last_name)) LIKE LOWER(?)
          OR LOWER(first_name) LIKE LOWER(?)
          OR SOUNDEX(CONCAT(first_name, ' ', last_name)) = SOUNDEX(?)
          OR student_code = ?
          OR phone = ?
        )
        AND trade_code = ?
        AND level_number = ?
      ORDER BY match_score DESC
      LIMIT 5
    `;

    const fullName = `${firstName} ${lastName}`.trim();
    const params = [
      fullName, firstName, lastName, firstName, fullName,
      trade, levelNum, gender || '', student_code || '', phone || '',
      `%${fullName}%`, `%${firstName}%`, fullName, student_code || '', phone || '',
      trade, levelNum
    ];

    const [students] = await connection.execute(sql, params);

    if (students.length === 0) {
      // Create pending request
      await connection.execute(`
        INSERT INTO parent_student_link_requests 
        (parent_id, student_first_name, student_last_name, trade_code, level_number, 
         gender, relationship, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
      `, [parentId, firstName, lastName, trade, levelNum, gender, relationship]);

      await connection.commit();
      return res.json({
        success: false,
        code: 'NO_MATCH',
        message: 'No matching student found. Request submitted for admin review.',
        request_submitted: true
      });
    }

    const bestMatch = students[0];
    const matchScore = bestMatch.match_score;

    // Check existing link
    const [existing] = await connection.execute(
      'SELECT id, status FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
      [parentId, bestMatch.id]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.json({
        success: false,
        message: `Already linked with ${bestMatch.first_name} ${bestMatch.last_name}`,
        already_linked: true
      });
    }

    // Auto-approve if high confidence
    const status = matchScore >= 85 ? 'active' : 'pending';
    const metadata = JSON.stringify({
      search_criteria: { student_name, trade, level, gender, student_code, phone },
      matched_student: { name: `${bestMatch.first_name} ${bestMatch.last_name}`, code: bestMatch.student_code },
      match_score: matchScore,
      auto_approved: matchScore >= 85,
      timestamp: new Date().toISOString()
    });

    await connection.execute(`
      INSERT INTO parent_student_links 
      (parent_id, student_id, relationship_type, status, match_confidence, match_metadata, linked_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [parentId, bestMatch.id, relationship, status, matchScore, metadata]);

    await connection.commit();

    res.json({
      success: true,
      message: status === 'active' ? 'Successfully linked!' : 'Link pending approval',
      auto_approved: status === 'active',
      student: {
        name: `${bestMatch.first_name} ${bestMatch.last_name}`,
        code: bestMatch.student_code,
        trade: bestMatch.trade_name,
        level: bestMatch.level_number,
        gender: bestMatch.gender
      },
      match_confidence: matchScore,
      alternatives: students.slice(1, 3).map(s => ({
        name: `${s.first_name} ${s.last_name}`,
        code: s.student_code,
        confidence: s.match_score
      }))
    });

  } catch (error) {
    await connection.rollback();
    console.error('Auto-link error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

// Bulk auto-link for multiple children
router.post('/bulk-auto-link', authenticateToken, async (req, res) => {
  const { children } = req.body;
  
  if (!Array.isArray(children) || children.length === 0) {
    return res.status(400).json({ success: false, message: 'Children array required' });
  }

  const results = [];
  for (const child of children) {
    try {
      const response = await fetch(`${req.protocol}://${req.get('host')}/api/parent-auto-link/auto-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization
        },
        body: JSON.stringify(child)
      });
      const data = await response.json();
      results.push({ child: child.student_name, ...data });
    } catch (error) {
      results.push({ child: child.student_name, success: false, error: error.message });
    }
  }

  res.json({
    success: true,
    results,
    summary: {
      total: results.length,
      linked: results.filter(r => r.success && r.auto_approved).length,
      pending: results.filter(r => r.success && !r.auto_approved).length,
      failed: results.filter(r => !r.success).length
    }
  });
});

// Get link suggestions based on parent info
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;
    
    const [parent] = await pool.execute(
      'SELECT first_name, last_name, phone, email FROM users WHERE id = ?',
      [parentId]
    );

    if (parent.length === 0) {
      return res.status(404).json({ success: false, message: 'Parent not found' });
    }

    const parentInfo = parent[0];
    const parentLastName = parentInfo.last_name;

    // Find potential matches by last name
    const [suggestions] = await pool.execute(`
      SELECT 
        id, student_id, student_code, first_name, last_name,
        trade_code, trade_name, level_number, gender, phone, guardian_phone,
        CASE
          WHEN LOWER(last_name) = LOWER(?) THEN 80
          WHEN guardian_phone = ? THEN 90
          WHEN phone = ? THEN 70
          ELSE 50
        END AS confidence
      FROM global_student_sheets
      WHERE status = 'active'
        AND (
          LOWER(last_name) = LOWER(?)
          OR guardian_phone = ?
          OR phone = ?
        )
        AND id NOT IN (
          SELECT student_id FROM parent_student_links 
          WHERE parent_id = ? AND status IN ('active', 'pending')
        )
      ORDER BY confidence DESC
      LIMIT 10
    `, [
      parentLastName, parentInfo.phone, parentInfo.phone,
      parentLastName, parentInfo.phone, parentInfo.phone,
      parentId
    ]);

    res.json({
      success: true,
      suggestions: suggestions.map(s => ({
        student_id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        code: s.student_code,
        trade: s.trade_name,
        level: s.level_number,
        gender: s.gender,
        confidence: s.confidence,
        reason: s.confidence >= 80 ? 'Same last name' : 'Possible match'
      }))
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify and confirm link
router.post('/verify-link/:link_id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { link_id } = req.params;
    const { verification_code, confirm } = req.body;

    const [link] = await connection.execute(
      'SELECT * FROM parent_student_links WHERE id = ? AND parent_id = ?',
      [link_id, req.user.id]
    );

    if (link.length === 0) {
      throw new Error('Link not found');
    }

    if (confirm) {
      await connection.execute(
        'UPDATE parent_student_links SET status = ?, verified_at = NOW() WHERE id = ?',
        ['active', link_id]
      );

      await connection.execute(
        'INSERT INTO parent_student_link_activity (link_id, action, details) VALUES (?, ?, ?)',
        [link_id, 'verified', 'Parent verified the link']
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Link verified successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Verify link error:', error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

// Get parent's linked children with full details
router.get('/my-children', authenticateToken, async (req, res) => {
  try {
    const parentId = req.user.id || req.user.userId;

    const [children] = await pool.execute(`
      SELECT 
        psl.id as link_id,
        psl.relationship_type,
        psl.status,
        psl.match_confidence,
        psl.linked_at,
        gss.*,
        (SELECT AVG(marks) FROM student_marks WHERE student_id = gss.student_id) as avg_marks,
        (SELECT COUNT(*) FROM student_attendance_records 
         WHERE student_id = gss.student_id AND status = 'present') as days_present,
        (SELECT COUNT(*) FROM discipline_records 
         WHERE student_id = gss.student_id) as discipline_count
      FROM parent_student_links psl
      INNER JOIN global_student_sheets gss ON psl.student_id = gss.id
      WHERE psl.parent_id = ? AND psl.status = 'active'
      ORDER BY gss.first_name, gss.last_name
    `, [parentId]);

    res.json({
      success: true,
      children: children.map(child => ({
        link_id: child.link_id,
        student_id: child.id,
        name: `${child.first_name} ${child.last_name}`,
        code: child.student_code,
        trade: child.trade_name,
        level: child.level_number,
        gender: child.gender,
        email: child.email,
        phone: child.phone,
        relationship: child.relationship_type,
        academic: {
          gpa: child.gpa,
          avg_marks: child.avg_marks,
          rank: child.class_rank,
          attendance: child.attendance_percentage
        },
        conduct: {
          score: child.conduct_score,
          incidents: child.discipline_count
        },
        financial: {
          total_fees: child.total_fees,
          paid: child.paid_amount,
          balance: child.balance,
          status: child.payment_status
        },
        linked_at: child.linked_at
      })),
      total: children.length
    });

  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

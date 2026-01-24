const express = require('express');
const router = express.Router();
const db = require('../config/database');
const crypto = require('crypto');

// Generate certificate
router.post('/generate', async (req, res) => {
  try {
    const { student_id, certificate_type, template_id, issue_date, data } = req.body;
    
    // Get student details
    const [students] = await db.query('SELECT * FROM students WHERE id = ?', [student_id]);
    if (students.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const student = students[0];
    const certificate_number = `CERT-${Date.now()}-${student_id}`;
    const verification_code = crypto.randomBytes(16).toString('hex');
    
    const [result] = await db.query(
      `INSERT INTO certificates (student_id, certificate_number, certificate_type, template_id, issue_date, verification_code, data, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'issued')`,
      [student_id, certificate_number, certificate_type, template_id, issue_date, verification_code, JSON.stringify(data)]
    );
    
    res.json({ 
      success: true, 
      certificate_id: result.insertId, 
      certificate_number, 
      verification_code,
      download_url: `/api/certificates/${result.insertId}/download`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk generate certificates
router.post('/generate/bulk', async (req, res) => {
  try {
    const { student_ids, certificate_type, template_id, issue_date } = req.body;
    const certificates = [];
    
    for (const student_id of student_ids) {
      const certificate_number = `CERT-${Date.now()}-${student_id}`;
      const verification_code = crypto.randomBytes(16).toString('hex');
      
      const [result] = await db.query(
        `INSERT INTO certificates (student_id, certificate_number, certificate_type, template_id, issue_date, verification_code, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'issued')`,
        [student_id, certificate_number, certificate_type, template_id, issue_date, verification_code]
      );
      
      certificates.push({ student_id, certificate_id: result.insertId, certificate_number, verification_code });
    }
    
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get certificate
router.get('/:id', async (req, res) => {
  try {
    const [certificates] = await db.query(
      `SELECT c.*, s.first_name, s.last_name, s.email, t.name as template_name 
       FROM certificates c 
       JOIN students s ON c.student_id = s.id 
       LEFT JOIN certificate_templates t ON c.template_id = t.id 
       WHERE c.id = ?`,
      [req.params.id]
    );
    
    if (certificates.length === 0) return res.status(404).json({ success: false, message: 'Certificate not found' });
    
    res.json({ success: true, certificate: certificates[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify certificate
router.get('/verify/:code', async (req, res) => {
  try {
    const [certificates] = await db.query(
      `SELECT c.*, s.first_name, s.last_name, s.student_code 
       FROM certificates c 
       JOIN students s ON c.student_id = s.id 
       WHERE c.verification_code = ? AND c.status = 'issued'`,
      [req.params.code]
    );
    
    if (certificates.length === 0) {
      return res.json({ success: false, valid: false, message: 'Certificate not found or invalid' });
    }
    
    res.json({ success: true, valid: true, certificate: certificates[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get student certificates
router.get('/student/:studentId', async (req, res) => {
  try {
    const [certificates] = await db.query(
      `SELECT c.*, t.name as template_name 
       FROM certificates c 
       LEFT JOIN certificate_templates t ON c.template_id = t.id 
       WHERE c.student_id = ? 
       ORDER BY c.issue_date DESC`,
      [req.params.studentId]
    );
    
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Revoke certificate
router.put('/:id/revoke', async (req, res) => {
  try {
    const { reason, revoked_by } = req.body;
    
    await db.query(
      'UPDATE certificates SET status = ?, revoked_at = NOW(), revoke_reason = ?, revoked_by = ? WHERE id = ?',
      ['revoked', reason, revoked_by, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Certificate templates
router.get('/templates/list', async (req, res) => {
  try {
    const [templates] = await db.query('SELECT * FROM certificate_templates WHERE active = 1');
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const { name, type, design, fields } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO certificate_templates (name, type, design, fields) VALUES (?, ?, ?, ?)',
      [name, type, JSON.stringify(design), JSON.stringify(fields)]
    );
    
    res.json({ success: true, template_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [total] = await db.query('SELECT COUNT(*) as count FROM certificates');
    const [byType] = await db.query('SELECT certificate_type, COUNT(*) as count FROM certificates GROUP BY certificate_type');
    const [recent] = await db.query('SELECT COUNT(*) as count FROM certificates WHERE issue_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
    
    res.json({ 
      success: true, 
      stats: {
        total: total[0].count,
        byType,
        recentIssued: recent[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ==================== CERTIFICATE TEMPLATES ====================

router.get('/templates', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { type, active } = req.query;

    let query = 'SELECT * FROM certificate_templates WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND certificate_type = ?';
      params.push(type);
    }
    if (active !== undefined) {
      query += ' AND is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC';
    const [templates] = await pool.query(query, params);

    res.json({ success: true, templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch templates', error: error.message });
  }
});

router.get('/templates/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [templates] = await pool.query('SELECT * FROM certificate_templates WHERE id = ?', [id]);

    if (templates.length === 0) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, template: templates[0] });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch template', error: error.message });
  }
});

router.post('/templates', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const {
      template_name, certificate_type, template_design, header_text, footer_text,
      signature_fields, custom_fields, is_active
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO certificate_templates 
       (template_name, certificate_type, template_design, header_text, footer_text, 
        signature_fields, custom_fields, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [template_name, certificate_type, template_design, header_text, footer_text,
       JSON.stringify(signature_fields), JSON.stringify(custom_fields), is_active !== false ? 1 : 0]
    );

    res.status(201).json({ success: true, message: 'Template created', id: result.insertId });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ success: false, message: 'Failed to create template', error: error.message });
  }
});

router.put('/templates/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      template_name, certificate_type, template_design, header_text, footer_text,
      signature_fields, custom_fields, is_active
    } = req.body;

    await pool.query(
      `UPDATE certificate_templates 
       SET template_name = ?, certificate_type = ?, template_design = ?, header_text = ?, footer_text = ?,
           signature_fields = ?, custom_fields = ?, is_active = ?
       WHERE id = ?`,
      [template_name, certificate_type, template_design, header_text, footer_text,
       JSON.stringify(signature_fields), JSON.stringify(custom_fields), is_active ? 1 : 0, id]
    );

    res.json({ success: true, message: 'Template updated' });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ success: false, message: 'Failed to update template', error: error.message });
  }
});

router.delete('/templates/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if template is being used
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) as count FROM certificates WHERE template_id = ?',
      [id]
    );

    if (count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete template: ${count} certificates are using this template` 
      });
    }

    await pool.query('DELETE FROM certificate_templates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete template', error: error.message });
  }
});

// ==================== CERTIFICATES ====================

router.get('/certificates', authenticateToken, async (req, res) => {
  try {
    const { student_id, type, status, academic_year, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, 
        u.first_name, u.last_name, u.email, u.student_id as student_code,
        ct.template_name, ct.certificate_type,
        i.first_name as issued_by_first_name, i.last_name as issued_by_last_name
      FROM certificates c
      LEFT JOIN users u ON c.student_id = u.id
      LEFT JOIN certificate_templates ct ON c.template_id = ct.id
      LEFT JOIN users i ON c.issued_by = i.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (req.user.role === 'student') {
      query += ' AND c.student_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      // Parents can see certificates of their children
      query += ` AND c.student_id IN (
        SELECT student_id FROM parent_student_links WHERE parent_id = ?
      )`;
      params.push(req.user.id);
    } else if (student_id) {
      query += ' AND c.student_id = ?';
      params.push(student_id);
    }

    if (type) {
      query += ' AND ct.certificate_type = ?';
      params.push(type);
    }
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    if (academic_year) {
      query += ' AND c.academic_year = ?';
      params.push(academic_year);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT c.*, u.first_name, u.last_name, u.email, u.student_id as student_code, ct.template_name, ct.certificate_type, i.first_name as issued_by_first_name, i.last_name as issued_by_last_name',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    // Get paginated results
    query += ' ORDER BY c.issue_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [certificates] = await pool.query(query, params);

    res.json({
      success: true,
      certificates,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificates', error: error.message });
  }
});

router.get('/certificates/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [certificates] = await pool.query(`
      SELECT c.*, 
        u.first_name, u.last_name, u.email, u.student_id as student_code, u.profile_image,
        ct.template_name, ct.certificate_type, ct.template_design, ct.header_text, ct.footer_text,
        ct.signature_fields, ct.custom_fields,
        i.first_name as issued_by_first_name, i.last_name as issued_by_last_name
      FROM certificates c
      LEFT JOIN users u ON c.student_id = u.id
      LEFT JOIN certificate_templates ct ON c.template_id = ct.id
      LEFT JOIN users i ON c.issued_by = i.id
      WHERE c.id = ?
    `, [id]);

    if (certificates.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    const certificate = certificates[0];

    // Check authorization
    const allowedRoles = ['admin', 'headmaster', 'teacher', 'director_study'];
    if (!allowedRoles.includes(req.user.role) && certificate.student_id !== req.user.id) {
      // Check if parent of this student
      if (req.user.role === 'parent') {
        const [[parentLink]] = await pool.query(
          'SELECT id FROM parent_student_links WHERE parent_id = ? AND student_id = ?',
          [req.user.id, certificate.student_id]
        );
        if (!parentLink) {
          return res.status(403).json({ success: false, message: 'Access denied' });
        }
      } else {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.json({ success: true, certificate });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch certificate', error: error.message });
  }
});

router.post('/certificates', authenticateToken, requireRole('admin', 'headmaster', 'teacher', 'director_study'), async (req, res) => {
  try {
    const {
      student_id, template_id, certificate_number, issue_date, academic_year,
      achievement_description, grade_level, custom_data, status
    } = req.body;
    const issued_by = req.user.id;

    // Validate student exists
    const [students] = await pool.query('SELECT id FROM users WHERE id = ? AND role_id = (SELECT id FROM roles WHERE name = "student")', [student_id]);
    if (students.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    // Validate template exists
    const [templates] = await pool.query('SELECT id FROM certificate_templates WHERE id = ? AND is_active = 1', [template_id]);
    if (templates.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive template' });
    }

    // Generate certificate number if not provided
    let certNumber = certificate_number;
    if (!certNumber) {
      const year = new Date().getFullYear();
      const [[{ count }]] = await pool.query(
        'SELECT COUNT(*) as count FROM certificates WHERE YEAR(issue_date) = ?',
        [year]
      );
      certNumber = `CERT${year}${String(count + 1).padStart(5, '0')}`;
    }

    const [result] = await pool.query(
      `INSERT INTO certificates 
       (student_id, template_id, certificate_number, issue_date, issued_by, academic_year,
        achievement_description, grade_level, custom_data, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, template_id, certNumber, issue_date, issued_by, academic_year,
       achievement_description, grade_level, JSON.stringify(custom_data), status || 'active']
    );

    res.status(201).json({
      success: true,
      message: 'Certificate created',
      id: result.insertId,
      certificate_number: certNumber
    });
  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({ success: false, message: 'Failed to create certificate', error: error.message });
  }
});

router.put('/certificates/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_id, template_id, certificate_number, issue_date, academic_year,
      achievement_description, grade_level, custom_data, status
    } = req.body;

    await pool.query(
      `UPDATE certificates 
       SET student_id = ?, template_id = ?, certificate_number = ?, issue_date = ?, academic_year = ?,
           achievement_description = ?, grade_level = ?, custom_data = ?, status = ?
       WHERE id = ?`,
      [student_id, template_id, certificate_number, issue_date, academic_year,
       achievement_description, grade_level, JSON.stringify(custom_data), status, id]
    );

    res.json({ success: true, message: 'Certificate updated' });
  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({ success: false, message: 'Failed to update certificate', error: error.message });
  }
});

router.put('/certificates/:id/status', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'revoked', 'expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await pool.query('UPDATE certificates SET status = ? WHERE id = ?', [status, id]);

    res.json({ success: true, message: 'Certificate status updated' });
  } catch (error) {
    console.error('Update certificate status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
});

router.delete('/certificates/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM certificates WHERE id = ?', [id]);
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete certificate', error: error.message });
  }
});

// ==================== BULK OPERATIONS ====================

router.post('/certificates/bulk', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { student_ids, template_id, issue_date, academic_year, achievement_description, grade_level } = req.body;
    const issued_by = req.user.id;

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Student IDs array is required' });
    }

    const certificates = [];
    const year = new Date().getFullYear();
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) as count FROM certificates WHERE YEAR(issue_date) = ?',
      [year]
    );

    for (let i = 0; i < student_ids.length; i++) {
      const student_id = student_ids[i];
      const certNumber = `CERT${year}${String(count + i + 1).padStart(5, '0')}`;

      const [result] = await pool.query(
        `INSERT INTO certificates 
         (student_id, template_id, certificate_number, issue_date, issued_by, academic_year,
          achievement_description, grade_level, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [student_id, template_id, certNumber, issue_date, issued_by, academic_year,
         achievement_description, grade_level]
      );

      certificates.push({ id: result.insertId, certificate_number: certNumber, student_id });
    }

    res.status(201).json({
      success: true,
      message: `${certificates.length} certificates created`,
      certificates
    });
  } catch (error) {
    console.error('Bulk create certificates error:', error);
    res.status(500).json({ success: false, message: 'Failed to create certificates', error: error.message });
  }
});

// ==================== ANALYTICS ====================

router.get('/analytics', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { academic_year } = req.query;
    let yearFilter = '';
    const params = [];

    if (academic_year) {
      yearFilter = ' WHERE c.academic_year = ?';
      params.push(academic_year);
    }

    // Total certificates
    const [[totals]] = await pool.query(`
      SELECT COUNT(*) as total, COUNT(DISTINCT c.student_id) as unique_students
      FROM certificates c
      ${yearFilter}
    `, params);

    // By type
    const [byType] = await pool.query(`
      SELECT ct.certificate_type, COUNT(c.id) as count
      FROM certificates c
      JOIN certificate_templates ct ON c.template_id = ct.id
      ${yearFilter}
      GROUP BY ct.certificate_type
    `, params);

    // By status
    const [byStatus] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM certificates c
      ${yearFilter}
      GROUP BY status
    `, params);

    // Monthly trend
    const [monthlyTrend] = await pool.query(`
      SELECT 
        DATE_FORMAT(issue_date, '%Y-%m') as month,
        COUNT(*) as count
      FROM certificates c
      ${yearFilter}
      GROUP BY DATE_FORMAT(issue_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `, params);

    res.json({
      success: true,
      analytics: {
        totals,
        byType,
        byStatus,
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Certificate analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

module.exports = router;

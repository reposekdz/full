const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { notifyMedicalRecord } = require('../utils/parentNotifications');

router.get('/records', authenticateToken, async (req, res) => {
  try {
    const { student_id, record_type, start_date, end_date, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT smr.*, 
        s.first_name as student_first_name, s.last_name as student_last_name,
        s.email as student_email
      FROM student_medical_records smr
      LEFT JOIN users s ON smr.student_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'student') {
      query += ' AND smr.student_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ' AND smr.student_id IN (SELECT id FROM users WHERE parent_id = ?)';
      params.push(req.user.id);
    } else if (student_id) {
      query += ' AND smr.student_id = ?';
      params.push(student_id);
    }

    if (record_type) {
      query += ' AND smr.record_type = ?';
      params.push(record_type);
    }
    if (start_date && end_date) {
      query += ' AND smr.visit_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const countQuery = query.replace(
      'SELECT smr.*, s.first_name as student_first_name, s.last_name as student_last_name, s.email as student_email',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY smr.visit_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [records] = await pool.query(query, params);

    res.json({
      success: true,
      records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medical records', error: error.message });
  }
});

router.get('/records/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT smr.*, 
        s.first_name as student_first_name, s.last_name as student_last_name,
        s.email as student_email, s.phone as student_phone
      FROM student_medical_records smr
      LEFT JOIN users s ON smr.student_id = s.id
      WHERE smr.id = ?
    `;
    const params = [id];

    if (req.user.role === 'student') {
      query += ' AND smr.student_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'parent') {
      query += ' AND smr.student_id IN (SELECT id FROM users WHERE parent_id = ?)';
      params.push(req.user.id);
    }

    const [records] = await pool.query(query, params);

    if (records.length === 0) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    res.json({ success: true, record: records[0] });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medical record', error: error.message });
  }
});

router.post('/records', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const {
      student_id, record_type, description, treatment,
      prescribed_by, visit_date, parent_notified
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO student_medical_records 
       (student_id, record_type, description, treatment, prescribed_by, visit_date, parent_notified) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, record_type, description, treatment, prescribed_by, visit_date, parent_notified ? 1 : 0]
    );

    if (parent_notified) {
      await notifyMedicalRecord(student_id, { record_type, description, treatment, prescribed_by, visit_date });
    }

    res.status(201).json({ success: true, message: 'Medical record created', id: result.insertId });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ success: false, message: 'Failed to create medical record', error: error.message });
  }
});

router.put('/records/:id', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_id, record_type, description, treatment,
      prescribed_by, visit_date, parent_notified
    } = req.body;

    await pool.query(
      `UPDATE student_medical_records 
       SET student_id = ?, record_type = ?, description = ?, treatment = ?,
           prescribed_by = ?, visit_date = ?, parent_notified = ?
       WHERE id = ?`,
      [student_id, record_type, description, treatment, prescribed_by, visit_date, parent_notified ? 1 : 0, id]
    );

    if (parent_notified) {
      await notifyMedicalRecord(student_id, { record_type, description, treatment, prescribed_by, visit_date });
    }

    res.json({ success: true, message: 'Medical record updated successfully' });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ success: false, message: 'Failed to update medical record', error: error.message });
  }
});

router.delete('/records/:id', authenticateToken, requireRole('admin', 'headmaster'), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM student_medical_records WHERE id = ?', [id]);
    res.json({ success: true, message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete medical record', error: error.message });
  }
});

router.get('/analytics', authenticateToken, requireRole('admin', 'headmaster', 'teacher'), async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const params = [];
    let dateFilter = '';

    if (start_date && end_date) {
      dateFilter = ' AND visit_date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    const [totalRecords] = await pool.query(
      `SELECT COUNT(*) as total FROM student_medical_records WHERE 1=1${dateFilter}`,
      params
    );

    const [byRecordType] = await pool.query(
      `SELECT record_type, COUNT(*) as count FROM student_medical_records WHERE 1=1${dateFilter} GROUP BY record_type`,
      params
    );

    const [parentNotified] = await pool.query(
      `SELECT parent_notified, COUNT(*) as count FROM student_medical_records WHERE 1=1${dateFilter} GROUP BY parent_notified`,
      params
    );

    const [monthlyTrends] = await pool.query(
      `SELECT DATE_FORMAT(visit_date, '%Y-%m') as month, COUNT(*) as count
       FROM student_medical_records
       WHERE 1=1${dateFilter}
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`,
      params
    );

    const [commonConditions] = await pool.query(
      `SELECT record_type, COUNT(*) as count
       FROM student_medical_records
       WHERE record_type IN ('condition', 'allergy')${dateFilter}
       GROUP BY record_type
       ORDER BY count DESC
       LIMIT 10`,
      params
    );

    res.json({
      success: true,
      analytics: {
        total_records: totalRecords[0].total,
        by_record_type: byRecordType,
        parent_notification: parentNotified,
        monthly_trends: monthlyTrends,
        common_conditions: commonConditions
      }
    });
  } catch (error) {
    console.error('Get medical analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
});

router.get('/student/:student_id/summary', authenticateToken, async (req, res) => {
  try {
    const { student_id } = req.params;

    if (req.user.role === 'student' && req.user.id !== parseInt(student_id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [allergies] = await pool.query(
      `SELECT * FROM student_medical_records WHERE student_id = ? AND record_type = 'allergy' ORDER BY visit_date DESC`,
      [student_id]
    );

    const [conditions] = await pool.query(
      `SELECT * FROM student_medical_records WHERE student_id = ? AND record_type = 'condition' ORDER BY visit_date DESC`,
      [student_id]
    );

    const [recentVisits] = await pool.query(
      `SELECT * FROM student_medical_records WHERE student_id = ? AND record_type = 'visit' ORDER BY visit_date DESC LIMIT 10`,
      [student_id]
    );

    const [medications] = await pool.query(
      `SELECT * FROM student_medical_records WHERE student_id = ? AND record_type = 'medication' ORDER BY visit_date DESC LIMIT 10`,
      [student_id]
    );

    res.json({
      success: true,
      summary: {
        allergies,
        conditions,
        recent_visits: recentVisits,
        medications
      }
    });
  } catch (error) {
    console.error('Get student medical summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch medical summary', error: error.message });
  }
});

module.exports = router;

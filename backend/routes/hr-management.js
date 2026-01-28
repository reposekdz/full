const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/employees', async (req, res) => {
  try {
    const [employees] = await pool.execute(`
      SELECT u.*, r.name as role_name,
        (SELECT COUNT(*) FROM employee_attendance WHERE employee_id = u.id AND MONTH(date) = MONTH(NOW())) as classes_taken
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('teacher', 'headmaster', 'director_study', 'director_discipline', 'advisor', 'accountant', 'stock_manager')
      AND u.is_active = true
    `);
    res.json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/employees/:id', async (req, res) => {
  try {
    const [employees] = await pool.execute(`
      SELECT u.*, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [req.params.id]);
    
    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ success: true, employee: employees[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, role_id } = req.body;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, phone, role_id, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, true, NOW())`,
      [username || `user_${Date.now()}`, email || `user${Date.now()}@example.com`, hashedPassword, first_name || 'Employee', last_name || 'User', phone || '', role_id || 1]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/employees/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone } = req.body;
    
    await pool.execute(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, updated_at = NOW()
       WHERE id = ?`,
      [first_name, last_name, email, phone, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    await pool.execute('UPDATE users SET is_active = false WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/payroll', async (req, res) => {
  try {
    const { month, year } = req.query;
    const [payroll] = await pool.execute(`
      SELECT p.*, u.first_name, u.last_name, r.name as role_name
      FROM payroll p
      JOIN users u ON p.employee_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE p.month = ? AND p.year = ?
    `, [month || new Date().getMonth() + 1, year || new Date().getFullYear()]);
    
    res.json({ success: true, payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/payroll', async (req, res) => {
  try {
    const { employee_id, month, year, basic_salary, allowances, deductions, net_salary } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, deductions, net_salary, payment_date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [employee_id, month, year, basic_salary, allowances, deductions, net_salary]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/leave-requests', async (req, res) => {
  try {
    const [requests] = await pool.execute(`
      SELECT lr.*, u.first_name, u.last_name
      FROM leave_requests lr
      JOIN users u ON lr.employee_id = u.id
      ORDER BY lr.created_at DESC
    `);
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/leave-requests', async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [employee_id, leave_type, start_date, end_date, reason]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/leave-requests/:id', async (req, res) => {
  try {
    const { status, approved_by, approval_notes } = req.body;
    
    await pool.execute(
      `UPDATE leave_requests SET status = ?, approved_by = ?, approval_notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, approved_by, approval_notes, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/performance-reviews', async (req, res) => {
  try {
    const [reviews] = await pool.execute(`
      SELECT pr.*, u.first_name, u.last_name, r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
      FROM performance_reviews pr
      JOIN users u ON pr.employee_id = u.id
      LEFT JOIN users r ON pr.reviewer_id = r.id
      ORDER BY pr.review_date DESC
    `);
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/performance-reviews', async (req, res) => {
  try {
    const { employee_id, reviewer_id, review_date, rating, strengths, weaknesses, goals } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO performance_reviews (employee_id, reviewer_id, review_date, rating, strengths, weaknesses, goals, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [employee_id, reviewer_id, review_date, rating, strengths, weaknesses, goals]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/attendance-tracking', async (req, res) => {
  try {
    const { employee_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT ea.*, u.first_name, u.last_name
      FROM employee_attendance ea
      JOIN users u ON ea.employee_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (employee_id) {
      query += ' AND ea.employee_id = ?';
      params.push(employee_id);
    }
    
    if (start_date && end_date) {
      query += ' AND ea.date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    query += ' ORDER BY ea.date DESC';
    
    const [attendance] = await pool.execute(query, params);
    res.json({ success: true, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/attendance-tracking', async (req, res) => {
  try {
    const { employee_id, date, check_in, check_out, status } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO employee_attendance (employee_id, date, check_in, check_out, status, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [employee_id, date, check_in, check_out, status]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/training-programs', async (req, res) => {
  try {
    const [programs] = await pool.execute(`
      SELECT * FROM training_programs ORDER BY start_date DESC
    `);
    res.json({ success: true, programs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/training-programs', async (req, res) => {
  try {
    const { title, description, start_date, end_date, trainer, location } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO training_programs (title, description, start_date, end_date, trainer, location, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [title, description, start_date, end_date, trainer, location]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/training-enrollments', async (req, res) => {
  try {
    const [enrollments] = await pool.execute(`
      SELECT te.*, u.first_name, u.last_name, tp.title as program_title
      FROM training_enrollments te
      JOIN users u ON te.employee_id = u.id
      JOIN training_programs tp ON te.program_id = tp.id
    `);
    res.json({ success: true, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/training-enrollments', async (req, res) => {
  try {
    const { employee_id, program_id } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO training_enrollments (employee_id, program_id, enrollment_date, status, created_at)
       VALUES (?, ?, NOW(), 'enrolled', NOW())`,
      [employee_id, program_id]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/recruitment', async (req, res) => {
  try {
    const [positions] = await pool.execute(`
      SELECT * FROM job_postings WHERE status = 'open' ORDER BY posted_date DESC
    `);
    res.json({ success: true, positions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/recruitment', async (req, res) => {
  try {
    const { title, description, requirements, salary_range, deadline } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO job_postings (title, description, requirements, salary_range, deadline, posted_date, status, created_at)
       VALUES (?, ?, ?, ?, ?, NOW(), 'open', NOW())`,
      [title, description, requirements, salary_range, deadline]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/applications', async (req, res) => {
  try {
    const [applications] = await pool.execute(`
      SELECT ja.*, jp.title as position_title
      FROM job_applications ja
      JOIN job_postings jp ON ja.job_id = jp.id
      ORDER BY ja.applied_date DESC
    `);
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/applications', async (req, res) => {
  try {
    const { job_id, applicant_name, email, phone, resume_url, cover_letter } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO job_applications (job_id, applicant_name, email, phone, resume_url, cover_letter, applied_date, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), 'pending', NOW())`,
      [job_id, applicant_name, email, phone, resume_url, cover_letter]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ========================================
// COMPREHENSIVE STAFF MANAGEMENT SYSTEM
// Shared APIs for all staff roles
// ========================================

const STAFF_ROLES = ['teacher', 'admin', 'accountant', 'headmaster', 'stockmanager', 'advisor', 'dos', 'dod', 'patron', 'matron'];

// ========================================
// DISCIPLINE MANAGEMENT (DOS, DOD, Patron, Matron, Teacher)
// ========================================

// Record discipline incident
router.post('/discipline/incidents', authenticateToken, requireRole(['teacher', 'dos', 'dod', 'patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      student_id, incident_type, category, title, description,
      incident_date, incident_time, location, action_taken,
      punishment, suspension_days, counseling_required,
      witness_names, conduct_points_deducted
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO student_discipline_records (
        student_id, incident_type, category, title, description,
        incident_date, incident_time, location, action_taken,
        punishment, suspension_days, counseling_required,
        reported_by, handled_by, witness_names, status,
        conduct_points_deducted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Reported', ?)
    `, [
      student_id, incident_type, category, title, description,
      incident_date || new Date().toISOString().split('T')[0],
      incident_time || null, location || null, action_taken || null,
      punishment || null, suspension_days || 0, counseling_required || false,
      req.user.id, req.user.id, witness_names || null,
      conduct_points_deducted || 0
    ]);

    // Update student conduct score
    await db.query(`
      UPDATE global_students 
      SET conduct_score = conduct_score - ?
      WHERE id = ?
    `, [conduct_points_deducted || 0, student_id]);

    // Log action
    await db.query(`
      INSERT INTO staff_student_actions (
        staff_id, staff_role, staff_name, student_id,
        student_admission_number, student_name, action_type,
        action_category, action_description, related_record_type,
        related_record_id, impact_level
      ) VALUES (?, ?, ?, ?, 
        (SELECT admission_number FROM global_students WHERE id = ?),
        (SELECT full_name FROM global_students WHERE id = ?),
        'Discipline Incident Recorded', 'Discipline', ?, 'discipline_record', ?, ?)
    `, [
      req.user.id, req.user.role, req.user.name, student_id, student_id, student_id,
      `${incident_type} incident: ${title}`, result.insertId,
      incident_type === 'Critical' ? 'Critical' : incident_type === 'Major' ? 'High' : 'Medium'
    ]);

    // Notify parent if major or critical
    if (incident_type === 'Major' || incident_type === 'Critical') {
      const [parents] = await db.query(`
        SELECT id, phone, email FROM student_parents 
        WHERE student_id = ? AND is_active = true
      `, [student_id]);

      for (const parent of parents) {
        await db.query(`
          INSERT INTO parent_notifications (
            parent_id, student_id, notification_type, title, message,
            priority, delivery_method, requires_action
          ) VALUES (?, ?, 'Discipline', ?, ?, ?, 'All', true)
        `, [
          parent.id, student_id,
          `Discipline Incident: ${title}`,
          `Your child has been involved in a ${incident_type.toLowerCase()} discipline incident. ${description}`,
          incident_type === 'Critical' ? 'Critical' : 'High'
        ]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Discipline incident recorded successfully',
      incidentId: result.insertId
    });
  } catch (error) {
    console.error('Error recording discipline incident:', error);
    res.status(500).json({ success: false, message: 'Failed to record incident', error: error.message });
  }
});

// Get discipline records
router.get('/discipline/incidents', authenticateToken, requireRole(STAFF_ROLES), async (req, res) => {
  try {
    const { student_id, status, incident_type, date_from, date_to } = req.query;

    let query = `
      SELECT sdr.*, 
             gs.full_name as student_name, gs.student_id as student_number,
             u1.name as reported_by_name,
             u2.name as handled_by_name
      FROM student_discipline_records sdr
      INNER JOIN global_students gs ON sdr.student_id = gs.id
      LEFT JOIN users u1 ON sdr.reported_by = u1.id
      LEFT JOIN users u2 ON sdr.handled_by = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (student_id) {
      query += ` AND sdr.student_id = ?`;
      params.push(student_id);
    }

    if (status) {
      query += ` AND sdr.status = ?`;
      params.push(status);
    }

    if (incident_type) {
      query += ` AND sdr.incident_type = ?`;
      params.push(incident_type);
    }

    if (date_from) {
      query += ` AND sdr.incident_date >= ?`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND sdr.incident_date <= ?`;
      params.push(date_to);
    }

    query += ` ORDER BY sdr.incident_date DESC, sdr.created_at DESC`;

    const [incidents] = await db.query(query, params);

    res.json({ success: true, incidents });
  } catch (error) {
    console.error('Error fetching discipline incidents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch incidents', error: error.message });
  }
});

// ========================================
// ACADEMIC RECORDS (Teacher, DOS, Admin, Headmaster)
// ========================================

// Add academic record
router.post('/academic/records', authenticateToken, requireRole(['teacher', 'dos', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      student_id, academic_year, term, subject_id, subject_name,
      marks_obtained, total_marks, remarks, skills_assessment, competencies
    } = req.body;

    const percentage = (marks_obtained / total_marks) * 100;
    let grade = 'F';
    let points = 0;

    if (percentage >= 90) { grade = 'A'; points = 5.0; }
    else if (percentage >= 80) { grade = 'B'; points = 4.0; }
    else if (percentage >= 70) { grade = 'C'; points = 3.0; }
    else if (percentage >= 60) { grade = 'D'; points = 2.0; }
    else if (percentage >= 50) { grade = 'E'; points = 1.0; }

    const [result] = await db.query(`
      INSERT INTO student_academic_records (
        student_id, academic_year, term, subject_id, subject_name,
        marks_obtained, total_marks, percentage, grade, points,
        remarks, teacher_id, assessment_date, skills_assessment, competencies
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)
    `, [
      student_id, academic_year, term, subject_id, subject_name,
      marks_obtained, total_marks, percentage, grade, points,
      remarks || null, req.user.id,
      skills_assessment ? JSON.stringify(skills_assessment) : null,
      competencies ? JSON.stringify(competencies) : null
    ]);

    // Update student GPA
    const [gpaResult] = await db.query(`
      SELECT AVG(points) as avg_points
      FROM student_academic_records
      WHERE student_id = ?
    `, [student_id]);

    await db.query(`
      UPDATE global_students SET current_gpa = ? WHERE id = ?
    `, [gpaResult[0].avg_points || 0, student_id]);

    // Log action
    await db.query(`
      INSERT INTO staff_student_actions (
        staff_id, staff_role, staff_name, student_id,
        student_admission_number, student_name, action_type,
        action_category, action_description, related_record_type,
        related_record_id
      ) VALUES (?, ?, ?, ?, 
        (SELECT admission_number FROM global_students WHERE id = ?),
        (SELECT full_name FROM global_students WHERE id = ?),
        'Academic Record Added', 'Academic', ?, 'academic_record', ?)
    `, [
      req.user.id, req.user.role, req.user.name, student_id, student_id, student_id,
      `Added ${subject_name} marks: ${marks_obtained}/${total_marks} (${grade})`,
      result.insertId
    ]);

    res.status(201).json({
      success: true,
      message: 'Academic record added successfully',
      recordId: result.insertId,
      grade,
      percentage
    });
  } catch (error) {
    console.error('Error adding academic record:', error);
    res.status(500).json({ success: false, message: 'Failed to add academic record', error: error.message });
  }
});

// ========================================
// HEALTH RECORDS (Patron, Matron, Nurse, Admin)
// ========================================

// Add health record
router.post('/health/records', authenticateToken, requireRole(['patron', 'matron', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      student_id, visit_type, symptoms, diagnosis, vital_signs,
      treatment_given, medication_prescribed, dosage_instructions,
      referred_to_hospital, hospital_name, referral_reason,
      follow_up_required, follow_up_date, follow_up_notes,
      parent_notified
    } = req.body;

    const [result] = await db.query(`
      INSERT INTO student_health_records (
        student_id, visit_date, visit_time, visit_type, symptoms,
        diagnosis, vital_signs, treatment_given, medication_prescribed,
        dosage_instructions, referred_to_hospital, hospital_name,
        referral_reason, attended_by, follow_up_required, follow_up_date,
        follow_up_notes, parent_notified
      ) VALUES (?, CURDATE(), CURTIME(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id, visit_type, symptoms || null, diagnosis || null,
      vital_signs ? JSON.stringify(vital_signs) : null,
      treatment_given || null, medication_prescribed || null,
      dosage_instructions || null, referred_to_hospital || false,
      hospital_name || null, referral_reason || null, req.user.id,
      follow_up_required || false, follow_up_date || null,
      follow_up_notes || null, parent_notified || false
    ]);

    // Log action
    await db.query(`
      INSERT INTO staff_student_actions (
        staff_id, staff_role, staff_name, student_id,
        student_admission_number, student_name, action_type,
        action_category, action_description, related_record_type,
        related_record_id, impact_level
      ) VALUES (?, ?, ?, ?, 
        (SELECT admission_number FROM global_students WHERE id = ?),
        (SELECT full_name FROM global_students WHERE id = ?),
        'Health Record Added', 'Health', ?, 'health_record', ?, ?)
    `, [
      req.user.id, req.user.role, req.user.name, student_id, student_id, student_id,
      `${visit_type}: ${diagnosis || symptoms}`, result.insertId,
      referred_to_hospital ? 'High' : visit_type === 'Emergency' ? 'Critical' : 'Medium'
    ]);

    // Notify parents if emergency or referred to hospital
    if (visit_type === 'Emergency' || referred_to_hospital) {
      const [parents] = await db.query(`
        SELECT id FROM student_parents 
        WHERE student_id = ? AND is_active = true
      `, [student_id]);

      for (const parent of parents) {
        await db.query(`
          INSERT INTO parent_notifications (
            parent_id, student_id, notification_type, title, message,
            priority, delivery_method, requires_action
          ) VALUES (?, ?, 'Health', ?, ?, 'Critical', 'All', true)
        `, [
          parent.id, student_id,
          `Health Alert: ${visit_type}`,
          `Your child visited the school clinic. ${diagnosis || symptoms}. ${referred_to_hospital ? `Referred to ${hospital_name}.` : 'Treatment provided.'}`
        ]);

        // Mark as notified
        await db.query(`
          UPDATE student_health_records 
          SET parent_notified = true, notification_sent_at = NOW()
          WHERE id = ?
        `, [result.insertId]);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Health record added successfully',
      recordId: result.insertId
    });
  } catch (error) {
    console.error('Error adding health record:', error);
    res.status(500).json({ success: false, message: 'Failed to add health record', error: error.message });
  }
});

// ========================================
// FINANCIAL MANAGEMENT (Accountant, Admin, Headmaster)
// ========================================

// Record fee payment
router.post('/finance/payments', authenticateToken, requireRole(['accountant', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      student_id, amount_paid, payment_method, fee_type, description,
      academic_year, term, mobile_money_provider, mobile_money_transaction_ref,
      payer_phone, paid_by_parent_id
    } = req.body;

    // Generate unique payment reference
    const paymentRef = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const receiptNumber = `REC-${Date.now()}`;

    const [result] = await db.query(`
      INSERT INTO student_fee_payments (
        student_id, payment_reference, payment_date, academic_year,
        term, amount_paid, payment_method, fee_type, description,
        mobile_money_provider, mobile_money_transaction_ref, payer_phone,
        receipt_number, received_by, approved_by, approval_status,
        paid_by_parent_id
      ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', ?)
    `, [
      student_id, paymentRef, academic_year || null, term || null,
      amount_paid, payment_method, fee_type, description || null,
      mobile_money_provider || null, mobile_money_transaction_ref || null,
      payer_phone || null, receiptNumber, req.user.id, req.user.id,
      paid_by_parent_id || null
    ]);

    // Update student fee balance
    const [feeInfo] = await db.query(`
      SELECT fee_balance, total_fees_paid FROM global_students WHERE id = ?
    `, [student_id]);

    const newBalance = parseFloat(feeInfo[0].fee_balance || 0) - parseFloat(amount_paid);
    const newTotalPaid = parseFloat(feeInfo[0].total_fees_paid || 0) + parseFloat(amount_paid);

    await db.query(`
      UPDATE global_students 
      SET fee_balance = ?, total_fees_paid = ?
      WHERE id = ?
    `, [newBalance, newTotalPaid, student_id]);

    // Log action
    await db.query(`
      INSERT INTO staff_student_actions (
        staff_id, staff_role, staff_name, student_id,
        student_admission_number, student_name, action_type,
        action_category, action_description, related_record_type,
        related_record_id
      ) VALUES (?, ?, ?, ?, 
        (SELECT admission_number FROM global_students WHERE id = ?),
        (SELECT full_name FROM global_students WHERE id = ?),
        'Fee Payment Recorded', 'Financial', ?, 'fee_payment', ?)
    `, [
      req.user.id, req.user.role, req.user.name, student_id, student_id, student_id,
      `Payment of ${amount_paid} RWF received via ${payment_method}. Receipt: ${receiptNumber}`,
      result.insertId
    ]);

    // Notify parent
    if (paid_by_parent_id) {
      await db.query(`
        INSERT INTO parent_notifications (
          parent_id, student_id, notification_type, title, message,
          priority, delivery_method
        ) VALUES (?, ?, 'Financial', 'Payment Confirmed', ?, 'Normal', 'All')
      `, [
        paid_by_parent_id, student_id,
        `Your payment of ${amount_paid} RWF has been received. Receipt: ${receiptNumber}. New balance: ${newBalance} RWF.`
      ]);
    }

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      paymentId: result.insertId,
      paymentReference: paymentRef,
      receiptNumber,
      newBalance
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment', error: error.message });
  }
});

// Get payment history
router.get('/finance/payments', authenticateToken, requireRole(['accountant', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { student_id, date_from, date_to, payment_method, fee_type } = req.query;

    let query = `
      SELECT sfp.*,
             gs.full_name as student_name, gs.student_id as student_number,
             u.name as received_by_name
      FROM student_fee_payments sfp
      INNER JOIN global_students gs ON sfp.student_id = gs.id
      LEFT JOIN users u ON sfp.received_by = u.id
      WHERE sfp.approval_status = 'Approved'
    `;
    const params = [];

    if (student_id) {
      query += ` AND sfp.student_id = ?`;
      params.push(student_id);
    }

    if (date_from) {
      query += ` AND sfp.payment_date >= ?`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND sfp.payment_date <= ?`;
      params.push(date_to);
    }

    if (payment_method) {
      query += ` AND sfp.payment_method = ?`;
      params.push(payment_method);
    }

    if (fee_type) {
      query += ` AND sfp.fee_type = ?`;
      params.push(fee_type);
    }

    query += ` ORDER BY sfp.payment_date DESC, sfp.created_at DESC`;

    const [payments] = await db.query(query, params);

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments', error: error.message });
  }
});

// ========================================
// COUNSELING & ADVISORY (Advisor, DOS, Patron, Matron)
// ========================================

// Add counseling session note
router.post('/counseling/sessions', authenticateToken, requireRole(['advisor', 'dos', 'patron', 'matron', 'admin']), async (req, res) => {
  try {
    const { student_id, session_type, topic, notes, recommendations, follow_up_required, follow_up_date } = req.body;

    const [result] = await db.query(`
      INSERT INTO staff_student_actions (
        staff_id, staff_role, staff_name, student_id,
        student_admission_number, student_name, action_type,
        action_category, action_description, context_data,
        requires_followup, followup_date
      ) VALUES (?, ?, ?, ?, 
        (SELECT admission_number FROM global_students WHERE id = ?),
        (SELECT full_name FROM global_students WHERE id = ?),
        'Counseling Session', 'Counseling', ?, ?, ?, ?)
    `, [
      req.user.id, req.user.role, req.user.name, student_id, student_id, student_id,
      `${session_type}: ${topic}`,
      JSON.stringify({ notes, recommendations }),
      follow_up_required || false,
      follow_up_date || null
    ]);

    res.status(201).json({
      success: true,
      message: 'Counseling session recorded successfully',
      sessionId: result.insertId
    });
  } catch (error) {
    console.error('Error recording counseling session:', error);
    res.status(500).json({ success: false, message: 'Failed to record session', error: error.message });
  }
});

// ========================================
// STAFF ACTION LOGS & ANALYTICS
// ========================================

// Get all staff actions (Admin, Headmaster)
router.get('/staff/actions', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { staff_id, student_id, action_category, date_from, date_to, page = 1, limit = 50 } = req.query;

    let query = `
      SELECT ssa.*, gs.full_name as student_full_name
      FROM staff_student_actions ssa
      INNER JOIN global_students gs ON ssa.student_id = gs.id
      WHERE 1=1
    `;
    const params = [];

    if (staff_id) {
      query += ` AND ssa.staff_id = ?`;
      params.push(staff_id);
    }

    if (student_id) {
      query += ` AND ssa.student_id = ?`;
      params.push(student_id);
    }

    if (action_category) {
      query += ` AND ssa.action_category = ?`;
      params.push(action_category);
    }

    if (date_from) {
      query += ` AND DATE(ssa.created_at) >= ?`;
      params.push(date_from);
    }

    if (date_to) {
      query += ` AND DATE(ssa.created_at) <= ?`;
      params.push(date_to);
    }

    query += ` ORDER BY ssa.created_at DESC`;
    
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [actions] = await db.query(query, params);

    res.json({ success: true, actions });
  } catch (error) {
    console.error('Error fetching staff actions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff actions', error: error.message });
  }
});

// Get staff performance metrics
router.get('/staff/:id/metrics', authenticateToken, requireRole(['admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;

    const [metrics] = await db.query(`
      SELECT 
        COUNT(*) as total_actions,
        COUNT(DISTINCT student_id) as students_engaged,
        COUNT(DISTINCT action_category) as action_categories,
        SUM(CASE WHEN action_category = 'Academic' THEN 1 ELSE 0 END) as academic_actions,
        SUM(CASE WHEN action_category = 'Discipline' THEN 1 ELSE 0 END) as discipline_actions,
        SUM(CASE WHEN action_category = 'Health' THEN 1 ELSE 0 END) as health_actions,
        SUM(CASE WHEN action_category = 'Financial' THEN 1 ELSE 0 END) as financial_actions,
        SUM(CASE WHEN action_category = 'Counseling' THEN 1 ELSE 0 END) as counseling_actions
      FROM staff_student_actions
      WHERE staff_id = ?
    `, [id]);

    res.json({ success: true, metrics: metrics[0] });
  } catch (error) {
    console.error('Error fetching staff metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch metrics', error: error.message });
  }
});

module.exports = router;

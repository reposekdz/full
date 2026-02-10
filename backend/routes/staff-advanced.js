const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/staff/documents';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `staff_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Staff roles configuration
const STAFF_ROLES = {
  school_owner: { label: 'School Owner', label_rw: 'Umuyobozi w\'Ishuri', priority: 1 },
  admin: { label: 'Administrator', label_rw: 'Umuyobozi Mukuru', priority: 2 },
  headmaster: { label: 'Headmaster', label_rw: 'Umuyobozi w\'Ishuri', priority: 3 },
  director_study: { label: 'Director of Studies', label_rw: 'Umuyobozi w\'Amasomo', priority: 4 },
  director_discipline: { label: 'Discipline Director', label_rw: 'Umuyobozi w\'Imyitwarire', priority: 5 },
  accountant: { label: 'Accountant', label_rw: 'Umubare', priority: 6 },
  stock_manager: { label: 'Stock Manager', label_rw: 'Umuyobozi w\'Ibikoresho', priority: 7 },
  teacher: { label: 'Teacher', label_rw: 'Umwarimu', priority: 8 },
  advisor: { label: 'Advisor', label_rw: 'Umujyanama', priority: 9 },
  patron: { label: 'Patron', label_rw: 'Patron', priority: 10 },
  matron: { label: 'Matron', label_rw: 'Matron', priority: 11 },
  support_staff: { label: 'Support Staff', label_rw: 'Abakozi b\'Amashuri', priority: 12 }
};

// ==================== CORE STAFF ROUTES ====================

// Get all staff with advanced filtering and search
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      search,
      role,
      department,
      status,
      contract_type,
      min_salary,
      max_salary,
      hire_date_from,
      hire_date_to,
      min_rating,
      sort_by = 'last_name',
      sort_order = 'ASC',
      page = 1,
      limit = 50,
      analytics
    } = req.query;

    let query = `
      SELECT 
        sm.*,
        sr.role_label,
        sr.role_label_rw,
        sp.first_name,
        sp.last_name,
        sp.email,
        sp.phone,
        sp.profile_image,
        sp.date_of_birth,
        sp.address,
        sp.emergency_contact,
        sp.emergency_phone,
        sp.hire_date,
        sm.status as employment_status,
        sm.specialization,
        sm.department,
        sm.salary,
        sm.bank_account,
        sm.tin_number,
        sm.nssf_number,
        sm.contract_type,
        sm.working_hours,
        sm.leave_balance,
        perf.avg_rating,
        perf.review_count
      FROM staff_management sm
      LEFT JOIN staff_roles sr ON sm.role_id = sr.id
      LEFT JOIN staff_profiles sp ON sm.id = sp.staff_id
      LEFT JOIN (
        SELECT staff_id, AVG(overall_rating) AS avg_rating, COUNT(*) AS review_count
        FROM staff_reviews
        GROUP BY staff_id
      ) perf ON perf.staff_id = sm.id
      WHERE sm.status != 'deleted'
    `;

    const params = [];

    if (search) {
      query += ` AND (
        sm.first_name LIKE ? OR 
        sm.last_name LIKE ? OR 
        sp.email LIKE ? OR 
        sp.phone LIKE ? OR
        sm.employee_id LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (role && role !== 'all') {
      query += ` AND sm.role_name = ?`;
      params.push(role);
    }

    if (department && department !== 'all') {
      query += ` AND sm.department = ?`;
      params.push(department);
    }

    if (status && status !== 'all') {
      query += ` AND sm.status = ?`;
      params.push(status);
    }
    if (contract_type && contract_type !== 'all') {
      query += ` AND sm.contract_type = ?`;
      params.push(contract_type);
    }
    if (min_salary) {
      query += ` AND sm.salary >= ?`;
      params.push(Number(min_salary));
    }
    if (max_salary) {
      query += ` AND sm.salary <= ?`;
      params.push(Number(max_salary));
    }
    if (hire_date_from) {
      query += ` AND sp.hire_date >= ?`;
      params.push(hire_date_from);
    }
    if (hire_date_to) {
      query += ` AND sp.hire_date <= ?`;
      params.push(hire_date_to);
    }
    if (min_rating) {
      query += ` AND (perf.avg_rating IS NULL OR perf.avg_rating >= ?)`;
      params.push(Number(min_rating));
    }

    // Get total count
    const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM');
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Add sorting and pagination
    const validSortColumns = ['last_name', 'first_name', 'hire_date', 'role_name', 'department', 'created_at', 'salary', 'avg_rating'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'last_name';
    const order = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY sm.${sortColumn} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [staff] = await pool.execute(query, params);

    // If analytics requested, return aggregated data
    if (analytics === 'true') {
      const analyticsQuery = `
        SELECT 
          COUNT(*) as total_staff,
          SUM(CASE WHEN sm.status = 'active' THEN 1 ELSE 0 END) as active_staff,
          SUM(CASE WHEN sm.status = 'inactive' THEN 1 ELSE 0 END) as inactive_staff,
          SUM(CASE WHEN sm.role_name = 'teacher' THEN 1 ELSE 0 END) as total_teachers,
          SUM(CASE WHEN sm.role_name = 'admin' THEN 1 ELSE 0 END) as total_admin,
          COUNT(DISTINCT sm.department) as total_departments,
          AVG(DATEDIFF(CURDATE(), sp.hire_date)) as avg_tenure_days,
          SUM(CASE WHEN sm.contract_type = 'permanent' THEN 1 ELSE 0 END) as permanent_staff,
          SUM(CASE WHEN sm.contract_type = 'contract' THEN 1 ELSE 0 END) as contract_staff
        FROM staff_management sm
        LEFT JOIN staff_profiles sp ON sm.id = sp.staff_id
        WHERE sm.status != 'deleted'
      `;
      const [analyticsData] = await pool.execute(analyticsQuery);
      const [salaryStats] = await pool.execute(`
        SELECT SUM(salary) as total_payroll, AVG(salary) as avg_salary, MIN(salary) as min_salary, MAX(salary) as max_salary
        FROM staff_management WHERE status != 'deleted'
      `);
      const [contractDist] = await pool.execute(`
        SELECT contract_type, COUNT(*) as count 
        FROM staff_management 
        WHERE status != 'deleted' 
        GROUP BY contract_type
      `);
      const [ratingStats] = await pool.execute(`
        SELECT AVG(overall_rating) as avg_rating, COUNT(*) as total_reviews
        FROM staff_reviews
      `);
      
      // Role distribution
      const roleQuery = `
        SELECT role_name, COUNT(*) as count 
        FROM staff_management 
        WHERE status != 'deleted'
        GROUP BY role_name
      `;
      const [roleDistribution] = await pool.execute(roleQuery);

      // Department distribution
      const deptQuery = `
        SELECT department, COUNT(*) as count 
        FROM staff_management 
        WHERE status != 'deleted' AND department IS NOT NULL
        GROUP BY department
      `;
      const [deptDistribution] = await pool.execute(deptQuery);

      // Monthly hiring trends (last 12 months)
      const trendsQuery = `
        SELECT 
          DATE_FORMAT(sp.hire_date, '%Y-%m') as month,
          COUNT(*) as hires
        FROM staff_profiles sp
        JOIN staff_management sm ON sp.staff_id = sm.id
        WHERE sp.hire_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(sp.hire_date, '%Y-%m')
        ORDER BY month DESC
      `;
      const [hiringTrends] = await pool.execute(trendsQuery);

      return res.json({
        success: true,
        staff,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        analytics: {
          summary: analyticsData[0],
          salary_stats: salaryStats[0],
          contract_distribution: contractDist,
          rating_overview: ratingStats[0],
          role_distribution: roleDistribution,
          department_distribution: deptDistribution,
          hiring_trends: hiringTrends
        }
      });
    }

    res.json({
      success: true,
      staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff', error: error.message });
  }
});

// Get single staff member with full details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { include_documents, include_schedule, include_performance } = req.query;

    // Get basic staff info
    const [staff] = await pool.execute(`
      SELECT 
        sm.*,
        sr.role_label,
        sr.role_label_rw,
        sp.*,
        sm.status as employment_status
      FROM staff_management sm
      LEFT JOIN staff_roles sr ON sm.role_id = sr.id
      LEFT JOIN staff_profiles sp ON sm.id = sp.staff_id
      WHERE sm.id = ?
    `, [id]);

    if (staff.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const staffMember = staff[0];

    // Include documents if requested
    if (include_documents === 'true') {
      const [documents] = await pool.execute(`
        SELECT * FROM staff_documents 
        WHERE staff_id = ? 
        ORDER BY upload_date DESC
      `, [id]);
      staffMember.documents = documents;
    }

    // Include schedule if requested
    if (include_schedule === 'true') {
      const [schedule] = await pool.execute(`
        SELECT * FROM staff_schedule 
        WHERE staff_id = ? 
        ORDER BY day_of_week, start_time
      `, [id]);
      staffMember.schedule = schedule;
    }

    // Include performance data if requested
    if (include_performance === 'true') {
      const [performance] = await pool.execute(`
        SELECT 
          sp.*,
          sr.evaluation_period,
          sr.overall_rating,
          sr.rating_breakdown,
          sr.strengths,
          sr.areas_for_improvement,
          sr.recommendations,
          sr.created_at as evaluation_date
        FROM staff_performance sp
        LEFT JOIN staff_reviews sr ON sp.id = sr.performance_id
        WHERE sp.staff_id = ?
        ORDER BY sr.created_at DESC
      `, [id]);
      staffMember.performance = performance;
    }

    // Get activity log
    const [activities] = await pool.execute(`
      SELECT * FROM staff_activity_log 
      WHERE staff_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [id]);
    staffMember.activities = activities;

    res.json({ success: true, staff: staffMember });
  } catch (error) {
    console.error('Get staff details error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff details', error: error.message });
  }
});

// Create new staff member
router.post('/', authenticateToken, authorize(['school_owner', 'admin', 'headmaster']), async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      role_name,
      department,
      specialization,
      hire_date,
      contract_type,
      working_hours,
      salary,
      bank_account,
      tin_number,
      nssf_number,
      date_of_birth,
      address,
      emergency_contact,
      emergency_phone
    } = req.body;

    // Generate employee ID
    const [maxId] = await pool.execute('SELECT MAX(id) as max_id FROM staff_management');
    const employeeId = `EMP${String((maxId[0]?.max_id || 0) + 1).padStart(4, '0')}`;

    // Insert into staff_management
    const [result] = await pool.execute(`
      INSERT INTO staff_management (
        employee_id, role_name, department, specialization, status,
        contract_type, working_hours, salary, bank_account, tin_number, nssf_number,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      employeeId, role_name, department, specialization,
      contract_type, working_hours, salary, bank_account, tin_number, nssf_number
    ]);

    const staffId = result.insertId;

    // Insert into staff_profiles
    await pool.execute(`
      INSERT INTO staff_profiles (
        staff_id, first_name, last_name, email, phone, 
        date_of_birth, address, emergency_contact, emergency_phone, hire_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      staffId, first_name, last_name, email, phone,
      date_of_birth, address, emergency_contact, emergency_phone, hire_date
    ]);

    // Log activity
    await pool.execute(`
      INSERT INTO staff_activity_log (staff_id, action, description, created_at)
      VALUES (?, 'created', 'New staff member hired', NOW())
    `, [staffId]);

    res.json({
      success: true,
      message: 'Staff member created successfully',
      staff_id: staffId,
      employee_id: employeeId
    });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to create staff', error: error.message });
  }
});

// Update staff member
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    // Update staff_management fields
    const managementFields = ['department', 'specialization', 'status', 'contract_type', 
      'working_hours', 'salary', 'bank_account', 'tin_number', 'nssf_number', 'leave_balance'];
    
    const managementUpdates = {};
    managementFields.forEach(field => {
      if (updates[field] !== undefined) {
        managementUpdates[field] = updates[field];
      }
    });

    if (Object.keys(managementUpdates).length > 0) {
      const setClause = Object.keys(managementUpdates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(managementUpdates), id];
      await pool.execute(`UPDATE staff_management SET ${setClause}, updated_at = NOW() WHERE id = ?`, values);
    }

    // Update staff_profiles fields
    const profileFields = ['first_name', 'last_name', 'email', 'phone', 
      'date_of_birth', 'address', 'emergency_contact', 'emergency_phone', 'profile_image'];
    
    const profileUpdates = {};
    profileFields.forEach(field => {
      if (updates[field] !== undefined) {
        profileUpdates[field] = updates[field];
      }
    });

    if (Object.keys(profileUpdates).length > 0) {
      const setClause = Object.keys(profileUpdates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(profileUpdates), id];
      await pool.execute(`UPDATE staff_profiles SET ${setClause}, updated_at = NOW() WHERE staff_id = ?`, values);
    }

    // Log activity
    await pool.execute(`
      INSERT INTO staff_activity_log (staff_id, action, description, created_at)
      VALUES (?, 'updated', 'Staff profile updated', NOW())
    `, [id]);

    res.json({ success: true, message: 'Staff updated successfully' });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to update staff', error: error.message });
  }
});

// Delete/Deactivate staff
router.delete('/:id', authenticateToken, authorize(['school_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    if (permanent === 'true') {
      // Permanent deletion
      await pool.execute('DELETE FROM staff_documents WHERE staff_id = ?', [id]);
      await pool.execute('DELETE FROM staff_schedule WHERE staff_id = ?', [id]);
      await pool.execute('DELETE FROM staff_performance WHERE staff_id = ?', [id]);
      await pool.execute('DELETE FROM staff_activity_log WHERE staff_id = ?', [id]);
      await pool.execute('DELETE FROM staff_profiles WHERE staff_id = ?', [id]);
      await pool.execute('DELETE FROM staff_management WHERE id = ?', [id]);
      res.json({ success: true, message: 'Staff permanently deleted' });
    } else {
      // Soft delete (deactivate)
      await pool.execute('UPDATE staff_management SET status = ?, updated_at = NOW() WHERE id = ?', ['inactive', id]);
      await pool.execute(`
        INSERT INTO staff_activity_log (staff_id, action, description, created_at)
        VALUES (?, 'deactivated', 'Staff account deactivated', NOW())
      `, [id]);
      res.json({ success: true, message: 'Staff deactivated successfully' });
    }
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete staff', error: error.message });
  }
});

// ==================== BULK OPERATIONS ====================

// Bulk update staff
router.post('/bulk-update', authenticateToken, authorize(['school_owner', 'admin']), async (req, res) => {
  try {
    const { staff_ids, updates, action, ...inline } = req.body;
    const payload = updates || inline || {};
    const userId = req.user?.id;

    if (!staff_ids || !Array.isArray(staff_ids) || staff_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Staff IDs required' });
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const staffId of staff_ids) {
      try {
        if (action === 'update_department') {
          await pool.execute('UPDATE staff_management SET department = ? WHERE id = ?', [payload.department, staffId]);
        } else if (action === 'update_status') {
          await pool.execute('UPDATE staff_management SET status = ? WHERE id = ?', [payload.status, staffId]);
        } else if (action === 'update_role') {
          await pool.execute('UPDATE staff_management SET role_name = ? WHERE id = ?', [payload.role_name, staffId]);
        } else if (action === 'update_salary') {
          await pool.execute('UPDATE staff_management SET salary = ? WHERE id = ?', [payload.salary, staffId]);
        } else if (action === 'update_contract') {
          await pool.execute('UPDATE staff_management SET contract_type = ?, working_hours = ? WHERE id = ?', [payload.contract_type, payload.working_hours || 40, staffId]);
        } else if (action === 'adjust_leave') {
          await pool.execute('UPDATE staff_management SET leave_balance = leave_balance + ? WHERE id = ?', [payload.delta || 0, staffId]);
        } else {
          throw new Error(`Unsupported bulk action: ${action}`);
        }

        await pool.execute(`
          INSERT INTO staff_activity_log (staff_id, action, description, created_at)
          VALUES (?, 'bulk_update', ?, NOW())
        `, [staffId, `Bulk ${action} applied`]);

        results.successful.push(staffId);
      } catch (err) {
        results.failed.push({ id: staffId, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk update completed`,
      results
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ success: false, message: 'Bulk update failed', error: error.message });
  }
});

// Bulk delete staff
router.post('/bulk-delete', authenticateToken, authorize(['school_owner', 'admin']), async (req, res) => {
  try {
    const { staff_ids } = req.body;

    if (!staff_ids || !Array.isArray(staff_ids) || staff_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Staff IDs required' });
    }

    const placeholders = staff_ids.map(() => '?').join(',');
    await pool.execute(`UPDATE staff_management SET status = 'inactive', updated_at = NOW() WHERE id IN (${placeholders})`, staff_ids);

    // Log bulk action
    for (const staffId of staff_ids) {
      await pool.execute(`
        INSERT INTO staff_activity_log (staff_id, action, description, created_at)
        VALUES (?, 'bulk_deactivated', 'Bulk deactivate action', NOW())
      `, [staffId]);
    }

    res.json({
      success: true,
      message: `${staff_ids.length} staff members deactivated`
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ success: false, message: 'Bulk delete failed', error: error.message });
  }
});

// Export staff data
router.get('/export/csv', authenticateToken, authorize(['school_owner', 'admin']), async (req, res) => {
  try {
    const [staff] = await pool.execute(`
      SELECT 
        sm.employee_id,
        sp.first_name,
        sp.last_name,
        sp.email,
        sp.phone,
        sm.role_name,
        sm.department,
        sm.specialization,
        sm.status,
        sp.hire_date,
        sm.contract_type,
        sm.salary,
        sm.bank_account,
        sm.tin_number,
        sm.nssf_number,
        sm.created_at
      FROM staff_management sm
      LEFT JOIN staff_profiles sp ON sm.id = sp.staff_id
    `);

    // Generate CSV
    const headers = Object.keys(staff[0] || {}).join(',');
    const rows = staff.map(s => Object.values(s).map(v => `"${v || ''}"`).join(','));
    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=staff_export_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ success: false, message: 'Export failed', error: error.message });
  }
});

// ==================== PERFORMANCE TRACKING ====================

// Get performance reviews
router.get('/:id/performance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { period, year } = req.query;

    let query = `
      SELECT * FROM staff_reviews 
      WHERE staff_id = ? AND deleted_at IS NULL
    `;
    const params = [id];

    if (period) {
      query += ' AND evaluation_period = ?';
      params.push(period);
    }
    if (year) {
      query += ' AND YEAR(created_at) = ?';
      params.push(year);
    }

    query += ' ORDER BY created_at DESC';
    const [reviews] = await pool.execute(query, params);

    // Calculate average rating
    let avgRating = 0;
    if (reviews.length > 0) {
      avgRating = reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length;
    }

    res.json({
      success: true,
      reviews,
      average_rating: avgRating.toFixed(2),
      total_reviews: reviews.length
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch performance data', error: error.message });
  }
});

// Add performance review
router.post('/:id/performance', authenticateToken, authorize(['school_owner', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      evaluation_period,
      overall_rating,
      rating_breakdown,
      strengths,
      areas_for_improvement,
      recommendations,
      goals,
      comments
    } = req.body;

    await pool.execute(`
      INSERT INTO staff_reviews (
        staff_id, evaluator_id, evaluation_period, overall_rating,
        rating_breakdown, strengths, areas_for_improvement,
        recommendations, goals, comments, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      id, req.user?.id, evaluation_period, overall_rating,
      JSON.stringify(rating_breakdown), strengths, areas_for_improvement,
      recommendations, JSON.stringify(goals), comments
    ]);

    // Update performance score
    await pool.execute(`
      INSERT INTO staff_performance (staff_id, last_evaluation_date, overall_score, updated_at)
      VALUES (?, NOW(), ?, NOW())
      ON DUPLICATE KEY UPDATE last_evaluation_date = NOW(), overall_score = ?, updated_at = NOW()
    `, [id, overall_rating, overall_rating]);

    await pool.execute(`
      INSERT INTO staff_activity_log (staff_id, action, description, created_at)
      VALUES (?, 'performance_review', 'Performance review completed', NOW())
    `, [id]);

    res.json({ success: true, message: 'Performance review added successfully' });
  } catch (error) {
    console.error('Add performance error:', error);
    res.status(500).json({ success: false, message: 'Failed to add performance review', error: error.message });
  }
});

// ==================== SCHEDULING & CALENDAR ====================

// Get staff schedule
router.get('/:id/schedule', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { week_start } = req.query;

    const [schedule] = await pool.execute(`
      SELECT * FROM staff_schedule 
      WHERE staff_id = ? 
      ORDER BY day_of_week, start_time
    `, [id]);

    res.json({ success: true, schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule', error: error.message });
  }
});

// Update staff schedule
router.put('/:id/schedule', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body; // Array of schedule entries

    // Delete existing schedule
    await pool.execute('DELETE FROM staff_schedule WHERE staff_id = ?', [id]);

    // Insert new schedule
    if (schedule && schedule.length > 0) {
      for (const entry of schedule) {
        await pool.execute(`
          INSERT INTO staff_schedule (staff_id, day_of_week, start_time, end_time, location, activity, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [id, entry.day_of_week, entry.start_time, entry.end_time, entry.location, entry.activity, entry.notes]);
      }
    }

    await pool.execute(`
      INSERT INTO staff_activity_log (staff_id, action, description, created_at)
      VALUES (?, 'schedule_updated', 'Schedule updated', NOW())
    `, [id]);

    res.json({ success: true, message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule', error: error.message });
  }
});

// Get all staff schedules for calendar view
router.get('/schedules/calendar', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;

    const [schedules] = await pool.execute(`
      SELECT 
        ss.*,
        sm.employee_id,
        CONCAT(sp.first_name, ' ', sp.last_name) as staff_name,
        sr.role_label
      FROM staff_schedule ss
      JOIN staff_management sm ON ss.staff_id = sm.id
      JOIN staff_profiles sp ON sm.id = sp.staff_id
      LEFT JOIN staff_roles sr ON sm.role_id = sr.id
      ${date ? "WHERE DATE(ss.created_at) = DATE(?)" : ""}
      ORDER BY ss.day_of_week, ss.start_time
    `, date ? [date] : []);

    res.json({ success: true, schedules });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch calendar', error: error.message });
  }
});

// ==================== DOCUMENT MANAGEMENT ====================

// Get staff documents
router.get('/:id/documents', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;

    let query = 'SELECT * FROM staff_documents WHERE staff_id = ?';
    const params = [id];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY upload_date DESC';
    const [documents] = await pool.execute(query, params);

    // Calculate storage used
    const totalSize = documents.reduce((sum, d) => sum + (d.file_size || 0), 0);

    res.json({
      success: true,
      documents,
      total_count: documents.length,
      total_size_bytes: totalSize,
      total_size_mb: (totalSize / (1024 * 1024)).toFixed(2)
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch documents', error: error.message });
  }
});

// Upload document
router.post('/:id/documents', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const categories = ['contract', 'certificate', 'id_document', 'resume', 'performance', 'other'];

    await pool.execute(`
      INSERT INTO staff_documents (
        staff_id, file_name, file_path, file_type, file_size, category, description, uploaded_by, upload_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      id,
      req.file.originalname,
      req.file.path,
      req.file.mimetype,
      req.file.size,
      categories.includes(category) ? category : 'other',
      description,
      req.user?.id
    ]);

    await pool.execute(`
      INSERT INTO staff_activity_log (staff_id, action, description, created_at)
      VALUES (?, 'document_uploaded', CONCAT('Document uploaded: ', ?), NOW())
    `, [id, req.file.originalname]);

    res.json({ success: true, message: 'Document uploaded successfully' });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document', error: error.message });
  }
});

// Delete document
router.delete('/:id/documents/:doc_id', authenticateToken, async (req, res) => {
  try {
    const { id, doc_id } = req.params;

    // Get document info
    const [docs] = await pool.execute('SELECT * FROM staff_documents WHERE id = ? AND staff_id = ?', [doc_id, id]);
    
    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Delete file
    if (docs[0].file_path && fs.existsSync(docs[0].file_path)) {
      fs.unlinkSync(docs[0].file_path);
    }

    // Delete record
    await pool.execute('DELETE FROM staff_documents WHERE id = ?', [doc_id]);

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document', error: error.message });
  }
});

// ==================== NOTIFICATIONS & COMMUNICATION ====================

// Current user notifications (dashboard)
router.get('/notifications/me', authenticateToken, async (req, res) => {
  try {
    const staffId = req.user?.id;
    const { unread_only, limit = 50 } = req.query;

    let query = 'SELECT * FROM staff_notifications WHERE staff_id = ?';
    const params = [staffId];
    if (unread_only === 'true') {
      query += ' AND is_read = 0';
    }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [notifications] = await pool.execute(query, params);
    const [unreadCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM staff_notifications WHERE staff_id = ? AND is_read = 0',
      [staffId]
    );

    res.json({
      success: true,
      notifications,
      unread_count: unreadCount[0]?.count || 0
    });
  } catch (error) {
    console.error('Get my notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
});

// Mark all notifications as read for current user
router.put('/notifications/me/read-all', authenticateToken, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE staff_notifications SET is_read = 1, read_at = NOW() WHERE staff_id = ?',
      [req.user?.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notifications as read', error: error.message });
  }
});

// Get staff notifications
router.get('/:id/notifications', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { unread_only, limit = 50 } = req.query;

    let query = `
      SELECT * FROM staff_notifications 
      WHERE staff_id = ? 
    `;
    const params = [id];

    if (unread_only === 'true') {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [notifications] = await pool.execute(query, params);

    // Get unread count
    const [unreadCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM staff_notifications WHERE staff_id = ? AND is_read = 0',
      [id]
    );

    res.json({
      success: true,
      notifications,
      unread_count: unreadCount[0]?.count || 0
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
});

// Send notification to staff
router.post('/:id/notifications', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, priority, action_url } = req.body;

    await pool.execute(`
      INSERT INTO staff_notifications (
        staff_id, title, message, type, priority, action_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [id, title, message, type || 'info', priority || 'normal', action_url || null]);

    res.json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification', error: error.message });
  }
});

// Broadcast notification to multiple staff
router.post('/notifications/broadcast', authenticateToken, authorize(['school_owner', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { staff_ids, title, message, type, priority, role_filter } = req.body;
    const senderId = req.user?.id;

    let staffMembers = [];
    
    if (role_filter) {
      // Get staff by role
      const [result] = await pool.execute(
        'SELECT id FROM staff_management WHERE role_name = ? AND status = "active"',
        [role_filter]
      );
      staffMembers = result.map(r => r.id);
    } else if (staff_ids && Array.isArray(staff_ids)) {
      staffMembers = staff_ids;
    } else {
      // Get all active staff
      const [result] = await pool.execute(
        'SELECT id FROM staff_management WHERE status = "active"'
      );
      staffMembers = result.map(r => r.id);
    }

    // Insert notifications
    for (const staffId of staffMembers) {
      await pool.execute(`
        INSERT INTO staff_notifications (staff_id, title, message, type, priority, sender_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [staffId, title, message, type || 'info', priority || 'normal', senderId]);
    }

    res.json({
      success: true,
      message: `Notification sent to ${staffMembers.length} staff members`
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ success: false, message: 'Failed to broadcast notification', error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      'UPDATE staff_notifications SET is_read = 1, read_at = NOW() WHERE id = ?',
      [id]
    );
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read', error: error.message });
  }
});

// ==================== REAL-TIME ACTIVITY TRACKING ====================

// Get activity log
router.get('/:id/activities', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, offset = 0, action_type } = req.query;

    let query = 'SELECT * FROM staff_activity_log WHERE staff_id = ?';
    const params = [id];

    if (action_type && action_type !== 'all') {
      query += ' AND action = ?';
      params.push(action_type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [activities] = await pool.execute(query, params);

    // Get activity statistics
    const [stats] = await pool.execute(`
      SELECT action, COUNT(*) as count 
      FROM staff_activity_log 
      WHERE staff_id = ? 
      GROUP BY action
    `, [id]);

    res.json({
      success: true,
      activities,
      statistics: stats,
      total: activities.length
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities', error: error.message });
  }
});

// Log activity (internal use)
router.post('/activities/log', authenticateToken, async (req, res) => {
  try {
    const { staff_id, action, description, metadata } = req.body;

    await pool.execute(`
      INSERT INTO staff_activity_log (staff_id, action, description, metadata, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [staff_id, action, description, JSON.stringify(metadata || {})]);

    res.json({ success: true, message: 'Activity logged' });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to log activity', error: error.message });
  }
});

// Get all staff activities (for admin view)
router.get('/activities/all', authenticateToken, authorize(['school_owner', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { limit = 200, action_type, staff_id, date_from, date_to } = req.query;

    let query = `
      SELECT sal.*,
        CONCAT(sp.first_name, ' ', sp.last_name) as staff_name,
        sm.employee_id,
        sm.role_name
      FROM staff_activity_log sal
      JOIN staff_management sm ON sal.staff_id = sm.id
      JOIN staff_profiles sp ON sm.id = sp.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (action_type) {
      query += ' AND sal.action = ?';
      params.push(action_type);
    }
    if (staff_id) {
      query += ' AND sal.staff_id = ?';
      params.push(staff_id);
    }
    if (date_from) {
      query += ' AND sal.created_at >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND sal.created_at <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY sal.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [activities] = await pool.execute(query, params);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Get all activities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities', error: error.message });
  }
});

// Lightweight live feed for dashboard
router.get('/activities/live', authenticateToken, authorize(['school_owner', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const [activities] = await pool.execute(`
      SELECT sal.*, CONCAT(sp.first_name, ' ', sp.last_name) as staff_name, sm.role_name
      FROM staff_activity_log sal
      JOIN staff_management sm ON sal.staff_id = sm.id
      JOIN staff_profiles sp ON sm.id = sp.staff_id
      ORDER BY sal.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);
    res.json({ success: true, activities });
  } catch (error) {
    console.error('Live activities error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch live activities', error: error.message });
  }
});

// ==================== REPORTS & ANALYTICS ====================

// Comprehensive staff reports
router.get('/reports/comprehensive', authenticateToken, authorize(['school_owner', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { year, month } = req.query;

    // Summary statistics
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_staff,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_staff,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_staff,
        SUM(CASE WHEN contract_type = 'permanent' THEN 1 ELSE 0 END) as permanent_staff,
        SUM(CASE WHEN contract_type = 'contract' THEN 1 ELSE 0 END) as contract_staff,
        SUM(salary) as total_monthly_salary,
        AVG(salary) as avg_salary,
        COUNT(DISTINCT department) as total_departments
      FROM staff_management
    `);

    // Role distribution
    const [roleDist] = await pool.execute(`
      SELECT role_name, COUNT(*) as count, 
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM staff_management), 2) as percentage
      FROM staff_management
      GROUP BY role_name
      ORDER BY count DESC
    `);

    // Department analysis
    const [deptAnalysis] = await pool.execute(`
      SELECT department, COUNT(*) as staff_count,
        AVG(salary) as avg_salary,
        SUM(salary) as total_salary
      FROM staff_management
      WHERE department IS NOT NULL
      GROUP BY department
      ORDER BY staff_count DESC
    `);

    // Tenure analysis
    const [tenureAnalysis] = await pool.execute(`
      SELECT 
        CASE 
          WHEN DATEDIFF(CURDATE(), sp.hire_date) < 365 THEN 'Less than 1 year'
          WHEN DATEDIFF(CURDATE(), sp.hire_date) < 730 THEN '1-2 years'
          WHEN DATEDIFF(CURDATE(), sp.hire_date) < 1825 THEN '2-5 years'
          ELSE 'More than 5 years'
        END as tenure_range,
        COUNT(*) as count
      FROM staff_profiles sp
      JOIN staff_management sm ON sp.staff_id = sm.id
      WHERE sm.status = 'active'
      GROUP BY tenure_range
    `);

    // Monthly hiring trends
    const [hiringTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(sp.hire_date, '%Y-%m') as month,
        COUNT(*) as hires,
        SUM(CASE WHEN sm.contract_type = 'permanent' THEN 1 ELSE 0 END) as permanent_hires,
        SUM(CASE WHEN sm.contract_type = 'contract' THEN 1 ELSE 0 END) as contract_hires
      FROM staff_profiles sp
      JOIN staff_management sm ON sp.staff_id = sm.id
      WHERE sp.hire_date >= DATE_SUB(CURDATE(), INTERVAL 24 MONTH)
      GROUP BY DATE_FORMAT(sp.hire_date, '%Y-%m')
      ORDER BY month DESC
    `);

    // Performance overview
    const [performanceOverview] = await pool.execute(`
      SELECT 
        AVG(sr.overall_rating) as avg_rating,
        COUNT(sr.id) as total_reviews,
        SUM(CASE WHEN sr.overall_rating >= 4 THEN 1 ELSE 0 END) as excellent_ratings,
        SUM(CASE WHEN sr.overall_rating >= 3 AND sr.overall_rating < 4 THEN 1 ELSE 0 END) as good_ratings,
        SUM(CASE WHEN sr.overall_rating < 3 THEN 1 ELSE 0 END) as needs_improvement
      FROM staff_reviews sr
    `);

    // Salary distribution
    const [salaryDist] = await pool.execute(`
      SELECT 
        FLOOR(salary / 50000) * 50000 as salary_range,
        COUNT(*) as count
      FROM staff_management
      WHERE salary IS NOT NULL
      GROUP BY FLOOR(salary / 50000) * 50000
      ORDER BY salary_range
    `);

    res.json({
      success: true,
      report: {
        generated_at: new Date().toISOString(),
        summary: summary[0],
        role_distribution: roleDist,
        department_analysis: deptAnalysis,
        tenure_analysis: tenureAnalysis,
        hiring_trends: hiringTrends,
        performance_overview: performanceOverview[0],
        salary_distribution: salaryDist
      }
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate reports', error: error.message });
  }
});

// Attendance report
router.get('/reports/attendance', authenticateToken, authorize(['school_owner', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    // This would integrate with attendance system
    // For now, return mock data structure
    const [attendance] = await pool.execute(`
      SELECT 
        sm.id,
        CONCAT(sp.first_name, ' ', sp.last_name) as name,
        sm.role_name,
        COUNT(DISTINCT DATE(sa.created_at)) as days_present,
        COUNT(DISTINCT CASE WHEN sa.status = 'absent' THEN DATE(sa.created_at) END) as days_absent,
        COUNT(DISTINCT CASE WHEN sa.status = 'late' THEN DATE(sa.created_at) END) as days_late
      FROM staff_management sm
      LEFT JOIN staff_profiles sp ON sm.id = sp.staff_id
      LEFT JOIN staff_attendance sa ON sm.id = sa.staff_id 
        AND MONTH(sa.created_at) = ? AND YEAR(sa.created_at) = ?
      WHERE sm.status = 'active'
      GROUP BY sm.id, sp.first_name, sp.last_name, sm.role_name
    `, [targetMonth, targetYear]);

    res.json({
      success: true,
      report: {
        month: targetMonth,
        year: targetYear,
        attendance
      }
    });
  } catch (error) {
    console.error('Attendance report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate attendance report', error: error.message });
  }
});

// Leave management report
router.get('/reports/leave', authenticateToken, async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    const [leaveReport] = await pool.execute(`
      SELECT 
        sm.id,
        CONCAT(sp.first_name, ' ', sp.last_name) as name,
        sm.role_name,
        sm.leave_balance,
        COUNT(sl.id) as total_leave_requests,
        SUM(CASE WHEN sl.status = 'approved' THEN 1 ELSE 0 END) as approved_leaves,
        SUM(CASE WHEN sl.status = 'pending' THEN 1 ELSE 0 END) as pending_leaves,
        SUM(CASE WHEN sl.status = 'rejected' THEN 1 ELSE 0 END) as rejected_leaves,
        COALESCE(SUM(DATEDIFF(sl.end_date, sl.start_date) + 1), 0) as total_leave_days_taken
      FROM staff_management sm
      LEFT JOIN staff_profiles sp ON sm.id = sp.staff_id
      LEFT JOIN staff_leaves sl ON sm.id = sl.staff_id 
        AND YEAR(sl.created_at) = ?
      WHERE sm.status = 'active'
      GROUP BY sm.id, sp.first_name, sp.last_name, sm.role_name, sm.leave_balance
    `, [targetYear]);

    res.json({
      success: true,
      report: {
        year: targetYear,
        leave_report: leaveReport
      }
    });
  } catch (error) {
    console.error('Leave report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate leave report', error: error.message });
  }
});

// ==================== LEAVE MANAGEMENT ====================

// Get leave balance and history
router.get('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [staff] = await pool.execute(
      'SELECT leave_balance, leave_used FROM staff_management WHERE id = ?',
      [id]
    );

    const [leaveHistory] = await pool.execute(`
      SELECT * FROM staff_leaves 
      WHERE staff_id = ? 
      ORDER BY created_at DESC
    `, [id]);

    res.json({
      success: true,
      leave: {
        balance: staff[0]?.leave_balance || 0,
        used: staff[0]?.leave_used || 0,
        available: (staff[0]?.leave_balance || 0) - (staff[0]?.leave_used || 0),
        history: leaveHistory
      }
    });
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leave data', error: error.message });
  }
});

// Apply for leave
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { leave_type, start_date, end_date, reason, coverage_arrangement } = req.body;

    const [staff] = await pool.execute(
      'SELECT leave_balance, leave_used FROM staff_management WHERE id = ?',
      [id]
    );

    const available = (staff[0]?.leave_balance || 0) - (staff[0]?.leave_used || 0);
    const requestedDays = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)) + 1;

    if (requestedDays > available) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient leave balance. Available: ${available} days, Requested: ${requestedDays} days` 
      });
    }

    await pool.execute(`
      INSERT INTO staff_leaves (staff_id, leave_type, start_date, end_date, reason, coverage_arrangement, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [id, leave_type, start_date, end_date, reason, coverage_arrangement]);

    await pool.execute(`
      INSERT INTO staff_activity_log (staff_id, action, description, created_at)
      VALUES (?, 'leave_applied', 'Leave application submitted', NOW())
    `, [id]);

    res.json({ success: true, message: 'Leave application submitted' });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit leave application', error: error.message });
  }
});

// Approve/reject leave
router.put('/leave/:leave_id', authenticateToken, authorize(['school_owner', 'admin', 'headmaster']), async (req, res) => {
  try {
    const { leave_id } = req.params;
    const { status, reviewer_comments } = req.body;

    // Get leave details
    const [leaves] = await pool.execute(
      'SELECT * FROM staff_leaves WHERE id = ?',
      [leave_id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const leave = leaves[0];
    const days = Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1;

    // Update leave status
    await pool.execute(
      'UPDATE staff_leaves SET status = ?, reviewed_by = ?, reviewed_at = NOW(), reviewer_comments = ? WHERE id = ?',
      [status, req.user?.id, reviewer_comments, leave_id]
    );

    if (status === 'approved') {
      // Update leave used
      await pool.execute(
        'UPDATE staff_management SET leave_used = leave_used + ? WHERE id = ?',
        [days, leave.staff_id]
      );
    }

    await pool.execute(`
      INSERT INTO staff_activity_log (staff_id, action, description, created_at)
      VALUES (?, ?, CONCAT('Leave request ', ?, ': ', ?), NOW())
    `, [leave.staff_id, `leave_${status}`, status, leave_id]);

    res.json({ success: true, message: `Leave ${status}` });
  } catch (error) {
    console.error('Review leave error:', error);
    res.status(500).json({ success: false, message: 'Failed to review leave', error: error.message });
  }
});

// ==================== GET STAFF ROLES ====================

router.get('/meta/roles', authenticateToken, async (req, res) => {
  try {
    const roles = Object.entries(STAFF_ROLES).map(([key, value]) => ({
      id: key,
      ...value,
      count: 0 // Will be populated if needed
    }));
    res.json({ success: true, roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch roles', error: error.message });
  }
});

module.exports = router;

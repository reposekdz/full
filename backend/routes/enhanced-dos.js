const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Enhanced Student Management with Advanced Features
router.get('/students/advanced-search', authenticateToken, async (req, res) => {
  try {
    const {
      search, 
      trade, 
      level, 
      status, 
      performance_grade,
      attendance_min,
      enrollment_year,
      sort_by = 'name',
      sort_order = 'ASC',
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT 
        u.id,
        u.student_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        c.name as class_name,
        t.name as trade_name,
        t.code as trade_code,
        COALESCE(AVG(g.obtained_marks / g.max_marks * 100), 0) as avg_grade,
        COUNT(DISTINCT a.id) as total_attendance_records,
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present_count,
        ROUND(COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0), 2) as attendance_percentage,
        e.enrollment_date,
        e.status as enrollment_status,
        u.created_at
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN courses t ON c.course_id = t.id
      LEFT JOIN grades g ON u.id = g.student_id
      LEFT JOIN attendance a ON u.id = a.student_id
      WHERE u.role = 'student'
    `;

    const queryParams = [];

    // Advanced search filters
    if (search) {
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (trade) {
      query += ` AND t.code = ?`;
      queryParams.push(trade);
    }

    if (level) {
      query += ` AND c.name LIKE ?`;
      queryParams.push(`%${level}%`);
    }

    if (status) {
      query += ` AND e.status = ?`;
      queryParams.push(status);
    }

    if (enrollment_year) {
      query += ` AND YEAR(e.enrollment_date) = ?`;
      queryParams.push(enrollment_year);
    }

    query += ` GROUP BY u.id, u.student_id, u.first_name, u.last_name, u.email, u.phone, c.name, t.name, t.code, e.enrollment_date, e.status, u.created_at`;

    // Performance and attendance filters (applied after aggregation)
    const havingConditions = [];
    if (performance_grade) {
      havingConditions.push(`AVG(g.obtained_marks / g.max_marks * 100) >= ?`);
      queryParams.push(performance_grade);
    }

    if (attendance_min) {
      havingConditions.push(`ROUND(COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0), 2) >= ?`);
      queryParams.push(attendance_min);
    }

    if (havingConditions.length > 0) {
      query += ` HAVING ${havingConditions.join(' AND ')}`;
    }

    // Sorting
    const allowedSortFields = ['name', 'student_id', 'avg_grade', 'attendance_percentage', 'enrollment_date'];
    let orderField = 'u.first_name';
    
    switch (sort_by) {
      case 'name':
        orderField = 'u.first_name';
        break;
      case 'student_id':
        orderField = 'u.student_id';
        break;
      case 'avg_grade':
        orderField = 'avg_grade';
        break;
      case 'attendance_percentage':
        orderField = 'attendance_percentage';
        break;
      case 'enrollment_date':
        orderField = 'e.enrollment_date';
        break;
    }

    query += ` ORDER BY ${orderField} ${sort_order}`;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [students] = await pool.execute(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN courses t ON c.course_id = t.id
      WHERE u.role = 'student'
    `;

    const countParams = [];
    
    if (search) {
      countQuery += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.student_id LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (trade) {
      countQuery += ` AND t.code = ?`;
      countParams.push(trade);
    }

    if (level) {
      countQuery += ` AND c.name LIKE ?`;
      countParams.push(`%${level}%`);
    }

    if (status) {
      countQuery += ` AND e.status = ?`;
      countParams.push(status);
    }

    if (enrollment_year) {
      countQuery += ` AND YEAR(e.enrollment_date) = ?`;
      countParams.push(enrollment_year);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const totalStudents = countResult[0].total;

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: totalStudents,
          total_pages: Math.ceil(totalStudents / limit)
        }
      }
    });

  } catch (error) {
    console.error('Enhanced search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Advanced Analytics Dashboard
router.get('/analytics/comprehensive', authenticateToken, async (req, res) => {
  try {
    const { timeframe = 'current_semester' } = req.query;

    // Academic Performance Analytics
    const [performanceData] = await pool.execute(`
      SELECT 
        c.name as class_name,
        t.name as trade_name,
        COUNT(DISTINCT u.id) as student_count,
        ROUND(AVG(g.obtained_marks / g.max_marks * 100), 2) as avg_performance,
        ROUND(MIN(g.obtained_marks / g.max_marks * 100), 2) as min_performance,
        ROUND(MAX(g.obtained_marks / g.max_marks * 100), 2) as max_performance,
        COUNT(DISTINCT g.id) as total_assessments
      FROM classes c
      LEFT JOIN courses t ON c.course_id = t.id
      LEFT JOIN enrollments e ON c.id = e.class_id
      LEFT JOIN users u ON e.student_id = u.id
      LEFT JOIN grades g ON u.id = g.student_id
      GROUP BY c.id, c.name, t.name
      ORDER BY avg_performance DESC
    `);

    // Attendance Analytics
    const [attendanceData] = await pool.execute(`
      SELECT 
        c.name as class_name,
        t.name as trade_name,
        COUNT(DISTINCT a.id) as total_attendance_records,
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present_count,
        COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as absent_count,
        COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.id END) as late_count,
        ROUND(COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0), 2) as attendance_rate
      FROM classes c
      LEFT JOIN courses t ON c.course_id = t.id
      LEFT JOIN enrollments e ON c.id = e.class_id
      LEFT JOIN users u ON e.student_id = u.id
      LEFT JOIN attendance a ON u.id = a.student_id
      GROUP BY c.id, c.name, t.name
      ORDER BY attendance_rate DESC
    `);

    // Subject Performance Analytics
    const [subjectPerformance] = await pool.execute(`
      SELECT 
        s.name as subject_name,
        s.code as subject_code,
        COUNT(DISTINCT g.student_id) as students_assessed,
        ROUND(AVG(g.obtained_marks / g.max_marks * 100), 2) as avg_performance,
        COUNT(DISTINCT g.id) as total_assessments,
        COUNT(DISTINCT CASE WHEN (g.obtained_marks / g.max_marks * 100) >= 80 THEN g.student_id END) as excellent_count,
        COUNT(DISTINCT CASE WHEN (g.obtained_marks / g.max_marks * 100) BETWEEN 60 AND 79 THEN g.student_id END) as good_count,
        COUNT(DISTINCT CASE WHEN (g.obtained_marks / g.max_marks * 100) BETWEEN 40 AND 59 THEN g.student_id END) as average_count,
        COUNT(DISTINCT CASE WHEN (g.obtained_marks / g.max_marks * 100) < 40 THEN g.student_id END) as poor_count
      FROM subjects s
      LEFT JOIN grades g ON s.id = g.subject_id
      GROUP BY s.id, s.name, s.code
      ORDER BY avg_performance DESC
    `);

    // Enrollment Trends
    const [enrollmentTrends] = await pool.execute(`
      SELECT 
        YEAR(e.enrollment_date) as year,
        MONTH(e.enrollment_date) as month,
        COUNT(*) as enrollments,
        t.name as trade_name
      FROM enrollments e
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN courses t ON c.course_id = t.id
      WHERE e.enrollment_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY YEAR(e.enrollment_date), MONTH(e.enrollment_date), t.name
      ORDER BY year DESC, month DESC
    `);

    // Top Performers
    const [topPerformers] = await pool.execute(`
      SELECT 
        u.first_name,
        u.last_name,
        u.student_id,
        c.name as class_name,
        t.name as trade_name,
        ROUND(AVG(g.obtained_marks / g.max_marks * 100), 2) as avg_grade,
        COUNT(g.id) as assessments_taken
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN courses t ON c.course_id = t.id
      LEFT JOIN grades g ON u.id = g.student_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.first_name, u.last_name, u.student_id, c.name, t.name
      HAVING AVG(g.obtained_marks / g.max_marks * 100) IS NOT NULL
      ORDER BY avg_grade DESC
      LIMIT 10
    `);

    // At-Risk Students (low performance or attendance)
    const [atRiskStudents] = await pool.execute(`
      SELECT 
        u.first_name,
        u.last_name,
        u.student_id,
        c.name as class_name,
        t.name as trade_name,
        ROUND(AVG(g.obtained_marks / g.max_marks * 100), 2) as avg_grade,
        ROUND(COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0), 2) as attendance_rate,
        COUNT(DISTINCT g.id) as assessments_taken,
        COUNT(DISTINCT a.id) as attendance_records
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.student_id
      LEFT JOIN classes c ON e.class_id = c.id
      LEFT JOIN courses t ON c.course_id = t.id
      LEFT JOIN grades g ON u.id = g.student_id
      LEFT JOIN attendance a ON u.id = a.student_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.first_name, u.last_name, u.student_id, c.name, t.name
      HAVING 
        (AVG(g.obtained_marks / g.max_marks * 100) < 50 AND COUNT(DISTINCT g.id) >= 3)
        OR 
        (COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0) < 75 AND COUNT(DISTINCT a.id) >= 10)
      ORDER BY avg_grade ASC, attendance_rate ASC
      LIMIT 15
    `);

    // Teacher Performance Analytics
    const [teacherPerformance] = await pool.execute(`
      SELECT 
        t.first_name,
        t.last_name,
        COUNT(DISTINCT cs.class_id) as classes_taught,
        COUNT(DISTINCT cs.subject_id) as subjects_taught,
        COUNT(DISTINCT g.student_id) as students_graded,
        ROUND(AVG(g.obtained_marks / g.max_marks * 100), 2) as avg_student_performance,
        COUNT(DISTINCT a.student_id) as students_attendance_tracked
      FROM users t
      LEFT JOIN class_schedules cs ON t.id = cs.teacher_id
      LEFT JOIN grades g ON t.id = g.teacher_id
      LEFT JOIN attendance a ON t.id = a.marked_by
      WHERE t.role = 'teacher'
      GROUP BY t.id, t.first_name, t.last_name
      ORDER BY avg_student_performance DESC
    `);

    res.json({
      success: true,
      data: {
        academic_performance: performanceData,
        attendance_analytics: attendanceData,
        subject_performance: subjectPerformance,
        enrollment_trends: enrollmentTrends,
        top_performers: topPerformers,
        at_risk_students: atRiskStudents,
        teacher_performance: teacherPerformance,
        summary: {
          total_students: topPerformers.length + atRiskStudents.length,
          avg_overall_performance: topPerformers.reduce((sum, student) => sum + student.avg_grade, 0) / topPerformers.length || 0,
          students_at_risk: atRiskStudents.length,
          performance_trend: 'stable' // This could be calculated based on historical data
        }
      }
    });

  } catch (error) {
    console.error('Comprehensive analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Bulk Operations for Student Management
router.post('/students/bulk-actions', authenticateToken, async (req, res) => {
  try {
    const { action, student_ids, data } = req.body;

    if (!action || !student_ids || !Array.isArray(student_ids)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters'
      });
    }

    let result = { success: 0, failed: 0, details: [] };

    switch (action) {
      case 'update_class':
        if (!data.class_id) {
          return res.status(400).json({
            success: false,
            message: 'Class ID is required'
          });
        }

        for (const student_id of student_ids) {
          try {
            await pool.execute(
              'UPDATE enrollments SET class_id = ?, updated_at = NOW() WHERE student_id = ?',
              [data.class_id, student_id]
            );
            result.success++;
          } catch (error) {
            result.failed++;
            result.details.push({ student_id, error: error.message });
          }
        }
        break;

      case 'update_status':
        if (!data.status) {
          return res.status(400).json({
            success: false,
            message: 'Status is required'
          });
        }

        for (const student_id of student_ids) {
          try {
            await pool.execute(
              'UPDATE enrollments SET status = ?, updated_at = NOW() WHERE student_id = ?',
              [data.status, student_id]
            );
            result.success++;
          } catch (error) {
            result.failed++;
            result.details.push({ student_id, error: error.message });
          }
        }
        break;

      case 'mark_attendance':
        if (!data.date || !data.status || !data.subject_id || !data.class_id) {
          return res.status(400).json({
            success: false,
            message: 'Date, status, subject_id, and class_id are required'
          });
        }

        for (const student_id of student_ids) {
          try {
            await pool.execute(`
              INSERT INTO attendance (student_id, class_id, subject_id, attendance_date, status, marked_by, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE 
              status = VALUES(status), 
              marked_by = VALUES(marked_by), 
              notes = VALUES(notes),
              updated_at = NOW()
            `, [
              student_id, 
              data.class_id, 
              data.subject_id, 
              data.date, 
              data.status, 
              req.user.id, 
              data.notes || 'Bulk attendance update'
            ]);
            result.success++;
          } catch (error) {
            result.failed++;
            result.details.push({ student_id, error: error.message });
          }
        }
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    res.json({
      success: true,
      message: `Bulk operation completed. ${result.success} successful, ${result.failed} failed.`,
      data: result
    });

  } catch (error) {
    console.error('Bulk operations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Advanced Reporting
router.get('/reports/comprehensive/:reportType', authenticateToken, async (req, res) => {
  try {
    const { reportType } = req.params;
    const { startDate, endDate, classId, tradeId, format = 'json' } = req.query;

    let reportData = {};

    switch (reportType) {
      case 'academic_performance':
        const [academicReport] = await pool.execute(`
          SELECT 
            u.student_id,
            u.first_name,
            u.last_name,
            c.name as class_name,
            t.name as trade_name,
            s.name as subject_name,
            g.assessment_type,
            g.assessment_name,
            g.max_marks,
            g.obtained_marks,
            ROUND((g.obtained_marks / g.max_marks) * 100, 2) as percentage,
            g.grade_letter,
            g.assessment_date,
            teach.first_name as teacher_first_name,
            teach.last_name as teacher_last_name
          FROM grades g
          JOIN users u ON g.student_id = u.id
          JOIN subjects s ON g.subject_id = s.id
          JOIN classes c ON g.class_id = c.id
          JOIN courses t ON c.course_id = t.id
          JOIN users teach ON g.teacher_id = teach.id
          WHERE 1=1
          ${startDate ? 'AND g.assessment_date >= ?' : ''}
          ${endDate ? 'AND g.assessment_date <= ?' : ''}
          ${classId ? 'AND g.class_id = ?' : ''}
          ${tradeId ? 'AND t.id = ?' : ''}
          ORDER BY u.last_name, u.first_name, g.assessment_date DESC
        `, [
          ...(startDate ? [startDate] : []),
          ...(endDate ? [endDate] : []),
          ...(classId ? [classId] : []),
          ...(tradeId ? [tradeId] : [])
        ]);
        
        reportData = { academic_performance: academicReport };
        break;

      case 'attendance_summary':
        const [attendanceReport] = await pool.execute(`
          SELECT 
            u.student_id,
            u.first_name,
            u.last_name,
            c.name as class_name,
            t.name as trade_name,
            COUNT(DISTINCT a.id) as total_days,
            COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present_days,
            COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as absent_days,
            COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.id END) as late_days,
            ROUND(COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / NULLIF(COUNT(DISTINCT a.id), 0), 2) as attendance_percentage
          FROM users u
          JOIN enrollments e ON u.id = e.student_id
          JOIN classes c ON e.class_id = c.id
          JOIN courses t ON c.course_id = t.id
          LEFT JOIN attendance a ON u.id = a.student_id
          WHERE u.role = 'student'
          ${startDate ? 'AND a.attendance_date >= ?' : ''}
          ${endDate ? 'AND a.attendance_date <= ?' : ''}
          ${classId ? 'AND a.class_id = ?' : ''}
          ${tradeId ? 'AND t.id = ?' : ''}
          GROUP BY u.id, u.student_id, u.first_name, u.last_name, c.name, t.name
          ORDER BY attendance_percentage DESC
        `, [
          ...(startDate ? [startDate] : []),
          ...(endDate ? [endDate] : []),
          ...(classId ? [classId] : []),
          ...(tradeId ? [tradeId] : [])
        ]);
        
        reportData = { attendance_summary: attendanceReport };
        break;

      case 'class_overview':
        const [classOverview] = await pool.execute(`
          SELECT 
            c.name as class_name,
            t.name as trade_name,
            COUNT(DISTINCT e.student_id) as enrolled_students,
            c.capacity,
            ROUND(COUNT(DISTINCT e.student_id) * 100.0 / c.capacity, 2) as utilization_rate,
            ROUND(AVG(g.obtained_marks / g.max_marks * 100), 2) as avg_performance,
            ROUND(AVG(
              COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) * 100.0 / 
              NULLIF(COUNT(DISTINCT a.id), 0)
            ), 2) as avg_attendance
          FROM classes c
          LEFT JOIN courses t ON c.course_id = t.id
          LEFT JOIN enrollments e ON c.id = e.class_id AND e.status = 'active'
          LEFT JOIN grades g ON e.student_id = g.student_id AND g.class_id = c.id
          LEFT JOIN attendance a ON e.student_id = a.student_id AND a.class_id = c.id
          ${classId ? 'WHERE c.id = ?' : ''}
          ${tradeId ? (classId ? 'AND' : 'WHERE') + ' t.id = ?' : ''}
          GROUP BY c.id, c.name, t.name, c.capacity
          ORDER BY c.name
        `, [
          ...(classId ? [classId] : []),
          ...(tradeId ? [tradeId] : [])
        ]);
        
        reportData = { class_overview: classOverview };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}_${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      report_type: reportType,
      generated_at: new Date().toISOString(),
      data: reportData
    });

  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  const firstKey = Object.keys(data)[0];
  const rows = data[firstKey];
  
  if (!rows || rows.length === 0) return '';
  
  const headers = Object.keys(rows[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = rows.map(row => 
    headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

module.exports = router;
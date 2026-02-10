const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// Headmaster Applications Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Overall statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'waitlisted' THEN 1 END) as waitlisted,
        COUNT(CASE WHEN status = 'enrolled' THEN 1 END) as enrolled,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as this_week,
        COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as this_month
      FROM student_applications
    `);

    // Applications by trade and level
    const [tradeStats] = await pool.execute(`
      SELECT 
        sa.trade_code,
        t.name as trade_name,
        sa.level_number,
        COUNT(*) as total,
        COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN sa.status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN sa.status = 'rejected' THEN 1 END) as rejected
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      GROUP BY sa.trade_code, t.name, sa.level_number
      ORDER BY sa.trade_code, sa.level_number
    `);

    // Recent applications requiring attention
    const [recentApplications] = await pool.execute(`
      SELECT 
        sa.*,
        t.name as trade_name,
        DATEDIFF(NOW(), sa.created_at) as days_pending
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE sa.status IN ('pending', 'under_review')
      ORDER BY sa.created_at DESC
      LIMIT 10
    `);

    // Monthly trends
    const [monthlyTrends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as applications,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM student_applications
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        trade_statistics: tradeStats,
        recent_applications: recentApplications,
        monthly_trends: monthlyTrends
      }
    });

  } catch (error) {
    console.error('Headmaster dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// Get all applications with advanced filtering for Headmaster
router.get('/applications', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      trade_code,
      level_number,
      search,
      priority = 'all',
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('sa.status = ?');
      queryParams.push(status);
    }
    if (trade_code) {
      whereConditions.push('sa.trade_code = ?');
      queryParams.push(trade_code);
    }
    if (level_number) {
      whereConditions.push('sa.level_number = ?');
      queryParams.push(level_number);
    }
    if (search) {
      whereConditions.push('(sa.first_name LIKE ? OR sa.last_name LIKE ? OR sa.phone LIKE ? OR sa.application_number LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (date_from) {
      whereConditions.push('DATE(sa.created_at) >= ?');
      queryParams.push(date_from);
    }
    if (date_to) {
      whereConditions.push('DATE(sa.created_at) <= ?');
      queryParams.push(date_to);
    }
    if (priority === 'urgent') {
      whereConditions.push('sa.status = "pending" AND DATEDIFF(NOW(), sa.created_at) > 7');
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM student_applications sa
      ${whereClause}
    `, queryParams);

    // Get applications
    const [applications] = await pool.execute(`
      SELECT 
        sa.*,
        t.name as trade_name,
        DATEDIFF(NOW(), sa.created_at) as days_since_application,
        CASE 
          WHEN sa.status = 'pending' AND DATEDIFF(NOW(), sa.created_at) > 14 THEN 'critical'
          WHEN sa.status = 'pending' AND DATEDIFF(NOW(), sa.created_at) > 7 THEN 'urgent'
          ELSE 'normal'
        END as priority_level
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      ${whereClause}
      ORDER BY sa.${sort_by} ${sort_order}
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    const totalPages = Math.ceil(countResult[0].total / limit);

    res.json({
      success: true,
      data: applications,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: countResult[0].total,
        per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Headmaster final approval/rejection
router.put('/applications/:id/final-decision', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { decision, reason, headmaster_notes } = req.body;
    
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be approved or rejected'
      });
    }
    
    // Get current application
    const [currentApp] = await connection.execute(
      'SELECT * FROM student_applications WHERE id = ?',
      [id]
    );
    
    if (currentApp.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    const oldStatus = currentApp[0].status;
    
    // Update application with headmaster decision
    await connection.execute(`
      UPDATE student_applications 
      SET status = ?, updated_at = NOW(), reviewed_by = 1, reviewed_at = NOW()
      WHERE id = ?
    `, [decision, id]);
    
    // Log status change
    await connection.execute(`
      INSERT INTO application_status_history 
      (application_id, old_status, new_status, change_reason, changed_by, changed_at)
      VALUES (?, ?, ?, ?, 1, NOW())
    `, [id, oldStatus, decision, `Headmaster final decision: ${reason}`]);
    
    // Add headmaster review
    await connection.execute(`
      INSERT INTO application_reviews 
      (application_id, reviewer_id, review_text, rating, created_at)
      VALUES (?, 1, ?, ?, NOW())
    `, [id, headmaster_notes || `Application ${decision} by Headmaster`, decision === 'approved' ? 5 : 1]);
    
    // Send notification
    const message = decision === 'approved' 
      ? `Congratulations! Your application ${currentApp[0].application_number} has been approved by the Headmaster.`
      : `Your application ${currentApp[0].application_number} has been reviewed. Please contact the school for details.`;
    
    await connection.execute(`
      INSERT INTO application_notifications (application_id, notification_type, recipient_phone, message, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `, [id, decision, currentApp[0].phone, message]);
    
    await connection.commit();
    
    res.json({
      success: true,
      message: `Application ${decision} successfully`,
      decision: decision
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Final decision error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process final decision',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Bulk approve/reject applications
router.put('/applications/bulk-decision', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { application_ids, decision, reason } = req.body;
    
    if (!Array.isArray(application_ids) || application_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application IDs are required'
      });
    }
    
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be approved or rejected'
      });
    }
    
    let processedCount = 0;
    
    for (const appId of application_ids) {
      // Get current application
      const [currentApp] = await connection.execute(
        'SELECT status, phone, application_number FROM student_applications WHERE id = ?',
        [appId]
      );
      
      if (currentApp.length > 0) {
        const oldStatus = currentApp[0].status;
        
        // Update status
        await connection.execute(`
          UPDATE student_applications 
          SET status = ?, updated_at = NOW(), reviewed_by = 1, reviewed_at = NOW()
          WHERE id = ?
        `, [decision, appId]);
        
        // Log status change
        await connection.execute(`
          INSERT INTO application_status_history 
          (application_id, old_status, new_status, change_reason, changed_by, changed_at)
          VALUES (?, ?, ?, ?, 1, NOW())
        `, [appId, oldStatus, decision, `Headmaster bulk ${decision}: ${reason}`]);
        
        // Queue notification
        const message = decision === 'approved' 
          ? `Congratulations! Your application ${currentApp[0].application_number} has been approved.`
          : `Your application ${currentApp[0].application_number} has been reviewed. Please contact the school.`;
        
        await connection.execute(`
          INSERT INTO application_notifications (application_id, notification_type, recipient_phone, message, status, created_at)
          VALUES (?, ?, ?, ?, 'pending', NOW())
        `, [appId, decision, currentApp[0].phone, message]);
        
        processedCount++;
      }
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: `${processedCount} applications ${decision} successfully`
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Bulk decision error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk decision',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Generate comprehensive reports
router.get('/reports/comprehensive', async (req, res) => {
  try {
    const { period = '30', format = 'json' } = req.query;
    
    // Applications summary
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        ROUND(COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / COUNT(*), 2) as approval_rate,
        AVG(DATEDIFF(COALESCE(reviewed_at, NOW()), created_at)) as avg_processing_days
      FROM student_applications
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    `, [period]);
    
    // Trade performance
    const [tradePerformance] = await pool.execute(`
      SELECT 
        sa.trade_code,
        t.name as trade_name,
        COUNT(*) as total_applications,
        COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) as approved,
        ROUND(COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) * 100.0 / COUNT(*), 2) as approval_rate
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE sa.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY sa.trade_code, t.name
      ORDER BY total_applications DESC
    `, [period]);
    
    // Level distribution
    const [levelDistribution] = await pool.execute(`
      SELECT 
        level_number,
        COUNT(*) as applications,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved
      FROM student_applications
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY level_number
      ORDER BY level_number
    `, [period]);
    
    const reportData = {
      summary: summary[0],
      trade_performance: tradePerformance,
      level_distribution: levelDistribution,
      generated_at: new Date().toISOString(),
      period_days: period
    };
    
    if (format === 'csv') {
      // Generate CSV format
      let csv = 'Report Type,Value\n';
      csv += `Total Applications,${reportData.summary.total_applications}\n`;
      csv += `Approved,${reportData.summary.approved}\n`;
      csv += `Rejected,${reportData.summary.rejected}\n`;
      csv += `Approval Rate,${reportData.summary.approval_rate}%\n`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=headmaster_report_${Date.now()}.csv`);
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: reportData
      });
    }
    
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
});

module.exports = router;
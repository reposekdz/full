const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// DOS Applications Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Academic-focused statistics
    const [academicStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_review,
        COUNT(CASE WHEN status = 'under_review' THEN 1 END) as under_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        AVG(CASE WHEN completion_year IS NOT NULL THEN YEAR(CURDATE()) - completion_year END) as avg_gap_years
      FROM student_applications
    `);

    // Applications by education level and previous grades
    const [educationStats] = await pool.execute(`
      SELECT 
        education_level,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        ROUND(AVG(CASE WHEN completion_year IS NOT NULL THEN YEAR(CURDATE()) - completion_year END), 1) as avg_gap_years
      FROM student_applications
      GROUP BY education_level
      ORDER BY total DESC
    `);

    // Trade capacity analysis
    const [tradeCapacity] = await pool.execute(`
      SELECT 
        sa.trade_code,
        t.name as trade_name,
        sa.level_number,
        COUNT(*) as applications,
        COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN sa.status = 'pending' THEN 1 END) as pending,
        CASE 
          WHEN COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) >= 25 THEN 'Full'
          WHEN COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) >= 20 THEN 'Near Full'
          ELSE 'Available'
        END as capacity_status
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      GROUP BY sa.trade_code, t.name, sa.level_number
      ORDER BY sa.trade_code, sa.level_number
    `);

    // Applications requiring academic review
    const [academicReview] = await pool.execute(`
      SELECT 
        sa.*,
        t.name as trade_name,
        DATEDIFF(NOW(), sa.created_at) as days_pending,
        CASE 
          WHEN sa.education_level = 'Primary' THEN 'Basic Education'
          WHEN sa.education_level = 'Secondary' THEN 'Secondary Complete'
          WHEN sa.education_level = 'TVET' THEN 'Technical Background'
          ELSE sa.education_level
        END as education_category
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE sa.status IN ('pending', 'under_review')
      ORDER BY 
        CASE WHEN sa.education_level = 'TVET' THEN 1
             WHEN sa.education_level = 'Secondary' THEN 2
             ELSE 3 END,
        sa.created_at ASC
      LIMIT 15
    `);

    res.json({
      success: true,
      data: {
        academic_overview: academicStats[0],
        education_statistics: educationStats,
        trade_capacity: tradeCapacity,
        pending_academic_review: academicReview
      }
    });

  } catch (error) {
    console.error('DOS dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch DOS dashboard data',
      error: error.message
    });
  }
});

// Academic evaluation of applications
router.put('/applications/:id/academic-review', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { 
      academic_status, 
      academic_notes, 
      recommended_level, 
      prerequisites_met,
      academic_score 
    } = req.body;
    
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
    const newStatus = academic_status === 'pass' ? 'under_review' : 'rejected';
    
    // Update application with academic review
    await connection.execute(`
      UPDATE student_applications 
      SET status = ?, updated_at = NOW()
      WHERE id = ?
    `, [newStatus, id]);
    
    // Log academic review
    await connection.execute(`
      INSERT INTO application_status_history 
      (application_id, old_status, new_status, change_reason, changed_by, changed_at)
      VALUES (?, ?, ?, ?, 2, NOW())
    `, [id, oldStatus, newStatus, `DOS Academic Review: ${academic_status}`]);
    
    // Add detailed academic review
    await connection.execute(`
      INSERT INTO application_reviews 
      (application_id, reviewer_id, review_text, rating, created_at)
      VALUES (?, 2, ?, ?, NOW())
    `, [
      id, 
      `Academic Review by DOS:
      Status: ${academic_status}
      Recommended Level: ${recommended_level || 'As applied'}
      Prerequisites Met: ${prerequisites_met ? 'Yes' : 'No'}
      Academic Score: ${academic_score || 'N/A'}/10
      Notes: ${academic_notes}`,
      academic_score || (academic_status === 'pass' ? 4 : 2)
    ]);
    
    // Update recommended level if different
    if (recommended_level && recommended_level !== currentApp[0].level_number) {
      await connection.execute(`
        UPDATE student_applications 
        SET level_number = ?
        WHERE id = ?
      `, [recommended_level, id]);
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: `Academic review completed: ${academic_status}`,
      new_status: newStatus,
      recommended_level: recommended_level
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Academic review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete academic review',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Get applications for academic review
router.get('/applications/academic-review', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      education_level,
      trade_code,
      level_number,
      priority = 'all'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['sa.status IN ("pending", "under_review")'];
    let queryParams = [];

    if (education_level) {
      whereConditions.push('sa.education_level = ?');
      queryParams.push(education_level);
    }
    if (trade_code) {
      whereConditions.push('sa.trade_code = ?');
      queryParams.push(trade_code);
    }
    if (level_number) {
      whereConditions.push('sa.level_number = ?');
      queryParams.push(level_number);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    // Get applications for academic review
    const [applications] = await pool.execute(`
      SELECT 
        sa.*,
        t.name as trade_name,
        DATEDIFF(NOW(), sa.created_at) as days_pending,
        CASE 
          WHEN sa.education_level = 'TVET' THEN 'High Priority'
          WHEN sa.education_level = 'Secondary' AND sa.completion_year >= YEAR(CURDATE()) - 2 THEN 'Medium Priority'
          ELSE 'Standard Priority'
        END as academic_priority,
        CASE 
          WHEN sa.completion_year IS NOT NULL THEN YEAR(CURDATE()) - sa.completion_year
          ELSE NULL
        END as years_since_completion
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      ${whereClause}
      ORDER BY 
        CASE WHEN sa.education_level = 'TVET' THEN 1
             WHEN sa.education_level = 'Secondary' THEN 2
             ELSE 3 END,
        sa.created_at ASC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    // Get count
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM student_applications sa
      ${whereClause}
    `, queryParams);

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
    console.error('Academic review applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications for academic review',
      error: error.message
    });
  }
});

// Bulk academic review
router.put('/applications/bulk-academic-review', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { application_ids, academic_status, notes } = req.body;
    
    if (!Array.isArray(application_ids) || application_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Application IDs are required'
      });
    }
    
    const newStatus = academic_status === 'pass' ? 'under_review' : 'rejected';
    let processedCount = 0;
    
    for (const appId of application_ids) {
      // Get current application
      const [currentApp] = await connection.execute(
        'SELECT status FROM student_applications WHERE id = ?',
        [appId]
      );
      
      if (currentApp.length > 0) {
        const oldStatus = currentApp[0].status;
        
        // Update status
        await connection.execute(`
          UPDATE student_applications 
          SET status = ?, updated_at = NOW()
          WHERE id = ?
        `, [newStatus, appId]);
        
        // Log status change
        await connection.execute(`
          INSERT INTO application_status_history 
          (application_id, old_status, new_status, change_reason, changed_by, changed_at)
          VALUES (?, ?, ?, ?, 2, NOW())
        `, [appId, oldStatus, newStatus, `DOS Bulk Academic Review: ${academic_status} - ${notes}`]);
        
        // Add review
        await connection.execute(`
          INSERT INTO application_reviews 
          (application_id, reviewer_id, review_text, rating, created_at)
          VALUES (?, 2, ?, ?, NOW())
        `, [appId, `Bulk Academic Review: ${academic_status} - ${notes}`, academic_status === 'pass' ? 4 : 2]);
        
        processedCount++;
      }
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: `${processedCount} applications processed for academic review`
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Bulk academic review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk academic review',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Academic performance report
router.get('/reports/academic-performance', async (req, res) => {
  try {
    const { period = '90' } = req.query;
    
    // Academic performance by education level
    const [educationPerformance] = await pool.execute(`
      SELECT 
        education_level,
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
        ROUND(COUNT(CASE WHEN status = 'approved' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate,
        AVG(CASE WHEN completion_year IS NOT NULL THEN YEAR(CURDATE()) - completion_year END) as avg_gap_years
      FROM student_applications
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY education_level
      ORDER BY total_applications DESC
    `, [period]);
    
    // Trade academic requirements analysis
    const [tradeRequirements] = await pool.execute(`
      SELECT 
        sa.trade_code,
        t.name as trade_name,
        sa.level_number,
        COUNT(*) as applications,
        COUNT(CASE WHEN sa.education_level = 'Secondary' THEN 1 END) as secondary_applicants,
        COUNT(CASE WHEN sa.education_level = 'TVET' THEN 1 END) as tvet_applicants,
        COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) as approved,
        ROUND(COUNT(CASE WHEN sa.status = 'approved' THEN 1 END) * 100.0 / COUNT(*), 2) as approval_rate
      FROM student_applications sa
      LEFT JOIN trades t ON sa.trade_code = t.code
      WHERE sa.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY sa.trade_code, t.name, sa.level_number
      ORDER BY sa.trade_code, sa.level_number
    `, [period]);
    
    // Academic review efficiency
    const [reviewEfficiency] = await pool.execute(`
      SELECT 
        COUNT(*) as total_reviewed,
        AVG(DATEDIFF(reviewed_at, created_at)) as avg_review_days,
        COUNT(CASE WHEN DATEDIFF(reviewed_at, created_at) <= 3 THEN 1 END) as reviewed_within_3_days,
        COUNT(CASE WHEN DATEDIFF(reviewed_at, created_at) > 7 THEN 1 END) as reviewed_after_7_days
      FROM student_applications
      WHERE reviewed_at IS NOT NULL 
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    `, [period]);
    
    res.json({
      success: true,
      data: {
        education_performance: educationPerformance,
        trade_requirements: tradeRequirements,
        review_efficiency: reviewEfficiency[0],
        generated_at: new Date().toISOString(),
        period_days: period
      }
    });
    
  } catch (error) {
    console.error('Academic performance report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate academic performance report',
      error: error.message
    });
  }
});

// Recommend level adjustments
router.post('/applications/:id/recommend-level', async (req, res) => {
  try {
    const { id } = req.params;
    const { recommended_level, reason } = req.body;
    
    // Get current application
    const [application] = await pool.execute(
      'SELECT * FROM student_applications WHERE id = ?',
      [id]
    );
    
    if (application.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Add recommendation
    await pool.execute(`
      INSERT INTO application_reviews 
      (application_id, reviewer_id, review_text, rating, created_at)
      VALUES (?, 2, ?, 3, NOW())
    `, [id, `DOS Level Recommendation: Change from Level ${application[0].level_number} to Level ${recommended_level}. Reason: ${reason}`]);
    
    res.json({
      success: true,
      message: 'Level recommendation added successfully',
      current_level: application[0].level_number,
      recommended_level: recommended_level
    });
    
  } catch (error) {
    console.error('Level recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add level recommendation',
      error: error.message
    });
  }
});

module.exports = router;
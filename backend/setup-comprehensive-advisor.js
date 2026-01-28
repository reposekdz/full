const { pool } = require('./config/database');

async function setupComprehensiveAdvisorSystem() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Create staff_role_cards table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS staff_role_cards (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20),
        features JSON,
        access_level ENUM('low', 'medium', 'high', 'admin') DEFAULT 'medium',
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create dashboard_configs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dashboard_configs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role VARCHAR(50) NOT NULL,
        config_name VARCHAR(100) NOT NULL,
        config_data JSON,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_role_config (role, config_name)
      )
    `);

    // Create advisor_analytics table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS advisor_analytics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(10,2),
        metric_data JSON,
        date_recorded DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_metric_date (metric_name, date_recorded)
      )
    `);

    // Insert advisor role card
    await connection.execute(`
      INSERT INTO staff_role_cards (
        role, title, description, icon, color, features, 
        access_level, display_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        features = VALUES(features),
        updated_at = NOW()
    `, [
      'advisor',
      'School Advisor',
      'Comprehensive school management with full analytics, student oversight, contact management, and communication coordination. Access to all student data, performance metrics, and school development insights.',
      'fas fa-user-tie',
      '#2563eb',
      JSON.stringify([
        'Full Student Database Access - View all student records across all trades and levels',
        'Advanced Analytics Dashboard - Real-time school performance metrics and trends',
        'Contact Management System - Handle all inquiries and communications',
        'Performance Monitoring - Track student progress and identify at-risk students',
        'Communication Oversight - Manage parent-school communications',
        'Report Generation - Create comprehensive reports and analytics',
        'Risk Assessment Tools - Identify and address student challenges',
        'Parent Coordination - Facilitate parent-school relationships',
        'Teacher Collaboration - Work with teaching staff on student issues',
        'School Development Insights - Provide strategic recommendations'
      ]),
      'high',
      2
    ]);

    // Insert other role cards
    const roleCards = [
      {
        role: 'admin',
        title: 'System Administrator',
        description: 'Full system access with complete administrative control',
        icon: 'fas fa-crown',
        color: '#dc2626',
        features: ['Complete System Control', 'User Management', 'System Configuration'],
        access_level: 'admin',
        display_order: 1
      },
      {
        role: 'headmaster',
        title: 'Headmaster',
        description: 'Executive leadership with strategic oversight',
        icon: 'fas fa-graduation-cap',
        color: '#7c3aed',
        features: ['Strategic Planning', 'Staff Management', 'Academic Oversight'],
        access_level: 'admin',
        display_order: 3
      },
      {
        role: 'dos',
        title: 'Director of Studies',
        description: 'Academic leadership with curriculum oversight',
        icon: 'fas fa-book-open',
        color: '#059669',
        features: ['Curriculum Management', 'Academic Standards', 'Teacher Supervision'],
        access_level: 'high',
        display_order: 4
      },
      {
        role: 'teacher',
        title: 'Teacher',
        description: 'Classroom instruction and student assessment',
        icon: 'fas fa-chalkboard-teacher',
        color: '#0891b2',
        features: ['Class Management', 'Student Assessment', 'Lesson Planning'],
        access_level: 'medium',
        display_order: 6
      }
    ];

    for (const card of roleCards) {
      await connection.execute(`
        INSERT INTO staff_role_cards (
          role, title, description, icon, color, features, 
          access_level, display_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, true)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          updated_at = NOW()
      `, [
        card.role,
        card.title,
        card.description,
        card.icon,
        card.color,
        JSON.stringify(card.features),
        card.access_level,
        card.display_order
      ]);
    }

    // Create advisor dashboard configuration
    await connection.execute(`
      INSERT INTO dashboard_configs (
        role, config_name, config_data, is_active
      ) VALUES (?, ?, ?, true)
      ON DUPLICATE KEY UPDATE 
        config_data = VALUES(config_data),
        updated_at = NOW()
    `, [
      'advisor',
      'main_dashboard',
      JSON.stringify({
        layout: 'comprehensive',
        widgets: [
          {
            id: 'school_overview',
            title: 'School Overview',
            type: 'stats_grid',
            size: 'large',
            position: { x: 0, y: 0, w: 12, h: 4 },
            data_sources: ['student_count', 'teacher_count', 'parent_count', 'class_count']
          },
          {
            id: 'student_analytics',
            title: 'Student Performance Analytics',
            type: 'multi_chart',
            size: 'large',
            position: { x: 0, y: 4, w: 8, h: 6 },
            data_sources: ['grade_trends', 'attendance_rates', 'performance_by_trade']
          },
          {
            id: 'communication_hub',
            title: 'Communication Management',
            type: 'activity_feed',
            size: 'medium',
            position: { x: 8, y: 4, w: 4, h: 6 },
            data_sources: ['recent_messages', 'pending_contacts', 'urgent_issues']
          },
          {
            id: 'contact_management',
            title: 'Contact Queue',
            type: 'priority_table',
            size: 'large',
            position: { x: 0, y: 10, w: 12, h: 8 },
            data_sources: ['contact_submissions', 'support_tickets']
          },
          {
            id: 'risk_assessment',
            title: 'Student Risk Assessment',
            type: 'alert_panel',
            size: 'medium',
            position: { x: 0, y: 18, w: 6, h: 6 },
            data_sources: ['at_risk_students', 'intervention_needed']
          },
          {
            id: 'performance_trends',
            title: 'School Performance Trends',
            type: 'trend_analysis',
            size: 'medium',
            position: { x: 6, y: 18, w: 6, h: 6 },
            data_sources: ['monthly_performance', 'yearly_comparison']
          }
        ],
        refresh_intervals: {
          real_time: 30000,
          frequent: 300000,
          periodic: 1800000
        },
        permissions: [
          'view_all_students',
          'access_analytics',
          'manage_contacts',
          'generate_reports',
          'view_sensitive_data'
        ]
      })
    ]);

    // Update advisor user permissions
    await connection.execute(`
      UPDATE admin_users 
      SET permissions = ?, updated_at = NOW()
      WHERE role = 'advisor'
    `, [
      JSON.stringify([
        'full_school_access',
        'analytics_dashboard',
        'student_management',
        'contact_management',
        'report_generation',
        'data_analysis',
        'communication_oversight',
        'performance_monitoring',
        'risk_assessment',
        'parent_coordination',
        'teacher_collaboration',
        'school_insights'
      ])
    ]);

    await connection.commit();
    console.log('✅ Comprehensive advisor system setup complete!');
    console.log('📊 Features enabled:');
    console.log('   - Staff role card with advisor position');
    console.log('   - Advanced dashboard configuration');
    console.log('   - Full analytics access');
    console.log('   - Contact management system');
    console.log('   - Student data access across all trades');
    console.log('   - Performance monitoring tools');
    console.log('   - Communication oversight capabilities');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Setup failed:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

setupComprehensiveAdvisorSystem();
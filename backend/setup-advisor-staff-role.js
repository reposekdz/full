const { pool } = require('./config/database');

async function setupAdvisorStaffRole() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Create advisor role if not exists
    const [existingRole] = await connection.execute(
      'SELECT id FROM roles WHERE name = "advisor"'
    );

    let advisorRoleId;
    if (existingRole.length === 0) {
      const [roleResult] = await connection.execute(`
        INSERT INTO roles (name, description, permissions, created_at) 
        VALUES (?, ?, ?, NOW())
      `, [
        'advisor',
        'School Advisor - Comprehensive management and analytics access',
        JSON.stringify([
          'view_all_students',
          'view_all_classes', 
          'view_analytics',
          'manage_contacts',
          'view_reports',
          'access_student_sheets',
          'manage_communications',
          'view_school_data',
          'generate_reports',
          'access_dashboard'
        ])
      ]);
      advisorRoleId = roleResult.insertId;
      console.log('✅ Advisor role created');
    } else {
      advisorRoleId = existingRole[0].id;
      console.log('✅ Advisor role already exists');
    }

    // Create advisor user in admin_users table
    const [existingAdvisor] = await connection.execute(
      'SELECT id FROM admin_users WHERE role = "advisor"'
    );

    if (existingAdvisor.length === 0) {
      const hashedPassword = '$2a$10$defaulthash'; // Default password hash
      await connection.execute(`
        INSERT INTO admin_users (
          username, email, password, role, first_name, last_name,
          phone, is_active, permissions, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, true, ?, NOW())
      `, [
        'advisor_emerance',
        'emerancemukamugema77@gmail.com',
        hashedPassword,
        'advisor',
        'Mukamugema',
        'Emerance',
        '+250788000000',
        JSON.stringify([
          'full_school_access',
          'analytics_dashboard',
          'student_management',
          'contact_management',
          'report_generation',
          'data_analysis'
        ])
      ]);
      console.log('✅ Advisor user created in admin_users');
    } else {
      console.log('✅ Advisor user already exists');
    }

    // Create staff role card data
    const [existingCard] = await connection.execute(
      'SELECT id FROM staff_role_cards WHERE role = "advisor"'
    );

    if (existingCard.length === 0) {
      await connection.execute(`
        INSERT INTO staff_role_cards (
          role, title, description, icon, color, features, 
          access_level, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        'advisor',
        'School Advisor',
        'Comprehensive school management with full analytics, student oversight, and communication coordination',
        'fas fa-user-tie',
        '#2563eb',
        JSON.stringify([
          'Full Student Database Access',
          'Advanced Analytics Dashboard', 
          'Contact Management System',
          'Performance Monitoring',
          'Communication Oversight',
          'Report Generation',
          'Risk Assessment Tools',
          'Parent Coordination',
          'Teacher Collaboration',
          'School Development Insights'
        ]),
        'high'
      ]);
      console.log('✅ Advisor staff card created');
    } else {
      console.log('✅ Advisor staff card already exists');
    }

    // Create advisor dashboard configuration
    await connection.execute(`
      INSERT INTO dashboard_configs (
        role, config_name, config_data, is_active, created_at
      ) VALUES (?, ?, ?, true, NOW())
      ON DUPLICATE KEY UPDATE 
        config_data = VALUES(config_data),
        updated_at = NOW()
    `, [
      'advisor',
      'main_dashboard',
      JSON.stringify({
        widgets: [
          {
            id: 'school_overview',
            title: 'School Overview',
            type: 'stats',
            size: 'large',
            data_source: 'school_stats'
          },
          {
            id: 'student_analytics',
            title: 'Student Analytics',
            type: 'chart',
            size: 'medium',
            data_source: 'student_performance'
          },
          {
            id: 'communication_hub',
            title: 'Communication Hub',
            type: 'list',
            size: 'medium',
            data_source: 'recent_messages'
          },
          {
            id: 'contact_management',
            title: 'Contact Management',
            type: 'table',
            size: 'large',
            data_source: 'pending_contacts'
          },
          {
            id: 'performance_trends',
            title: 'Performance Trends',
            type: 'graph',
            size: 'large',
            data_source: 'performance_analytics'
          }
        ],
        layout: 'grid',
        refresh_interval: 300000
      })
    ]);

    await connection.commit();
    console.log('🎉 Advisor staff role setup complete!');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Setup failed:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

setupAdvisorStaffRole();
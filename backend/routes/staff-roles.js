const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET all staff role cards including advisor
router.get('/roles/cards', async (req, res) => {
  try {
    // Get all staff role cards from database
    const [roleCards] = await pool.execute(`
      SELECT * FROM staff_role_cards 
      WHERE is_active = true 
      ORDER BY display_order, role
    `);

    // If no cards exist, create default ones
    if (roleCards.length === 0) {
      await createDefaultRoleCards();
      const [newCards] = await pool.execute(`
        SELECT * FROM staff_role_cards 
        WHERE is_active = true 
        ORDER BY display_order, role
      `);
      return res.json({ success: true, cards: newCards });
    }

    // Enhance cards with real-time data
    const enhancedCards = await Promise.all(roleCards.map(async (card) => {
      const stats = await getRoleStats(card.role);
      return {
        ...card,
        features: JSON.parse(card.features || '[]'),
        stats: stats,
        is_available: true,
        last_updated: new Date().toISOString()
      };
    }));

    res.json({ success: true, cards: enhancedCards });
  } catch (error) {
    console.error('Error fetching role cards:', error);
    res.status(500).json({ success: false, message: 'Error fetching role cards' });
  }
});

// GET specific role details
router.get('/roles/:role/details', async (req, res) => {
  try {
    const { role } = req.params;

    const [roleDetails] = await pool.execute(`
      SELECT src.*, r.description as role_description, r.permissions
      FROM staff_role_cards src
      LEFT JOIN roles r ON src.role = r.name
      WHERE src.role = ? AND src.is_active = true
    `, [role]);

    if (roleDetails.length === 0) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const roleData = roleDetails[0];
    const stats = await getRoleStats(role);
    const capabilities = await getRoleCapabilities(role);

    const detailedRole = {
      ...roleData,
      features: JSON.parse(roleData.features || '[]'),
      permissions: JSON.parse(roleData.permissions || '[]'),
      stats: stats,
      capabilities: capabilities,
      requirements: await getRoleRequirements(role),
      dashboard_preview: await getDashboardPreview(role)
    };

    res.json({ success: true, role: detailedRole });
  } catch (error) {
    console.error('Error fetching role details:', error);
    res.status(500).json({ success: false, message: 'Error fetching role details' });
  }
});

// Helper function to create default role cards
async function createDefaultRoleCards() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Create staff_role_cards table if not exists
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

    const defaultCards = [
      {
        role: 'admin',
        title: 'System Administrator',
        description: 'Full system access with complete administrative control over all school operations',
        icon: 'fas fa-crown',
        color: '#dc2626',
        features: [
          'Complete System Control',
          'User Management',
          'System Configuration',
          'Security Management',
          'Backup & Recovery',
          'Advanced Analytics',
          'Financial Management',
          'Report Generation'
        ],
        access_level: 'admin',
        display_order: 1
      },
      {
        role: 'advisor',
        title: 'School Advisor',
        description: 'Comprehensive school management with full analytics, student oversight, and communication coordination',
        icon: 'fas fa-user-tie',
        color: '#2563eb',
        features: [
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
        ],
        access_level: 'high',
        display_order: 2
      },
      {
        role: 'headmaster',
        title: 'Headmaster',
        description: 'Executive leadership with strategic oversight and decision-making authority',
        icon: 'fas fa-graduation-cap',
        color: '#7c3aed',
        features: [
          'Strategic Planning',
          'Staff Management',
          'Academic Oversight',
          'Budget Management',
          'Policy Development',
          'External Relations',
          'Performance Review',
          'School Development'
        ],
        access_level: 'admin',
        display_order: 3
      },
      {
        role: 'dos',
        title: 'Director of Studies',
        description: 'Academic leadership with curriculum oversight and educational quality management',
        icon: 'fas fa-book-open',
        color: '#059669',
        features: [
          'Curriculum Management',
          'Academic Standards',
          'Teacher Supervision',
          'Student Assessment',
          'Educational Planning',
          'Quality Assurance',
          'Academic Reports',
          'Learning Analytics'
        ],
        access_level: 'high',
        display_order: 4
      },
      {
        role: 'dod',
        title: 'Director of Discipline',
        description: 'Student discipline and behavioral management with welfare oversight',
        icon: 'fas fa-shield-alt',
        color: '#dc2626',
        features: [
          'Discipline Management',
          'Student Welfare',
          'Behavioral Monitoring',
          'Incident Management',
          'Counseling Coordination',
          'Safety Protocols',
          'Parent Communication',
          'Intervention Programs'
        ],
        access_level: 'high',
        display_order: 5
      },
      {
        role: 'teacher',
        title: 'Teacher',
        description: 'Classroom instruction and student assessment with subject expertise',
        icon: 'fas fa-chalkboard-teacher',
        color: '#0891b2',
        features: [
          'Class Management',
          'Student Assessment',
          'Lesson Planning',
          'Grade Management',
          'Parent Communication',
          'Student Progress',
          'Resource Management',
          'Professional Development'
        ],
        access_level: 'medium',
        display_order: 6
      },
      {
        role: 'accountant',
        title: 'Accountant',
        description: 'Financial management and accounting with budget oversight',
        icon: 'fas fa-calculator',
        color: '#ea580c',
        features: [
          'Financial Management',
          'Budget Planning',
          'Fee Collection',
          'Expense Tracking',
          'Financial Reports',
          'Audit Management',
          'Payment Processing',
          'Cost Analysis'
        ],
        access_level: 'high',
        display_order: 7
      },
      {
        role: 'stockmanager',
        title: 'Stock Manager',
        description: 'Inventory and resource management with procurement oversight',
        icon: 'fas fa-boxes',
        color: '#7c2d12',
        features: [
          'Inventory Management',
          'Stock Control',
          'Procurement Planning',
          'Supplier Management',
          'Asset Tracking',
          'Usage Analytics',
          'Cost Optimization',
          'Report Generation'
        ],
        access_level: 'medium',
        display_order: 8
      }
    ];

    for (const card of defaultCards) {
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

    await connection.commit();
    console.log('✅ Default role cards created');
  } catch (error) {
    await connection.rollback();
    console.error('Error creating default role cards:', error);
  } finally {
    connection.release();
  }
}

// Helper function to get role statistics
async function getRoleStats(role) {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN role = ? THEN 1 END) as active_users,
        COUNT(CASE WHEN role = ? AND last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_logins,
        COUNT(CASE WHEN role = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users
      FROM admin_users
      WHERE is_active = true
    `, [role, role, role]);

    return {
      active_users: stats[0]?.active_users || 0,
      recent_logins: stats[0]?.recent_logins || 0,
      new_users: stats[0]?.new_users || 0,
      utilization_rate: stats[0]?.active_users > 0 ? 
        ((stats[0]?.recent_logins || 0) / stats[0].active_users * 100).toFixed(1) : '0'
    };
  } catch (error) {
    console.error('Error getting role stats:', error);
    return { active_users: 0, recent_logins: 0, new_users: 0, utilization_rate: '0' };
  }
}

// Helper function to get role capabilities
async function getRoleCapabilities(role) {
  const capabilities = {
    admin: {
      data_access: 'Full system access',
      management_scope: 'All school operations',
      reporting_level: 'Executive reports',
      user_management: 'Complete user control'
    },
    advisor: {
      data_access: 'All student and school data',
      management_scope: 'Student affairs and communications',
      reporting_level: 'Comprehensive analytics',
      user_management: 'Student and parent coordination'
    },
    headmaster: {
      data_access: 'Strategic and operational data',
      management_scope: 'School-wide leadership',
      reporting_level: 'Executive summaries',
      user_management: 'Staff oversight'
    },
    dos: {
      data_access: 'Academic and curriculum data',
      management_scope: 'Educational programs',
      reporting_level: 'Academic reports',
      user_management: 'Teacher management'
    },
    dod: {
      data_access: 'Student discipline and welfare data',
      management_scope: 'Student behavior and safety',
      reporting_level: 'Discipline reports',
      user_management: 'Student oversight'
    },
    teacher: {
      data_access: 'Class and student data',
      management_scope: 'Classroom operations',
      reporting_level: 'Class reports',
      user_management: 'Student interaction'
    },
    accountant: {
      data_access: 'Financial and payment data',
      management_scope: 'Financial operations',
      reporting_level: 'Financial reports',
      user_management: 'Payment tracking'
    },
    stockmanager: {
      data_access: 'Inventory and asset data',
      management_scope: 'Resource management',
      reporting_level: 'Inventory reports',
      user_management: 'Supplier coordination'
    }
  };

  return capabilities[role] || {
    data_access: 'Limited access',
    management_scope: 'Specific functions',
    reporting_level: 'Basic reports',
    user_management: 'Limited interaction'
  };
}

// Helper function to get role requirements
async function getRoleRequirements(role) {
  const requirements = {
    advisor: {
      education: 'Bachelor\'s degree in Education or Counseling',
      experience: '3+ years in educational counseling',
      skills: ['Communication', 'Data Analysis', 'Student Psychology', 'Report Writing'],
      certifications: ['Counseling Certificate', 'Educational Leadership']
    },
    admin: {
      education: 'Bachelor\'s degree in IT or Management',
      experience: '5+ years in system administration',
      skills: ['System Management', 'Security', 'Database Management', 'Leadership'],
      certifications: ['System Administration', 'Security Management']
    }
    // Add other roles as needed
  };

  return requirements[role] || {
    education: 'Relevant degree required',
    experience: 'Professional experience preferred',
    skills: ['Communication', 'Organization', 'Problem Solving'],
    certifications: ['Professional certification preferred']
  };
}

// Helper function to get dashboard preview
async function getDashboardPreview(role) {
  const previews = {
    advisor: {
      widgets: [
        'Student Overview Dashboard',
        'Communication Management',
        'Performance Analytics',
        'Contact Management System',
        'Risk Assessment Tools'
      ],
      key_metrics: [
        'Total Students Managed',
        'Active Communications',
        'Performance Trends',
        'Intervention Cases'
      ]
    }
    // Add other role previews as needed
  };

  return previews[role] || {
    widgets: ['Basic Dashboard', 'Role-specific Tools'],
    key_metrics: ['Activity Overview', 'Performance Metrics']
  };
}

module.exports = router;
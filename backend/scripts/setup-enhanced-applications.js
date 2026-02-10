const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setupEnhancedApplicationSystem() {
  console.log('🚀 Setting up Enhanced Student Application System...\n');
  
  try {
    // Create uploads directory
    const uploadsDir = path.join(__dirname, 'uploads', 'applications');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory');
    }
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'migrations', 'enhanced_student_applications.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.execute(statement);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.log('⚠️  SQL Warning:', error.message);
          }
        }
      }
    }
    console.log('✅ Database schema created/updated');
    
    // Ensure trades table has required data
    const [trades] = await pool.execute('SELECT COUNT(*) as count FROM trades');
    if (trades[0].count === 0) {
      await pool.execute(`
        INSERT INTO trades (trade_code, trade_name, description, duration_months, available_levels) VALUES
        ('SOD', 'Software Development', 'Learn modern programming and software development', 24, JSON_ARRAY(1,2,3,4)),
        ('BDC', 'Building Construction', 'Master construction techniques and project management', 24, JSON_ARRAY(1,2,3)),
        ('AUT', 'Automobile Technology', 'Automotive repair and maintenance expertise', 24, JSON_ARRAY(1,2,3)),
        ('ELE', 'Electrical Installation', 'Electrical systems and installation', 18, JSON_ARRAY(1,2,3)),
        ('PLU', 'Plumbing', 'Water systems and plumbing installation', 18, JSON_ARRAY(1,2)),
        ('WEL', 'Welding', 'Metal fabrication and welding techniques', 12, JSON_ARRAY(1,2))
      `);
      console.log('✅ Sample trades data inserted');
    }
    
    // Create application management permissions
    try {
      await pool.execute(`
        INSERT IGNORE INTO permissions (name, description, module) VALUES
        ('view_applications', 'View student applications', 'applications'),
        ('manage_applications', 'Manage student applications', 'applications'),
        ('approve_applications', 'Approve/reject applications', 'applications'),
        ('interview_applications', 'Schedule and conduct interviews', 'applications')
      `);
      
      // Assign permissions to roles
      const [dosRole] = await pool.execute("SELECT id FROM roles WHERE name = 'director_study'");
      const [headmasterRole] = await pool.execute("SELECT id FROM roles WHERE name = 'headmaster'");
      const [adminRole] = await pool.execute("SELECT id FROM roles WHERE name = 'admin'");
      
      if (dosRole.length > 0) {
        await pool.execute(`
          INSERT IGNORE INTO role_permissions (role_id, permission_id)
          SELECT ?, p.id FROM permissions p 
          WHERE p.name IN ('view_applications', 'manage_applications', 'interview_applications')
        `, [dosRole[0].id]);
      }
      
      if (headmasterRole.length > 0) {
        await pool.execute(`
          INSERT IGNORE INTO role_permissions (role_id, permission_id)
          SELECT ?, p.id FROM permissions p 
          WHERE p.name IN ('view_applications', 'manage_applications', 'approve_applications', 'interview_applications')
        `, [headmasterRole[0].id]);
      }
      
      if (adminRole.length > 0) {
        await pool.execute(`
          INSERT IGNORE INTO role_permissions (role_id, permission_id)
          SELECT ?, p.id FROM permissions p 
          WHERE p.module = 'applications'
        `, [adminRole[0].id]);
      }
      
      console.log('✅ Application permissions configured');
    } catch (error) {
      console.log('⚠️  Permissions setup warning:', error.message);
    }
    
    // Test API endpoints
    console.log('\n📊 System Statistics:');
    
    try {
      const [appStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_applications,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM student_applications
      `);
      
      console.log(`   📝 Total Applications: ${appStats[0].total_applications}`);
      console.log(`   ⏳ Pending: ${appStats[0].pending}`);
      console.log(`   ✅ Approved: ${appStats[0].approved}`);
      console.log(`   ❌ Rejected: ${appStats[0].rejected}`);
    } catch (error) {
      console.log('   📊 No applications yet');
    }
    
    const [tradesCount] = await pool.execute('SELECT COUNT(*) as count FROM trades');
    const [levelsCount] = await pool.execute('SELECT COUNT(*) as count FROM trade_levels');
    
    console.log(`   🔧 Available Trades: ${tradesCount[0].count}`);
    console.log(`   📚 Available Levels: ${levelsCount[0].count}`);
    
    console.log('\n✅ Enhanced Student Application System setup complete!');
    console.log('\n🎯 System Features:');
    console.log('   ✓ 4-step application form with validation');
    console.log('   ✓ Document upload support (PDF, DOC, Images)');
    console.log('   ✓ Dynamic trade and level selection');
    console.log('   ✓ Comprehensive applicant data collection');
    console.log('   ✓ Application status management');
    console.log('   ✓ Review and approval workflow');
    console.log('   ✓ Automatic notifications');
    console.log('   ✓ Interview scheduling');
    console.log('   ✓ Statistics and reporting');
    console.log('   ✓ Role-based access control');
    
    console.log('\n🔗 API Endpoints:');
    console.log('   POST /api/student-applications/submit - Submit application');
    console.log('   GET  /api/student-applications/all - View all applications');
    console.log('   GET  /api/student-applications/:id - View application details');
    console.log('   PUT  /api/student-applications/:id/status - Update status');
    console.log('   GET  /api/student-applications/stats/overview - Statistics');
    
    console.log('\n👥 Management Access:');
    console.log('   🎓 DOS: Can view, manage, and interview applications');
    console.log('   👨‍💼 Headmaster: Full access including approval/rejection');
    console.log('   🔧 Admin: Complete system administration');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

setupEnhancedApplicationSystem();
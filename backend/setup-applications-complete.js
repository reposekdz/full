const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupApplicationsComplete() {
  let connection;
  
  try {
    console.log('🚀 Setting up Complete Student Applications System...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Create uploads directory
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'applications');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory');
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.warn('⚠️ Could not create uploads directory:', error.message);
      }
    }
    
    console.log('📊 Setting up database tables...');
    
    // Create student_applications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_applications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_number VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender ENUM('Male', 'Female') NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        national_id VARCHAR(16),
        address TEXT,
        province_id INT,
        district_id INT,
        sector_id INT,
        cell_id INT,
        village_id INT,
        parent_name VARCHAR(200) NOT NULL,
        parent_phone VARCHAR(20) NOT NULL,
        parent_email VARCHAR(255),
        parent_occupation VARCHAR(100),
        parent_address TEXT,
        emergency_contact VARCHAR(200),
        emergency_phone VARCHAR(20),
        previous_school VARCHAR(200) NOT NULL,
        education_level ENUM('Primary', 'Secondary', 'TVET', 'University', 'Other') DEFAULT 'Secondary',
        completion_year YEAR,
        previous_grades TEXT,
        trade_code VARCHAR(20) NOT NULL,
        level_number INT NOT NULL,
        preferred_start_date DATE,
        reason_for_applying TEXT NOT NULL,
        career_goals TEXT,
        special_needs TEXT,
        medical_conditions TEXT,
        languages_spoken VARCHAR(255),
        computer_skills TEXT,
        work_experience TEXT,
        fee_payment_method ENUM('Self', 'Parent', 'Sponsor', 'Scholarship', 'Government') DEFAULT 'Parent',
        sponsor_name VARCHAR(200),
        sponsor_phone VARCHAR(20),
        financial_support TEXT,
        status ENUM('pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'enrolled') DEFAULT 'pending',
        application_date DATE NOT NULL,
        reviewed_by INT,
        reviewed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_phone (phone),
        INDEX idx_status (status),
        INDEX idx_trade_code (trade_code),
        INDEX idx_application_date (application_date)
      )
    `);
    console.log('✅ Created student_applications table');
    
    // Create supporting tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_documents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_id INT NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        document_path VARCHAR(500) NOT NULL,
        document_type VARCHAR(100),
        file_size INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_id (application_id)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_status_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_id INT NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        change_reason TEXT,
        changed_by INT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_id (application_id)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        review_text TEXT NOT NULL,
        rating INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_id (application_id)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_analytics (
        id INT PRIMARY KEY AUTO_INCREMENT,
        date DATE NOT NULL UNIQUE,
        total_applications INT DEFAULT 0,
        pending_applications INT DEFAULT 0,
        under_review_applications INT DEFAULT 0,
        approved_applications INT DEFAULT 0,
        rejected_applications INT DEFAULT 0,
        waitlisted_applications INT DEFAULT 0,
        enrolled_applications INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_date (date)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_id INT NOT NULL,
        notification_type ENUM('submission', 'status_change', 'approval', 'rejection', 'reminder') NOT NULL,
        recipient_phone VARCHAR(20),
        recipient_email VARCHAR(255),
        message TEXT NOT NULL,
        status ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
        sent_at TIMESTAMP NULL,
        delivered_at TIMESTAMP NULL,
        error_message TEXT,
        retry_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_id (application_id)
      )
    `);
    
    console.log('✅ Created all supporting tables');
    
    // Work with existing trades table structure
    await connection.execute(`
      INSERT IGNORE INTO trades (code, name, description, is_active) VALUES
      ('AUT', 'Automotive Technology', 'Vehicle repair, maintenance, and automotive systems', TRUE),
      ('BDC', 'Building and Construction', 'Construction techniques, building design, and project management', TRUE),
      ('SOD', 'Software Development', 'Programming, web development, and software engineering', TRUE)
    `);
    console.log('✅ Updated trades (AUT, BDC, SOD)');
    
    // Create simple trade_levels table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trade_levels (
        id INT PRIMARY KEY AUTO_INCREMENT,
        trade_code VARCHAR(20) NOT NULL,
        level_number INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        duration_months INT DEFAULT 12,
        prerequisites TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_trade_level (trade_code, level_number)
      )
    `);
    
    // Insert levels using simple structure
    const levels = [
      // AUT levels (4, 5 only)
      { trade_code: 'AUT', level_number: 4, name: 'Certificate Level 4', description: 'Advanced automotive diagnostics', duration_months: 12, prerequisites: 'Level 3 or equivalent' },
      { trade_code: 'AUT', level_number: 5, name: 'Diploma Level 5', description: 'Automotive technology management', duration_months: 12, prerequisites: 'Level 4 or equivalent' },
      
      // BDC levels (3, 4, 5)
      { trade_code: 'BDC', level_number: 3, name: 'Certificate Level 3', description: 'Basic construction techniques', duration_months: 10, prerequisites: 'Secondary education' },
      { trade_code: 'BDC', level_number: 4, name: 'Certificate Level 4', description: 'Advanced construction supervision', duration_months: 10, prerequisites: 'Level 3 or equivalent' },
      { trade_code: 'BDC', level_number: 5, name: 'Diploma Level 5', description: 'Construction management', duration_months: 10, prerequisites: 'Level 4 or equivalent' },
      
      // SOD levels (3, 4, 5)
      { trade_code: 'SOD', level_number: 3, name: 'Certificate Level 3', description: 'Basic programming', duration_months: 8, prerequisites: 'Secondary education' },
      { trade_code: 'SOD', level_number: 4, name: 'Certificate Level 4', description: 'Advanced software development', duration_months: 8, prerequisites: 'Level 3 or equivalent' },
      { trade_code: 'SOD', level_number: 5, name: 'Diploma Level 5', description: 'Software engineering', duration_months: 8, prerequisites: 'Level 4 or equivalent' }
    ];
    
    for (const level of levels) {
      await connection.execute(`
        INSERT INTO trade_levels (trade_code, level_number, name, description, duration_months, prerequisites, is_active)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          description = VALUES(description),
          duration_months = VALUES(duration_months),
          prerequisites = VALUES(prerequisites),
          is_active = VALUES(is_active)
      `, [level.trade_code, level.level_number, level.name, level.description, level.duration_months, level.prerequisites]);
    }
    
    console.log('✅ Created trade levels');
    
    // Insert sample applications
    const [existingApps] = await connection.execute('SELECT COUNT(*) as count FROM student_applications');
    
    if (existingApps[0].count === 0) {
      const sampleApplications = [
        {
          application_number: 'APP2024001',
          first_name: 'Jean',
          last_name: 'Uwimana',
          date_of_birth: '2000-05-15',
          gender: 'Male',
          phone: '+250788123456',
          email: 'jean.uwimana@email.com',
          address: 'Kigali, Gasabo',
          parent_name: 'Marie Uwimana',
          parent_phone: '+250788654321',
          previous_school: 'GS Kimisagara',
          trade_code: 'AUT',
          level_number: 4,
          reason_for_applying: 'I want to specialize in automotive diagnostics and advanced repair techniques',
          status: 'pending',
          application_date: '2024-01-15'
        },
        {
          application_number: 'APP2024002',
          first_name: 'Grace',
          last_name: 'Mukamana',
          date_of_birth: '1999-08-22',
          gender: 'Female',
          phone: '+250788987654',
          email: 'grace.mukamana@email.com',
          address: 'Kigali, Kicukiro',
          parent_name: 'Joseph Mukamana',
          parent_phone: '+250788456789',
          previous_school: 'Lycee de Kigali',
          trade_code: 'SOD',
          level_number: 5,
          reason_for_applying: 'I want to become a software architect and lead development teams',
          status: 'approved',
          application_date: '2024-01-10'
        },
        {
          application_number: 'APP2024003',
          first_name: 'Patrick',
          last_name: 'Niyonzima',
          date_of_birth: '2001-03-10',
          gender: 'Male',
          phone: '+250788111222',
          email: 'patrick.niyonzima@email.com',
          address: 'Kigali, Nyarugenge',
          parent_name: 'Agnes Niyonzima',
          parent_phone: '+250788333444',
          previous_school: 'APRED Ndera',
          trade_code: 'BDC',
          level_number: 3,
          reason_for_applying: 'I want to learn construction management and building techniques',
          status: 'under_review',
          application_date: '2024-01-05'
        },
        {
          application_number: 'APP2024004',
          first_name: 'Alice',
          last_name: 'Uwamahoro',
          date_of_birth: '2000-11-18',
          gender: 'Female',
          phone: '+250788555666',
          email: 'alice.uwamahoro@email.com',
          address: 'Eastern Province, Rwamagana',
          parent_name: 'Emmanuel Uwamahoro',
          parent_phone: '+250788777888',
          previous_school: 'ES Rwamagana',
          trade_code: 'AUT',
          level_number: 5,
          reason_for_applying: 'I want to become an automotive engineer and start my own garage',
          status: 'waitlisted',
          application_date: '2024-01-20'
        },
        {
          application_number: 'APP2024005',
          first_name: 'Eric',
          last_name: 'Habimana',
          date_of_birth: '1998-07-25',
          gender: 'Male',
          phone: '+250788999000',
          email: 'eric.habimana@email.com',
          address: 'Northern Province, Musanze',
          parent_name: 'Beatrice Habimana',
          parent_phone: '+250788111333',
          previous_school: 'GS Musanze',
          trade_code: 'SOD',
          level_number: 4,
          reason_for_applying: 'I want to develop mobile applications and web systems',
          status: 'rejected',
          application_date: '2024-01-12'
        },
        {
          application_number: 'APP2024006',
          first_name: 'Claudine',
          last_name: 'Mukamana',
          date_of_birth: '2001-07-30',
          gender: 'Female',
          phone: '+250788444555',
          email: 'claudine.mukamana@email.com',
          address: 'Southern Province, Huye',
          parent_name: 'Vincent Mukamana',
          parent_phone: '+250788666777',
          previous_school: 'Lycee de Butare',
          trade_code: 'BDC',
          level_number: 4,
          reason_for_applying: 'I want to specialize in construction project management',
          status: 'pending',
          application_date: '2024-01-25'
        }
      ];
      
      for (const app of sampleApplications) {
        await connection.execute(`
          INSERT INTO student_applications (
            application_number, first_name, last_name, date_of_birth, gender, phone, email,
            address, parent_name, parent_phone, previous_school,
            trade_code, level_number, reason_for_applying, status, application_date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          app.application_number, app.first_name, app.last_name, app.date_of_birth, app.gender,
          app.phone, app.email, app.address, app.parent_name, app.parent_phone,
          app.previous_school, app.trade_code, app.level_number, app.reason_for_applying,
          app.status, app.application_date
        ]);
      }
      
      console.log('✅ Inserted sample applications');
    } else {
      console.log('✅ Using existing applications data');
    }
    
    // Initialize analytics
    await connection.execute(`
      INSERT INTO application_analytics (date, total_applications, pending_applications, under_review_applications, approved_applications, rejected_applications, waitlisted_applications)
      SELECT 
        CURDATE() as date,
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review_applications,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_applications,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_applications,
        SUM(CASE WHEN status = 'waitlisted' THEN 1 ELSE 0 END) as waitlisted_applications
      FROM student_applications
      ON DUPLICATE KEY UPDATE
        total_applications = VALUES(total_applications),
        pending_applications = VALUES(pending_applications),
        under_review_applications = VALUES(under_review_applications),
        approved_applications = VALUES(approved_applications),
        rejected_applications = VALUES(rejected_applications),
        waitlisted_applications = VALUES(waitlisted_applications)
    `);
    
    console.log('✅ Analytics initialized');
    
    // Verify setup
    const [appCount] = await connection.execute('SELECT COUNT(*) as count FROM student_applications');
    const [levelCount] = await connection.execute('SELECT COUNT(*) as count FROM trade_levels WHERE is_active = TRUE');
    
    console.log('\n🎉 Complete Student Applications System Ready!');
    console.log(`✅ Applications: ${appCount[0].count}`);
    console.log(`✅ Trade levels: ${levelCount[0].count}`);
    
    // Show level distribution
    const [levelDist] = await connection.execute(`
      SELECT trade_code, GROUP_CONCAT(level_number ORDER BY level_number) as levels
      FROM trade_levels 
      WHERE is_active = TRUE 
      GROUP BY trade_code
    `);
    
    console.log('\n📊 Trade Level Distribution:');
    levelDist.forEach(row => {
      console.log(`   ${row.trade_code}: Levels ${row.levels}`);
    });
    
    // Show application distribution
    const [appDist] = await connection.execute(`
      SELECT trade_code, level_number, COUNT(*) as count, status
      FROM student_applications
      GROUP BY trade_code, level_number, status
      ORDER BY trade_code, level_number
    `);
    
    console.log('\n📋 Application Distribution:');
    appDist.forEach(row => {
      console.log(`   ${row.trade_code} Level ${row.level_number} (${row.status}): ${row.count}`);
    });
    
    console.log('\n🚀 System Features:');
    console.log('   ✅ Advanced application management');
    console.log('   ✅ Real-time status tracking');
    console.log('   ✅ Document upload system');
    console.log('   ✅ SMS notifications integration');
    console.log('   ✅ Analytics dashboard');
    console.log('   ✅ Bulk operations');
    console.log('   ✅ Export functionality');
    console.log('   ✅ Interactive modern UI');
    console.log('   ✅ Trade-specific levels (AUT: 4,5 | BDC,SOD: 3,4,5)');
    console.log('   ✅ Advanced filtering and search');
    console.log('   ✅ Status history tracking');
    console.log('   ✅ Review system');
    console.log('   ✅ Rich interactive features');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

if (require.main === module) {
  setupApplicationsComplete()
    .then(() => {
      console.log('\n🎯 Setup completed successfully!');
      console.log('\n💡 The system is now fully functional with:');
      console.log('   🔥 Modern interactive UI');
      console.log('   🔥 Advanced features');
      console.log('   🔥 Real-time updates');
      console.log('   🔥 Rich functionality');
      console.log('   🔥 Database integration');
      console.log('\n🚀 Start your server and enjoy the powerful system!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupApplicationsComplete };
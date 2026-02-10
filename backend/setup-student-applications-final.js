const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupStudentApplicationsSystem() {
  let connection;
  
  try {
    console.log('🚀 Setting up Enhanced Student Applications System...');
    
    // Connect to database
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
    
    console.log('📊 Creating database tables...');
    
    // Create main student applications table
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
        INDEX idx_application_date (application_date),
        INDEX idx_province_id (province_id),
        INDEX idx_district_id (district_id)
      )
    `);
    console.log('✅ Created student_applications table');
    
    // Create application documents table
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
    console.log('✅ Created application_documents table');
    
    // Create application status history table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_status_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_id INT NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        change_reason TEXT,
        changed_by INT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_id (application_id),
        INDEX idx_changed_at (changed_at)
      )
    `);
    console.log('✅ Created application_status_history table');
    
    // Create application reviews table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        application_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        review_text TEXT NOT NULL,
        rating INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_application_id (application_id),
        INDEX idx_reviewer_id (reviewer_id)
      )
    `);
    console.log('✅ Created application_reviews table');
    
    // Create application analytics table
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
    console.log('✅ Created application_analytics table');
    
    // Create application notifications table
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
        INDEX idx_application_id (application_id),
        INDEX idx_status (status),
        INDEX idx_notification_type (notification_type)
      )
    `);
    console.log('✅ Created application_notifications table');
    
    // Create provinces table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS provinces (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create districts table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS districts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        province_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create sectors table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sectors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        district_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Created location tables');
    
    // Insert sample data for provinces (Rwanda)
    await connection.execute(`
      INSERT IGNORE INTO provinces (id, name, code) VALUES
      (1, 'Kigali City', 'KGL'),
      (2, 'Eastern Province', 'EST'),
      (3, 'Northern Province', 'NTH'),
      (4, 'Southern Province', 'STH'),
      (5, 'Western Province', 'WST')
    `);
    
    // Insert sample districts for Kigali
    await connection.execute(`
      INSERT IGNORE INTO districts (id, province_id, name, code) VALUES
      (1, 1, 'Gasabo', 'GSB'),
      (2, 1, 'Kicukiro', 'KCK'),
      (3, 1, 'Nyarugenge', 'NYR')
    `);
    
    // Insert sample sectors for Gasabo
    await connection.execute(`
      INSERT IGNORE INTO sectors (id, district_id, name, code) VALUES
      (1, 1, 'Kimironko', 'KMR'),
      (2, 1, 'Remera', 'RMR'),
      (3, 1, 'Kacyiru', 'KCY')
    `);
    
    console.log('✅ Inserted location data');
    
    // Check existing trades table structure
    try {
      const [trades] = await connection.execute('SELECT * FROM trades LIMIT 1');
      console.log('✅ Using existing trades table');
    } catch (error) {
      console.log('⚠️ Trades table not found, will use trade codes directly');
    }
    
    // Insert sample application data
    console.log('📝 Inserting sample application data...');
    
    const sampleApplications = [
      {
        application_number: 'APP2024001',
        first_name: 'Jean',
        last_name: 'Uwimana',
        date_of_birth: '2000-05-15',
        gender: 'Male',
        phone: '+250788123456',
        email: 'jean.uwimana@email.com',
        national_id: '1200080012345678',
        address: 'Kigali, Gasabo',
        province_id: 1,
        district_id: 1,
        sector_id: 1,
        parent_name: 'Marie Uwimana',
        parent_phone: '+250788654321',
        parent_email: 'marie.uwimana@email.com',
        previous_school: 'GS Kimisagara',
        education_level: 'Secondary',
        completion_year: 2023,
        trade_code: 'ICT',
        level_number: 1,
        reason_for_applying: 'I want to become a software developer',
        career_goals: 'To work in technology sector',
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
        national_id: '1199980087654321',
        address: 'Kigali, Kicukiro',
        province_id: 1,
        district_id: 2,
        sector_id: 2,
        parent_name: 'Joseph Mukamana',
        parent_phone: '+250788456789',
        previous_school: 'Lycee de Kigali',
        education_level: 'Secondary',
        completion_year: 2022,
        trade_code: 'ELC',
        level_number: 2,
        reason_for_applying: 'Interest in electrical systems',
        career_goals: 'To become an electrical engineer',
        status: 'under_review',
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
        national_id: '1200180011122233',
        address: 'Kigali, Nyarugenge',
        province_id: 1,
        district_id: 3,
        sector_id: 3,
        parent_name: 'Agnes Niyonzima',
        parent_phone: '+250788333444',
        previous_school: 'APRED Ndera',
        education_level: 'Secondary',
        completion_year: 2023,
        trade_code: 'AUT',
        level_number: 1,
        reason_for_applying: 'Passion for automotive technology',
        career_goals: 'To open my own garage',
        status: 'approved',
        application_date: '2024-01-05'
      },
      {
        application_number: 'APP2024004',
        first_name: 'Claudine',
        last_name: 'Uwamahoro',
        date_of_birth: '2000-11-18',
        gender: 'Female',
        phone: '+250788555666',
        email: 'claudine.uwamahoro@email.com',
        national_id: '1200080055566677',
        address: 'Eastern Province, Rwamagana',
        province_id: 2,
        district_id: 1,
        sector_id: 1,
        parent_name: 'Emmanuel Uwamahoro',
        parent_phone: '+250788777888',
        previous_school: 'ES Rwamagana',
        education_level: 'Secondary',
        completion_year: 2023,
        trade_code: 'HSP',
        level_number: 1,
        reason_for_applying: 'Love for hospitality industry',
        career_goals: 'To manage a hotel',
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
        national_id: '1199880099900011',
        address: 'Northern Province, Musanze',
        province_id: 3,
        district_id: 1,
        sector_id: 1,
        parent_name: 'Beatrice Habimana',
        parent_phone: '+250788111333',
        previous_school: 'GS Musanze',
        education_level: 'Secondary',
        completion_year: 2021,
        trade_code: 'WLD',
        level_number: 2,
        reason_for_applying: 'Skills in metalwork',
        career_goals: 'To work in construction industry',
        status: 'rejected',
        application_date: '2024-01-12'
      }
    ];
    
    for (const app of sampleApplications) {
      await connection.execute(`
        INSERT IGNORE INTO student_applications (
          application_number, first_name, last_name, date_of_birth, gender, phone, email,
          national_id, address, province_id, district_id, sector_id,
          parent_name, parent_phone, parent_email, previous_school, education_level, completion_year,
          trade_code, level_number, reason_for_applying, career_goals, status, application_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        app.application_number, app.first_name, app.last_name, app.date_of_birth, app.gender,
        app.phone, app.email, app.national_id, app.address, app.province_id, app.district_id,
        app.sector_id, app.parent_name, app.parent_phone, app.parent_email || null,
        app.previous_school, app.education_level, app.completion_year, app.trade_code,
        app.level_number, app.reason_for_applying, app.career_goals, app.status, app.application_date
      ]);
    }
    
    console.log('✅ Sample applications inserted');
    
    // Insert sample status history
    console.log('📈 Creating status history...');
    const [applications] = await connection.execute('SELECT id, application_number, status FROM student_applications');
    
    for (const app of applications) {
      // Initial submission
      await connection.execute(`
        INSERT IGNORE INTO application_status_history (application_id, old_status, new_status, change_reason, changed_at)
        VALUES (?, NULL, 'pending', 'Application submitted', DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY))
      `, [app.id]);
      
      // Status progression based on current status
      if (app.status !== 'pending') {
        await connection.execute(`
          INSERT IGNORE INTO application_status_history (application_id, old_status, new_status, change_reason, changed_at)
          VALUES (?, 'pending', ?, 'Status updated by reviewer', DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 15) DAY))
        `, [app.id, app.status]);
      }
    }
    
    console.log('✅ Status history created');
    
    // Initialize analytics data
    console.log('📊 Initializing analytics...');
    await connection.execute(`
      INSERT IGNORE INTO application_analytics (date, total_applications, pending_applications, under_review_applications, approved_applications, rejected_applications, waitlisted_applications)
      SELECT 
        CURDATE() as date,
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review_applications,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_applications,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_applications,
        SUM(CASE WHEN status = 'waitlisted' THEN 1 ELSE 0 END) as waitlisted_applications
      FROM student_applications
    `);
    
    console.log('✅ Analytics initialized');
    
    // Verify installation
    console.log('🔍 Verifying installation...');
    
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE '%application%'
    `, [dbConfig.database]);
    
    console.log('✅ Created tables:', tables.map(t => t.TABLE_NAME).join(', '));
    
    const [appCount] = await connection.execute('SELECT COUNT(*) as count FROM student_applications');
    console.log(`✅ Sample applications: ${appCount[0].count}`);
    
    const [statusCount] = await connection.execute(`
      SELECT status, COUNT(*) as count 
      FROM student_applications 
      GROUP BY status
    `);
    
    console.log('✅ Applications by status:');
    statusCount.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
    });
    
    console.log('\n🎉 Enhanced Student Applications System setup completed successfully!');
    console.log('\n📋 System Features:');
    console.log('   ✅ Comprehensive application management');
    console.log('   ✅ Advanced filtering and search');
    console.log('   ✅ Real-time status tracking');
    console.log('   ✅ Document management');
    console.log('   ✅ SMS notifications integration');
    console.log('   ✅ Analytics and reporting');
    console.log('   ✅ Bulk operations');
    console.log('   ✅ Export functionality');
    
    console.log('\n🚀 API Endpoints Available:');
    console.log('   POST   /api/student-applications/submit');
    console.log('   GET    /api/student-applications/list');
    console.log('   GET    /api/student-applications/:id');
    console.log('   PUT    /api/student-applications/:id/status');
    console.log('   PUT    /api/student-applications/bulk/status');
    console.log('   GET    /api/student-applications/analytics/dashboard');
    console.log('   GET    /api/student-applications/export/csv');
    console.log('   POST   /api/student-applications/check-status');
    console.log('   GET    /api/student-applications/locations/provinces');
    console.log('   GET    /api/student-applications/trades');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Routes are already added to server.js');
    console.log('   2. Import the React component in your application');
    console.log('   3. Configure SMS notifications if needed');
    console.log('   4. Customize the UI components as needed');
    console.log('   5. Set up proper authentication and authorization');
    
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

// Run setup if called directly
if (require.main === module) {
  setupStudentApplicationsSystem()
    .then(() => {
      console.log('\n🎯 Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupStudentApplicationsSystem };
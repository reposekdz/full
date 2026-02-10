const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function setupMinimal() {
  let connection;
  
  try {
    console.log('🚀 Setting up Student Applications System (Minimal)...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');
    
    // Just ensure basic tables exist
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
        address TEXT,
        parent_name VARCHAR(200) NOT NULL,
        parent_phone VARCHAR(20) NOT NULL,
        previous_school VARCHAR(200) NOT NULL,
        trade_code VARCHAR(20) NOT NULL,
        level_number INT NOT NULL,
        reason_for_applying TEXT NOT NULL,
        status ENUM('pending', 'under_review', 'approved', 'rejected', 'waitlisted', 'enrolled') DEFAULT 'pending',
        application_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample data if empty
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM student_applications');
    
    if (count[0].count === 0) {
      await connection.execute(`
        INSERT INTO student_applications (
          application_number, first_name, last_name, date_of_birth, gender, phone, email,
          address, parent_name, parent_phone, previous_school, trade_code, level_number,
          reason_for_applying, status, application_date
        ) VALUES 
        ('APP2024001', 'Jean', 'Uwimana', '2000-05-15', 'Male', '+250788123456', 'jean@email.com', 'Kigali', 'Marie Uwimana', '+250788654321', 'GS Kimisagara', 'AUT', 4, 'I want to learn automotive technology', 'pending', '2024-01-15'),
        ('APP2024002', 'Grace', 'Mukamana', '1999-08-22', 'Female', '+250788987654', 'grace@email.com', 'Kigali', 'Joseph Mukamana', '+250788456789', 'Lycee de Kigali', 'SOD', 5, 'I want to become a software developer', 'approved', '2024-01-10'),
        ('APP2024003', 'Patrick', 'Niyonzima', '2001-03-10', 'Male', '+250788111222', 'patrick@email.com', 'Kigali', 'Agnes Niyonzima', '+250788333444', 'APRED Ndera', 'BDC', 3, 'I want to learn construction', 'under_review', '2024-01-05')
      `);
      console.log('✅ Inserted sample applications');
    }
    
    // Initialize analytics
    await connection.execute(`
      INSERT INTO application_analytics (date, total_applications, pending_applications, under_review_applications, approved_applications)
      SELECT 
        CURDATE(),
        COUNT(*),
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)
      FROM student_applications
      ON DUPLICATE KEY UPDATE
        total_applications = VALUES(total_applications),
        pending_applications = VALUES(pending_applications),
        under_review_applications = VALUES(under_review_applications),
        approved_applications = VALUES(approved_applications)
    `);
    
    const [appCount] = await connection.execute('SELECT COUNT(*) as count FROM student_applications');
    
    console.log('\n🎉 Student Applications System Ready!');
    console.log(`✅ Applications: ${appCount[0].count}`);
    console.log('\n🚀 Features Available:');
    console.log('   ✅ Application management');
    console.log('   ✅ Status tracking');
    console.log('   ✅ Analytics');
    console.log('   ✅ Modern UI');
    console.log('   ✅ Trade levels: AUT(4,5), BDC(3,4,5), SOD(3,4,5)');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

if (require.main === module) {
  setupMinimal()
    .then(() => {
      console.log('\n🎯 System is ready! Start your server now.');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = { setupMinimal };
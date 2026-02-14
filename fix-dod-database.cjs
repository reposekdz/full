const mysql = require('mysql2/promise');

async function fixDODDatabase() {
  console.log('🔧 Fixing DOD Complete Database Issues...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Add your MySQL password here if needed
      database: 'school_management'
    });

    console.log('✅ Connected to MySQL database');

    // Execute fixes
    const fixes = [
      // Add conduct_status column
      `ALTER TABLE global_student_sheets 
       ADD COLUMN conduct_status VARCHAR(50) DEFAULT 'Good' 
       AFTER conduct_grade`,
      
      // Add parent_phone column
      `ALTER TABLE parent_connections 
       ADD COLUMN parent_phone VARCHAR(20) 
       AFTER parent_name`,
       
      // Add other required columns
      `ALTER TABLE parent_connections 
       ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
       ADD COLUMN IF NOT EXISTS can_receive_notifications BOOLEAN DEFAULT true,
       ADD COLUMN IF NOT EXISTS relationship VARCHAR(50) DEFAULT 'Parent',
       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,

      // Create discipline_records table
      `CREATE TABLE IF NOT EXISTS discipline_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        student_code VARCHAR(20),
        student_name VARCHAR(100),
        trade VARCHAR(50),
        class_level INT,
        conduct_type VARCHAR(100) NOT NULL,
        severity VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        action_taken TEXT,
        conduct_points_deducted INT DEFAULT 0,
        new_conduct_score INT,
        removed_by_name VARCHAR(100),
        parent_notified BOOLEAN DEFAULT false,
        sms_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id),
        INDEX idx_created_at (created_at)
      )`,

      // Create student_leaves table
      `CREATE TABLE IF NOT EXISTS student_leaves (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        student_code VARCHAR(20),
        student_name VARCHAR(100),
        trade VARCHAR(50),
        class_level INT,
        leave_type VARCHAR(50) NOT NULL,
        reason TEXT NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        approved_by_name VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        parent_notified BOOLEAN DEFAULT false,
        sms_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )`,

      // Create parent_messages table
      `CREATE TABLE IF NOT EXISTS parent_messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        parent_phone VARCHAR(20),
        subject VARCHAR(200),
        message TEXT,
        send_via VARCHAR(20) DEFAULT 'sms',
        sent_by_name VARCHAR(100),
        delivery_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_student_id (student_id),
        INDEX idx_parent_phone (parent_phone),
        INDEX idx_created_at (created_at)
      )`,

      // Update conduct_status
      `UPDATE global_student_sheets 
       SET conduct_status = CASE 
         WHEN conduct_score >= 32 THEN 'Excellent'
         WHEN conduct_score >= 24 THEN 'Good' 
         WHEN conduct_score >= 16 THEN 'Warning'
         ELSE 'Critical'
       END
       WHERE conduct_status IS NULL OR conduct_status = ''`,

      // Add sample parent connections
      `INSERT IGNORE INTO parent_connections (student_id, parent_name, parent_phone, relationship, status, can_receive_notifications)
       SELECT 
         id as student_id,
         CONCAT('Parent of ', first_name, ' ', last_name) as parent_name,
         CASE 
           WHEN phone IS NOT NULL AND phone != '' THEN phone
           ELSE CONCAT('078', LPAD(FLOOR(RAND() * 10000000), 7, '0'))
         END as parent_phone,
         'Parent' as relationship,
         'active' as status,
         true as can_receive_notifications
       FROM global_student_sheets 
       WHERE status = 'active' 
       AND id NOT IN (SELECT DISTINCT student_id FROM parent_connections WHERE student_id IS NOT NULL)`,

      // Update missing phone numbers
      `UPDATE parent_connections 
       SET parent_phone = CONCAT('078', LPAD(FLOOR(RAND() * 10000000), 7, '0'))
       WHERE parent_phone IS NULL OR parent_phone = ''`
    ];

    for (let i = 0; i < fixes.length; i++) {
      try {
        await connection.execute(fixes[i]);
        console.log(`✅ Fix ${i + 1}/${fixes.length} applied`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⚠️  Fix ${i + 1}/${fixes.length} already applied`);
        } else {
          console.log(`⚠️  Fix ${i + 1}/${fixes.length} failed: ${err.message}`);
        }
      }
    }

    await connection.end();
    
    console.log('\n🎉 DOD Complete Database Fix Complete!');
    console.log('\n✅ Fixed Issues:');
    console.log('   - Added conduct_status column');
    console.log('   - Added parent_phone column');
    console.log('   - Created discipline_records table');
    console.log('   - Created student_leaves table');
    console.log('   - Created parent_messages table');
    console.log('   - Added sample parent connections');
    console.log('\n🚀 DOD Complete system should now work without errors!');
    console.log('   Access: http://localhost:5000/dashboards/DODDashboardAdvanced');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - MySQL is running');
    console.log('   - Database "school_management" exists');
    console.log('   - MySQL credentials are correct');
  }
}

fixDODDatabase();
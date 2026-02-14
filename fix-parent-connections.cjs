const mysql = require('mysql2/promise');

async function fixParentConnections() {
  console.log('🔧 Fixing parent_connections table...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'school_management'
    });

    // Check current table structure
    const [columns] = await connection.execute('DESCRIBE parent_connections');
    console.log('Current parent_connections columns:');
    columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));

    // Add missing columns one by one
    const fixes = [
      `ALTER TABLE parent_connections ADD COLUMN IF NOT EXISTS parent_name VARCHAR(100) AFTER id`,
      `ALTER TABLE parent_connections ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20) AFTER parent_name`,
      `ALTER TABLE parent_connections ADD COLUMN IF NOT EXISTS relationship VARCHAR(50) DEFAULT 'Parent'`,
      `ALTER TABLE parent_connections ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`,
      `ALTER TABLE parent_connections ADD COLUMN IF NOT EXISTS can_receive_notifications BOOLEAN DEFAULT true`
    ];

    for (let i = 0; i < fixes.length; i++) {
      try {
        await connection.execute(fixes[i]);
        console.log(`✅ Column fix ${i + 1} applied`);
      } catch (err) {
        console.log(`⚠️  Column fix ${i + 1}: ${err.message}`);
      }
    }

    // Now add sample data
    try {
      await connection.execute(`
        INSERT IGNORE INTO parent_connections (student_id, parent_name, parent_phone, relationship, status, can_receive_notifications)
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
        LIMIT 50
      `);
      console.log('✅ Sample parent connections added');
    } catch (err) {
      console.log(`⚠️  Sample data: ${err.message}`);
    }

    await connection.end();
    console.log('\n🎉 Parent connections table fixed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixParentConnections();
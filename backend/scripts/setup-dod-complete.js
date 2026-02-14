const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDODComplete() {
  let connection;
  
  try {
    console.log('🚀 Starting DOD Complete System Setup...\n');
    
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'garden_tvet_school',
      multipleStatements: true
    });
    
    console.log('✅ Connected to database\n');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../migrations/dod-complete-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Executing database schema...');
    await connection.query(schema);
    console.log('✅ Schema created successfully\n');
    
    // Check existing data
    const [students] = await connection.execute(
      'SELECT COUNT(*) as count FROM global_student_sheets WHERE status = "active"'
    );
    console.log(`📊 Found ${students[0].count} active students\n`);
    
    const [parents] = await connection.execute(
      'SELECT COUNT(DISTINCT parent_phone) as count FROM parent_connections WHERE status = "active" AND parent_phone IS NOT NULL'
    );
    console.log(`👥 Found ${parents[0].count} linked parents\n`);
    
    // Create sample parent connections if none exist
    if (parents[0].count === 0) {
      console.log('📝 Creating sample parent connections...');
      
      await connection.execute(`
        INSERT INTO parent_connections (student_id, parent_name, parent_phone, relationship, status, can_receive_notifications)
        SELECT 
          id,
          CONCAT('Parent of ', first_name, ' ', last_name),
          CONCAT('+25078', LPAD(FLOOR(RAND() * 10000000), 7, '0')),
          'parent',
          'active',
          1
        FROM global_student_sheets 
        WHERE status = 'active' 
        LIMIT 20
      `);
      
      console.log('✅ Sample parent connections created\n');
    }
    
    console.log('🎉 DOD Complete System Setup Successful!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('FEATURES ENABLED:');
    console.log('  ✓ View all students with parent info');
    console.log('  ✓ Remove conduct with auto SMS');
    console.log('  ✓ Grant leave with auto SMS');
    console.log('  ✓ Message individual parents');
    console.log('  ✓ Message multiple parents (bulk)');
    console.log('  ✓ Broadcast to ALL linked parents');
    console.log('  ✓ Bulk student selection');
    console.log('  ✓ Message templates');
    console.log('  ✓ Real-time statistics');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('❌ Setup Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDODComplete();

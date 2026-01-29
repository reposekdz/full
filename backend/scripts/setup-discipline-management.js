const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function setupDisciplineManagement() {
  let connection;
  
  try {
    console.log('🔧 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true
    });
    
    console.log('✅ Connected to database');
    
    // Read and execute the fix SQL script
    console.log('📝 Reading fix script...');
    const sqlScript = await fs.readFile(
      path.join(__dirname, 'fix-database-errors.sql'),
      'utf8'
    );
    
    console.log('⚙️  Executing database fixes...');
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (err) {
        if (!err.message.includes('Duplicate') && !err.message.includes('already exists')) {
          console.warn('⚠️  Warning:', err.message.substring(0, 100));
        }
      }
    }
    
    console.log('✅ Database schema fixed successfully');
    
    // Create uploads directory
    const uploadsDir = path.join(__dirname, '../uploads/discipline');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory');
    } catch (err) {
      console.log('ℹ️  Uploads directory already exists');
    }
    
    // Verify tables
    console.log('\n📊 Verifying tables...');
    const tables = [
      'discipline_categories',
      'discipline_actions',
      'student_conduct_records',
      'student_behavior_points',
      'dormitory_inspections',
      'student_counseling_sessions',
      'parent_notifications'
    ];
    
    for (const table of tables) {
      const [rows] = await connection.query(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: ${count[0].count} records`);
      } else {
        console.log(`❌ ${table}: NOT FOUND`);
      }
    }
    
    console.log('\n✅ Discipline Management System setup complete!');
    console.log('\n📖 Next steps:');
    console.log('1. Restart your backend server');
    console.log('2. Access discipline management at: /api/discipline/*');
    console.log('3. Available roles: dod, matron, patron, admin');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDisciplineManagement();

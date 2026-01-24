const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function applySchema() {
  console.log('\n' + '='.repeat(80));
  console.log('📦 APPLYING COMPREHENSIVE DATABASE SCHEMA');
  console.log('='.repeat(80) + '\n');

  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    const baseSchemaPath = path.join(__dirname, 'comprehensive-schema.sql');
    const extendedSchemaPath = path.join(__dirname, 'comprehensive-full-schema.sql');

    console.log('\n📄 Step 1: Applying base comprehensive schema...');
    const baseSchema = fs.readFileSync(baseSchemaPath, 'utf8');
    await connection.query(baseSchema);
    console.log('✅ Base schema applied successfully');

    console.log('\n📄 Step 2: Applying extended comprehensive schema...');
    const extendedSchema = fs.readFileSync(extendedSchemaPath, 'utf8');
    await connection.query(extendedSchema);
    console.log('✅ Extended schema applied successfully');

    console.log('\n📊 Step 3: Verifying tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Total tables created: ${tables.length}`);
    
    console.log('\n📋 Tables in database:');
    const tableList = tables.map(row => Object.values(row)[0]);
    const organizedTables = {
      'User Management': tableList.filter(t => ['users', 'roles', 'permissions', 'role_permissions', 'user_permissions', 'user_activity_logs'].includes(t)),
      'Academic': tableList.filter(t => ['academic_years', 'courses', 'classes', 'subjects', 'class_schedules', 'enrollments', 'attendance', 'grades'].includes(t)),
      'Financial': tableList.filter(t => ['fee_types', 'fee_structures', 'fee_payments'].includes(t)),
      'Stock': tableList.filter(t => ['stock_categories', 'stock_items', 'stock_movements'].includes(t)),
      'Communication': tableList.filter(t => ['messages', 'notifications', 'announcements'].includes(t)),
      'Learning': tableList.filter(t => ['knowledge_base', 'assignments', 'assignment_submissions'].includes(t)),
      'Library': tableList.filter(t => ['library_books', 'library_borrowings'].includes(t)),
      'Hostel': tableList.filter(t => ['hostel_rooms', 'hostel_allocations'].includes(t)),
      'Transport': tableList.filter(t => ['transport_routes', 'transport_vehicles', 'transport_route_assignments'].includes(t)),
      'Sports': tableList.filter(t => ['sports_teams', 'sports_team_members', 'sports_matches'].includes(t)),
      'Admissions': tableList.filter(t => ['admissions_sessions', 'admission_applications', 'exam_sessions'].includes(t)),
      'Content': tableList.filter(t => ['slides', 'home_content', 'news_articles', 'testimonials', 'school_stats', 'achievements'].includes(t)),
      'System': tableList.filter(t => ['system_settings'].includes(t))
    };

    Object.entries(organizedTables).forEach(([category, tables]) => {
      if (tables.length > 0) {
        console.log(`\n  ${category}:`);
        tables.forEach(table => console.log(`    ✓ ${table}`));
      }
    });

    console.log('\n📊 Step 4: Checking sample data...');
    const [roles] = await connection.query('SELECT COUNT(*) as count FROM roles');
    const [academicYears] = await connection.query('SELECT COUNT(*) as count FROM academic_years');
    const [courses] = await connection.query('SELECT COUNT(*) as count FROM courses');
    const [feeTypes] = await connection.query('SELECT COUNT(*) as count FROM fee_types');
    const [stockCategories] = await connection.query('SELECT COUNT(*) as count FROM stock_categories');
    
    console.log(`  ✓ Roles: ${roles[0].count}`);
    console.log(`  ✓ Academic Years: ${academicYears[0].count}`);
    console.log(`  ✓ Courses: ${courses[0].count}`);
    console.log(`  ✓ Fee Types: ${feeTypes[0].count}`);
    console.log(`  ✓ Stock Categories: ${stockCategories[0].count}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ COMPREHENSIVE SCHEMA APPLIED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log('\n💡 Next Steps:');
    console.log('   1. Create a super admin user via API');
    console.log('   2. Start testing the comprehensive APIs');
    console.log('   3. Access APIs at: http://localhost:5000/api/v1/');
    console.log('\n📚 API Endpoints Available:');
    console.log('   - /api/v1/users          (User Management)');
    console.log('   - /api/v1/academic       (Academic Management)');
    console.log('   - /api/v1/finance        (Financial Management)');
    console.log('   - /api/v1/stock          (Stock Management)');
    console.log('   - /api/v1/knowledge      (Knowledge Base & Notifications)');
    console.log('   - /api/v1/academics-tracking  (Attendance & Grades)');
    console.log('   - /api/v1/services       (Library, Hostel, Transport, Sports)\n');

  } catch (error) {
    console.error('\n❌ Error applying schema:', error.message);
    if (error.sql) {
      console.error('\n📄 Failed SQL:\n', error.sql.substring(0, 500));
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed\n');
    }
  }
}

applySchema();

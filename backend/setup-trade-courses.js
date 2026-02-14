const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupTradeCourses() {
  let connection;
  
  try {
    console.log('🚀 Starting Trade Courses System Setup...\n');

    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_management',
      multipleStatements: true
    });

    console.log('✅ Connected to database\n');

    // Read and execute the SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlFile = path.join(__dirname, 'migrations', 'trade_courses_system.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Executing SQL migration...');
    await connection.query(sql);
    console.log('✅ Database schema created\n');

    // Verify the data
    const [courses] = await connection.execute(`
      SELECT trade_code, level_number, COUNT(*) as course_count
      FROM trade_courses
      GROUP BY trade_code, level_number
      ORDER BY trade_code, level_number
    `);

    console.log('📊 Course Summary:');
    console.log('═══════════════════════════════════════');
    
    let currentTrade = '';
    let totalCourses = 0;
    
    courses.forEach(row => {
      if (currentTrade !== row.trade_code) {
        if (currentTrade !== '') console.log('');
        currentTrade = row.trade_code;
        console.log(`\n${row.trade_code}:`);
      }
      console.log(`  Level ${row.level_number}: ${row.course_count} courses`);
      totalCourses += row.course_count;
    });

    console.log('\n═══════════════════════════════════════');
    console.log(`\n✅ Total Courses Added: ${totalCourses}`);

    // Get trade summary
    const [tradeSummary] = await connection.execute(`
      SELECT 
        t.code,
        t.name,
        COUNT(DISTINCT tc.level_number) as levels,
        COUNT(tc.id) as courses
      FROM trades t
      LEFT JOIN trade_courses tc ON t.code = tc.trade_code
      WHERE t.is_active = true
      GROUP BY t.code, t.name
      ORDER BY t.name
    `);

    console.log('\n📚 Trade Summary:');
    console.log('═══════════════════════════════════════');
    tradeSummary.forEach(trade => {
      console.log(`${trade.name} (${trade.code}): ${trade.levels} levels, ${trade.courses} courses`);
    });

    console.log('\n═══════════════════════════════════════');
    console.log('\n✅ Trade Courses System Setup Complete!');
    console.log('\n📖 API Endpoints Available:');
    console.log('   GET  /api/trade-courses-api/structure');
    console.log('   GET  /api/trade-courses-api/trade/:tradeCode');
    console.log('   GET  /api/trade-courses-api/trade/:tradeCode/level/:levelNumber');
    console.log('   GET  /api/trade-courses-api/trade/:tradeCode/levels');
    console.log('   GET  /api/trade-courses-api/summary');
    console.log('   GET  /api/trade-courses-api/search?query=...');
    console.log('   POST /api/trade-courses-api/add');
    console.log('   PUT  /api/trade-courses-api/:courseId');
    console.log('   DELETE /api/trade-courses-api/:courseId');
    
    console.log('\n🎨 Frontend Page: /trade-courses');
    console.log('\n✨ All courses are now available in the system!\n');

  } catch (error) {
    console.error('❌ Error setting up trade courses:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupTradeCourses();

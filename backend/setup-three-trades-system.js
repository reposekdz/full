const mysql = require('mysql2/promise');
require('dotenv').config();

const setupThreeTradesSystem = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('🚀 Setting up Three Trades System (BDC, SOD, AUT)...\n');

    // Clear existing trades and keep only the three
    await connection.query('DELETE FROM trades WHERE code NOT IN ("BDC", "SOD", "AUT")');
    console.log('✅ Cleared non-essential trades');

    // Insert/Update the three trades
    const trades = [
      {
        code: 'BDC',
        name: 'Building and Construction',
        name_rw: 'Kubaka no Gusana',
        description: 'Comprehensive training in construction, masonry, carpentry, plumbing, and electrical installations',
        description_rw: 'Amahugurwa yuzuye mu kubaka, gusana, kubaza, gushyira amazi n\'amashanyarazi',
        duration_years: 3,
        total_students: 0,
        total_instructors: 0
      },
      {
        code: 'SOD',
        name: 'Software Development',
        name_rw: 'Guteza Imbere Porogaramu',
        description: 'Modern software development, web technologies, mobile apps, and database management',
        description_rw: 'Guteza imbere porogaramu zigezweho, tekinoroji ya web, aplikasiyo za telefoni n\'imiyoborere ya database',
        duration_years: 3,
        total_students: 0,
        total_instructors: 0
      },
      {
        code: 'AUT',
        name: 'Automotive Technology',
        name_rw: 'Tekinoroji y\'Ibinyabiziga',
        description: 'Vehicle maintenance, repair, diagnostics, and automotive electrical systems',
        description_rw: 'Kubungabunga, gusana, gusuzuma no gukoresha sisitemu z\'amashanyarazi mu binyabiziga',
        duration_years: 3,
        total_students: 0,
        total_instructors: 0
      }
    ];

    for (const trade of trades) {
      await connection.query(`
        INSERT INTO trades (code, name, name_rw, description, description_rw, duration_years, total_students, total_instructors, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          name_rw = VALUES(name_rw),
          description = VALUES(description),
          description_rw = VALUES(description_rw),
          duration_years = VALUES(duration_years),
          is_active = TRUE
      `, [trade.code, trade.name, trade.name_rw, trade.description, trade.description_rw, trade.duration_years, trade.total_students, trade.total_instructors]);
      console.log(`✅ ${trade.code} - ${trade.name}`);
    }

    // Setup levels for each trade
    console.log('\n📚 Setting up levels...');
    const levels = [
      { name: 'Level 1', code: 'L1', order_index: 1 },
      { name: 'Level 2', code: 'L2', order_index: 2 },
      { name: 'Level 3', code: 'L3', order_index: 3 }
    ];

    for (const level of levels) {
      await connection.query(`
        INSERT INTO levels (name, code, order_index, is_active)
        VALUES (?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          order_index = VALUES(order_index),
          is_active = TRUE
      `, [level.name, level.code, level.order_index]);
      console.log(`✅ ${level.name} (${level.code})`);
    }

    // Setup courses for BDC
    console.log('\n📖 Setting up BDC courses...');
    const bdcCourses = [
      { code: 'BDC101', name: 'Construction Fundamentals', level: 'L1', credits: 4, hours: 60 },
      { code: 'BDC102', name: 'Masonry Basics', level: 'L1', credits: 4, hours: 60 },
      { code: 'BDC103', name: 'Carpentry Fundamentals', level: 'L1', credits: 4, hours: 60 },
      { code: 'BDC104', name: 'Technical Drawing', level: 'L1', credits: 3, hours: 45 },
      { code: 'BDC201', name: 'Advanced Construction', level: 'L2', credits: 5, hours: 75 },
      { code: 'BDC202', name: 'Plumbing Systems', level: 'L2', credits: 4, hours: 60 },
      { code: 'BDC203', name: 'Electrical Installation', level: 'L2', credits: 4, hours: 60 },
      { code: 'BDC204', name: 'Building Materials', level: 'L2', credits: 3, hours: 45 },
      { code: 'BDC301', name: 'Project Management', level: 'L3', credits: 5, hours: 75 },
      { code: 'BDC302', name: 'Advanced Carpentry', level: 'L3', credits: 4, hours: 60 },
      { code: 'BDC303', name: 'Construction Safety', level: 'L3', credits: 3, hours: 45 },
      { code: 'BDC304', name: 'Final Project', level: 'L3', credits: 6, hours: 90 }
    ];

    for (const course of bdcCourses) {
      await connection.query(`
        INSERT INTO trade_courses (trade_code, code, name, level, credits, hours, is_active)
        VALUES ('BDC', ?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          level = VALUES(level),
          credits = VALUES(credits),
          hours = VALUES(hours)
      `, [course.code, course.name, course.level, course.credits, course.hours]);
    }
    console.log(`✅ Added ${bdcCourses.length} BDC courses`);

    // Setup courses for SOD
    console.log('\n📖 Setting up SOD courses...');
    const sodCourses = [
      { code: 'SOD101', name: 'Programming Fundamentals', level: 'L1', credits: 5, hours: 75 },
      { code: 'SOD102', name: 'Web Development Basics', level: 'L1', credits: 4, hours: 60 },
      { code: 'SOD103', name: 'Database Fundamentals', level: 'L1', credits: 4, hours: 60 },
      { code: 'SOD104', name: 'Computer Networks', level: 'L1', credits: 3, hours: 45 },
      { code: 'SOD201', name: 'Advanced Programming', level: 'L2', credits: 5, hours: 75 },
      { code: 'SOD202', name: 'Mobile App Development', level: 'L2', credits: 5, hours: 75 },
      { code: 'SOD203', name: 'Web Frameworks', level: 'L2', credits: 4, hours: 60 },
      { code: 'SOD204', name: 'Software Engineering', level: 'L2', credits: 4, hours: 60 },
      { code: 'SOD301', name: 'Full Stack Development', level: 'L3', credits: 6, hours: 90 },
      { code: 'SOD302', name: 'Cloud Computing', level: 'L3', credits: 4, hours: 60 },
      { code: 'SOD303', name: 'DevOps Practices', level: 'L3', credits: 3, hours: 45 },
      { code: 'SOD304', name: 'Capstone Project', level: 'L3', credits: 6, hours: 90 }
    ];

    for (const course of sodCourses) {
      await connection.query(`
        INSERT INTO trade_courses (trade_code, code, name, level, credits, hours, is_active)
        VALUES ('SOD', ?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          level = VALUES(level),
          credits = VALUES(credits),
          hours = VALUES(hours)
      `, [course.code, course.name, course.level, course.credits, course.hours]);
    }
    console.log(`✅ Added ${sodCourses.length} SOD courses`);

    // Setup courses for AUT
    console.log('\n📖 Setting up AUT courses...');
    const autCourses = [
      { code: 'AUT101', name: 'Automotive Basics', level: 'L1', credits: 4, hours: 60 },
      { code: 'AUT102', name: 'Engine Fundamentals', level: 'L1', credits: 5, hours: 75 },
      { code: 'AUT103', name: 'Vehicle Electrical Systems', level: 'L1', credits: 4, hours: 60 },
      { code: 'AUT104', name: 'Automotive Tools & Safety', level: 'L1', credits: 3, hours: 45 },
      { code: 'AUT201', name: 'Engine Diagnostics', level: 'L2', credits: 5, hours: 75 },
      { code: 'AUT202', name: 'Transmission Systems', level: 'L2', credits: 4, hours: 60 },
      { code: 'AUT203', name: 'Brake & Suspension', level: 'L2', credits: 4, hours: 60 },
      { code: 'AUT204', name: 'Automotive Electronics', level: 'L2', credits: 4, hours: 60 },
      { code: 'AUT301', name: 'Advanced Diagnostics', level: 'L3', credits: 5, hours: 75 },
      { code: 'AUT302', name: 'Hybrid & Electric Vehicles', level: 'L3', credits: 5, hours: 75 },
      { code: 'AUT303', name: 'Workshop Management', level: 'L3', credits: 3, hours: 45 },
      { code: 'AUT304', name: 'Final Practical Project', level: 'L3', credits: 6, hours: 90 }
    ];

    for (const course of autCourses) {
      await connection.query(`
        INSERT INTO trade_courses (trade_code, code, name, level, credits, hours, is_active)
        VALUES ('AUT', ?, ?, ?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          level = VALUES(level),
          credits = VALUES(credits),
          hours = VALUES(hours)
      `, [course.code, course.name, course.level, course.credits, course.hours]);
    }
    console.log(`✅ Added ${autCourses.length} AUT courses`);

    // Update student counts
    console.log('\n📊 Updating statistics...');
    for (const trade of ['BDC', 'SOD', 'AUT']) {
      const [result] = await connection.query(
        'SELECT COUNT(*) as count FROM students WHERE trade = (SELECT name FROM trades WHERE code = ?) AND status = "active"',
        [trade]
      );
      await connection.query(
        'UPDATE trades SET total_students = ? WHERE code = ?',
        [result[0].count, trade]
      );
    }

    console.log('\n✅ Three Trades System setup complete!');
    console.log('\n📋 Summary:');
    console.log('   - 3 Trades: BDC, SOD, AUT');
    console.log('   - 3 Levels per trade: L1, L2, L3');
    console.log('   - 12 Courses per trade (36 total)');
    console.log('\n🎯 System is ready for use!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
};

setupThreeTradesSystem().catch(console.error);

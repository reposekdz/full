const mysql = require('mysql2/promise');

async function fixTradesAndLevels() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
    waitForConnections: true
  });

  try {
    console.log('🔧 Fixing trades and levels...\n');

    // 1. Update AUT to AUTO for consistency
    console.log('1. Checking if AUT needs to be renamed to AUTO...');
    const [autTrades] = await pool.query('SELECT * FROM trades WHERE code = ?', ['AUT']);
    
    if (autTrades.length > 0) {
      console.log('   ✅ Found AUT trade, will keep it as AUT (frontend will handle normalization)');
    }

    // 2. Add level-specific trades if they don't exist
    console.log('\n2. Adding level-specific trades...');
    
    const baseTrades = [
      {
        code: 'SOD',
        name: 'Software Development',
        name_rw: 'Iterambere rya Software',
        description: 'Learn modern software development, web and mobile applications',
        description_rw: 'Wiga iterambere rya software rigezweho, urubuga na porogaramu za mobile',
        icon: '💻'
      },
      {
        code: 'BDC',
        name: 'Building and Construction',
        name_rw: 'Ubwubatsi n\'Inyubako',
        description: 'Master construction techniques, architecture, and project management',
        description_rw: 'Wiga uburyo bwo kubaka, gushushanya, no gucunga imishinga',
        icon: '🏗️'
      },
      {
        code: 'AUT',
        name: 'Automotive Technology',
        name_rw: 'Ikoranabuhanga ry\'Ibinyabiziga',
        description: 'Become an expert in vehicle maintenance, repair, and diagnostics',
        description_rw: 'Wiga gusana, gukora serivisi, n\'ikoranabuhanga ry\'ibinyabiziga',
        icon: '🚗'
      }
    ];

    const levels = [3, 4, 5];
    
    for (const baseTrade of baseTrades) {
      for (const level of levels) {
        const levelCode = `${baseTrade.code}L${level}`;
        const [existing] = await pool.query('SELECT id FROM trades WHERE code = ?', [levelCode]);
        
        if (existing.length === 0) {
          await pool.query(
            `INSERT INTO trades (code, name, name_rw, description, description_rw, icon, duration_years, total_students, total_instructors, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              levelCode,
              `${baseTrade.name} Level ${level}`,
              `${baseTrade.name_rw} - Urwego rwa ${level}`,
              baseTrade.description,
              baseTrade.description_rw,
              baseTrade.icon,
              level === 3 ? 1 : level === 4 ? 2 : 3,
              Math.floor(Math.random() * 50) + 20,
              Math.floor(Math.random() * 5) + 3
            ]
          );
          console.log(`   ✅ Added ${levelCode}`);
        } else {
          console.log(`   ⏭️  ${levelCode} already exists`);
        }
      }
    }

    // 3. Ensure courses exist for each level
    console.log('\n3. Checking courses for each level...');
    
    const coursesByLevel = {
      3: [
        { name: 'Introduction to Programming', name_rw: 'Intangiriro ya Porogaramu', credits: 4 },
        { name: 'Basic Mathematics', name_rw: 'Imibare y\'Ibanze', credits: 3 },
        { name: 'Computer Fundamentals', name_rw: 'Ibanze bya Mudasobwa', credits: 3 },
        { name: 'English Communication', name_rw: 'Itumanaho mu Cyongereza', credits: 2 }
      ],
      4: [
        { name: 'Advanced Programming', name_rw: 'Porogaramu Zigoye', credits: 5 },
        { name: 'Database Systems', name_rw: 'Sisitemu za Database', credits: 4 },
        { name: 'Web Development', name_rw: 'Iterambere rya Website', credits: 4 },
        { name: 'Project Management', name_rw: 'Gucunga Imishinga', credits: 3 }
      ],
      5: [
        { name: 'Software Engineering', name_rw: 'Ubwubatsi bwa Software', credits: 5 },
        { name: 'Mobile App Development', name_rw: 'Iterambere rya App za Mobile', credits: 5 },
        { name: 'Cloud Computing', name_rw: 'Cloud Computing', credits: 4 },
        { name: 'Cybersecurity', name_rw: 'Umutekano wa Cyber', credits: 4 }
      ]
    };

    for (const baseTrade of baseTrades) {
      for (const level of levels) {
        const levelCode = `${baseTrade.code}L${level}`;
        const [trade] = await pool.query('SELECT id FROM trades WHERE code = ?', [levelCode]);
        
        if (trade.length > 0) {
          const tradeId = trade[0].id;
          const courses = coursesByLevel[level];
          
          for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const courseCode = `${levelCode}-C${i + 1}`;
            
            const [existingCourse] = await pool.query(
              'SELECT id FROM trade_courses WHERE trade_code = ? AND course_code = ?',
              [levelCode, courseCode]
            );
            
            if (existingCourse.length === 0) {
              await pool.query(
                `INSERT INTO trade_courses (trade_code, course_code, course_name, level_number, credits, description, is_required, is_active, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, 1, 1, NOW(), NOW())`,
                [
                  levelCode,
                  courseCode,
                  course.name,
                  level,
                  course.credits,
                  `${course.name} - ${course.name_rw}`
                ]
              );
              console.log(`   ✅ Added course ${courseCode} for ${levelCode}`);
            }
          }
        }
      }
    }

    // 4. Update base trades with Kinyarwanda names
    console.log('\n4. Updating base trades with Kinyarwanda names...');
    for (const baseTrade of baseTrades) {
      await pool.query(
        'UPDATE trades SET name_rw = ?, description_rw = ? WHERE code = ?',
        [baseTrade.name_rw, baseTrade.description_rw, baseTrade.code]
      );
      console.log(`   ✅ Updated ${baseTrade.code} with Kinyarwanda translations`);
    }

    // 5. Show summary
    console.log('\n📊 Summary:');
    const [allTrades] = await pool.query('SELECT code, name, name_rw FROM trades ORDER BY code');
    console.log(`   Total trades: ${allTrades.length}`);
    allTrades.forEach(t => {
      console.log(`   - ${t.code}: ${t.name} (${t.name_rw || 'No Kinyarwanda name'})`);
    });

    const [allCourses] = await pool.query('SELECT COUNT(*) as count FROM trade_courses');
    console.log(`\n   Total courses: ${allCourses[0].count}`);

    console.log('\n✅ All fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

fixTradesAndLevels().catch(console.error);

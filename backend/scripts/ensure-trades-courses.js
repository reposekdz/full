const mysql = require('mysql2/promise');

async function ensureTradesCourses() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Ensuring courses for all trades...\n');

    // SOD Courses
    const sodCourses = [
      { code: 'SOD', level: 3, name: 'Introduction to Software Development', name_rw: 'Intangiriro ku Iterambere rya Software' },
      { code: 'SOD', level: 3, name: 'Programming Fundamentals', name_rw: 'Ibanze bya Gahunda' },
      { code: 'SOD', level: 3, name: 'Web Design Basics', name_rw: 'Ibanze bya Gushushanya Urubuga' },
      { code: 'SOD', level: 4, name: 'Advanced Programming', name_rw: 'Gahunda zo Mu rwego rwo Hejuru' },
      { code: 'SOD', level: 4, name: 'Database Management', name_rw: 'Gucunga Ububiko bw\'Amakuru' },
      { code: 'SOD', level: 4, name: 'Web Development', name_rw: 'Iterambere rya Urubuga' },
      { code: 'SOD', level: 5, name: 'Full Stack Development', name_rw: 'Iterambere Ryuzuye rya Software' },
      { code: 'SOD', level: 5, name: 'Mobile App Development', name_rw: 'Iterambere rya Porogaramu za Telefoni' },
      { code: 'SOD', level: 5, name: 'Software Engineering', name_rw: 'Ubwubatsi bwa Software' }
    ];

    // BDC Courses
    const bdcCourses = [
      { code: 'BDC', level: 3, name: 'Construction Basics', name_rw: 'Ibanze by\'Ubwubatsi' },
      { code: 'BDC', level: 3, name: 'Building Materials', name_rw: 'Ibikoresho by\'Ubwubatsi' },
      { code: 'BDC', level: 3, name: 'Technical Drawing', name_rw: 'Gushushanya Tekiniki' },
      { code: 'BDC', level: 4, name: 'Advanced Construction', name_rw: 'Ubwubatsi bwo Mu rwego rwo Hejuru' },
      { code: 'BDC', level: 4, name: 'Structural Design', name_rw: 'Gushushanya Imiterere' },
      { code: 'BDC', level: 4, name: 'Construction Management', name_rw: 'Gucunga Ubwubatsi' },
      { code: 'BDC', level: 5, name: 'Project Management', name_rw: 'Gucunga Imishinga' },
      { code: 'BDC', level: 5, name: 'Quantity Surveying', name_rw: 'Gupima Umubare' },
      { code: 'BDC', level: 5, name: 'Building Technology', name_rw: 'Ikoranabuhanga ry\'Ubwubatsi' }
    ];

    // AUT Courses
    const autCourses = [
      { code: 'AUT', level: 3, name: 'Automotive Basics', name_rw: 'Ibanze by\'Imodoka' },
      { code: 'AUT', level: 3, name: 'Engine Fundamentals', name_rw: 'Ibanze bya Moteri' },
      { code: 'AUT', level: 3, name: 'Vehicle Maintenance', name_rw: 'Kubungabunga Imodoka' },
      { code: 'AUT', level: 4, suffix: 'A', name: 'Advanced Engine Systems', name_rw: 'Sisitemu za Moteri zo Mu rwego rwo Hejuru' },
      { code: 'AUT', level: 4, suffix: 'A', name: 'Electrical Systems', name_rw: 'Sisitemu z\'Amashanyarazi' },
      { code: 'AUT', level: 4, suffix: 'B', name: 'Transmission Systems', name_rw: 'Sisitemu zo Kohereza Imbaraga' },
      { code: 'AUT', level: 4, suffix: 'B', name: 'Brake Systems', name_rw: 'Sisitemu zo Guhagarika' },
      { code: 'AUT', level: 5, suffix: 'A', name: 'Automotive Electronics', name_rw: 'Elektronike y\'Imodoka' },
      { code: 'AUT', level: 5, suffix: 'A', name: 'Diagnostic Systems', name_rw: 'Sisitemu zo Gusuzuma' },
      { code: 'AUT', level: 5, suffix: 'B', name: 'Hybrid Technology', name_rw: 'Ikoranabuhanga rya Hybrid' },
      { code: 'AUT', level: 5, suffix: 'B', name: 'Workshop Management', name_rw: 'Gucunga Ateliye' }
    ];

    const allCourses = [...sodCourses, ...bdcCourses, ...autCourses];

    for (const course of allCourses) {
      const [existing] = await connection.query(
        'SELECT id FROM courses WHERE trade_code = ? AND level_number = ? AND level_suffix = ? AND name = ?',
        [course.code, course.level, course.suffix || '', course.name]
      );

      if (existing.length === 0) {
        await connection.query(
          `INSERT INTO courses (trade_code, level_number, level_suffix, name, description, code, duration_months, is_active) 
           VALUES (?, ?, ?, ?, ?, ?, 3, 1)`,
          [course.code, course.level, course.suffix || '', course.name, course.name_rw, `${course.code}-L${course.level}${course.suffix || ''}`]
        );
        console.log(`✓ Added: ${course.code} Level ${course.level}${course.suffix || ''} - ${course.name}`);
      } else {
        console.log(`  Exists: ${course.code} Level ${course.level}${course.suffix || ''} - ${course.name}`);
      }
    }

    console.log('\n✅ All trade courses verified!');
    console.log(`\nSummary:`);
    console.log(`- SOD: ${sodCourses.length} courses`);
    console.log(`- BDC: ${bdcCourses.length} courses`);
    console.log(`- AUT: ${autCourses.length} courses`);
    console.log(`- Total: ${allCourses.length} courses`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

ensureTradesCourses();

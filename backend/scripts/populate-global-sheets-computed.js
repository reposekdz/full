const mysql = require('mysql2/promise');

async function populateComputedFields() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    waitForConnections: true,
    connectionLimit: 10
  });

  console.log('🔄 Populating global_student_sheets...\n');

  try {
    const [tables] = await pool.execute(`SHOW TABLES LIKE 'student_%'`);
    const existing = tables.map(t => Object.values(t)[0]);

    if (existing.includes('student_marks')) {
      console.log('📊 Calculating GPA...');
      try {
        const [r] = await pool.execute(`
          UPDATE global_student_sheets gss
          LEFT JOIN (
            SELECT CAST(student_id AS CHAR) as sid, (AVG(mark) / 100 * 4.0) as gpa
            FROM student_marks WHERE mark IS NOT NULL GROUP BY student_id
          ) m ON CAST(gss.student_id AS CHAR) = m.sid OR CAST(gss.id AS CHAR) = m.sid
          SET gss.gpa = COALESCE(m.gpa, gss.gpa)
        `);
        console.log(`   ✓ ${r.affectedRows} records`);
      } catch (e) { console.log(`   ⚠️  ${e.message}`); }
    }

    if (existing.includes('student_attendance')) {
      console.log('📈 Calculating attendance...');
      const [r] = await pool.execute(`
        UPDATE global_student_sheets gss
        LEFT JOIN (
          SELECT student_id, (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100) as rate
          FROM student_attendance WHERE attendance_date IS NOT NULL GROUP BY student_id
        ) a ON gss.student_id = a.student_id
        SET gss.attendance_percentage = COALESCE(a.rate, gss.attendance_percentage)
      `);
      console.log(`   ✓ ${r.affectedRows} records`);
    }

    if (existing.includes('student_conduct_records')) {
      console.log('⭐ Calculating conduct (40-point)...');
      try {
        const [r] = await pool.execute(`
          UPDATE global_student_sheets gss
          LEFT JOIN (
            SELECT student_id, 40 - COALESCE(SUM(COALESCE(points_deducted, 0)), 0) as pts,
            CASE WHEN 40 - COALESCE(SUM(COALESCE(points_deducted, 0)), 0) >= 36 THEN 'A'
                 WHEN 40 - COALESCE(SUM(COALESCE(points_deducted, 0)), 0) >= 32 THEN 'B'
                 WHEN 40 - COALESCE(SUM(COALESCE(points_deducted, 0)), 0) >= 28 THEN 'C'
                 WHEN 40 - COALESCE(SUM(COALESCE(points_deducted, 0)), 0) >= 24 THEN 'D'
                 ELSE 'F' END as grade
            FROM student_conduct_records GROUP BY student_id
          ) c ON gss.id = c.student_id OR gss.student_id = c.student_id
          SET gss.conduct_score = COALESCE(c.pts, 40), gss.conduct_grade = COALESCE(c.grade, 'A')
        `);
        console.log(`   ✓ ${r.affectedRows} records`);
      } catch (e) { console.log(`   ⚠️  ${e.message}`); }
    }

    console.log('🔧 Setting defaults...');
    const [d] = await pool.execute(`
      UPDATE global_student_sheets SET
        gpa = COALESCE(gpa, 0),
        attendance_percentage = COALESCE(attendance_percentage, 100),
        conduct_score = COALESCE(conduct_score, 40),
        conduct_grade = COALESCE(conduct_grade, 'A'),
        status = COALESCE(status, 'active')
      WHERE gpa IS NULL OR attendance_percentage IS NULL OR conduct_score IS NULL OR status IS NULL
    `);
    console.log(`   ✓ ${d.affectedRows} records`);

    const [s] = await pool.execute(`
      SELECT COUNT(*) as total, AVG(gpa) as gpa, AVG(attendance_percentage) as att, AVG(conduct_score) as conduct
      FROM global_student_sheets WHERE status = 'active'
    `);
    console.log(`\n📋 Summary: ${s[0].total} students | GPA: ${Number(s[0].gpa||0).toFixed(2)} | Attendance: ${Number(s[0].att||0).toFixed(1)}% | Conduct: ${Number(s[0].conduct||0).toFixed(1)}/40\n`);
    console.log('✅ Done!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

populateComputedFields();

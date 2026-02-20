// Safe script to populate global_student_sheets with computed values
// Handles missing tables gracefully
const mysql = require('mysql2/promise');

async function populateComputedFields() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log('🔄 Populating global_student_sheets with computed values...\n');

  try {
    // Check which tables exist
    const [tables] = await pool.execute(`SHOW TABLES LIKE 'student_%'`);
    const existingTables = tables.map(t => Object.values(t)[0]);
    
    console.log('📋 Found tables:', existingTables.join(', '));

    // 1. Calculate GPA if student_marks exists
    if (existingTables.includes('student_marks')) {
      console.log('\n📊 Calculating GPA from marks...');
      try {
        const [gpaResult] = await pool.execute(`
          UPDATE global_student_sheets gss
          LEFT JOIN (
            SELECT 
              CAST(student_id AS CHAR) as student_id,
              AVG(mark) as avg_mark,
              (AVG(mark) / 100 * 4.0) as calculated_gpa
            FROM student_marks
            WHERE mark IS NOT NULL
            GROUP BY student_id
          ) marks ON CAST(gss.student_id AS CHAR) = marks.student_id OR CAST(gss.id AS CHAR) = marks.student_id
          SET gss.gpa = COALESCE(marks.calculated_gpa, gss.gpa)
        `);
        console.log(`   ✓ Updated ${gpaResult.affectedRows} records with GPA`);
      } catch (err) {
        console.log(`   ⚠️  GPA calculation skipped: ${err.message}`);
      }
    } else {
      console.log('\n⚠️  student_marks table not found, skipping GPA calculation');
    }

    // 2. Calculate attendance if student_attendance exists
    if (existingTables.includes('student_attendance')) {
      console.log('\n📈 Calculating attendance percentage...');
      const [attendanceResult] = await pool.execute(`
        UPDATE global_student_sheets gss
        LEFT JOIN (
          SELECT 
            student_id,
            COUNT(*) as total_days,
            SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
            (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*) * 100) as attendance_rate
          FROM student_attendance
          WHERE attendance_date IS NOT NULL
          GROUP BY student_id
        ) att ON gss.student_id = att.student_id
        SET gss.attendance_percentage = COALESCE(att.attendance_rate, gss.attendance_percentage)
      `);
      console.log(`   ✓ Updated ${attendanceResult.affectedRows} records with attendance`);
    } else {
      console.log('\n⚠️  student_attendance table not found, skipping attendance calculation');
    }

    // 3. Calculate conduct from student_conduct_records
    if (existingTables.includes('student_conduct_records')) {
      console.log('\n⭐ Calculating conduct score (40-point system)...');
      try {
        const [conductResult] = await pool.execute(`
          UPDATE global_student_sheets gss
          LEFT JOIN (
            SELECT 
              student_id,
              40 - COALESCE(SUM(COALESCE(points_deducted, 0)), 0) as total_points,
              CASE 
                WHEN 40 - COALESCE(SUM(COALESCE(points_deducted, 0)), 0) >= 36 THEN 'A'
                WHEN 40 - COALESCE(SUM(COALESCE(points_deducted, 0)), 0) >= 32 THEN 'B'
                WHEN 40 - COALESCE(SUM(COALESCE(points_deducted, 0)), 0) >= 28 THEN 'C'
                WHEN 40 - COALESCE(SUM(COALESCE(points_deducted, 0)), 0) >= 24 THEN 'D'
                ELSE 'F'
              END as conduct_grade
            FROM student_conduct_records
            GROUP BY student_id
          ) conduct ON gss.id = conduct.student_id OR gss.student_id = conduct.student_id
          SET 
            gss.conduct_score = COALESCE(conduct.total_points, 40),
            gss.conduct_grade = COALESCE(conduct.conduct_grade, 'A')
        `);
        console.log(`   ✓ Updated ${conductResult.affectedRows} records with conduct`);
      } catch (err) {
        console.log(`   ⚠️  Conduct calculation skipped: ${err.message}`);
      }
    } else {
      console.log('\n⚠️  student_conduct_records table not found, skipping conduct calculation');
    }

    // 4. Set default values for any missing fields
    console.log('\n🔧 Setting default values for missing fields...');
    const [defaultResult] = await pool.execute(`
      UPDATE global_student_sheets 
      SET 
        gpa = COALESCE(gpa, 0),
        attendance_percentage = COALESCE(attendance_percentage, 100),
        conduct_score = COALESCE(conduct_score, 40),
        conduct_grade = COALESCE(conduct_grade, 'A'),
        status = COALESCE(status, 'active')
      WHERE 
        gpa IS NULL OR 
        attendance_percentage IS NULL OR 
        conduct_score IS NULL OR 
        status IS NULL
    `);
    console.log(`   ✓ Set defaults for ${defaultResult.affectedRows} records`);

    // 5. Display summary
    console.log('\n📋 Summary of global_student_sheets:');
    const [summary] = await pool.execute(`
      SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN gpa > 0 THEN 1 END) as with_gpa,
        COUNT(CASE WHEN attendance_percentage > 0 THEN 1 END) as with_attendance,
        COUNT(CASE WHEN conduct_score > 0 THEN 1 END) as with_conduct,
        AVG(gpa) as avg_gpa,
        AVG(attendance_percentage) as avg_attendance,
        AVG(conduct_score) as avg_conduct
      FROM global_student_sheets
      WHERE status = 'active'
    `);
    
    const s = summary[0];
    console.log(`   Total Active Students: ${s.total_students}`);
    console.log(`   Students with GPA: ${s.with_gpa}`);
    console.log(`   Students with Attendance: ${s.with_attendance}`);
    console.log(`   Students with Conduct: ${s.with_conduct}`);
    console.log(`   Average GPA: ${Number(s.avg_gpa || 0).toFixed(2)}`);
    console.log(`   Average Attendance: ${Number(s.avg_attendance || 0).toFixed(1)}%`);
    console.log(`   Average Conduct: ${Number(s.avg_conduct || 0).toFixed(1)}/40`);

    console.log('\n✅ Done! global_student_sheets is now populated with computed values.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

populateComputedFields();

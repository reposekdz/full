const { pool } = require('./config/database');

async function setupAdvisorInLeadership() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if advisor already exists
    const [existing] = await connection.execute(
      'SELECT id FROM leadership WHERE role = "advisor" AND name LIKE "%Mukamugema%" AND name LIKE "%Emerance%"'
    );

    if (existing.length === 0) {
      await connection.execute(`
        INSERT INTO leadership (
          name, role, department, biography_rw, biography_en, email, phone, 
          image_url, qualifications, experience_years, specialization, 
          achievements, responsibilities, status, display_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1)
      `, [
        'Mukamugema Emerance',
        'advisor', 
        'Student Affairs',
        'Umujyanama w\'uburezi ukomeye wiyemeje gutera inkunga abanyeshuri kugira ngo bagere ku ntego zabo z\'amashuri n\'umwuga. Afite ubunararibonye bw\'imyaka 8 mu gufasha abanyeshuri.',
        'Experienced educational advisor dedicated to student success and academic excellence at Garden TVET School. Providing comprehensive guidance and support to help students achieve their academic and career goals.',
        'emerancemukamugema77@gmail.com',
        '+250788000000',
        '/uploads/leadership/mukamugema-emerance.jpg',
        'Master of Education, Bachelor of Arts in Counseling Psychology, Certified Academic Advisor, Professional Development Certificate in Student Counseling',
        8,
        'Academic Guidance, Career Counseling, Personal Development, Study Planning, Goal Setting',
        'Successfully guided over 500 students to academic success, Developed innovative counseling programs, Recognized for excellence in student support services',
        'Student academic guidance, Career path counseling, Personal development support, Study skills training, Goal setting and achievement planning',
      ]);
      console.log('✅ Advisor Mukamugema Emerance added to leadership');
    } else {
      await connection.execute(`
        UPDATE leadership SET 
          name = ?, email = ?, image_url = ?, biography_en = ?, biography_rw = ?,
          qualifications = ?, experience_years = ?, specialization = ?, 
          achievements = ?, responsibilities = ?, status = 'active'
        WHERE id = ?
      `, [
        'Mukamugema Emerance',
        'emerancemukamugema77@gmail.com',
        '/uploads/leadership/mukamugema-emerance.jpg',
        'Experienced educational advisor dedicated to student success and academic excellence at Garden TVET School. Providing comprehensive guidance and support to help students achieve their academic and career goals.',
        'Umujyanama w\'uburezi ukomeye wiyemeje gutera inkunga abanyeshuri kugira ngo bagere ku ntego zabo z\'amashuri n\'umwuga. Afite ubunararibonye bw\'imyaka 8 mu gufasha abanyeshuri.',
        'Master of Education, Bachelor of Arts in Counseling Psychology, Certified Academic Advisor, Professional Development Certificate in Student Counseling',
        8,
        'Academic Guidance, Career Counseling, Personal Development, Study Planning, Goal Setting',
        'Successfully guided over 500 students to academic success, Developed innovative counseling programs, Recognized for excellence in student support services',
        'Student academic guidance, Career path counseling, Personal development support, Study skills training, Goal setting and achievement planning',
        existing[0].id
      ]);
      console.log('✅ Advisor Mukamugema Emerance updated in leadership');
    }

    await connection.commit();
    console.log('🎉 Advisor leadership setup complete!');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Setup failed:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

setupAdvisorInLeadership();
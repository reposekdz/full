const { pool } = require('./config/database');

async function setupAdvisorLeadership() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert/Update Mukamugema Emerance as Advisor
    const [existing] = await connection.execute(
      'SELECT id FROM leadership WHERE position = "advisor" AND first_name = "Mukamugema" AND last_name = "Emerance"'
    );

    if (existing.length === 0) {
      await connection.execute(`
        INSERT INTO leadership (
          first_name, last_name, position, email, phone, image_url, 
          bio, qualifications, experience_years, department, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW())
      `, [
        'Mukamugema',
        'Emerance', 
        'advisor',
        'emerancemukamugema77@gmail.com',
        '+250788000000',
        '/uploads/leadership/mukamugema-emerance.jpg',
        'Experienced educational advisor dedicated to student success and academic excellence at Garden TVET School.',
        'Master of Education, Bachelor of Arts in Counseling Psychology',
        8,
        'Student Affairs'
      ]);
      console.log('✅ Advisor Mukamugema Emerance added to leadership');
    } else {
      await connection.execute(`
        UPDATE leadership SET 
          email = ?, image_url = ?, bio = ?, qualifications = ?, 
          experience_years = ?, department = ?, is_active = true
        WHERE id = ?
      `, [
        'emerancemukamugema77@gmail.com',
        '/uploads/leadership/mukamugema-emerance.jpg',
        'Experienced educational advisor dedicated to student success and academic excellence at Garden TVET School.',
        'Master of Education, Bachelor of Arts in Counseling Psychology',
        8,
        'Student Affairs',
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

setupAdvisorLeadership();
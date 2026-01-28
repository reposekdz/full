const { pool } = require('./config/database');

async function setupAdvisor() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Simple insert/update for advisor
    const [existing] = await connection.execute(
      'SELECT id FROM leadership WHERE role = "advisor" LIMIT 1'
    );

    if (existing.length === 0) {
      await connection.execute(`
        INSERT INTO leadership (
          name, role, department, email, phone, image_url, 
          biography_en, experience_years, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `, [
        'Mukamugema Emerance',
        'advisor', 
        'Student Affairs',
        'emerancemukamugema77@gmail.com',
        '+250788000000',
        '/uploads/leadership/mukamugema-emerance.jpg',
        'Experienced educational advisor dedicated to student success and academic excellence at Garden TVET School.',
        8
      ]);
      console.log('✅ Advisor Mukamugema Emerance added');
    } else {
      await connection.execute(`
        UPDATE leadership SET 
          name = ?, email = ?, image_url = ?, biography_en = ?, 
          experience_years = ?, status = 'active'
        WHERE id = ?
      `, [
        'Mukamugema Emerance',
        'emerancemukamugema77@gmail.com',
        '/uploads/leadership/mukamugema-emerance.jpg',
        'Experienced educational advisor dedicated to student success and academic excellence at Garden TVET School.',
        8,
        existing[0].id
      ]);
      console.log('✅ Advisor updated');
    }

    await connection.commit();
    console.log('🎉 Setup complete!');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

setupAdvisor();
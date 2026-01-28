const { pool } = require('./config/database');

async function setupLeadershipTable() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Create leadership table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leadership (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(20),
        image_url VARCHAR(500),
        bio TEXT,
        qualifications TEXT,
        experience_years INT DEFAULT 0,
        department VARCHAR(100),
        office_location VARCHAR(200),
        specialization TEXT,
        achievements TEXT,
        responsibilities TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert/Update Mukamugema Emerance as Advisor
    const [existing] = await connection.execute(
      'SELECT id FROM leadership WHERE position = "advisor" AND first_name = "Mukamugema" AND last_name = "Emerance"'
    );

    if (existing.length === 0) {
      await connection.execute(`
        INSERT INTO leadership (
          first_name, last_name, position, email, phone, image_url, 
          bio, qualifications, experience_years, department, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)
      `, [
        'Mukamugema',
        'Emerance', 
        'advisor',
        'emerancemukamugema77@gmail.com',
        '+250788000000',
        '/uploads/leadership/mukamugema-emerance.jpg',
        'Experienced educational advisor dedicated to student success and academic excellence at Garden TVET School. Providing comprehensive guidance and support to help students achieve their academic and career goals.',
        'Master of Education, Bachelor of Arts in Counseling Psychology, Certified Academic Advisor',
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
        'Experienced educational advisor dedicated to student success and academic excellence at Garden TVET School. Providing comprehensive guidance and support to help students achieve their academic and career goals.',
        'Master of Education, Bachelor of Arts in Counseling Psychology, Certified Academic Advisor',
        8,
        'Student Affairs',
        existing[0].id
      ]);
      console.log('✅ Advisor Mukamugema Emerance updated in leadership');
    }

    await connection.commit();
    console.log('🎉 Leadership table and advisor setup complete!');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Setup failed:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

setupLeadershipTable();
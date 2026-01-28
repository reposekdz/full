const mysql = require('mysql2/promise');

const updateEmeranceAdvisor = async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('Checking for Emerance in leadership table...');
    
    const [existing] = await connection.execute(
      "SELECT * FROM leadership WHERE email = 'emerancemukamugema77@gmail.com' OR name LIKE '%Emerance%' OR name LIKE '%Mukamugema%'"
    );
    
    if (existing.length > 0) {
      console.log('Found Emerance:', existing[0]);
      
      await connection.execute(
        `UPDATE leadership 
         SET image_url = ?,
             role = ?,
             status = ?,
             biography_en = ?,
             biography_rw = ?,
             department = ?,
             phone = ?,
             office_location = ?,
             experience_years = ?
         WHERE id = ?`,
        [
          '/uploads/leadership/mukamugenga emmerance.jpg',
          'Advisor',
          'active',
          'Dedicated academic advisor with extensive experience in student counseling and career guidance. Specialized in helping TVET students achieve their academic and professional goals.',
          'Umujyanama w\'amasomo ufite ubunararibonye bwinshi mu kugira inama abanyeshuri no kubayobora ku murongo w\'umwuga. Inararibonye mu gufasha abanyeshuri ba TVET kugera ku ntego zabo z\'amasomo n\'umwuga.',
          'Student Affairs',
          '+250788123456',
          'Student Affairs Office - Building A, Room 102',
          8,
          existing[0].id
        ]
      );
      
      console.log('✅ Updated Emerance advisor record successfully!');
    } else {
      console.log('Emerance not found, creating new record...');
      
      await connection.execute(
        `INSERT INTO leadership (
          name, role, email, phone, department, 
          biography_en, biography_rw, office_location, 
          image_url, experience_years, status, display_order, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          'MUKAMUGEMA Emerance',
          'Advisor',
          'emerancemukamugema77@gmail.com',
          '+250788123456',
          'Student Affairs',
          'Dedicated academic advisor with extensive experience in student counseling and career guidance. Specialized in helping TVET students achieve their academic and professional goals.',
          'Umujyanama w\'amasomo ufite ubunararibonye bwinshi mu kugira inama abanyeshuri no kubayobora ku murongo w\'umwuga. Inararibonye mu gufasha abanyeshuri ba TVET kugera ku ntego zabo z\'amasomo n\'umwuga.',
          'Student Affairs Office - Building A, Room 102',
          '/uploads/leadership/mukamugenga emmerance.jpg',
          8,
          'active',
          2
        ]
      );
      
      console.log('✅ Created Emerance advisor record successfully!');
    }
    
    const [allLeaders] = await connection.execute('SELECT id, name, role, image_url, status FROM leadership ORDER BY display_order');
    console.log('\n📋 All Leadership Members:');
    console.table(allLeaders);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
};

updateEmeranceAdvisor();

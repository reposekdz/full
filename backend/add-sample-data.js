const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function addSampleData() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Check if we have data
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM student_applications');
    
    if (count[0].count === 0) {
      // Insert without application_date column
      await connection.execute(`
        INSERT INTO student_applications (
          application_number, first_name, last_name, date_of_birth, gender, phone, email,
          address, parent_name, parent_phone, previous_school, trade_code, level_number,
          reason_for_applying, status
        ) VALUES 
        ('APP2024001', 'Jean', 'Uwimana', '2000-05-15', 'Male', '+250788123456', 'jean@email.com', 'Kigali', 'Marie Uwimana', '+250788654321', 'GS Kimisagara', 'AUT', 4, 'I want to learn automotive technology', 'pending'),
        ('APP2024002', 'Grace', 'Mukamana', '1999-08-22', 'Female', '+250788987654', 'grace@email.com', 'Kigali', 'Joseph Mukamana', '+250788456789', 'Lycee de Kigali', 'SOD', 5, 'I want to become a software developer', 'approved'),
        ('APP2024003', 'Patrick', 'Niyonzima', '2001-03-10', 'Male', '+250788111222', 'patrick@email.com', 'Kigali', 'Agnes Niyonzima', '+250788333444', 'APRED Ndera', 'BDC', 3, 'I want to learn construction', 'under_review'),
        ('APP2024004', 'Alice', 'Uwamahoro', '2000-11-18', 'Female', '+250788555666', 'alice@email.com', 'Rwamagana', 'Emmanuel Uwamahoro', '+250788777888', 'ES Rwamagana', 'AUT', 5, 'I want to become an automotive engineer', 'waitlisted'),
        ('APP2024005', 'Eric', 'Habimana', '1998-07-25', 'Male', '+250788999000', 'eric@email.com', 'Musanze', 'Beatrice Habimana', '+250788111333', 'GS Musanze', 'SOD', 4, 'I want to develop mobile applications', 'rejected'),
        ('APP2024006', 'Claudine', 'Mukamana', '2001-07-30', 'Female', '+250788444555', 'claudine@email.com', 'Huye', 'Vincent Mukamana', '+250788666777', 'Lycee de Butare', 'BDC', 4, 'I want to specialize in construction management', 'pending')
      `);
      console.log('✅ Added sample applications');
    }
    
    const [finalCount] = await connection.execute('SELECT COUNT(*) as count FROM student_applications');
    console.log(`🎉 Total applications: ${finalCount[0].count}`);
    
    // Show distribution
    const [dist] = await connection.execute(`
      SELECT trade_code, level_number, status, COUNT(*) as count
      FROM student_applications
      GROUP BY trade_code, level_number, status
      ORDER BY trade_code, level_number
    `);
    
    console.log('\n📊 Application Distribution:');
    dist.forEach(row => {
      console.log(`   ${row.trade_code} Level ${row.level_number} (${row.status}): ${row.count}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

addSampleData();
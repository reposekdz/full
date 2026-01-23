const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'school_management'
};

async function verifyLeadership() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    const [rows] = await connection.execute('SELECT * FROM leadership');
    
    console.log('📊 LEADERSHIP RECORDS:\n');
    console.log('='.repeat(80));
    
    rows.forEach((row, index) => {
      console.log(`\n${index + 1}. ${row.name}`);
      console.log(`   Role: ${row.role}`);
      console.log(`   Department: ${row.department}`);
      console.log(`   Email: ${row.email}`);
      console.log(`   Phone: ${row.phone}`);
      console.log(`   Office: ${row.office_location}`);
      console.log(`   Image: ${row.image_url}`);
      console.log(`   Experience: ${row.experience_years} years`);
      console.log(`   Qualifications: ${row.qualifications ? JSON.parse(row.qualifications).length : 0} items`);
      console.log(`   Achievements: ${row.achievements ? JSON.parse(row.achievements).length : 0} items`);
      console.log(`   Responsibilities: ${row.responsibilities ? JSON.parse(row.responsibilities).length : 0} items`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total Leadership Members: ${rows.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

verifyLeadership();

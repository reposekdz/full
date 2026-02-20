const mysql = require('mysql2/promise');

async function checkScores() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  const [rows] = await connection.execute(
    'SELECT id, first_name, last_name, conduct_score FROM global_student_sheets LIMIT 10'
  );
  
  console.log('Current Conduct Scores:');
  rows.forEach(r => console.log(`${r.first_name} ${r.last_name}: ${r.conduct_score}`));
  
  await connection.end();
}

checkScores();

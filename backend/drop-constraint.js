const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  console.log('🔧 Dropping foreign key constraint...');
  
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    await connection.query('ALTER TABLE parent_student_links DROP FOREIGN KEY parent_student_links_ibfk_2');
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
    console.log('✅ Constraint parent_student_links_ibfk_2 REMOVED!');
  } catch (error) {
    console.log('⚠️  Constraint may already be removed:', error.message);
  }

  await connection.end();
  console.log('\n✅ DONE! Restart your server now.');
})();

const mysql = require('mysql2/promise');

async function updateFootballImage() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    const [result] = await connection.execute(
      `UPDATE sports_teams 
       SET image_url = '/uploads/sports/foot ball team.png'
       WHERE name = 'Umupira w\\'Amaguru' OR name_en = 'Football Team'`
    );

    console.log('✅ Football team image updated successfully!');
    console.log(`   Rows affected: ${result.affectedRows}`);
    
    // Verify the update
    const [teams] = await connection.execute(
      `SELECT id, name, name_en, image_url FROM sports_teams WHERE name = 'Umupira w\\'Amaguru' OR name_en = 'Football Team'`
    );
    
    console.log('\n📋 Updated team:');
    console.log(teams[0]);
    
  } catch (error) {
    console.error('❌ Error updating image:', error.message);
  } finally {
    await connection.end();
  }
}

updateFootballImage();

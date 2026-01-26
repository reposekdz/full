const mysql = require('mysql2/promise');

async function verify() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management'
  });

  try {
    console.log('=== VERIFICATION RESULTS ===\n');
    
    const [devs] = await connection.execute('SELECT name, role FROM developers ORDER BY sort_order');
    console.log('🧑‍💻 DEVELOPERS:');
    devs.forEach((dev, i) => console.log(`   ${i+1}. ${dev.name} - ${dev.role}`));
    
    const [admins] = await connection.execute('SELECT username, role FROM admin_users WHERE role != "super_admin"');
    console.log('\n👥 STAFF USERS:');
    admins.forEach((admin, i) => console.log(`   ${i+1}. ${admin.username} (${admin.role})`));
    
    const [sports] = await connection.execute('SELECT name, sport_type FROM sports_teams WHERE is_active = 1');
    console.log('\n⚽ SPORTS TEAMS:');
    sports.forEach((team, i) => console.log(`   ${i+1}. ${team.name} (${team.sport_type})`));
    
    console.log('\n✅ ALL SYSTEMS READY!');
    console.log('\nNow restart the backend server and test:');
    console.log('- Staff login with any credentials above');
    console.log('- Sports page should show football and volleyball');
    console.log('- Developers page should show all 4 developers');
    
  } catch (err) {
    console.log('Error:', err.message);
  } finally {
    await connection.end();
  }
}

verify();
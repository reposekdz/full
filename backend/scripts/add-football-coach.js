const db = require('../config/database');

async function addCoach() {
  try {
    const [teams] = await db.pool.query("SELECT id FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1");
    
    if (teams.length === 0) {
      console.log('❌ Football team not found');
      process.exit(1);
    }

    const teamId = teams[0].id;
    
    await db.pool.query('DELETE FROM sports_coaches WHERE team_id = ?', [teamId]);

    await db.pool.query(
      'INSERT INTO sports_coaches (team_id, name, role, image_url, phone, email, experience_years, bio, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [teamId, 'Jotham', 'Head Coach', '/uploads/sports/coach of football.jpg', '+250788000000', 'jotham@garden.rw', 5, 'Inter-School Championship Winner 2023, National Youth Coach License, 2+ years experience']
    );

    await db.pool.query(
      'INSERT INTO sports_coaches (team_id, name, role, image_url, phone, email, experience_years, bio, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
      [teamId, 'Patrick', 'Assistant Coach', '/uploads/sports/coach helper.jpg', '+250788000001', 'patrick@garden.rw', 3, 'Assistant Coach & Team Coordinator, 2+ years experience']
    );

    console.log('✅ Added coaches Jotham and Patrick to football team');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addCoach();

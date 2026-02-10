const db = require('../config/database');

const players = [
  { name: 'Beningabo Emmanuel', position: 'Forward', jersey_number: 10, is_captain: 1, image: '/uploads/sports/garden foot ball plyers/beningabo emannuel.jpg' },
  { name: 'Cyangwege John', position: 'Midfielder', jersey_number: 8, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/cyangwege john.jpg' },
  { name: 'Dukuze JMV', position: 'Defender', jersey_number: 5, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/dukuze jmv.jpg' },
  { name: 'Habineza Felix', position: 'Goalkeeper', jersey_number: 1, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/habineza felix.jpg' },
  { name: 'Iradukunda Sammuel', position: 'Forward', jersey_number: 11, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/iradukunda sammuel.jpg' },
  { name: 'Irafasha Augiste', position: 'Midfielder', jersey_number: 6, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/irafasha augiste.jpg' },
  { name: 'Manzi Fabrice', position: 'Defender', jersey_number: 4, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/manzi fabrice.jpg' },
  { name: 'Mpfite Umukiza Lavie', position: 'Midfielder', jersey_number: 7, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/mpfite umukiza lavie.jpg' },
  { name: 'Mugisha Dieudonne', position: 'Forward', jersey_number: 9, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/mugisha dieudonne.jpg' },
  { name: 'Mugisha Elisa', position: 'Defender', jersey_number: 3, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/mugisha elisa.jpg' },
  { name: 'Mugisha Joseph', position: 'Midfielder', jersey_number: 14, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/mugisha joseph.jpg' },
  { name: 'Ndayizeye Eric', position: 'Forward', jersey_number: 17, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/ndayizeye eric.jpg' },
  { name: 'Ndayizeye Patric', position: 'Defender', jersey_number: 2, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/ndayizeye patric.jpg' },
  { name: 'Ndori Vedaste', position: 'Midfielder', jersey_number: 15, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/ndori vedaste.jpg' },
  { name: 'Nineza Nick Nelly', position: 'Forward', jersey_number: 19, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/nineza nick nelly.jpg' },
  { name: 'Nsengiyumva Flank', position: 'Defender', jersey_number: 12, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/nsengiyumva flank.jpg' },
  { name: 'Nzamurambaho Jirbert', position: 'Midfielder', jersey_number: 13, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/nzamurambaho jirbert.jpg' },
  { name: 'Olivier', position: 'Forward', jersey_number: 20, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/olivier.jpg' },
  { name: 'Umukundwa Anfge Lohike', position: 'Defender', jersey_number: 16, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/umukundwa anfge lohike.jpg' },
  { name: 'Uwayisenga Patrick', position: 'Midfielder', jersey_number: 18, is_captain: 0, image: '/uploads/sports/garden foot ball plyers/uwayisenga patrick.jpg' }
];

async function addPlayers() {
  try {
    const [teams] = await db.pool.query("SELECT id FROM sports_teams WHERE name LIKE '%Football%' OR name LIKE '%Umupira%' LIMIT 1");
    
    if (teams.length === 0) {
      console.log('❌ Football team not found');
      process.exit(1);
    }

    const teamId = teams[0].id;
    await db.pool.query('DELETE FROM sports_players WHERE team_id = ?', [teamId]);

    for (const player of players) {
      await db.pool.query(
        'INSERT INTO sports_players (team_id, name, position, jersey_number, is_captain, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [teamId, player.name, player.position, player.jersey_number, player.is_captain, player.image]
      );
    }

    console.log(`✅ Added ${players.length} football players to team ${teamId}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addPlayers();

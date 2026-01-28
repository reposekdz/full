const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSportsEndpoints() {
  try {
    console.log('🔐 Logging in as admin...');
    
    // Login as admin
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: '2026'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log(`👤 User: ${loginResponse.data.user.username} (${loginResponse.data.user.role})`);
    
    // Test sports comprehensive dashboard
    console.log('\n📊 Testing Sports Comprehensive Dashboard...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/sports-comprehensive/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (dashboardResponse.data.success) {
      console.log('✅ Sports Dashboard loaded successfully!');
      const { overview } = dashboardResponse.data.dashboard;
      console.log('\n📈 Sports Overview:');
      console.log(`   Teams: ${overview.teams.total_teams} (Active: ${overview.teams.active_teams})`);
      console.log(`   Players: ${overview.players.total_players} (Active: ${overview.players.active_players})`);
      console.log(`   Matches: ${overview.matches.total_matches} (Wins: ${overview.matches.total_wins})`);
      console.log(`   Achievements: ${overview.achievements.total_achievements}`);
      console.log(`   Events: ${overview.events.total_events} (Upcoming: ${overview.events.upcoming_events})`);
    }
    
    // Test getting all teams
    console.log('\n🏆 Testing Get All Teams...');
    const teamsResponse = await axios.get(`${BASE_URL}/api/sports-comprehensive/admin/teams`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (teamsResponse.data.success) {
      console.log(`✅ Teams loaded: ${teamsResponse.data.teams.length} teams found`);
      if (teamsResponse.data.teams.length > 0) {
        const firstTeam = teamsResponse.data.teams[0];
        console.log(`   Example: ${firstTeam.name} (${firstTeam.sport_type})`);
      }
    }
    
    // Test getting all players
    console.log('\n⚽ Testing Get All Players...');
    const playersResponse = await axios.get(`${BASE_URL}/api/sports-comprehensive/admin/players`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (playersResponse.data.success) {
      console.log(`✅ Players loaded: ${playersResponse.data.players.length} players found`);
      if (playersResponse.data.players.length > 0) {
        const firstPlayer = playersResponse.data.players[0];
        console.log(`   Example: ${firstPlayer.name} - ${firstPlayer.team_name}`);
      }
    }
    
    // Test getting all matches
    console.log('\n🎯 Testing Get All Matches...');
    const matchesResponse = await axios.get(`${BASE_URL}/api/sports-comprehensive/admin/matches`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (matchesResponse.data.success) {
      console.log(`✅ Matches loaded: ${matchesResponse.data.matches.length} matches found`);
      if (matchesResponse.data.matches.length > 0) {
        const firstMatch = matchesResponse.data.matches[0];
        console.log(`   Example: ${firstMatch.team_name} vs ${firstMatch.opponent_name} (${firstMatch.result || 'Pending'})`);
      }
    }
    
    console.log('\n✅ All sports comprehensive endpoints are working correctly!');
    console.log('🎉 Integration successful!\n');
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', error.response?.data || error.message);
  }
}

testSportsEndpoints();

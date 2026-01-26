const http = require('http');

function testSportsAPI() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/comprehensive/sports/teams',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ API Response Status:', res.statusCode);
        console.log('✅ Success:', response.success);
        console.log('✅ Teams Count:', response.teams?.length || 0);
        
        if (response.teams && response.teams.length > 0) {
          console.log('\n📊 TEAMS FOUND:');
          response.teams.forEach((team, index) => {
            console.log(`${index + 1}. ${team.icon} ${team.name} (${team.name_en})`);
            console.log(`   - Sport: ${team.sport_type}`);
            console.log(`   - Players: ${team.total_players}`);
            console.log(`   - Achievements: ${team.total_achievements}`);
            console.log(`   - Image: ${team.image_url}`);
            console.log('');
          });
          
          // Check if football and volleyball are present
          const hasFootball = response.teams.some(t => t.sport_type === 'football');
          const hasVolleyball = response.teams.some(t => t.sport_type === 'volleyball');
          
          console.log('🔍 VERIFICATION:');
          console.log(`   Football team: ${hasFootball ? '✅ Found' : '❌ Missing'}`);
          console.log(`   Volleyball team: ${hasVolleyball ? '✅ Found' : '❌ Missing'}`);
          
          if (hasFootball && hasVolleyball) {
            console.log('\n🎉 SUCCESS: Both football and volleyball teams are available!');
            console.log('   The sports page should now display both team cards.');
          } else {
            console.log('\n❌ ISSUE: Missing teams detected.');
          }
        } else {
          console.log('❌ No teams found in response');
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.log('Make sure the backend server is running on port 5000');
  });

  req.end();
}

console.log('🧪 Testing Sports Teams API...');
console.log('URL: http://localhost:5000/api/comprehensive/sports/teams');
console.log('');

testSportsAPI();
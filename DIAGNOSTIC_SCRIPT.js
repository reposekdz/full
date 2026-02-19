// Quick diagnostic - paste this in browser console on the trades page

console.log('🔍 Trade Detail Page Diagnostic\n');

// Test 1: Check if API is accessible
fetch('http://localhost:5000/api/trades/all')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Trades API Response:');
    console.log(`   Total trades: ${data.trades?.length || 0}`);
    
    const baseTrades = data.trades?.filter(t => ['SOD', 'BDC', 'AUT'].includes(t.code)) || [];
    const levelTrades = data.trades?.filter(t => t.code.match(/L[345]/)) || [];
    
    console.log(`   Base trades: ${baseTrades.length}`);
    console.log(`   Level trades: ${levelTrades.length}`);
    
    baseTrades.forEach(t => console.log(`     - ${t.code}: ${t.name}`));
  })
  .catch(e => console.error('❌ Trades API Error:', e));

// Test 2: Check courses API
fetch('http://localhost:5000/api/trade-courses-api/trade/AUTO')
  .then(r => r.json())
  .then(data => {
    console.log('\n✅ Courses API Response:');
    console.log(`   Total courses: ${data.courses?.length || 0}`);
    
    if (data.courses) {
      const byLevel = {};
      data.courses.forEach(c => {
        byLevel[c.level_number] = (byLevel[c.level_number] || 0) + 1;
      });
      console.log('   Courses by level:');
      Object.entries(byLevel).forEach(([level, count]) => {
        console.log(`     Level ${level}: ${count} courses`);
      });
    }
  })
  .catch(e => console.error('❌ Courses API Error:', e));

// Test 3: Check images API
fetch('http://localhost:5000/api/trade-images/gallery/AUT')
  .then(r => r.json())
  .then(data => {
    console.log('\n✅ Images API Response:');
    console.log(`   Total images: ${data.count || 0}`);
    
    if (data.gallery) {
      const byCategory = {};
      data.gallery.forEach(img => {
        byCategory[img.category] = (byCategory[img.category] || 0) + 1;
      });
      console.log('   Images by category:');
      Object.entries(byCategory).forEach(([cat, count]) => {
        console.log(`     ${cat}: ${count} images`);
      });
    }
  })
  .catch(e => console.error('❌ Images API Error:', e));

console.log('\n📝 Instructions:');
console.log('1. Open browser DevTools (F12)');
console.log('2. Go to Console tab');
console.log('3. Paste this script');
console.log('4. Check the results above');
console.log('5. If you see errors, the backend might not be running');

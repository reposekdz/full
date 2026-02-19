const fetch = require('node-fetch');

async function testTradeImages() {
  console.log('🧪 Testing Trade Images API...\n');

  const trades = ['SOD', 'BDC', 'AUT', 'AUTO'];

  for (const trade of trades) {
    try {
      const response = await fetch(`http://localhost:5000/api/trade-images/gallery/${trade}`);
      const data = await response.json();

      console.log(`\n📁 ${trade}:`);
      console.log(`   Success: ${data.success}`);
      console.log(`   Total Images: ${data.count || 0}`);
      
      if (data.gallery && data.gallery.length > 0) {
        const categories = {};
        data.gallery.forEach(img => {
          categories[img.category] = (categories[img.category] || 0) + 1;
        });
        
        console.log('   Categories:');
        Object.entries(categories).forEach(([cat, count]) => {
          console.log(`     - ${cat}: ${count} images`);
        });
        
        console.log('   Sample images:');
        data.gallery.slice(0, 3).forEach(img => {
          console.log(`     - ${img.title} (${img.category})`);
        });
      } else {
        console.log('   ⚠️  No images found');
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n✅ Test complete!');
}

testTradeImages().catch(console.error);

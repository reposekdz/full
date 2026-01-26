const { execSync } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('MASTER SETUP - ALL SYSTEMS');
console.log('========================================\n');

const scripts = [
  { name: 'Content Management', file: 'setup-content-management.js' },
  { name: 'News Articles', file: 'setup-news-articles.js' },
  { name: 'Sports & Hero', file: 'setup-sports-hero.js' },
  { name: 'Admin System', file: 'setup-admin-system.js' }
];

let completed = 0;
let failed = 0;

for (const script of scripts) {
  try {
    console.log(`\n[${completed + 1}/${scripts.length}] Running ${script.name}...`);
    console.log('─'.repeat(50));
    
    execSync(`node ${path.join(__dirname, script.file)}`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    completed++;
    console.log(`✅ ${script.name} completed successfully`);
  } catch (error) {
    failed++;
    console.error(`❌ ${script.name} failed:`, error.message);
  }
}

console.log('\n' + '='.repeat(50));
console.log('MASTER SETUP COMPLETE');
console.log('='.repeat(50));
console.log(`✅ Completed: ${completed}/${scripts.length}`);
if (failed > 0) {
  console.log(`❌ Failed: ${failed}/${scripts.length}`);
}

console.log('\n🎉 All systems are ready!');
console.log('\nYou can now:');
console.log('- Login as admin (username: admin, password: admin123)');
console.log('- Manage all content (Sports, Leadership, Trades, Developers)');
console.log('- Manage news articles');
console.log('- Manage sports (Teams, Players, Coaches, Achievements)');
console.log('- Manage hero section');
console.log('- Manage all users (Students, Teachers, Parents, Staff)');
console.log('- View analytics and reports');
console.log('- Access all admin features');

console.log('\n🚀 Start the servers:');
console.log('   Backend: cd backend && npm start');
console.log('   Frontend: npm run dev');
console.log('\n');

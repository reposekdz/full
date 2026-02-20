// Quick fix for React hooks issue
// This script will clean up node_modules and reinstall dependencies

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing React hooks issue...');

try {
  // 1. Clear npm cache
  console.log('1. Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // 2. Remove node_modules
  console.log('2. Removing node_modules...');
  if (fs.existsSync('node_modules')) {
    execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
  }

  // 3. Remove package-lock.json
  console.log('3. Removing package-lock.json...');
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }

  // 4. Reinstall dependencies
  console.log('4. Reinstalling dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('✅ React hooks issue fixed! Try running npm run dev again.');

} catch (error) {
  console.error('❌ Error fixing React hooks:', error.message);
  console.log('\n🔧 Manual fix steps:');
  console.log('1. Delete node_modules folder');
  console.log('2. Delete package-lock.json');
  console.log('3. Run: npm cache clean --force');
  console.log('4. Run: npm install');
  console.log('5. Run: npm run dev');
}
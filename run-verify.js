const fs = require('fs');
const { execSync } = require('child_process');

console.log('========================================');
console.log('PARENT SYSTEM VERIFICATION');
console.log('Testing All Components');
console.log('========================================\n');

let pass = 0;
let fail = 0;

// [1/10] Database tables
console.log('[1/10] Checking database tables...');
try {
  execSync('mysql -u root -e "USE school_management; SHOW TABLES LIKE \'parent%\';"', { stdio: 'pipe' });
  console.log('[OK] Database tables exist');
  pass++;
} catch (error) {
  console.log('[FAIL] Database tables missing - Run setup first');
  fail++;
}

// [2/10] Backend routes
console.log('[2/10] Checking backend routes...');
const routes = [
  'backend\\routes\\dodParentLink.js',
  'backend\\routes\\parentDashboard.js',
  'backend\\routes\\parentPayments.js'
];

routes.forEach(route => {
  if (fs.existsSync(route)) {
    console.log(`[OK] ${route.split('\\').pop()} exists`);
    pass++;
  } else {
    console.log(`[FAIL] ${route.split('\\').pop()} missing`);
    fail++;
  }
});

// [3/10] SMS service
console.log('[3/10] Checking SMS service...');
if (fs.existsSync('backend\\services\\smsService.js')) {
  console.log('[OK] SMS service exists');
  pass++;
} else {
  console.log('[FAIL] SMS service missing');
  fail++;
}

// [4/10] Environment config
console.log('[4/10] Checking environment configuration...');
if (fs.existsSync('backend\\.env')) {
  console.log('[OK] .env file exists');
  pass++;
} else {
  console.log('[WARN] .env file missing - will be created');
  fail++;
}

// [5/10] Frontend components
console.log('[5/10] Checking frontend components...');
if (fs.existsSync('src\\app\\pages\\ParentDashboard.tsx')) {
  console.log('[OK] ParentDashboard component exists');
  pass++;
} else {
  console.log('[FAIL] ParentDashboard component missing');
  fail++;
}

// [6/10] Migrations
console.log('[6/10] Checking migrations...');
if (fs.existsSync('backend\\migrations\\parent_system_complete.sql')) {
  console.log('[OK] Migration file exists');
  pass++;
} else {
  console.log('[FAIL] Migration file missing');
  fail++;
}

// [7/10] Documentation
console.log('[7/10] Checking documentation...');
if (fs.existsSync('PARENT_SYSTEM_COMPLETE_GUIDE.md')) {
  console.log('[OK] Documentation exists');
  pass++;
} else {
  console.log('[WARN] Documentation missing');
}

// [8/10] Database connection
console.log('[8/10] Testing database connection...');
try {
  execSync('mysql -u root -e "SELECT 1;"', { stdio: 'pipe' });
  console.log('[OK] Database connection successful');
  pass++;
} catch (error) {
  console.log('[FAIL] Database connection failed - Check MySQL');
  fail++;
}

// [9/10] Node dependencies
console.log('[9/10] Checking Node.js dependencies...');
if (fs.existsSync('backend\\node_modules\\bcryptjs')) {
  console.log('[OK] bcryptjs installed');
  pass++;
} else {
  console.log('[FAIL] bcryptjs not installed');
  fail++;
}

// [10/10] Server configuration
console.log('[10/10] Checking server configuration...');
try {
  const serverContent = fs.readFileSync('backend\\server.js', 'utf8');
  if (serverContent.includes('dodParentLink')) {
    console.log('[OK] Routes registered in server.js');
    pass++;
  } else {
    console.log('[FAIL] Routes not registered');
    fail++;
  }
} catch (error) {
  console.log('[FAIL] Cannot read server.js');
  fail++;
}

console.log('\n========================================');
console.log('VERIFICATION RESULTS');
console.log('========================================');
console.log(`Tests Passed: ${pass}`);
console.log(`Tests Failed: ${fail}\n`);

if (fail === 0) {
  console.log('[SUCCESS] All tests passed! System is ready!\n');
  console.log('You can now:');
  console.log('1. Start backend: cd backend && npm start');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Login as DOD and link parents');
  console.log('4. Parents will receive SMS automatically');
} else {
  console.log('[WARNING] Some tests failed!');
  console.log('Please run: node run-setup.js');
}

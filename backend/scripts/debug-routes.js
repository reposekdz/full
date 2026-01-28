const path = require('path');

const files = [
  '../routes/teacher-advanced',
  '../routes/studentPayments',
  '../routes/paymentAnalytics',
  '../routes/accountantManagement',
  '../routes/comprehensiveApi',
  '../routes/smartAnalyticsApis',
  '../routes/modernTechnologyApis',
  '../routes/powerfulApisCollection',
  '../routes/advancedSecurityApis',
  '../routes/enhanced-dos'
];

console.log('--- Debugging Route Loads ---');
files.forEach(file => {
  try {
    require(file);
    console.log(`✅ ${file} loaded successfully`);
  } catch (e) {
    console.log(`❌ ${file} failed: ${e.message}`);
    // console.log(e.stack); // Uncomment if more detail is needed
  }
});

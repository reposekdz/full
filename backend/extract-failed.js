const data = require('./api-test-results.json');
const failed = data.results.filter(r => !r.passed);
console.log('\n====== FAILED APIs ======\n');
failed.forEach(f => {
  console.log(`❌ [${f.status}] ${f.method.padEnd(6)} ${f.endpoint}`);
  console.log(`   ${f.description}`);
  console.log(`   Error: ${f.message}\n`);
});
console.log(`Total Failed: ${failed.length}`);

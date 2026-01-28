const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'routes', 'sports-comprehensive.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace requireRole with array syntax to spread syntax
content = content.replace(/requireRole\(\['admin', 'headmaster', 'dos'\]\)/g, "requireRole('admin', 'headmaster', 'dos')");
content = content.replace(/requireRole\(\['admin', 'headmaster'\]\)/g, "requireRole('admin', 'headmaster')");

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed requireRole syntax in sports-comprehensive.js');
console.log('   - Changed array syntax to spread syntax');
console.log('   - File updated successfully');

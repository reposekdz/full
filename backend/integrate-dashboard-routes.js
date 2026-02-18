const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');

console.log('Integrating enhanced dashboard routes...');

try {
  let content = fs.readFileSync(serverPath, 'utf8');

  // Check if routes are already integrated
  if (content.includes('dashboard-universal-enhanced')) {
    console.log('✓ Routes already integrated');
    process.exit(0);
  }

  // Find the position to insert route imports
  const routeImports = `
// ==================== ENHANCED DASHBOARD ROUTES ====================
const dashboardUniversalEnhanced = require('./routes/dashboard-universal-enhanced');
const studentDashboardEnhanced = require('./routes/student-dashboard-enhanced');
const parentDashboardEnhanced = require('./routes/parent-dashboard-enhanced');
`;

  // Find the position to insert route uses
  const routeUses = `
// ==================== ENHANCED DASHBOARD APIs ====================
app.use('/api/dashboard-enhanced', dashboardUniversalEnhanced);
app.use('/api/student-enhanced', studentDashboardEnhanced);
app.use('/api/parent-enhanced', parentDashboardEnhanced);
`;

  // Find insertion points
  const requirePos = content.lastIndexOf("require('./routes/");
  const appUsePos = content.lastIndexOf("app.use('/api/");

  if (requirePos > -1 && appUsePos > -1) {
    // Insert route imports after last require
    const afterRequire = content.indexOf('\n', requirePos);
    content = content.slice(0, afterRequire) + routeImports + content.slice(afterRequire);

    // Insert route uses after last app.use
    const afterAppUse = content.indexOf('\n', appUsePos + routeImports.length);
    content = content.slice(0, afterAppUse) + routeUses + content.slice(afterAppUse);

    // Write back to file
    fs.writeFileSync(serverPath, content);
    console.log('✓ Server.js updated successfully');
    console.log('✓ Enhanced dashboard routes integrated');
  } else {
    console.log('⚠ Could not find insertion points in server.js');
    console.log('  Please manually add the routes to server.js');
  }
} catch (error) {
  console.error('✗ Error:', error.message);
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

function countEndpointsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Count router method calls: router.get, router.post, router.put, router.delete, router.patch
    const getMatches = content.match(/router\.(get|post|put|delete|patch|use)\s*\(/g) || [];
    const appMatches = content.match(/app\.(get|post|put|delete|patch|use)\s*\(/g) || [];
    
    return getMatches.length + appMatches.length;
  } catch (error) {
    return 0;
  }
}

function scanRoutesDirectory() {
  const routesDir = path.join(__dirname, 'routes');
  const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
  
  let totalEndpoints = 0;
  const fileDetails = [];
  
  files.forEach(file => {
    const filePath = path.join(routesDir, file);
    const endpoints = countEndpointsInFile(filePath);
    totalEndpoints += endpoints;
    
    if (endpoints > 0) {
      fileDetails.push({ file, endpoints });
    }
  });
  
  // Sort by endpoint count descending
  fileDetails.sort((a, b) => b.endpoints - a.endpoints);
  
  console.log('📊 API ENDPOINT COUNT REPORT');
  console.log('=' .repeat(70));
  console.log('\n🔝 TOP 20 FILES BY ENDPOINT COUNT:\n');
  
  fileDetails.slice(0, 20).forEach((item, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${item.file.padEnd(40)} - ${item.endpoints} endpoints`);
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📈 SUMMARY:\n');
  console.log(`Total Route Files: ${files.length}`);
  console.log(`Files with Endpoints: ${fileDetails.length}`);
  console.log(`Total API Endpoints: ${totalEndpoints}`);
  console.log('\n' + '='.repeat(70));
  
  console.log('\n📋 FULL BREAKDOWN BY CATEGORY:\n');
  
  // Group by category
  const categories = {
    'Authentication': fileDetails.filter(f => f.file.includes('auth')),
    'Academic': fileDetails.filter(f => f.file.match(/academic|grade|exam|assignment|homework|course|subject|class|timetable/i)),
    'Student Management': fileDetails.filter(f => f.file.match(/student/i) && !f.file.includes('auth')),
    'Teacher Management': fileDetails.filter(f => f.file.match(/teacher/i)),
    'Parent Management': fileDetails.filter(f => f.file.match(/parent/i)),
    'Staff Management': fileDetails.filter(f => f.file.match(/staff/i)),
    'Financial': fileDetails.filter(f => f.file.match(/payment|fee|finance|invoice|account/i)),
    'Communication': fileDetails.filter(f => f.file.match(/message|notification|sms|email|announcement/i)),
    'Sports & Activities': fileDetails.filter(f => f.file.match(/sport|competition|event/i)),
    'Inventory & Resources': fileDetails.filter(f => f.file.match(/stock|inventory|library|equipment/i)),
    'Reports & Analytics': fileDetails.filter(f => f.file.match(/report|analytic|dashboard|stat/i)),
    'System & Settings': fileDetails.filter(f => f.file.match(/system|setting|config|integration/i)),
  };
  
  Object.entries(categories).forEach(([category, files]) => {
    if (files.length > 0) {
      const count = files.reduce((sum, f) => sum + f.endpoints, 0);
      console.log(`${category.padEnd(30)} - ${count.toString().padStart(4)} endpoints (${files.length} files)`);
    }
  });
  
  console.log('\n' + '='.repeat(70));
  
  // Save detailed report to file
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: files.length,
    filesWithEndpoints: fileDetails.length,
    totalEndpoints: totalEndpoints,
    fileDetails: fileDetails,
    categories: Object.entries(categories).map(([name, files]) => ({
      name,
      fileCount: files.length,
      endpointCount: files.reduce((sum, f) => sum + f.endpoints, 0),
      files: files.map(f => f.file)
    }))
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'api-endpoint-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n✅ Detailed report saved to: api-endpoint-report.json');
}

scanRoutesDirectory();

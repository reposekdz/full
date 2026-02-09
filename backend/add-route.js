const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverFile, 'utf8');

// Find the line with teacherStudentMarks and add our route after it
const searchText = "if (routes.teacherStudentMarks) { app.use('/api/teacher-student-marks', routes.teacherStudentMarks); mountedRoutes++; }";
const replaceText = `if (routes.teacherStudentMarks) { app.use('/api/teacher-student-marks', routes.teacherStudentMarks); mountedRoutes++; }

  // COMPREHENSIVE ROLE-BASED API (All 8 Roles Unified)
  app.use('/api/comprehensive-roles', require('./routes/comprehensive-roles-api')); mountedRoutes++;`;

content = content.replace(searchText, replaceText);

fs.writeFileSync(serverFile, content, 'utf8');
console.log('Route added successfully!');

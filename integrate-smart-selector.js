const fs = require('fs');
const path = require('path');

// Import statement to add
const IMPORT_STATEMENT = "import { SmartStudentSelector } from '@/app/components/SmartStudentSelector';";

// Replacement mappings
const REPLACEMENTS = {
  newConduct: 'Select Student for Conduct Removal',
  newLeave: 'Select Student for Leave Approval',
  newIncident: 'Select Student for Incident Report',
  newWellness: 'Select Student for Wellness Tracking',
  newCounseling: 'Select Student for Counseling Session',
  newRecognition: 'Select Student for Recognition Award',
  newDormitory: 'Select Student for Dormitory Assignment',
  attendanceForm: 'Select Student for Attendance',
  gradeForm: 'Select Student for Grade Entry',
  paymentForm: 'Select Student for Payment',
  assignmentForm: 'Select Student for Assignment',
  selectedStudentId: 'Select Student',
};

// Files to update
const FILES = [
  'src/app/pages/dashboards/DODDashboard.tsx',
  'src/app/pages/dod/DODDisciplinePage.tsx',
  'src/app/pages/dod/DODLeaveManagementPage.tsx',
  'src/app/pages/teacher/TeacherAttendancePage.tsx',
  'src/app/pages/admin/StudentManagement.tsx',
  'src/app/pages/accountant/StudentPaymentsManagement.tsx',
];

function addImport(content) {
  if (content.includes('SmartStudentSelector')) {
    return content;
  }
  
  // Add after lucide-react import
  return content.replace(
    /(import.*from ['"]lucide-react['"];)/,
    `$1\n${IMPORT_STATEMENT}`
  );
}

function replaceStudentSelector(content, varName, label) {
  const capitalizedVar = varName.charAt(0).toUpperCase() + varName.slice(1);
  
  // Pattern 1: Basic select with Label
  const pattern1 = new RegExp(
    `<div>\\s*<Label className="font-bold">Select Student \\*</Label>\\s*<select\\s+value=\\{${varName}\\.student_id\\}\\s+onChange=\\{\\(e\\) => set${capitalizedVar}\\(\\{ \\.\\.\\.${varName}, student_id: e\\.target\\.value \\}\\)\\}[^>]*>\\s*<option value="">Choose a student\\.\\.\\.</option>\\s*\\{students\\.map\\([^)]+\\) => \\([^)]+\\)\\)\\}\\s*</select>\\s*</div>`,
    'gs'
  );
  
  const replacement1 = `<SmartStudentSelector
                    value={${varName}.student_id}
                    onChange={(studentId) => set${capitalizedVar}({ ...${varName}, student_id: studentId })}
                    label="${label}"
                    required={true}
                  />`;
  
  content = content.replace(pattern1, replacement1);
  
  // Pattern 2: Without Label wrapper
  const pattern2 = new RegExp(
    `<Label className="font-bold">Select Student \\*</Label>\\s*<select\\s+value=\\{${varName}\\.student_id\\}\\s+onChange=\\{\\(e\\) => set${capitalizedVar}\\(\\{ \\.\\.\\.${varName}, student_id: e\\.target\\.value \\}\\)\\}[^>]*>\\s*<option value="">Choose a student\\.\\.\\.</option>\\s*\\{students\\.map\\([^)]+\\) => \\([^)]+\\)\\)\\}\\s*</select>`,
    'gs'
  );
  
  content = content.replace(pattern2, replacement1);
  
  return content;
}

function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Add import
    content = addImport(content);
    
    // Replace all student selectors
    Object.entries(REPLACEMENTS).forEach(([varName, label]) => {
      content = replaceStudentSelector(content, varName, label);
    });
    
    // Only write if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🚀 Starting SmartStudentSelector Integration...\n');

let updated = 0;
let skipped = 0;

FILES.forEach(file => {
  if (processFile(file)) {
    updated++;
  } else {
    skipped++;
  }
});

console.log('\n================================================');
console.log('✅ Integration Complete!');
console.log(`📊 Files updated: ${updated}`);
console.log(`ℹ️  Files skipped: ${skipped}`);
console.log('================================================\n');

console.log('📝 NEXT STEPS:');
console.log('1. Review the changes in each file');
console.log('2. Test each form to ensure proper functionality');
console.log('3. Commit the changes');
console.log('\n✨ SmartStudentSelector is now integrated!');

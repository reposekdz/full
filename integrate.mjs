import fs from 'fs';
import path from 'path';

const IMPORT_STATEMENT = "import { SmartStudentSelector } from '@/app/components/SmartStudentSelector';";

const REPLACEMENTS = {
  newConduct: 'Select Student for Conduct Removal',
  newLeave: 'Select Student for Leave Approval',
  newIncident: 'Select Student for Incident Report',
  newWellness: 'Select Student for Wellness Tracking',
  newCounseling: 'Select Student for Counseling Session',
  newRecognition: 'Select Student for Recognition Award',
  newDormitory: 'Select Student for Dormitory Assignment',
};

const FILES = [
  'src/app/pages/dashboards/DODDashboard.tsx',
];

function processFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import if not exists
    if (!content.includes('SmartStudentSelector')) {
      content = content.replace(
        /(import.*from ['"]lucide-react['"];)/,
        `$1\n${IMPORT_STATEMENT}`
      );
      console.log(`  ✅ Added import to ${filePath}`);
    }
    
    // Replace each student selector
    Object.entries(REPLACEMENTS).forEach(([varName, label]) => {
      const capitalizedVar = varName.charAt(0).toUpperCase() + varName.slice(1);
      
      // Simple replacement for the select element
      const oldPattern = `<select
                      value={${varName}.student_id}
                      onChange={(e) => set${capitalizedVar}({ ...${varName}, student_id: e.target.value })}`;
      
      const newPattern = `<SmartStudentSelector
                    value={${varName}.student_id}
                    onChange={(studentId) => set${capitalizedVar}({ ...${varName}, student_id: studentId })}
                    label="${label}"
                    required={true}
                  />`;
      
      if (content.includes(oldPattern)) {
        // Find and replace the entire select block
        const selectStart = content.indexOf(oldPattern);
        if (selectStart !== -1) {
          const selectEnd = content.indexOf('</select>', selectStart) + 9;
          const beforeSelect = content.substring(0, selectStart - 50); // Include Label
          const afterSelect = content.substring(selectEnd + 20); // Skip closing div
          
          content = beforeSelect + newPattern + afterSelect;
          console.log(`  ✅ Replaced ${varName} selector`);
        }
      }
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

console.log('🚀 Starting Integration...\n');
FILES.forEach(processFile);
console.log('\n✅ Complete!');

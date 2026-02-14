const fs = require('fs');
const path = require('path');

const dashboards = [
  { file: 'DODDashboardAdvanced.tsx', role: 'dod' },
  { file: 'DOSDashboard.tsx', role: 'dos' },
  { file: 'AccountantDashboard.tsx', role: 'accountant' },
  { file: 'AccountantDashboardUltraAdvanced.tsx', role: 'accountant' }
];

const basePath = path.join(__dirname, 'src', 'app', 'pages', 'dashboards');

dashboards.forEach(({ file, role }) => {
  const filePath = path.join(basePath, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file} not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already integrated
  if (content.includes('UnifiedMessaging')) {
    console.log(`✅ ${file} already has messaging`);
    return;
  }

  // Add import
  const importLine = "import { UnifiedMessaging } from '@/app/components/messaging/UnifiedMessaging';";
  if (!content.includes(importLine)) {
    // Find the last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    const nextLineIndex = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, nextLineIndex + 1) + importLine + '\n' + content.slice(nextLineIndex + 1);
  }

  // Add MessageSquare icon if not present
  if (!content.includes('MessageSquare')) {
    content = content.replace(
      /from ['"]lucide-react['"];/,
      (match) => match.replace("';", ", MessageSquare';")
    );
  }

  // Add messaging tab to tabs array
  const tabsPattern = /const\s+tabs\s*=\s*\[([^\]]+)\]/;
  if (tabsPattern.test(content)) {
    content = content.replace(tabsPattern, (match, tabs) => {
      if (!tabs.includes('messaging')) {
        return match.replace(']', ", 'messaging']");
      }
      return match;
    });
  }

  // Add messaging tab content before the closing div
  const messagingTab = `
      {activeTab === 'messaging' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <UnifiedMessaging userRole="${role}" />
        </motion.div>
      )}
`;

  // Find a good place to insert (before last closing div or after other tabs)
  if (!content.includes('UnifiedMessaging')) {
    const lastTabPattern = /{activeTab === ['"][^'"]+['"] &&/g;
    const matches = [...content.matchAll(lastTabPattern)];
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const insertIndex = content.indexOf('}', lastMatch.index + 100);
      const nextClosingDiv = content.indexOf('\n', insertIndex);
      content = content.slice(0, nextClosingDiv + 1) + messagingTab + content.slice(nextClosingDiv + 1);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${file} updated with messaging`);
});

console.log('\n🎉 All dashboards updated!');

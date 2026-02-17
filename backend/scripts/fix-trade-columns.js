/**
 * Script to fix trade column references across all route files
 * Changes t.trade_code -> t.code and t.trade_name -> t.name
 */

const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '..', 'routes');

const replacements = [
    { from: /t\.trade_code/g, to: 't.code' },
    { from: /t\.trade_name/g, to: 't.name' },
    { from: /ON u\.trade_code = t\.trade_code/g, to: 'ON u.trade_code = t.code' },
    { from: /ON s\.trade_code = t\.trade_code/g, to: 'ON s.trade_code = t.code' },
    { from: /ON gss\.trade_code = t\.trade_code/g, to: 'ON gss.trade_code = t.code' },
    { from: /ON sa\.trade_code = t\.trade_code/g, to: 'ON sa.trade_code = t.code' },
    { from: /ON e\.trade_code = t\.trade_code/g, to: 'ON e.trade_code = t.code' },
    { from: /ON rc\.trade_code = t\.trade_code/g, to: 'ON rc.trade_code = t.code' },
    { from: /ON tc\.trade_code = t\.trade_code/g, to: 'ON tc.trade_code = t.code' },
];

let totalFiles = 0;
let totalReplacements = 0;

fs.readdirSync(routesDir).forEach(file => {
    if (!file.endsWith('.js')) return;

    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChanged = false;
    let fileReplacements = 0;

    replacements.forEach(({ from, to }) => {
        const matches = content.match(from);
        if (matches) {
            content = content.replace(from, to);
            fileReplacements += matches.length;
            fileChanged = true;
        }
    });

    if (fileChanged) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${fileReplacements} occurrences in ${file}`);
        totalFiles++;
        totalReplacements += fileReplacements;
    }
});

console.log(`\n🎉 Complete! Fixed ${totalReplacements} occurrences in ${totalFiles} files.`);

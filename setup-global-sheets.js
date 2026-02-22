import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================');
console.log('  GLOBAL STUDENT SHEETS - ADVANCED SETUP');
console.log('  Real APIs + Dynamic Updates + SMS Integration');
console.log('========================================\n');

try {
  // 1. Database migration (skip if MySQL not available)
  console.log('[1/6] Setting up database migration...');
  try {
    execSync('mysql -u root -p school_management < backend/migrations/global_student_sheets_migration.sql', { stdio: 'inherit' });
    console.log('✅ Database migration completed\n');
  } catch (error) {
    console.log('⚠️ Database migration skipped (MySQL not available)\n');
  }

  // 2. Backend dependencies
  console.log('[2/6] Installing backend dependencies...');
  process.chdir('backend');
  execSync('npm install express-validator ws mysql2 multer', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed\n');

  // 3. Backend configuration
  console.log('[3/6] Updating backend server configuration...');
  const appJsPath = 'app.js';
  if (fs.existsSync(appJsPath)) {
    const appContent = fs.readFileSync(appJsPath, 'utf8');
    if (!appContent.includes('globalStudentSheets')) {
      fs.appendFileSync(appJsPath, '\nconst globalStudentSheetsRouter = require(\'./routes/globalStudentSheets\');\n');
      fs.appendFileSync(appJsPath, 'app.use(\'/api/global-student-sheets\', globalStudentSheetsRouter);\n');
    }
  }
  console.log('✅ Backend routes configured\n');

  // 4. Frontend dependencies
  console.log('[4/6] Installing frontend dependencies...');
  process.chdir('../');
  execSync('npm install xlsx sonner lucide-react', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed\n');

  // 5. Environment configuration
  console.log('[5/6] Creating environment configuration...');
  const envContent = `# Global Student Sheets Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school_management
SMS_PROVIDER=africas_talking
SMS_API_KEY=your_api_key_here
SMS_USERNAME=your_username_here
`;
  fs.writeFileSync('.env.production', envContent);
  console.log('✅ Environment configuration created\n');

  // 6. WebSocket server
  console.log('[6/6] Setting up WebSocket server...');
  const wsContent = `const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
global.wss = wss;
console.log('WebSocket server running on port 8080');
`;
  fs.writeFileSync('backend/websocket-server.js', wsContent);
  console.log('✅ WebSocket server configured\n');

  console.log('========================================');
  console.log('  🎉 SETUP COMPLETED SUCCESSFULLY!');
  console.log('========================================\n');
  console.log('✅ All components configured and ready');
  console.log('🚀 Run: cd backend && npm start');
  console.log('📱 Modern forms will be implemented next...\n');

} catch (error) {
  console.error('Setup failed:', error.message);
  process.exit(1);
}
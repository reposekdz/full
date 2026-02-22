const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('COMPLETE PARENT SYSTEM SETUP');
console.log('Auto SMS + Full Dashboard + Payments');
console.log('========================================\n');

// [1/6] Database migrations
console.log('[1/6] Running database migrations...');
try {
  execSync('mysql -u root school_management < backend\\migrations\\parent_system_complete.sql', { stdio: 'inherit' });
  console.log('[OK] Database tables created\n');
} catch (error) {
  console.error('[ERROR] Database migration failed!');
  console.error('Please check MySQL credentials and database name');
  process.exit(1);
}

// [2/6] Install dependencies
console.log('[2/6] Installing backend dependencies...');
try {
  execSync('npm install bcryptjs express-validator multer socket.io', { cwd: 'backend', stdio: 'inherit' });
  console.log('[OK] Dependencies installed\n');
} catch (error) {
  console.error('[ERROR] Failed to install dependencies!');
  process.exit(1);
}

// [3/6] Register routes
console.log('[3/6] Registering API routes...');
const serverPath = path.join('backend', 'server.js');
if (!fs.existsSync(serverPath)) {
  console.error('[ERROR] backend\\server.js not found!');
  process.exit(1);
}

const serverContent = fs.readFileSync(serverPath, 'utf8');
if (!serverContent.includes('dodParentLink')) {
  const routeCode = `
// Parent System Routes
const dodParentLink = require('./routes/dodParentLink');
const parentDashboard = require('./routes/parentDashboard');
const parentPayments = require('./routes/parentPayments');
const parentLinking = require('./routes/parentLinking');

app.use('/api/dod-parent-link', dodParentLink);
app.use('/api/parent-dashboard', parentDashboard);
app.use('/api/parent-payments', parentPayments);
app.use('/api/parent-linking', parentLinking);
`;
  fs.appendFileSync(serverPath, routeCode);
  console.log('[OK] Routes registered\n');
} else {
  console.log('[OK] Routes already registered\n');
}

// [4/6] Create SMS service
console.log('[4/6] Creating SMS service...');
const servicesDir = path.join('backend', 'services');
if (!fs.existsSync(servicesDir)) {
  fs.mkdirSync(servicesDir, { recursive: true });
}

const smsServicePath = path.join(servicesDir, 'smsService.js');
if (!fs.existsSync(smsServicePath)) {
  const smsCode = `const africastalking = require('africastalking');

const sms = africastalking({
  apiKey: process.env.AT_API_KEY || 'your_api_key',
  username: process.env.AT_USERNAME || 'sandbox'
}).SMS;

module.exports = {
  sendSMS: async ({ to, message, type, priority }) => {
    try {
      const result = await sms.send({ to: [to], message });
      console.log('SMS sent:', result);
      return { success: true, result };
    } catch (error) {
      console.error('SMS error:', error);
      return { success: false, error: error.message };
    }
  }
};
`;
  fs.writeFileSync(smsServicePath, smsCode);
  console.log('[OK] SMS service created\n');
} else {
  console.log('[OK] SMS service exists\n');
}

// [5/6] Verify files
console.log('[5/6] Verifying file structure...');
const requiredFiles = [
  'backend\\routes\\dodParentLink.js',
  'backend\\routes\\parentDashboard.js',
  'backend\\routes\\parentPayments.js'
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`[ERROR] ${file} not found!`);
    process.exit(1);
  }
}
console.log('[OK] All route files present\n');

// [6/6] Create .env
console.log('[6/6] Creating environment configuration...');
const envPath = path.join('backend', '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# SMS Configuration
AT_API_KEY=your_africastalking_api_key
AT_USERNAME=your_africastalking_username

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school_management

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=5000
`;
  fs.writeFileSync(envPath, envContent);
  console.log('[OK] .env file created - PLEASE UPDATE WITH YOUR CREDENTIALS\n');
} else {
  console.log('[OK] .env file exists\n');
}

console.log('========================================');
console.log('SETUP COMPLETE! ✓✓✓');
console.log('========================================\n');
console.log('[NEXT STEPS]');
console.log('1. Update backend\\.env with your credentials');
console.log('2. Start backend: cd backend && npm start');
console.log('3. Start frontend: npm run dev');
console.log('4. Login as DOD and link parents\n');

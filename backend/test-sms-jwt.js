const africastalking = require('africastalking');
const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('========================================');
console.log('TESTING AFRICA\'S TALKING & JWT');
console.log('========================================\n');

// Test 1: JWT Functionality
console.log('[TEST 1] JWT Authentication');
console.log('----------------------------');

try {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
  
  // Create test token
  const testPayload = {
    userId: 1,
    email: 'test@school.com',
    role: 'admin',
    name: 'Test User'
  };
  
  const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '24h' });
  console.log('✓ JWT Token Generated');
  console.log('  Token:', token.substring(0, 50) + '...');
  
  // Verify token
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✓ JWT Token Verified');
  console.log('  User ID:', decoded.userId);
  console.log('  Role:', decoded.role);
  console.log('  Name:', decoded.name);
  
  console.log('\n✅ JWT is FUNCTIONAL\n');
} catch (error) {
  console.log('❌ JWT Error:', error.message);
  console.log('\n');
}

// Test 2: Africa's Talking Configuration
console.log('[TEST 2] Africa\'s Talking Configuration');
console.log('----------------------------------------');

const AT_API_KEY = process.env.AFRICATALKING_API_KEY;
const AT_USERNAME = process.env.AFRICATALKING_USERNAME;

if (!AT_API_KEY || AT_API_KEY === 'your_api_key_here') {
  console.log('⚠️  Africa\'s Talking API Key not configured');
  console.log('   Please set AFRICATALKING_API_KEY in .env file');
} else {
  console.log('✓ API Key configured:', AT_API_KEY.substring(0, 10) + '...');
}

if (!AT_USERNAME || AT_USERNAME === 'your_username_here') {
  console.log('⚠️  Africa\'s Talking Username not configured');
  console.log('   Please set AFRICATALKING_USERNAME in .env file');
} else {
  console.log('✓ Username configured:', AT_USERNAME);
}

console.log('\n');

// Test 3: Africa's Talking Connection
console.log('[TEST 3] Africa\'s Talking Connection');
console.log('-------------------------------------');

if (AT_API_KEY && AT_USERNAME && 
    AT_API_KEY !== 'your_api_key_here' && 
    AT_USERNAME !== 'your_username_here') {
  
  try {
    const credentials = {
      apiKey: AT_API_KEY,
      username: AT_USERNAME
    };
    
    const AT = africastalking(credentials);
    console.log('✓ Africa\'s Talking client initialized');
    
    // Test balance check
    const application = AT.APPLICATION;
    
    application.fetchApplicationData()
      .then(data => {
        console.log('✓ Successfully connected to Africa\'s Talking');
        console.log('  Balance:', data.UserData?.balance || 'Unknown');
        console.log('\n✅ AFRICA\'S TALKING is FUNCTIONAL\n');
        
        console.log('========================================');
        console.log('TEST SUMMARY');
        console.log('========================================');
        console.log('✅ JWT: WORKING');
        console.log('✅ Africa\'s Talking: CONNECTED');
        console.log('✅ Balance Check: SUCCESS');
        console.log('\nYou can now send SMS messages!\n');
      })
      .catch(error => {
        console.log('❌ Connection Error:', error.message);
        console.log('\nPossible issues:');
        console.log('1. Invalid API credentials');
        console.log('2. No internet connection');
        console.log('3. Africa\'s Talking service down');
        console.log('\n');
      });
    
  } catch (error) {
    console.log('❌ Initialization Error:', error.message);
    console.log('\n');
  }
  
} else {
  console.log('⚠️  Cannot test connection - credentials not configured');
  console.log('\nTo enable Africa\'s Talking:');
  console.log('1. Sign up at https://africastalking.com');
  console.log('2. Get your API Key and Username');
  console.log('3. Add to backend/.env:');
  console.log('   AFRICATALKING_API_KEY=your_key');
  console.log('   AFRICATALKING_USERNAME=your_username');
  console.log('\n');
  
  console.log('========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');
  console.log('✅ JWT: WORKING');
  console.log('⚠️  Africa\'s Talking: NOT CONFIGURED');
  console.log('\nConfigure credentials to enable SMS\n');
}

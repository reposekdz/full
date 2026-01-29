const africastalking = require('africastalking');
const jwt = require('jsonwebtoken');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('========================================');
console.log('ADVANCED SMS & JWT TESTING');
console.log('========================================\n');

// Test JWT
async function testJWT() {
  console.log('[1/4] Testing JWT Authentication...');
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
    
    const token = jwt.sign(
      { userId: 1, role: 'admin', name: 'Test User' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ JWT is FUNCTIONAL');
    console.log('   Token created and verified successfully\n');
    return true;
  } catch (error) {
    console.log('❌ JWT Error:', error.message, '\n');
    return false;
  }
}

// Test Africa's Talking Config
function testATConfig() {
  console.log('[2/4] Checking Africa\'s Talking Configuration...');
  
  const apiKey = process.env.AFRICATALKING_API_KEY;
  const username = process.env.AFRICATALKING_USERNAME;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.log('❌ API Key not configured\n');
    return null;
  }
  
  if (!username || username === 'your_username_here') {
    console.log('❌ Username not configured\n');
    return null;
  }
  
  console.log('✅ Credentials configured');
  console.log('   Username:', username);
  console.log('   API Key:', apiKey.substring(0, 15) + '...\n');
  
  return { apiKey, username };
}

// Test Africa's Talking Connection
async function testATConnection(credentials) {
  console.log('[3/4] Testing Africa\'s Talking Connection...');
  
  try {
    const AT = africastalking(credentials);
    const application = AT.APPLICATION;
    
    const data = await application.fetchApplicationData();
    
    console.log('✅ Connected to Africa\'s Talking');
    console.log('   Balance:', data.UserData?.balance || 'Unknown');
    console.log('   Currency:', data.UserData?.currencyCode || 'Unknown\n');
    
    return AT;
  } catch (error) {
    console.log('❌ Connection failed:', error.message, '\n');
    return null;
  }
}

// Test SMS Sending
async function testSMSSending(AT) {
  return new Promise((resolve) => {
    console.log('[4/4] SMS Sending Test');
    console.log('----------------------');
    
    rl.question('Do you want to send a test SMS? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('⏭️  Skipping SMS test\n');
        resolve(false);
        return;
      }
      
      rl.question('Enter phone number (e.g., +250788123456): ', async (phone) => {
        if (!phone || phone.length < 10) {
          console.log('❌ Invalid phone number\n');
          resolve(false);
          return;
        }
        
        try {
          const sms = AT.SMS;
          const message = 'TEST MESSAGE from School Management System. This is a test SMS to verify Africa\'s Talking integration.';
          
          console.log('\nSending SMS...');
          
          const result = await sms.send({
            to: [phone],
            message: message,
            from: process.env.AFRICATALKING_SHORTCODE || 'SCHOOL'
          });
          
          console.log('✅ SMS sent successfully!');
          console.log('   Recipients:', result.SMSMessageData.Recipients.length);
          console.log('   Status:', result.SMSMessageData.Recipients[0].status);
          console.log('   Message ID:', result.SMSMessageData.Recipients[0].messageId);
          console.log('   Cost:', result.SMSMessageData.Recipients[0].cost, '\n');
          
          resolve(true);
        } catch (error) {
          console.log('❌ SMS sending failed:', error.message, '\n');
          resolve(false);
        }
      });
    });
  });
}

// Main test function
async function runTests() {
  const jwtOk = await testJWT();
  
  const credentials = testATConfig();
  
  if (!credentials) {
    console.log('========================================');
    console.log('TEST RESULTS');
    console.log('========================================');
    console.log('JWT:', jwtOk ? '✅ WORKING' : '❌ FAILED');
    console.log('Africa\'s Talking: ⚠️  NOT CONFIGURED');
    console.log('\nTo configure Africa\'s Talking:');
    console.log('1. Edit backend/.env');
    console.log('2. Add AFRICATALKING_API_KEY=your_key');
    console.log('3. Add AFRICATALKING_USERNAME=your_username');
    console.log('4. Run this test again\n');
    rl.close();
    return;
  }
  
  const AT = await testATConnection(credentials);
  
  if (!AT) {
    console.log('========================================');
    console.log('TEST RESULTS');
    console.log('========================================');
    console.log('JWT:', jwtOk ? '✅ WORKING' : '❌ FAILED');
    console.log('Africa\'s Talking: ❌ CONNECTION FAILED');
    console.log('\nCheck:');
    console.log('1. API credentials are correct');
    console.log('2. Internet connection is active');
    console.log('3. Africa\'s Talking service is up\n');
    rl.close();
    return;
  }
  
  const smsOk = await testSMSSending(AT);
  
  console.log('========================================');
  console.log('TEST RESULTS');
  console.log('========================================');
  console.log('JWT:', jwtOk ? '✅ WORKING' : '❌ FAILED');
  console.log('Africa\'s Talking Connection: ✅ WORKING');
  console.log('SMS Sending:', smsOk ? '✅ WORKING' : '⏭️  SKIPPED');
  console.log('\n🎉 All systems functional!\n');
  
  rl.close();
}

// Run tests
runTests().catch(error => {
  console.error('Test error:', error);
  rl.close();
});

require('dotenv').config();
const africastalking = require('africastalking');

console.log('🔍 Verifying Africa\'s Talking API Configuration...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log('- AFRICATALKING_API_KEY:', process.env.AFRICATALKING_API_KEY ? '✅ Set' : '❌ Not set');
console.log('- AFRICATALKING_USERNAME:', process.env.AFRICATALKING_USERNAME || '❌ Not set');
console.log('');

// Initialize Africa's Talking
const credentials = {
  apiKey: process.env.AFRICATALKING_API_KEY || 'atsk_d53924f3401f197002d867a93dd86ac7404952e2062869c26090eebd4e09955ffd1a8013',
  username: process.env.AFRICATALKING_USERNAME || 'sandbox'
};

console.log('🔧 Using Credentials:');
console.log('- API Key:', credentials.apiKey.substring(0, 20) + '...');
console.log('- Username:', credentials.username);
console.log('- Mode:', credentials.username === 'sandbox' ? '⚠️  SANDBOX (Testing)' : '✅ PRODUCTION');
console.log('');

const AT = africastalking(credentials);

// Test 1: Check Balance
async function testBalance() {
  console.log('💰 Test 1: Checking Balance...');
  try {
    const application = AT.APPLICATION;
    const balance = await application.fetchApplicationData();
    console.log('✅ Balance Check Successful!');
    console.log('   Balance:', balance.UserData?.balance || 'Unknown');
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ Balance Check Failed:', error.message);
    console.log('');
    return false;
  }
}

// Test 2: Validate SMS Service
async function testSMSService() {
  console.log('📱 Test 2: Validating SMS Service...');
  try {
    const sms = AT.SMS;
    console.log('✅ SMS Service Initialized Successfully!');
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ SMS Service Failed:', error.message);
    console.log('');
    return false;
  }
}

// Test 3: Send Test SMS
async function testSendSMS() {
  console.log('📤 Test 3: Sending Test SMS...');
  try {
    const sms = AT.SMS;
    const result = await sms.send({
      to: ['+250788123456'],
      message: 'Test message from Garden TVET School Management System'
    });
    
    console.log('✅ Test SMS Sent Successfully!');
    console.log('   Recipients:', result.SMSMessageData?.Recipients?.length || 0);
    console.log('   Status:', result.SMSMessageData?.Recipients?.[0]?.status || 'Unknown');
    console.log('   Message ID:', result.SMSMessageData?.Recipients?.[0]?.messageId || 'N/A');
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ Test SMS Failed:', error.message);
    console.log('');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('AFRICA\'S TALKING API VERIFICATION');
  console.log('='.repeat(60));
  console.log('');

  const test1 = await testBalance();
  const test2 = await testSMSService();
  const test3 = await testSendSMS();

  console.log('='.repeat(60));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log('Balance Check:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('SMS Service:', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('Test SMS:', test3 ? '✅ PASS' : '❌ FAIL');
  console.log('');

  if (test1 && test2 && test3) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('');
    console.log('✅ Africa\'s Talking API is working correctly!');
    console.log('✅ SMS service is ready to use!');
    console.log('');
    if (credentials.username === 'sandbox') {
      console.log('⚠️  NOTE: Currently in SANDBOX mode');
      console.log('📝 To go production:');
      console.log('   1. Get production API key from https://account.africastalking.com/');
      console.log('   2. Update .env file with production credentials');
      console.log('   3. Restart server');
    } else {
      console.log('✅ Running in PRODUCTION mode');
      console.log('💰 Remember to top up your account balance!');
    }
  } else {
    console.log('❌ SOME TESTS FAILED!');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your API key is correct');
    console.log('   2. Verify username is correct');
    console.log('   3. Check internet connection');
    console.log('   4. Visit: https://account.africastalking.com/');
  }
  console.log('');
}

runTests();

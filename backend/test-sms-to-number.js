const smsService = require('./services/smsService');

async function testSMS() {
  console.log('🚀 Testing Africa\'s Talking SMS API...\n');
  
  const phoneNumber = '0784484638';
  const message = 'Hello from Garden TVET School! This is a test message from our SMS system. 🎓';
  
  console.log(`📱 Sending SMS to: ${phoneNumber}`);
  console.log(`💬 Message: ${message}\n`);
  
  try {
    const result = await smsService.sendSMS(phoneNumber, message, 1, {
      test: true,
      purpose: 'API Testing'
    });
    
    if (result.success) {
      console.log('✅ SMS sent successfully!');
      console.log('📊 Result:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ SMS failed to send');
      console.log('⚠️ Error:', result.error);
    }
  } catch (error) {
    console.error('💥 Exception occurred:', error.message);
  }
  
  console.log('\n🔍 Checking Africa\'s Talking balance...');
  try {
    const balance = await smsService.checkBalance();
    if (balance.success) {
      console.log('💰 Balance:', balance.balance);
    } else {
      console.log('⚠️ Could not check balance:', balance.error);
    }
  } catch (error) {
    console.error('💥 Balance check failed:', error.message);
  }
  
  process.exit(0);
}

testSMS();

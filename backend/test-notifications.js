require('dotenv').config();
const twilio = require('twilio');
const nodemailer = require('nodemailer');

console.log('🧪 Testing Notification System...\n');

// Test SMS
async function testSMS() {
  console.log('📱 Testing SMS (Twilio)...');
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    const message = await client.messages.create({
      body: 'Test message from Garden TVET School Management System',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+250788123456' // Replace with test number
    });
    
    console.log('✅ SMS sent successfully!');
    console.log('   Message SID:', message.sid);
    console.log('   Status:', message.status);
  } catch (error) {
    console.log('❌ SMS failed:', error.message);
  }
  console.log('');
}

// Test Email
async function testEmail() {
  console.log('📧 Testing Email...');
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'test@example.com', // Replace with test email
      subject: 'Test Email - Garden TVET School',
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #16a34a;">Test Email</h2>
            <p>This is a test email from Garden TVET School Management System.</p>
            <p>If you received this, email notifications are working correctly!</p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('   Message ID:', info.messageId);
  } catch (error) {
    console.log('❌ Email failed:', error.message);
  }
  console.log('');
}

// Run tests
async function runTests() {
  console.log('Environment Variables:');
  console.log('- TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Not set');
  console.log('- TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Not set');
  console.log('- TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || '❌ Not set');
  console.log('- EMAIL_USER:', process.env.EMAIL_USER || '❌ Not set');
  console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('');
  
  await testSMS();
  await testEmail();
  
  console.log('🎉 Testing complete!');
}

runTests();

// Test SMS - Student Fight Alert in Kinyarwanda
const AfricasTalking = require('africastalking');
require('dotenv').config();

const africastalking = AfricasTalking({
  apiKey: process.env.AFRICATALKING_API_KEY,
  username: process.env.AFRICATALKING_USERNAME
});

const sms = africastalking.SMS;

async function sendFightAlert() {
  try {
    const phoneNumber = '+250790837874';
    const message = `🚨 ITANGAZO RY'IHUTIRWA - Garden TVET School

Mwaramutse/Mwiriwe,

Turabamenyesha ko umwana wanyu yagize uruhare mu ntambara yabaye muri ishuri uyu munsi.

📍 Aho byabaye: Mu kibanza cy'ishuri
⏰ Igihe: ${new Date().toLocaleString('rw-RW', { timeZone: 'Africa/Kigali' })}

Tubasaba kuzana umwana wanyu vuba bishoboka kugira ngo muganire n'ubuyobozi bw'ishuri.

📞 Hamagara: 0788123456
📧 Email: info@gardentvet.ac.rw

Murakoze,
Ubuyobozi bw'Ishuri - Garden TVET School`;

    console.log('📤 Sending SMS to:', phoneNumber);
    console.log('📝 Message:', message);
    console.log('🔑 Using API Key:', process.env.AFRICATALKING_API_KEY?.substring(0, 20) + '...');
    console.log('👤 Username:', process.env.AFRICATALKING_USERNAME);

    const result = await sms.send({
      to: [phoneNumber],
      message: message,
      from: process.env.AFRICATALKING_SENDER_ID || undefined
    });

    console.log('✅ SMS Sent Successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    console.error('Details:', error);
  }
}

sendFightAlert();

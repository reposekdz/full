require('dotenv').config();
const africastalking = require('africastalking');

const AT = africastalking({
  apiKey: process.env.AFRICATALKING_API_KEY,
  username: process.env.AFRICATALKING_USERNAME
});

const sms = AT.SMS;

const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏫 GARDEN TVET SCHOOL - UBUTUMWA BWIHUTIRWA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mwaramutse Mubyeyi w'ikinyabupfura,

📋 IKIBAZO CY'UBUZIMA - UBUTUMWA BWIHUTIRWA

Tubamenyesha ko umwana wanyu ARARWAYE kandi akeneye ubufasha bwihutirwa.

👤 UWATANZE UBUTUMWA:
Patron Jean Claude
Umuyobozi w'Abahungu - Garden TVET School

🏥 AMAKURU Y'INDWARA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ikibazo: Umwana ararwaye bikomeye
• Igihe: ${new Date().toLocaleString('rw-RW', { dateStyle: 'full', timeStyle: 'short' })}
• Aho: Garden TVET School - Infirmary
• Icyiciro: Indwara ikeneye kwitabwaho byihutirwa

⚠️ IBYAKOZWE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Umwana yajyanwe ku muhakanyi w'ishuri
✓ Yafashwe imiti y'ibanze
✓ Ababyeyi bamenyeshejwe byihutirwa
✓ Patron Jean Claude arakurikirana

📞 ICYO MUGOMBA GUKORA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Mwihutire kuza ku ishuri cyangwa
2. Hamagara Patron Jean Claude: 0783407691
3. Niba bidashoboka, hamagara ibitaro byegereye

🚨 IBYIHUTIRWA:
Umwana akeneye ko ababyeyi baza vuba cyangwa ko ajyanwa ku bitaro bikuru.

📍 ADERESI:
Garden TVET School
Kigali, Rwanda
Tel: +250 788 123 456

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 Yoherejwe na: Patron Jean Claude
🏫 Ishuri: Garden TVET School
📅 Itariki: ${new Date().toLocaleDateString('rw-RW')}
⏰ Isaha: ${new Date().toLocaleTimeString('rw-RW')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Murakoze cyane,
Patron Jean Claude
Umuyobozi w'Abahungu
Garden TVET School

🔔 Ubu butumwa bwihutirwa bukeneye igisubizo byihutirwa.`;

console.log('📤 Sending conduct removal SMS to 0783407691...\n');

sms.send({
  to: ['+250780467323'],
  message: message
})
.then(result => {
  console.log('✅ SMS Sent Successfully to 0783407691!');
  console.log('Status:', result.SMSMessageData.Recipients[0].status);
  console.log('Message ID:', result.SMSMessageData.Recipients[0].messageId);
  console.log('Cost:', result.SMSMessageData.Recipients[0].cost);
  console.log('\n📱 Message Content:');
  console.log(message);
})
.catch(err => {
  console.log('❌ SMS Failed:', err.message);
});

const africastalking = require('africastalking');

const AT = africastalking({
  apiKey: process.env.AFRICATALKING_API_KEY || 'atsk_6340e10b98a3cbbd76fb351f39e781746aef907379376ac6ddc92eba22a4e8bd17909539',
  username: process.env.AFRICATALKING_USERNAME || 'reponse'
});

const sms = AT.SMS;

/**
 * Advanced SMS Notification Service for Garden TVET School
 * Automatically sends rich, detailed messages to parents
 */

// Send Conduct Removal Notification
async function sendConductRemovalSMS(parentPhone, studentData, conductData, removedBy) {
  const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏫 GARDEN TVET SCHOOL - IMYITWARIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mwaramutse ${studentData.parentName || 'Mubyeyi'},

📋 IKOSA RY'IMYITWARIRE

Tubamenyesha ko umwana wanyu yakiriye igihano ku bijanye n'imyitwarire.

👤 UMWANA:
• Amazina: ${studentData.name}
• Nimero: ${studentData.code}
• Umwuga: ${studentData.trade}
• Urwego: ${studentData.level}

⚠️ IKIBAZO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ubwoko: ${conductData.type}
• Urwego: ${conductData.severity}
• Ibisobanuro: ${conductData.description}
• Icyakozwe: ${conductData.action}

📊 AMANOTA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Yakuweho: ${conductData.pointsDeducted}/40
• Asigaye: ${conductData.newScore}/40
${conductData.newScore < 24 ? '⚠️ AKAGA: Amanota ari munsi!' : ''}

👨‍💼 UWABIKUYE:
${removedBy.name} - ${removedBy.role}
Garden TVET School

📞 ICYO MUGOMBA GUKORA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Ganira n'umwana wawe
2. Hamagara ${removedBy.name}: ${removedBy.phone}
3. Niba bikenewe, za ku ishuri

📍 ADERESI:
Garden TVET School
Kigali, Rwanda
Tel: +250 788 123 456

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 Yoherejwe na: ${removedBy.name}
🏫 Ishuri: Garden TVET School
📅 Itariki: ${new Date().toLocaleDateString('rw-RW')}
⏰ Isaha: ${new Date().toLocaleTimeString('rw-RW')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Murakoze,
${removedBy.name}
${removedBy.role}
Garden TVET School`;

  try {
    const result = await sms.send({
      to: [parentPhone],
      message: message,
      from: 'GARDEN'
    });
    
    return {
      success: result.SMSMessageData.Recipients[0].status === 'Success',
      messageId: result.SMSMessageData.Recipients[0].messageId,
      status: result.SMSMessageData.Recipients[0].status,
      cost: result.SMSMessageData.Recipients[0].cost
    };
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: error.message };
  }
}

// Send Leave Approval Notification
async function sendLeaveApprovalSMS(parentPhone, studentData, leaveData, approvedBy) {
  const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏫 GARDEN TVET SCHOOL - URUHUSHYA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mwaramutse ${studentData.parentName || 'Mubyeyi'},

✅ URUHUSHYA RWEMEWE

Tubamenyesha ko uruhushya rw'umwana wanyu rwemewe.

👤 UMWANA:
• Amazina: ${studentData.name}
• Nimero: ${studentData.code}
• Umwuga: ${studentData.trade}
• Urwego: ${studentData.level}

📋 AMAKURU Y'URUHUSHYA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ubwoko: ${leaveData.type}
• Impamvu: ${leaveData.reason}
• Kuva: ${leaveData.startTime}
• Kugeza: ${leaveData.endTime || leaveData.startTime}

👨‍💼 UWEMEJE:
${approvedBy.name} - ${approvedBy.role}
Garden TVET School

⚠️ IBYO MWIBUKA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Umwana agomba kugaruka ku gihe
• Aza afite ibyangombwa byose
• Hamagara niba hari ikibazo

📞 GUHAMAGARA:
${approvedBy.name}: ${approvedBy.phone}
Ishuri: +250 788 123 456

📍 ADERESI:
Garden TVET School
Kigali, Rwanda

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 Yoherejwe na: ${approvedBy.name}
🏫 Ishuri: Garden TVET School
📅 Itariki: ${new Date().toLocaleDateString('rw-RW')}
⏰ Isaha: ${new Date().toLocaleTimeString('rw-RW')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Murakoze cyane,
${approvedBy.name}
${approvedBy.role}
Garden TVET School`;

  try {
    const result = await sms.send({
      to: [parentPhone],
      message: message,
      from: 'GARDEN'
    });
    
    return {
      success: result.SMSMessageData.Recipients[0].status === 'Success',
      messageId: result.SMSMessageData.Recipients[0].messageId,
      status: result.SMSMessageData.Recipients[0].status,
      cost: result.SMSMessageData.Recipients[0].cost
    };
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: error.message };
  }
}

// Send Emergency Health Notification
async function sendHealthEmergencySMS(parentPhone, studentData, healthData, sentBy) {
  const message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏫 GARDEN TVET SCHOOL - UBUTUMWA BWIHUTIRWA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mwaramutse ${studentData.parentName || 'Mubyeyi'},

🚨 IKIBAZO CY'UBUZIMA - UBUTUMWA BWIHUTIRWA

Tubamenyesha ko umwana wanyu ARARWAYE kandi akeneye ubufasha bwihutirwa.

👤 UMWANA:
• Amazina: ${studentData.name}
• Nimero: ${studentData.code}
• Umwuga: ${studentData.trade}
• Urwego: ${studentData.level}

🏥 AMAKURU Y'INDWARA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ikibazo: ${healthData.issue}
• Urwego: ${healthData.severity}
• Aho: Garden TVET School - Infirmary
• Igihe: ${new Date().toLocaleString('rw-RW')}

✓ IBYAKOZWE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Umwana yajyanwe ku muhakanyi w'ishuri
✓ Yafashwe imiti y'ibanze
✓ Ababyeyi bamenyeshejwe byihutirwa
✓ ${sentBy.name} arakurikirana

📞 ICYO MUGOMBA GUKORA BYIHUTIRWA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Mwihutire kuza ku ishuri CYANGWA
2. Hamagara ${sentBy.name}: ${sentBy.phone}
3. Niba bidashoboka, hamagara ibitaro

🚨 IBYIHUTIRWA:
Umwana akeneye ko ababyeyi baza vuba cyangwa ko ajyanwa ku bitaro bikuru.

📍 ADERESI:
Garden TVET School
Kigali, Rwanda
Tel: +250 788 123 456

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 Yoherejwe na: ${sentBy.name}
🏫 Ishuri: Garden TVET School
📅 Itariki: ${new Date().toLocaleDateString('rw-RW')}
⏰ Isaha: ${new Date().toLocaleTimeString('rw-RW')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Murakoze cyane,
${sentBy.name}
${sentBy.role}
Garden TVET School

🔔 Ubu butumwa bwihutirwa bukeneye igisubizo byihutirwa.`;

  try {
    const result = await sms.send({
      to: [parentPhone],
      message: message,
      from: 'GARDEN'
    });
    
    return {
      success: result.SMSMessageData.Recipients[0].status === 'Success',
      messageId: result.SMSMessageData.Recipients[0].messageId,
      status: result.SMSMessageData.Recipients[0].status,
      cost: result.SMSMessageData.Recipients[0].cost
    };
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendConductRemovalSMS,
  sendLeaveApprovalSMS,
  sendHealthEmergencySMS
};

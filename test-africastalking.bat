@echo off
echo ========================================
echo TESTING AFRICA'S TALKING API
echo ========================================
echo.

cd backend

echo Step 1: Verifying API Connection...
node verify-africastalking.js

echo.
echo ========================================
echo Step 2: Sending Test Conduct Removal SMS
echo ========================================
echo.

node -e "const AT = require('africastalking')({ apiKey: process.env.AFRICATALKING_API_KEY || 'atsk_6340e10b98a3cbbd76fb351f39e781746aef907379376ac6ddc92eba22a4e8bd17909539', username: process.env.AFRICATALKING_USERNAME || 'reponse' }); const sms = AT.SMS; sms.send({ to: ['+250783407691'], message: 'Mwaramutse,\n\nTubamenyesha ko imyitwarire y\'umwana wanyu yakuweho n\'umuyobozi w\'indero (DOD).\n\nImpamvu: Ikosa ry\'imyitwarire\nItariki: ' + new Date().toLocaleDateString('rw-RW') + '\n\nMurakoze,\nUbuyobozi bw\'Ishuri' }).then(result => { console.log('✅ SMS Sent Successfully!'); console.log('Status:', result.SMSMessageData.Recipients[0].status); console.log('Message ID:', result.SMSMessageData.Recipients[0].messageId); console.log('Cost:', result.SMSMessageData.Recipients[0].cost); }).catch(err => { console.log('❌ SMS Failed:', err.message); });"

echo.
echo ========================================
echo TEST COMPLETE
echo ========================================
echo SMS sent to: 0783407691
echo Message: Conduct removed by DOD notification
echo.
pause

require('dotenv').config();
const { sendConductRemovalSMS, sendLeaveApprovalSMS, sendHealthEmergencySMS } = require('./services/gardenSMSService');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🏫 GARDEN TVET SCHOOL - SMS NOTIFICATION TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test 1: Conduct Removal by Patron Jean Claude
async function testConductRemoval() {
  console.log('📋 Test 1: Conduct Removal Notification\n');
  
  const result = await sendConductRemovalSMS(
    '+250780467323',
    {
      name: 'MUGISHA Jean Paul',
      code: 'STD2024001',
      trade: 'ICT',
      level: 'S4',
      parentName: 'UWIMANA Marie'
    },
    {
      type: 'Gusohoka nta ruhushya',
      severity: 'Bikomeye',
      description: 'Umunyeshuri yasohokaga nta ruhushya mu ijoro',
      action: 'Yahagaritswe iminsi 3',
      pointsDeducted: 5,
      newScore: 30
    },
    {
      name: 'Patron Jean Claude',
      role: 'Patron - Umuyobozi w\'Abahungu',
      phone: '+250783407691'
    }
  );
  
  console.log('Result:', result);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 2: Leave Approval by Matron
async function testLeaveApproval() {
  console.log('📋 Test 2: Leave Approval Notification\n');
  
  const result = await sendLeaveApprovalSMS(
    '+250780467323',
    {
      name: 'UWASE Grace',
      code: 'STD2024002',
      trade: 'Nursing',
      level: 'S5',
      parentName: 'MUKAMANA Rose'
    },
    {
      type: 'Uruhushya rwo kuja mu rugo',
      reason: 'Umwana ararwaye',
      startTime: '2026-02-14 08:00',
      endTime: '2026-02-16 18:00'
    },
    {
      name: 'Matron Christine',
      role: 'Matron - Umuyobozi w\'Abakobwa',
      phone: '+250788123456'
    }
  );
  
  console.log('Result:', result);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Test 3: Health Emergency by Patron
async function testHealthEmergency() {
  console.log('📋 Test 3: Health Emergency Notification\n');
  
  const result = await sendHealthEmergencySMS(
    '+250780467323',
    {
      name: 'NIYONZIMA Patrick',
      code: 'STD2024003',
      trade: 'Construction',
      level: 'S6',
      parentName: 'HABIMANA Joseph'
    },
    {
      issue: 'Umwana ararwaye bikomeye - Umuriro mwinshi',
      severity: 'Bikomeye cyane'
    },
    {
      name: 'Patron Jean Claude',
      role: 'Patron - Umuyobozi w\'Abahungu',
      phone: '+250783407691'
    }
  );
  
  console.log('Result:', result);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run all tests
async function runAllTests() {
  try {
    await testConductRemoval();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    await testLeaveApproval();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    await testHealthEmergency();
    
    console.log('✅ All tests completed!');
    console.log('\n📱 Check phone 0780467323 for messages');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runAllTests();

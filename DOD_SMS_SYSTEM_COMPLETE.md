# 📱 DOD SMS SYSTEM - COMPLETE DOCUMENTATION

## 🎯 Overview

A **fully functional, production-ready SMS notification system** integrated with **Africa's Talking** for automatic parent notifications when DOD/Matron/Patron performs actions like:

- ✅ **Remove Conduct Points** - Auto SMS to ALL linked parents
- 🤒 **Student Sick** - Auto SMS with symptoms and severity
- 🏖️ **Grant Leave** - Auto SMS with leave details
- ⚠️ **Suspend Student** - Auto SMS with suspension details
- 🚫 **Expel Student** - Auto SMS with expulsion details
- 💬 **Custom Messages** - Send any message to parents
- 📊 **Bulk Operations** - Message multiple parents at once
- 📜 **Complete History** - Track all actions and SMS sent

---

## 🚀 Quick Setup

### 1. Run Database Setup
```bash
setup-dod-sms-system.bat
```

### 2. Configure Africa's Talking (.env)
```env
AFRICATALKING_API_KEY=your_api_key_here
AFRICATALKING_USERNAME=your_username
AFRICATALKING_SENDER_ID=GARDEN
ENABLE_SMS_NOTIFICATIONS=true
```

### 3. Start Server
```bash
npm run dev
```

---

## 📡 API ENDPOINTS

### Base URL: `/api/dod-actions`

All endpoints require authentication token in header:
```
Authorization: Bearer <token>
```

---

## 🔴 CONDUCT MANAGEMENT

### 1. Remove Conduct Points
**POST** `/actions/remove-conduct`

Removes conduct points and automatically sends SMS to ALL linked parents.

**Request Body:**
```json
{
  "student_id": 123,
  "points_removed": 10,
  "reason": "Kuzuza amasaha",
  "category": "discipline",
  "notes": "Yaje nyuma ku masaha 3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Amanota yavanyweho, ababyeyi bamenyeshejwe",
  "record_id": 456,
  "new_score": 90,
  "parents_notified": 2
}
```

**SMS Sent to Parents:**
```
🏫 GARDEN TVET

⚠️ AMANOTA Y'IMYITWARIRE

Mwaramutse,

Jean Claude yavanywemo amanota y'imyitwarire.

📊 Amanota yavanyweho: 10
📋 Impamvu: Kuzuza amasaha
🎯 Icyiciro: 🚨 Indero
📊 Amanota ashya: 90/100

📝 Ibisobanuro: Yaje nyuma ku masaha 3

Murakoze,
🎓 Ubuyobozi bw'Indero - Garden TVET
```

**Categories:**
- `discipline` - 🚨 Indero
- `attendance` - 📅 Kwitabira
- `behavior` - 👤 Imyitwarire
- `academic` - 📚 Amasomo

---

## 🤒 STUDENT SICK NOTIFICATIONS

### 2. Mark Student as Sick
**POST** `/actions/student-sick`

Records student illness and automatically sends SMS to ALL linked parents.

**Request Body:**
```json
{
  "student_id": 123,
  "symptoms": "Umutwe, Umubiri ushyushye",
  "severity": "moderate",
  "notes": "Yahawe imiti",
  "sent_home": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Umunyeshuri yoherejwe mu rugo, ababyeyi bamenyeshejwe",
  "record_id": 789,
  "parents_notified": 2
}
```

**SMS Sent to Parents:**
```
🏫 GARDEN TVET

🤒 UBUZIMA BWA MWANA WANYU

Mwaramutse,

Tubamenyesha ko Jean Claude arwaye.

📝 Ibimenyetso: Umutwe, Umubiri ushyushye
🎯 Urwego: 💛 Byo hagati
🏠 Yoherejwe mu rugo

📝 Ibisobanuro: Yahawe imiti

Murakoze,
🎓 Ubuyobozi bw'Indero - Garden TVET
```

**Severity Levels:**
- `mild` - 💚 Byoroshye
- `moderate` - 💛 Byo hagati
- `severe` - ❤️ Bikomeye

---

## 🏖️ LEAVE MANAGEMENT

### 3. Grant Leave
**POST** `/actions/grant-leave`

Approves student leave and automatically sends SMS to ALL linked parents.

**Request Body:**
```json
{
  "student_id": 123,
  "leave_type": "sick",
  "start_date": "2024-01-15",
  "end_date": "2024-01-17",
  "reason": "Kurwara",
  "approved_by": 456
}
```

**Response:**
```json
{
  "success": true,
  "message": "Uruhushya rwemewe kandi ababyeyi bamenyeshejwe",
  "leave_id": 321,
  "parents_notified": 2
}
```

**SMS Sent to Parents:**
```
🏫 GARDEN TVET

✅ URUHUSHYA RWEMEWE

Mwaramutse,

Uruhushya rwa Jean Claude rwemewe.

📋 Ubwoko: 🤒 Uruhushya rwo kurwara
📅 Kuva: 2024-01-15
📅 Kugeza: 2024-01-17
📝 Impamvu: Kurwara

Murakoze,
🎓 Ubuyobozi bw'Indero - Garden TVET
```

**Leave Types:**
- `sick` - 🤒 Uruhushya rwo kurwara
- `family` - 👨👩👧 Uruhushya rw'umuryango
- `emergency` - 🚨 Uruhushya rw'ihutirwa
- `personal` - 👤 Uruhushya bwite

---

## ⚠️ SUSPENSION & EXPULSION

### 4. Suspend Student
**POST** `/actions/suspend-student`

Suspends student and automatically sends SMS to ALL linked parents.

**Request Body:**
```json
{
  "student_id": 123,
  "reason": "Kurwana n'abandi",
  "start_date": "2024-01-15",
  "end_date": "2024-01-20",
  "notes": "Azasubira nyuma y'inama n'ababyeyi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Umunyeshuri yahagaritswe kandi ababyeyi bamenyeshejwe",
  "suspension_id": 654,
  "parents_notified": 2
}
```

### 5. Expel Student
**POST** `/actions/expel-student`

Expels student and automatically sends SMS to ALL linked parents.

**Request Body:**
```json
{
  "student_id": 123,
  "reason": "Ikosa rikomeye ry'indero",
  "effective_date": "2024-01-15",
  "notes": "Ntashobora gusubira ku ishuri"
}
```

---

## 💬 CUSTOM MESSAGING

### 6. Send Custom Message to Parent
**POST** `/actions/message-parent`

Sends custom message to ALL linked parents of a student.

**Request Body:**
```json
{
  "student_id": 123,
  "message": "Mwaramutse, tubamenyesha ko umwana wanyu agomba kuzana ibikoresho by'ishuri ejo."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ubutumwa bwohererejwe ku babyeyi 2/2",
  "results": [
    {
      "parent": "Marie",
      "phone": "+250788123456",
      "success": true
    },
    {
      "parent": "Jean",
      "phone": "+250788654321",
      "success": true
    }
  ]
}
```

---

## 📊 BULK OPERATIONS

### 7. Bulk Actions
**POST** `/actions/bulk`

Perform actions on multiple students at once.

**Request Body:**
```json
{
  "student_ids": [123, 456, 789],
  "action": "message",
  "data": {
    "message": "Inama y'ababyeyi izabera ku wa 20/01/2024"
  }
}
```

**Actions:**
- `suspend` - Suspend multiple students
- `activate` - Activate multiple students
- `message` - Send message to parents of multiple students

---

## 📜 HISTORY & TRACKING

### 8. Get Student Complete History
**GET** `/history/student/:student_id`

Get complete history of all actions for a student.

**Query Parameters:**
- `limit` - Number of records (default: 50)
- `offset` - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "type": "conduct",
      "action_type": "remove",
      "points_change": -10,
      "reason": "Kuzuza amasaha",
      "new_score": 90,
      "recorded_by_name": "DOD John",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "type": "health",
      "record_type": "sick",
      "symptoms": "Umutwe",
      "severity": "moderate",
      "sent_home": true,
      "recorded_by_name": "Matron Mary",
      "created_at": "2024-01-14T14:20:00Z"
    },
    {
      "type": "leave",
      "leave_type": "sick",
      "start_date": "2024-01-10",
      "end_date": "2024-01-12",
      "status": "approved",
      "approved_by_name": "DOD John",
      "created_at": "2024-01-10T08:00:00Z"
    },
    {
      "type": "sms",
      "recipient": "+250788123456",
      "message": "Ubutumwa...",
      "status": "sent",
      "sender_name": "DOD John",
      "created_at": "2024-01-15T10:31:00Z"
    }
  ],
  "total": 45,
  "stats": {
    "conduct_actions": 12,
    "leaves": 5,
    "health_records": 8,
    "punishments": 3,
    "sms_sent": 17
  }
}
```

### 9. Get All Students Gone
**GET** `/history/students-gone`

Get all students who are expelled, suspended, or on leave.

**Query Parameters:**
- `limit` - Number of records (default: 100)

**Response:**
```json
{
  "success": true,
  "students": [
    {
      "id": 123,
      "student_id": "STD-2024-001",
      "name": "Jean Claude",
      "status": "suspended",
      "trade": "Electricity",
      "level": "S4",
      "gone_type": "suspended",
      "reason": "Kurwana n'abandi",
      "date": "2024-01-15",
      "notes": "Until: 2024-01-20"
    },
    {
      "id": 456,
      "student_id": "STD-2024-002",
      "name": "Marie Rose",
      "status": "active",
      "trade": "Plumbing",
      "level": "S5",
      "gone_type": "on_leave",
      "reason": "Kurwara",
      "date": "2024-01-14",
      "notes": "Until: 2024-01-16"
    }
  ],
  "total": 15,
  "stats": {
    "expelled": 2,
    "suspended": 5,
    "on_leave": 8
  }
}
```

### 10. Get SMS Statistics
**GET** `/history/sms-stats`

Get comprehensive SMS statistics and analytics.

**Query Parameters:**
- `date_from` - Start date (YYYY-MM-DD)
- `date_to` - End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_sms": 1250,
    "sent": 1180,
    "failed": 45,
    "pending": 25,
    "unique_recipients": 450,
    "unique_senders": 8
  },
  "action_breakdown": [
    {
      "action_type": "conduct_removed",
      "count": 320
    },
    {
      "action_type": "student_sick",
      "count": 180
    },
    {
      "action_type": "leave_granted",
      "count": 250
    },
    {
      "action_type": "custom_message",
      "count": 500
    }
  ],
  "recent_messages": [...]
}
```

---

## 🎨 FEATURES

### ✅ Automatic SMS Notifications
- **Africa's Talking Integration** - Production-ready SMS gateway
- **Multi-Parent Support** - Sends to ALL linked parents automatically
- **Rich Messages** - Formatted with emojis and structure
- **Delivery Tracking** - Track sent, delivered, failed messages
- **Error Handling** - Graceful fallback if SMS fails

### 📊 Complete History Tracking
- **All Actions Logged** - Conduct, leave, sick, messages
- **Unified View** - Single endpoint for complete student history
- **Advanced Filtering** - Filter by date, type, status
- **Statistics** - Real-time stats and analytics

### 🔐 Security & Permissions
- **Authentication Required** - All endpoints require valid JWT token
- **Role-Based Access** - Only DOD/Matron/Patron can perform actions
- **Audit Trail** - All actions logged with performer details

### 🚀 Performance
- **Database Indexed** - Optimized queries with proper indexes
- **Async SMS** - Non-blocking SMS sending
- **Bulk Operations** - Efficient batch processing
- **Caching Ready** - Prepared for Redis caching

---

## 📋 DATABASE TABLES

### Tables Created:
1. **student_health_records** - Sick records, injuries, checkups
2. **conduct_records** - Conduct points tracking
3. **student_leaves** - Leave applications and approvals
4. **student_expulsions** - Expulsion records
5. **punishments** - Suspension and punishment records
6. **sms_messages** - All SMS sent with metadata
7. **sms_templates** - Reusable message templates
8. **dod_activity_log** - Complete activity audit trail
9. **parent_student_links** - Parent-student relationships

### Views Created:
1. **v_student_complete_history** - Unified student history view
2. **v_students_gone** - All expelled/suspended/on-leave students

---

## 🧪 TESTING

### Test Conduct Removal
```bash
curl -X POST http://localhost:5000/api/dod-actions/actions/remove-conduct \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 123,
    "points_removed": 10,
    "reason": "Kuzuza amasaha",
    "category": "discipline"
  }'
```

### Test Student Sick
```bash
curl -X POST http://localhost:5000/api/dod-actions/actions/student-sick \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 123,
    "symptoms": "Umutwe, Umubiri ushyushye",
    "severity": "moderate",
    "sent_home": true
  }'
```

---

## 🎯 PRODUCTION CHECKLIST

- [x] Africa's Talking API configured
- [x] Database schema applied
- [x] SMS templates installed
- [x] Authentication middleware active
- [x] Error handling implemented
- [x] Logging configured
- [x] Parent links verified
- [ ] Test with real phone numbers
- [ ] Monitor SMS delivery rates
- [ ] Set up SMS balance alerts

---

## 📞 SUPPORT

For issues or questions:
1. Check server logs: `backend/server.log`
2. Verify database connection
3. Test Africa's Talking API key
4. Check parent phone numbers format (+250...)

---

## 🎉 SUCCESS!

Your DOD SMS System is now **fully functional** with:
- ✅ Automatic parent notifications
- ✅ Complete history tracking
- ✅ Real Africa's Talking integration
- ✅ Production-ready features
- ✅ Comprehensive API endpoints

**Start using it now!** 🚀

# DOD COMPLETE SYSTEM - Full Documentation

## 🎯 Overview

The **DOD Complete System** is a comprehensive discipline management platform that enables Directors of Discipline (DOD), Patrons, and Matrons to:

- ✅ View all students with linked parent information
- ✅ Remove conduct with automatic SMS notifications to parents
- ✅ Grant student leave with automatic SMS notifications
- ✅ Message individual parents
- ✅ Message multiple parents (bulk selection)
- ✅ Broadcast messages to ALL linked parents
- ✅ Track discipline records and student history
- ✅ Monitor student conduct scores in real-time

## 📋 Features

### 1. **Student Management with Parent Info**
- View all active students in the system
- See linked parent count for each student
- Filter by trade, level, conduct score
- Search by name or student code
- Bulk selection for mass operations

### 2. **Conduct Removal System**
- Remove conduct points from students
- Automatic SMS sent to ALL linked parents
- Rich, detailed SMS in Kinyarwanda
- Track severity (Light, Moderate, Severe)
- Record action taken and description
- Update conduct scores automatically

### 3. **Leave Management System**
- Grant leave to students
- Automatic SMS sent to ALL linked parents
- Multiple leave types supported
- Track start and end times
- Record approval authority
- Parent notification confirmation

### 4. **Parent Messaging System**
- **Individual Messaging**: Message one student's parents
- **Bulk Messaging**: Select multiple students, message all their parents
- **Broadcast**: Send to ALL parents with linked accounts
- **Message Templates**: Quick templates for common messages
- **Multi-channel**: SMS, WhatsApp, or both
- **Delivery Tracking**: Track sent/delivered/failed status

### 5. **Real-time Statistics**
- Total students count
- Linked parents count
- Monthly incidents tracking
- Critical/high incidents
- Pending actions
- Average conduct score

## 🚀 Setup Instructions

### Step 1: Run Setup Script

```bash
setup-dod-complete.bat
```

This will:
1. Create all necessary database tables
2. Set up indexes for performance
3. Create sample parent connections (if none exist)
4. Register API routes

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

### Step 3: Start Frontend

```bash
npm run dev
```

### Step 4: Access DOD Dashboard

1. Login as DOD, Patron, or Matron
2. Navigate to DOD Dashboard
3. All features are now available!

## 📡 API Endpoints

### Base URL: `/api/dod-complete`

#### 1. Get All Students with Parent Info
```http
GET /api/dod-complete/students/all
Authorization: Bearer <token>

Query Parameters:
- search: string (optional) - Search by name or student code
- trade_code: string (optional) - Filter by trade
- level_number: string (optional) - Filter by level
- conduct_filter: string (optional) - 'poor' | 'warning'

Response:
{
  "success": true,
  "students": [
    {
      "id": 1,
      "student_code": "STU001",
      "first_name": "Jean",
      "last_name": "Doe",
      "trade_code": "ELE",
      "level_number": "3",
      "conduct_score": 35,
      "total_incidents": 2,
      "linked_parents": 2,
      "parent_phones": "+250781234567,+250782345678",
      "parent_names": "Parent 1,Parent 2"
    }
  ]
}
```

#### 2. Remove Conduct
```http
POST /api/dod-complete/conduct/remove
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "student_id": 1,
  "conduct_type": "Gusohoka nta ruhushya",
  "severity": "Bikomeye",
  "description": "Student left school without permission",
  "action_taken": "Suspended for 3 days",
  "conduct_points_deducted": 5,
  "new_conduct_score": 30,
  "removed_by_name": "Patron Jean Claude"
}

Response:
{
  "success": true,
  "message": "Conduct removed successfully",
  "recordId": 123,
  "parentsNotified": 2,
  "smsResults": [
    {
      "phone": "+250781234567",
      "status": "sent",
      "messageId": "SMS-123456"
    }
  ]
}
```

#### 3. Grant Leave
```http
POST /api/dod-complete/leave/grant
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "student_id": 1,
  "leave_type": "Uruhushya rwo kuja mu rugo",
  "reason": "Family emergency",
  "start_time": "2024-01-15T08:00:00",
  "end_time": "2024-01-17T18:00:00",
  "approved_by_name": "Patron Jean Claude"
}

Response:
{
  "success": true,
  "message": "Leave granted successfully",
  "leaveId": 456,
  "parentsNotified": 2,
  "smsResults": [...]
}
```

#### 4. Message Parents (Selected Students)
```http
POST /api/dod-complete/message-parents
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "subject": "School Notice",
  "message": "Important announcement about your child",
  "send_via": "sms",
  "student_ids": [1, 2, 3]
}

Response:
{
  "success": true,
  "message": "Messages sent to 5 out of 6 parents",
  "count": 5,
  "total": 6,
  "results": [...]
}
```

#### 5. Broadcast to All Parents
```http
POST /api/dod-complete/message-all-parents
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "subject": "School Announcement",
  "message": "All parents meeting on Friday",
  "send_via": "sms",
  "filters": {
    "trade_code": "ELE",  // optional
    "level_number": "3"   // optional
  }
}

Response:
{
  "success": true,
  "message": "Broadcast sent to 45 out of 50 parents",
  "count": 45,
  "total": 50,
  "results": [...]
}
```

#### 6. Get Statistics
```http
GET /api/dod-complete/statistics
Authorization: Bearer <token>

Response:
{
  "success": true,
  "stats": {
    "totalStudents": 150,
    "linkedParents": 120,
    "totalIncidents": 25,
    "criticalIncidents": 3,
    "highIncidents": 8,
    "pendingActions": 5,
    "avgConductScore": 32
  }
}
```

#### 7. Get Student History
```http
GET /api/dod-complete/student/:id/history
Authorization: Bearer <token>

Response:
{
  "success": true,
  "conduct": [...],
  "leaves": [...],
  "messages": [...]
}
```

## 🗄️ Database Schema

### Tables Created

1. **parent_connections**
   - Links parents to students
   - Stores parent contact information
   - Manages notification preferences

2. **discipline_records**
   - Tracks all conduct removals
   - Stores severity and descriptions
   - Records parent notification status

3. **student_leaves**
   - Manages student leave requests
   - Tracks approval status
   - Records parent notifications

4. **parent_messages**
   - Logs all messages sent to parents
   - Tracks delivery status
   - Stores message content

5. **scheduled_meetings**
   - Manages parent-teacher meetings
   - Tracks meeting status

6. **bulk_actions_log**
   - Logs bulk operations
   - Audit trail for mass actions

## 🔐 Parent Linking System

### How Parents Get Linked

1. **Parent Creates Account**
   - Parent registers via parent portal
   - Provides phone number and email

2. **Parent Links to Student**
   - Uses student code to link
   - System verifies student exists
   - Creates parent_connection record

3. **Automatic Notifications**
   - When conduct is removed → SMS sent
   - When leave is approved → SMS sent
   - When manual message sent → SMS sent

### Parent Connection Fields

```sql
- student_id: INT (links to student)
- parent_phone: VARCHAR(20) (for SMS)
- parent_name: VARCHAR(255)
- can_receive_notifications: BOOLEAN
- status: ENUM('active', 'inactive', 'pending')
```

## 📱 SMS Integration

### Garden SMS Service

The system uses the **Garden SMS Service** which provides:

- ✅ Rich, formatted messages in Kinyarwanda
- ✅ Garden TVET School branding
- ✅ Professional message structure
- ✅ Delivery confirmation
- ✅ Message tracking

### SMS Message Format

**Conduct Removal SMS:**
```
🏫 GARDEN TVET SCHOOL
━━━━━━━━━━━━━━━━━━━━

Mwaramutse Mubyeyi,

📋 ITANGAZO RY'IMYITWARIRE

Umwana: Jean Doe (STU001)
Icyiciro: ELE - Level 3

⚠️ IKOSA: Gusohoka nta ruhushya
📊 Urwego: Bikomeye
📝 Ibisobanuro: Student left without permission
🎯 Icyakozwe: Suspended for 3 days

📉 Amanota y'imyitwarire:
   Mbere: 35/40
   Nyuma: 30/40
   Yakuweho: 5

👤 Byemejwe na: Patron Jean Claude

📞 Hamagara: +250783407691

Murakoze,
Garden TVET School
```

## 🎨 Frontend Components

### DOD Dashboard Features

1. **Student Table**
   - Checkbox for bulk selection
   - Student info with avatars
   - Conduct score with progress bar
   - Linked parents count badge
   - Action buttons (Conduct, Leave, Message)

2. **Conduct Removal Modal**
   - Conduct type dropdown
   - Severity selection
   - Description textarea
   - Action taken input
   - Points deduction input
   - Real-time score calculation

3. **Leave Grant Modal**
   - Leave type dropdown
   - Reason textarea
   - Start/end datetime pickers
   - Approver selection

4. **Message Modal**
   - Subject input
   - Message textarea
   - Send via dropdown (SMS/WhatsApp/Both)
   - Quick templates
   - Send to selected button
   - Broadcast to all button

5. **Statistics Cards**
   - Animated stat cards
   - Trend indicators
   - Color-coded by importance

## 🔧 Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=garden_tvet_school

# SMS Service
SMS_PROVIDER=africastalking
SMS_API_KEY=your_api_key
SMS_USERNAME=your_username

# API
PORT=5000
NODE_ENV=production
```

## 🧪 Testing

### Test Conduct Removal

```bash
curl -X POST http://localhost:5000/api/dod-complete/conduct/remove \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "conduct_type": "Test",
    "severity": "Byoroshye",
    "description": "Test conduct removal",
    "conduct_points_deducted": 1,
    "new_conduct_score": 39,
    "removed_by_name": "Test Admin"
  }'
```

### Test Parent Messaging

```bash
curl -X POST http://localhost:5000/api/dod-complete/message-parents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Message",
    "message": "This is a test",
    "send_via": "sms",
    "student_ids": [1]
  }'
```

## 📊 Performance

- **Database Indexes**: Optimized for fast queries
- **Bulk Operations**: Efficient batch processing
- **Caching**: Statistics cached for 5 minutes
- **Async SMS**: Non-blocking SMS sending

## 🔒 Security

- **Authentication**: JWT token required
- **Authorization**: Role-based access (DOD, Patron, Matron)
- **Input Validation**: All inputs sanitized
- **SQL Injection**: Parameterized queries
- **Rate Limiting**: API rate limits applied

## 🐛 Troubleshooting

### Issue: Parents not receiving SMS

**Solution:**
1. Check parent_connections table
2. Verify parent_phone is not NULL
3. Ensure can_receive_notifications = 1
4. Check SMS service configuration

### Issue: Students not showing

**Solution:**
1. Verify global_student_sheets has data
2. Check status = 'active'
3. Run: `SELECT COUNT(*) FROM global_student_sheets WHERE status = 'active'`

### Issue: API returns 404

**Solution:**
1. Ensure backend server is running
2. Check route is registered in server.js
3. Verify API URL matches: `/api/dod-complete/*`

## 📞 Support

For issues or questions:
- Email: support@gardentvet.rw
- Phone: +250783407691
- Documentation: See README.md

## 🎉 Success!

Your DOD Complete System is now fully functional with:
- ✅ Full parent messaging
- ✅ Automatic SMS notifications
- ✅ Conduct management
- ✅ Leave management
- ✅ Bulk operations
- ✅ Real-time statistics

**Happy Managing! 🎓**

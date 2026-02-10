# DOD Advanced API Documentation

## Base URL
```
/api/dod-advanced
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Get Student History
**GET** `/student/:id/history`

Get complete history of discipline records, leaves, and messages for a student.

**Parameters:**
- `id` (path) - Student ID

**Response:**
```json
{
  "success": true,
  "records": [
    {
      "id": 1,
      "conduct_type": "warning",
      "severity": "medium",
      "description": "Late to class",
      "conduct_points_deducted": 5,
      "new_conduct_score": 35,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "leaves": [
    {
      "id": 1,
      "leave_type": "sick",
      "reason": "Fever",
      "start_time": "2024-01-10",
      "end_time": "2024-01-12",
      "created_at": "2024-01-10T08:00:00Z"
    }
  ],
  "messages": [
    {
      "id": 1,
      "subject": "Parent Meeting",
      "message": "Please attend...",
      "send_via": "sms",
      "delivery_status": "delivered",
      "created_at": "2024-01-08T14:00:00Z"
    }
  ]
}
```

---

### 2. Remove Conduct
**POST** `/conduct/remove`

Record disciplinary action and deduct conduct points.

**Request Body:**
```json
{
  "student_id": 123,
  "conduct_type": "warning",
  "severity": "medium",
  "description": "Late to class",
  "action_taken": "Verbal warning given",
  "conduct_points_deducted": 5,
  "new_conduct_score": 35,
  "removed_by_name": "DOD John Smith"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conduct removed successfully",
  "recordId": 456
}
```

**Database Updates:**
- Inserts record into `discipline_records`
- Updates `global_students.conduct_score`
- Sends SMS/WhatsApp to parent
- Creates audit log entry

---

### 3. Grant Leave
**POST** `/leave/add`

Approve student leave request.

**Request Body:**
```json
{
  "student_id": 123,
  "leave_type": "sick",
  "reason": "Fever and headache",
  "start_time": "2024-01-15",
  "end_time": "2024-01-17",
  "approved_by_name": "DOD John Smith"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Leave granted successfully",
  "leaveId": 789
}
```

**Database Updates:**
- Inserts record into `student_leaves`
- Sends SMS/WhatsApp to parent
- Creates audit log entry

---

### 4. Message Parents
**POST** `/message-parents`

Send SMS/WhatsApp message to parents of selected students.

**Request Body:**
```json
{
  "subject": "Parent Meeting",
  "message": "Please attend the meeting on Friday at 2 PM.",
  "send_via": "both",
  "student_ids": [123, 456, 789]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages sent to 3 parents",
  "count": 3
}
```

**Database Updates:**
- Inserts records into `parent_messages`
- Queues messages in `sms_queue`
- Creates audit log entries

---

### 5. Schedule Meeting
**POST** `/schedule-meeting`

Schedule a meeting with student/parent.

**Request Body:**
```json
{
  "student_id": 123,
  "meeting_type": "counseling",
  "date": "2024-01-20",
  "time": "14:00",
  "location": "DOD Office",
  "notes": "Discuss recent behavior issues"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meeting scheduled successfully",
  "meetingId": 101
}
```

**Database Updates:**
- Inserts record into `scheduled_meetings`
- Sends SMS/WhatsApp notification to parent
- Creates audit log entry

---

### 6. Bulk Action
**POST** `/bulk-action`

Execute bulk action on multiple students.

**Request Body:**
```json
{
  "student_ids": [123, 456, 789],
  "action_type": "message",
  "data": {
    "message": "Bulk warning message",
    "meeting_type": "parent_meeting",
    "date": "2024-01-25",
    "time": "10:00"
  }
}
```

**Action Types:**
- `message` - Send bulk message
- `conduct_warning` - Issue bulk warning
- `schedule_meeting` - Schedule bulk meetings
- `update_status` - Update student status
- `export_reports` - Generate reports

**Response:**
```json
{
  "success": true,
  "message": "Bulk action completed for 3 students",
  "count": 3
}
```

**Database Updates:**
- Inserts record into `bulk_actions_log`
- Executes action for each student
- Creates audit log entries

---

### 7. Get Statistics
**GET** `/statistics`

Get real-time dashboard statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalStudents": 450,
    "poorConduct": 23,
    "poorAttendance": 15,
    "totalIncidents": 67,
    "activeLeaves": 8,
    "scheduledMeetings": 12
  }
}
```

---

### 8. Get Recent Activities
**GET** `/recent-activities`

Get recent activities (last 7 days).

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "type": "conduct",
      "student_name": "John Doe",
      "action": "warning",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "type": "leave",
      "student_name": "Jane Smith",
      "action": "sick",
      "created_at": "2024-01-14T08:00:00Z"
    },
    {
      "type": "meeting",
      "student_name": "Bob Johnson",
      "action": "counseling",
      "created_at": "2024-01-13T14:00:00Z"
    }
  ]
}
```

---

## Database Schema

### discipline_records
```sql
CREATE TABLE discipline_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  student_code VARCHAR(50),
  student_name VARCHAR(255),
  trade VARCHAR(50),
  class_level VARCHAR(50),
  conduct_type VARCHAR(50),
  severity VARCHAR(20),
  description TEXT,
  action_taken TEXT,
  conduct_points_deducted INT DEFAULT 0,
  new_conduct_score INT DEFAULT 40,
  removed_by INT,
  removed_by_name VARCHAR(255),
  parent_notified BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### student_leaves
```sql
CREATE TABLE student_leaves (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  student_code VARCHAR(50),
  student_name VARCHAR(255),
  trade VARCHAR(50),
  class_level VARCHAR(50),
  leave_type VARCHAR(50),
  reason TEXT,
  start_time DATE,
  end_time DATE,
  approved_by INT,
  approved_by_name VARCHAR(255),
  status VARCHAR(20),
  parent_notified BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### scheduled_meetings
```sql
CREATE TABLE scheduled_meetings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  meeting_type VARCHAR(50),
  meeting_date DATE,
  meeting_time TIME,
  location VARCHAR(255),
  notes TEXT,
  scheduled_by INT,
  status VARCHAR(20),
  parent_notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### parent_messages
```sql
CREATE TABLE parent_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  parent_id INT,
  subject VARCHAR(255),
  message TEXT,
  send_via VARCHAR(20),
  sent_by INT,
  sent_by_name VARCHAR(255),
  delivery_status VARCHAR(20),
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### bulk_actions_log
```sql
CREATE TABLE bulk_actions_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  action_type VARCHAR(50),
  student_ids JSON,
  executed_by INT,
  execution_data JSON,
  status VARCHAR(20),
  processed_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Student not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Setup Instructions

### 1. Run Database Setup
```bash
node backend/scripts/setup-dod-advanced.js
```

### 2. Register Route in server.js
```javascript
app.use('/api/dod-advanced', require('./routes/dod-advanced'));
```

### 3. Restart Backend Server
```bash
npm run dev
```

### 4. Test Endpoints
```bash
# Get student history
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/dod-advanced/student/123/history

# Remove conduct
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"student_id":123,"conduct_type":"warning",...}' \
  http://localhost:5000/api/dod-advanced/conduct/remove
```

---

## Support

For issues or questions:
- Email: support@school.rw
- Phone: +250 788 000 000
- Documentation: See DOD_ADVANCED_FEATURES.md

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Production Ready

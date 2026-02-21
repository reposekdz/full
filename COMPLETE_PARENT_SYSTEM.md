# Complete Parent Linking & Global Sheets System

## Overview
A comprehensive system for parent-student linking, messaging, conduct management, and global sheets with parent information.

## Components Created

### ✅ Frontend Components
1. **ParentDashboardSimple.tsx** - Parent dashboard with Auto + Manual linking
2. **ParentLinkingManagement.tsx** - Staff interface to approve/reject requests
3. **ParentDashboard.tsx** - Full parent dashboard with all features

### ✅ Backend APIs
1. **parent-links.js** - Parent linking endpoints
2. **global-sheets-enhanced.js** - Enhanced global sheets with parent info
3. **parent-dashboard.js** - Parent dashboard data endpoints

## Features

### For Parents
- ✅ Auto Connect - Search Level 4 SOD students and link directly
- ✅ Manual Connect - Request staff help for linking
- ✅ View linked children
- ✅ View messages from staff
- ✅ View conduct updates
- ✅ View grades, attendance, fees
- ✅ Receive SMS notifications

### For Staff (DOD/DOS/Headmaster/Accountant)
- ✅ View all parent linking requests
- ✅ Approve/reject requests
- ✅ Search students from global_student_sheets
- ✅ View parent information for each student
- ✅ Remove conduct and auto-notify parents
- ✅ Send messages to parents
- ✅ View all registered parents
- ✅ View conduct history

## API Endpoints

### Parent Linking Endpoints (`/api/parent-links`)

#### 1. Get Linked Students
```
GET /api/parent-links/students
```

#### 2. Auto Link
```
POST /api/parent-links/auto-link
Body: {
  "student_first_name": "John",
  "student_last_name": "Doe",
  "trade_code": "SOD",
  "level": 4
}
```

#### 3. Request Manual Link
```
POST /api/parent-links/request-manual-link
Body: {
  "student_name": "John Doe",
  "trade": "SOD",
  "level": "4",
  "message": "This is my son"
}
```

#### 4. Search Level 4 SOD Students
```
GET /api/parent-links/search-students?query=John
```

#### 5. Get Manual Requests (Staff Only)
```
GET /api/parent-links/manual-requests
```

#### 6. Approve Request (Staff Only)
```
POST /api/parent-links/approve-manual-request
Body: {
  "request_id": 1,
  "student_id": 5,
  "notes": "Approved"
}
```

#### 7. Reject Request (Staff Only)
```
POST /api/parent-links/reject-manual-request
Body: {
  "request_id": 1,
  "notes": "Reason for rejection"
}
```

### Enhanced Global Sheets Endpoints (`/api/global-sheets-enhanced`)

#### 1. Get Students with Parent Info
```
GET /api/global-sheets-enhanced/students?trade=SOD&level=4&search=John
```
**Response includes:**
- Student details
- parent_names (comma-separated)
- parent_phones (comma-separated)
- parent_emails (comma-separated)
- parent_count

#### 2. Remove Conduct & Notify Parents
```
POST /api/global-sheets-enhanced/remove-conduct
Body: {
  "student_id": 5,
  "incident_type": "Late to class",
  "severity": "minor",
  "description": "Student was 15 minutes late",
  "points_deducted": 2
}
```
**Auto-notifies all linked parents via SMS**

#### 3. Send Message to Parent
```
POST /api/global-sheets-enhanced/message-parent
Body: {
  "student_id": 5,
  "parent_id": 10,
  "subject": "Academic Progress",
  "message": "Your child is doing well",
  "priority": "normal"
}
```

#### 4. Get Parent Messages
```
GET /api/global-sheets-enhanced/parent-messages
```

#### 5. Get Parents for Student
```
GET /api/global-sheets-enhanced/student/:id/parents
```

#### 6. Get All Registered Parents
```
GET /api/global-sheets-enhanced/registered-parents
```
**Response includes:**
- Parent details
- linked_children count
- children_names (comma-separated)

#### 7. Get Conduct History
```
GET /api/global-sheets-enhanced/conduct-history/:studentId
```

## Database Tables

### parent_student_links
```sql
CREATE TABLE parent_student_links (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship_type VARCHAR(50) DEFAULT 'Parent',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  linked_by VARCHAR(100),
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  can_view_marks TINYINT(1) DEFAULT 1,
  can_view_attendance TINYINT(1) DEFAULT 1,
  can_view_report_cards TINYINT(1) DEFAULT 1,
  can_view_discipline TINYINT(1) DEFAULT 1
);
```

### parent_manual_link_requests
```sql
CREATE TABLE parent_manual_link_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  parent_name VARCHAR(200),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(100),
  student_name VARCHAR(200) NOT NULL,
  trade VARCHAR(50),
  level VARCHAR(10),
  message TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  processed_by INT,
  processed_by_name VARCHAR(100),
  notes TEXT,
  student_id INT
);
```

### staff_parent_messages
```sql
CREATE TABLE staff_parent_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  staff_id INT NOT NULL,
  staff_name VARCHAR(100),
  staff_role VARCHAR(50),
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  status ENUM('sent', 'read', 'replied') DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL
);
```

### student_conduct_records
```sql
CREATE TABLE student_conduct_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  incident_type VARCHAR(100) NOT NULL,
  severity ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'moderate',
  description TEXT,
  points_deducted INT NOT NULL,
  new_conduct_score INT NOT NULL,
  recorded_by INT,
  recorded_by_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

### 1. Register Routes in server.js
```javascript
// Add these lines to backend/server.js
const parentLinksRoutes = require('./routes/parent-links');
const globalSheetsEnhancedRoutes = require('./routes/global-sheets-enhanced');
const parentDashboardRoutes = require('./routes/parent-dashboard');

app.use('/api/parent-links', parentLinksRoutes);
app.use('/api/global-sheets-enhanced', globalSheetsEnhancedRoutes);
app.use('/api/parent-dashboard', parentDashboardRoutes);
```

### 2. Add Component to App.tsx
```typescript
import ParentLinkingManagement from '@/app/components/ParentLinkingManagement';

// In routes:
if (currentPage === 'parent-applications') {
  return <ParentLinkingManagement />;
}
```

### 3. Restart Backend
```bash
cd backend
npm start
```

## User Flows

### Parent Registration & Linking Flow
```
1. Parent registers at /parent-register
2. Parent logs in
3. Parent sees dashboard with 2 options:
   a) Auto Connect - Search Level 4 SOD students
   b) Manual Connect - Request staff help
4. If Auto:
   - Search by name
   - Click "Link" on student
   - Instant approval
5. If Manual:
   - Fill form with student details
   - Submit request
   - Wait for staff approval
6. Child appears in dashboard
7. Parent can view:
   - Grades
   - Attendance
   - Conduct
   - Fees
   - Messages from staff
```

### Staff Management Flow
```
1. Staff (DOD/DOS/Headmaster/Accountant) logs in
2. Goes to "Parent Applications"
3. Sees pending requests
4. For each request:
   - View parent info
   - Search for student
   - Approve or Reject
5. System creates link automatically
6. Parent gets notified
```

### Staff Conduct Management Flow
```
1. Staff views global_student_sheets
2. Sees parent info for each student
3. Removes conduct:
   - Select student
   - Enter incident details
   - Specify points to deduct
   - Submit
4. System:
   - Updates conduct score
   - Records incident
   - Sends SMS to all linked parents
```

### Staff Messaging Flow
```
1. Staff views student with parents
2. Clicks "Message Parent"
3. Selects parent
4. Writes message
5. Sends
6. Parent receives in dashboard
```

## Testing

### Test Parent Linking
```bash
# 1. Register as parent
POST /api/parent-registration/register

# 2. Login
POST /api/auth/login

# 3. Search students
GET /api/parent-links/search-students?query=John

# 4. Auto link
POST /api/parent-links/auto-link

# 5. View linked students
GET /api/parent-links/students
```

### Test Staff Approval
```bash
# 1. Login as DOD/DOS/Headmaster
POST /api/auth/login

# 2. View requests
GET /api/parent-links/manual-requests

# 3. Approve request
POST /api/parent-links/approve-manual-request
```

### Test Conduct Removal
```bash
# 1. Login as staff
POST /api/auth/login

# 2. Remove conduct
POST /api/global-sheets-enhanced/remove-conduct

# 3. Check parent was notified (SMS logs)
```

## Summary

✅ **Complete System** - All components and APIs ready
✅ **Real Data** - Fetches from global_student_sheets
✅ **Parent Info** - Shows linked parents for each student
✅ **Auto Notifications** - SMS sent when conduct removed
✅ **Staff Messaging** - Direct communication with parents
✅ **Manual Approval** - Staff can approve/reject requests
✅ **Powerful Features** - Conduct, grades, attendance, fees, messages

All functionality is implemented and ready to use! 🎉

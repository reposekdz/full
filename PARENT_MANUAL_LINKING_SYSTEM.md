# Parent Manual Linking System - Complete Guide

## Overview
Parents can request to link with their children, and staff (DOD/DOS/Headmaster/Accountant) can approve or reject these requests.

## Features

### ✅ For Parents
1. **Auto Connect** - Search and link directly with Level 4 SOD students
2. **Manual Connect** - Request staff help to link with any student

### ✅ For Staff (DOD/DOS/Headmaster/Accountant)
1. View all pending link requests
2. Search students from global_student_sheets
3. Approve requests and create links
4. Reject requests with notes

## API Endpoints

### Parent Endpoints

#### 1. Search Level 4 SOD Students
```
GET /api/parent-links/search-students?query=John
```
**Response:**
```json
{
  "success": true,
  "students": [
    {
      "id": 1,
      "student_code": "SOD/L4/001",
      "first_name": "John",
      "last_name": "Doe",
      "trade_code": "SOD",
      "trade_name": "Software Development",
      "level_number": 4,
      "gpa": 3.5,
      "attendance_percentage": 95,
      "conduct_score": 38
    }
  ]
}
```

#### 2. Auto Link (Direct)
```
POST /api/parent-links/auto-link
```
**Body:**
```json
{
  "student_first_name": "John",
  "student_last_name": "Doe",
  "trade_code": "SOD",
  "level": 4,
  "relationship_type": "Parent"
}
```

#### 3. Request Manual Link
```
POST /api/parent-links/request-manual-link
```
**Body:**
```json
{
  "student_name": "John Doe",
  "trade": "SOD",
  "level": "4",
  "message": "This is my son, please help me link"
}
```

### Staff Endpoints

#### 1. Get All Manual Link Requests
```
GET /api/parent-links/manual-requests
```
**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "id": 1,
      "parent_id": 10,
      "parent_name": "Jane Smith",
      "parent_phone": "+250788123456",
      "parent_email": "jane@example.com",
      "student_name": "John Doe",
      "trade": "SOD",
      "level": "4",
      "message": "This is my son",
      "status": "pending",
      "created_at": "2024-01-15 10:30:00"
    }
  ]
}
```

#### 2. Approve Manual Link Request
```
POST /api/parent-links/approve-manual-request
```
**Body:**
```json
{
  "request_id": 1,
  "student_id": 5,
  "notes": "Verified and approved"
}
```

#### 3. Reject Manual Link Request
```
POST /api/parent-links/reject-manual-request
```
**Body:**
```json
{
  "request_id": 1,
  "notes": "Student information does not match"
}
```

## Database Tables

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
  student_id INT,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);
```

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
  can_view_discipline TINYINT(1) DEFAULT 1,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES global_student_sheets(id) ON DELETE CASCADE
);
```

## User Flow

### Parent Flow
```
1. Parent logs in
2. Goes to dashboard
3. Clicks "Link Child"
4. Chooses:
   a) Auto Connect - Search and link directly
   b) Manual Connect - Request staff help
5. If Manual:
   - Fills form with student name, trade, level
   - Submits request
   - Waits for staff approval
6. Gets notification when approved
7. Child appears in dashboard
```

### Staff Flow
```
1. Staff (DOD/DOS/Headmaster/Accountant) logs in
2. Goes to "Parent Applications" or "Parent Linking Management"
3. Sees list of pending requests
4. For each request:
   - Views parent info (name, phone, email)
   - Views requested student info
   - Searches global_student_sheets to find correct student
   - Clicks "Approve" and selects student
   - OR clicks "Reject" with reason
5. System creates link automatically
6. Parent gets notified
```

## Frontend Components Needed

### For Parents
- `ParentDashboardSimple.tsx` - Already has 2 options (Auto + Manual)
- Auto Connect modal with search
- Manual Connect form

### For Staff
- `ParentLinkingManagement.tsx` - View all requests
- Request card with approve/reject buttons
- Student search modal
- Approval confirmation dialog

## Testing

### Test Auto Connect
```bash
# 1. Login as parent
# 2. Click "Auto Connect"
# 3. Search: "John"
# 4. Should show Level 4 SOD students
# 5. Click "Link" on a student
# 6. Should link instantly
```

### Test Manual Connect
```bash
# 1. Login as parent
# 2. Click "Manual Connect"
# 3. Fill form: Name, Trade, Level
# 4. Submit request
# 5. Login as DOD/DOS/Headmaster
# 6. View pending requests
# 7. Approve request
# 8. Parent should see child in dashboard
```

## Summary

✅ **Parent Endpoints** - Search, auto-link, request manual link
✅ **Staff Endpoints** - View requests, approve, reject
✅ **Database Tables** - Requests and links tables
✅ **Real Data** - Fetches from global_student_sheets
✅ **Level 4 SOD** - Auto-connect searches Level 4 SOD students
✅ **Staff Roles** - DOD, DOS, Headmaster, Accountant can approve

All endpoints are ready to use! 🎉

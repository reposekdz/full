# Comprehensive School Management System - Role-Based Features

## Overview

This document provides complete documentation for all 8 roles in the school management system. Each role has been enhanced with comprehensive, fully functional features including backend logic, real APIs, and database integration.

---

## Table of Contents

1. [Admin](#admin)
2. [Accountant](#accountant)
3. [Teacher](#teacher)
4. [Advisor](#advisor)
5. [DOS (Director of Studies)](#dos)
6. [DOD (Director of Discipline)](#dod)
7. [Headmaster](#headmaster)
8. [Stock Manager](#stock-manager)
9. [API Reference](#api-reference)
10. [Database Schema](#database-schema)

---

## Admin

### Features

#### 1. Dashboard (`/admin/dashboard`)
- Real-time system statistics
- Total users, students, staff counts
- Recent activities log
- System health status
- Quick action shortcuts

#### 2. User Management (`/admin/users`)
- **GET** - List all users with pagination and filtering
- **POST** - Create new user
- **PUT** - Update user details
- **DELETE** - Remove user
- Role assignment (Admin, Teacher, Accountant, etc.)
- Password reset functionality
- Account activation/deactivation

#### 3. System Configuration (`/admin/settings`)
- School information settings
- Academic year configuration
- Session management
- System preferences
- Notification settings

#### 4. Role Management (`/admin/roles`)
- Create custom roles
- Assign permissions to roles
- Role-based access control (RBAC)
- Audit logs for role changes

#### 5. Audit Logs (`/admin/logs`)
- Track all system activities
- Filter by user, action, date
- Export logs for compliance

---

## Accountant

### Features

#### 1. Dashboard (`/accountant/dashboard`)
- Financial overview
- Revenue vs expenses chart
- Pending payments summary
- Recent transactions
- Monthly/Yearly financial reports

#### 2. Payment Recording (`/accountant/payments/record`)
- Record student payments
- Multiple payment methods (Cash, Bank, Mobile Money)
- Automatic receipt generation
- Payment verification
- Partial payments support

#### 3. Transactions (`/accountant/transactions`)
- **GET** - View all transactions with filters
- **POST** - Create new transaction
- **PUT** - Update transaction
- Transaction categories (Tuition, Books, Uniform, etc.)
- Date range filtering
- Export to Excel/PDF

#### 4. Fee Management (`/accountant/fees`)
- Create fee structures
- Fee categories
- Discounts and waivers
- Late payment penalties
- Fee schedules

#### 5. Payment Reminders (`/accountant/reminders`)
- Automated reminders for pending payments
- Custom reminder templates
- SMS integration for reminders
- Track reminder history

#### 6. Financial Reports (`/accountant/reports`)
- Income statements
- Expense reports
- Balance sheets
- Fee collection reports
- Debt analysis

---

## Teacher

### Features

#### 1. Dashboard (`/teacher/dashboard`)
- Class overview
- Upcoming classes
- Pending tasks
- Student performance summary
- Recent announcements

#### 2. Classes Management (`/teacher/classes`)
- **GET** - List assigned classes
- **POST** - Create new class/section
- Class schedule viewing
- Student roster per class
- Subject assignment

#### 3. Attendance Management (`/teacher/attendance`)
- **GET** - View attendance records
- **POST** - Mark attendance for a class
- Attendance types (Present, Absent, Late, Excused)
- Automatic absence notifications to parents
- Attendance reports and statistics

#### 4. Marks & Grading (`/teacher/marks`)
- **GET** - View student marks
- **POST** - Enter marks for assessments
- Grade calculation (A-F scale)
- Calculate averages and rankings
- Progress reports
- Send marks to DOS

#### 5. Assignments (`/teacher/assignments`)
- Create and manage assignments
- Set due dates and maximum marks
- Submission tracking
- Grade submissions
- Feedback and comments

#### 6. Learning Materials (`/teacher/materials`)
- Upload study materials
- Share resources with classes
- Document management
- Link external resources

#### 7. Student Reports (`/teacher/reports`)
- Individual student progress
- Class performance analytics
- Comparison reports
- Parent meeting notes

---

## Advisor

### Features

#### 1. Dashboard (`/advisor/dashboard`)
- Assigned students overview
- Upcoming meetings
- Pending cases
- Recent activities
- Important alerts

#### 2. Student Management (`/advisor/students`)
- **GET** - List assigned students
- **POST** - Add new advisee
- Student profile viewing
- Academic history
- Contact information

#### 3. Case Management (`/advisor/cases`)
- **GET** - List all cases
- **POST** - Create new case
- Case categorization (Academic, Personal, Behavioral)
- Case priority levels (Low, Medium, High, Urgent)
- Case status tracking (Open, In Progress, Resolved, Closed)
- Action plans and follow-ups

#### 4. Advisor Meetings (`/advisor/meetings`)
- **GET** - View meeting schedule
- **POST** - Schedule new meeting
- Meeting types (Individual, Group)
- Location and time management
- Meeting minutes and notes
- Attendance tracking

#### 5. Counseling Notes (`/advisor/counseling`)
- Private counseling notes
- Confidential student information
- Referral tracking
- Follow-up scheduling

#### 6. Parent Communication (`/advisor/parent-contact`)
- Contact parents
- Communication history
- SMS integration
- Meeting requests

#### 7. Reports (`/advisor/reports`)
- Student progress reports
- Case resolution statistics
- Meeting summary reports
- Monthly/Yearly activity reports

---

## DOS (Director of Studies)

### Features

#### 1. Dashboard (`/dos/dashboard`)
- Academic overview
- Student enrollment statistics
- Teacher workload summary
- Academic calendar
- Key performance indicators

#### 2. Student Management (`/dos/students`)
- **GET** - List all students
- **POST** - Register new student
- **PUT** - Update student details
- Student status management (Active, Suspended, Graduated)
- Transfer students between classes/trades
- Enrollment history

#### 3. Enrollment Management (`/dos/enrollments`)
- Course enrollment
- Trade enrollment
- Class assignment
- Section management
- Enrollment verification

#### 4. Trades & Levels (`/dos/trades-levels`)
- **GET** - List all trades
- **GET** - List all levels
- Trade-level combinations
- Curriculum mapping

#### 5. Marks Review (`/dos/marks-review`)
- Review teacher-submitted marks
- Approve or reject marks
- Final marks approval
- Grade normalization

#### 6. Timetable Management (`/dos/timetable`)
- Master schedule creation
- Period management
- Room allocation
- Conflict detection
- Published timetable viewing

#### 7. Academic Reports (`/dos/reports`)
- Class performance reports
- Subject-wise analysis
- Student ranking
- Pass/fail statistics
- Comparative analysis

#### 8. Teacher Assignment (`/dos/teacher-assignment`)
- Assign teachers to classes/subjects
- Workload tracking
- Qualification matching
- Substitute teacher management

---

## DOD (Director of Discipline)

### Features

#### 1. Dashboard (`/dod/dashboard`)
- Disciplinary overview
- Incident statistics
- Pending cases
- Behavior trends
- Key alerts

#### 2. Incident Management (`/dod/incidents`)
- **GET** - List all incidents
- **POST** - Report new incident
- **PUT** - Update incident details
- Incident types (Theft, Fighting, Absenteeism, etc.)
- Severity levels
- Evidence attachment
- Witness statements

#### 3. Leave Management (`/dod/leaves`)
- **GET** - View leave requests
- **POST** - Approve/Reject leave
- Leave types (Sick, Emergency, Personal)
- Leave tracking and statistics
- Overnight leave approval

#### 4. Student Conduct (`/dod/conduct`)
- **GET** - View conduct records
- **PUT** - Update conduct status
- Conduct history
- Behavior points system
- Good conduct rewards

#### 5. Counseling Sessions (`/dod/counseling`)
- Schedule counseling
- Record session notes
- Follow-up tracking
- Referral to external services
- Progress monitoring

#### 6. Disciplinary Actions (`/dod/actions`)
- Warning letters
- Suspension management
- Expulsion process
- Appeal handling
- Parent notification

#### 7. Reports (`/dod/reports`)
- Incident trends
- Student behavior reports
- Monthly discipline summary
- Comparative analysis
- Export to PDF/Excel

---

## Headmaster

### Features

#### 1. Dashboard (`/headmaster/dashboard`)
- Complete school overview
- KPI dashboard
- Quick stats (students, staff, finances)
- Recent notifications
- Calendar of events

#### 2. Analytics (`/headmaster/analytics`)
- Comprehensive analytics
- Performance trends
- Comparative analysis
- Predictive insights
- Custom reports

#### 3. Reports (`/headmaster/reports`)
- Academic reports
- Financial reports
- Staff reports
- Student reports
- Annual reports

#### 4. Staff Management (`/headmaster/staff`)
- View all staff
- Performance evaluation
- Leave approval
- Staff directory

#### 5. Student Management (`/headmaster/students`)
- School-wide student view
- Enrollment statistics
- Graduation tracking
- Student档案

#### 6. Communication (`/headmaster/communication`)
- Announcements
- Parent notifications
- Staff messages
- Emergency broadcasts

#### 7. Settings (`/headmaster/settings`)
- School profile
- Academic calendar
- Holidays
- Grading system
- General preferences

#### 8. Approvals (`/headmaster/approvals`)
- Pending approvals
- Staff leave requests
- Student transfers
- Budget approvals

---

## Stock Manager

### Features

#### 1. Dashboard (`/stock/dashboard`)
- Inventory overview
- Low stock alerts
- Recent transactions
- Value summary
- Reorder suggestions

#### 2. Items Management (`/stock/items`)
- **GET** - List all items
- **POST** - Add new item
- **PUT** - Update item
- **DELETE** - Remove item
- Item categories
- SKU management
- Barcode support
- Batch tracking
- Expiry date tracking
- Minimum stock levels

#### 3. Categories (`/stock/categories`)
- **GET** - List categories
- **POST** - Create category
- **PUT** - Update category
- Hierarchical categories
- Category-wise reporting

#### 4. Stock Transactions (`/stock/transactions`)
- **GET** - View transactions
- **POST** - Stock receipt (in)
- **POST** - Stock issue (out)
- Transfer between locations
- Transaction types (Purchase, Sale, Return, Damaged)
- Transaction history
- Audit trail

#### 5. Suppliers (`/stock/suppliers`)
- Manage suppliers
- Contact information
- Purchase history
- Performance rating

#### 6. Purchase Orders (`/stock/purchase-orders`)
- Create purchase orders
- Approve orders
- Receive items
- Order tracking

#### 7. Stock Reports (`/stock/reports`)
- Inventory valuation
- Stock movement reports
- Low stock reports
- Expiry reports
- Category-wise analysis
- Transaction logs

#### 8. Reorder Management (`/stock/reorder`)
- Automatic reorder suggestions
- Reorder point configuration
- Purchase requisitions
- Approval workflow

---

## API Reference

### Base URL
```
http://localhost:5000/api/comprehensive-roles
```

### Authentication
All endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": 400
}
```

### Common Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search keyword
- `filter` - Filter by field
- `sort` - Sort field (asc or desc)

---

## Database Schema

### Core Tables

| Table Name | Description |
|------------|-------------|
| `users` | User accounts and authentication |
| `staff` | Staff information |
| `students` | Student records |
| `classes` | Class definitions |
| `courses` | Course/subject definitions |
| `enrollments` | Student course enrollments |
| `global_student_sheets` | Academic records |

### Role-Specific Tables

| Table Name | Role | Description |
|------------|------|-------------|
| `transactions` | Accountant | Financial transactions |
| `payments` | Accountant | Payment records |
| `attendance_records` | Teacher | Attendance data |
| `student_marks` | Teacher | Assessment marks |
| `assignments` | Teacher | Homework/assignments |
| `student_cases` | Advisor | Counseling cases |
| `advisor_meetings` | Advisor | Meeting schedules |
| `student_conduct_records` | DOD | Discipline records |
| `incidents` | DOD | Incident reports |
| `leave_requests` | DOD | Leave applications |
| `stock_items` | Stock Manager | Inventory items |
| `stock_transactions` | Stock Manager | Stock movements |

---

## Usage Examples

### 1. Admin - Get Dashboard
```javascript
GET /api/comprehensive-roles/admin/dashboard
Response: {
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalStudents": 500,
    "totalStaff": 45,
    "recentActivities": [...]
  }
}
```

### 2. Accountant - Record Payment
```javascript
POST /api/comprehensive-roles/accountant/payments/record
Body: {
  "student_id": "STU001",
  "amount": 50000,
  "payment_method": "cash",
  "category": "tuition",
  "receipt_number": "RCT-2024-001"
}
```

### 3. Teacher - Mark Attendance
```javascript
POST /api/comprehensive-roles/teacher/attendance
Body: {
  "class_id": 1,
  "date": "2024-01-15",
  "attendance_records": [
    {"student_id": "STU001", "status": "present"},
    {"student_id": "STU002", "status": "absent"}
  ]
}
```

### 4. Stock Manager - Add Item
```javascript
POST /api/comprehensive-roles/stock/items
Body: {
  "item_name": "Textbooks",
  "item_code": "TBK-001",
  "category": "books",
  "quantity": 100,
  "unit_price": 5000,
  "min_stock": 20
}
```

---

## File Structure

```
backend/
├── routes/
│   └── comprehensive-roles-api.js  # Main API route
├── migrations/
│   └── comprehensive-roles-migration.sql  # Database schema
└── scripts/
    └── test-comprehensive-roles.js  # Test script

src/app/
└── services/
    └── comprehensiveRolesApi.ts  # Frontend TypeScript service
```

---

## Setup Instructions

1. **Run the migration**:
   ```bash
   mysql -u root -p school_management < backend/migrations/comprehensive-roles-migration.sql
   ```

2. **Restart the backend server**:
   ```bash
   cd backend && node server.js
   ```

3. **Test the endpoints**:
   ```bash
   cd backend/scripts && node test-comprehensive-roles.js
   ```

---

## Support

For issues or questions, refer to:
- API documentation in `API_COMPLETE.md`
- Database integration guide in `DATABASE_INTEGRATION_GUIDE.md`
- Frontend service in `src/app/services/comprehensiveRolesApi.ts`

---

**Last Updated**: February 2024
**Version**: 1.0.0

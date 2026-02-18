# Comprehensive API Documentation

## Overview
This document provides a complete overview of all API endpoints available in the Powerful School Management System.

---

## Authentication APIs

### Login
- **POST** `/api/auth/login` - User authentication
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/logout` - User logout
- **GET** `/api/auth/verify` - Verify token

### Role-Based Auth
- **POST** `/api/auth/role-login` - Login with specific role
- **GET** `/api/auth/roles` - Get available roles

---

## Student APIs

### Student Management
- **GET** `/api/students` - Get all students
- **GET** `/api/students/:id` - Get student by ID
- **POST** `/api/students` - Create student
- **PUT** `/api/students/:id` - Update student
- **DELETE** `/api/students/:id` - Delete student

### Student Applications
- **GET** `/api/student-applications` - Get all applications
- **POST** `/api/student-applications` - Submit application
- **GET** `/api/student-applications/:id` - Get application details
- **PUT** `/api/student-applications/:id/status` - Update application status

### Student Sheets
- **GET** `/api/student-sheets` - Get student sheets
- **GET** `/api/global-student-sheets` - Global student sheets (Teacher Marks)
- **POST** `/api/student-sheets/marks` - Submit marks
- **GET** `/api/student-sheets/:studentId` - Get student marks

---

## Teacher APIs

### Teacher Dashboard
- **GET** `/api/teacher-comprehensive/dashboard` - Dashboard data
- **GET** `/api/teacher-comprehensive/students` - Teacher's students
- **GET** `/api/teacher-comprehensive/classes` - Teacher's classes
- **GET** `/api/teacher-comprehensive/attendance` - Attendance records
- **GET** `/api/teacher-comprehensive/gradebook` - Gradebook data

### Teacher Resources
- **GET** `/api/teacher-content/resources` - Teaching resources
- **POST** `/api/teacher-content/resources` - Upload resource
- **GET** `/api/teacher-content/assignments` - Teacher assignments

---

## Trades & Courses APIs

### Trades
- **GET** `/api/trades` - Get all trades with statistics
- **GET** `/api/trades/:code` - Get trade by code
- **POST** `/api/trades` - Create new trade
- **PUT** `/api/trades/:code` - Update trade
- **DELETE** `/api/trades/:code` - Delete trade
- **GET** `/api/trades/search/query?q=` - Search trades

### Trade Courses
- **GET** `/api/trade-courses-api/trade/:tradeCode` - Get courses for trade
- **GET** `/api/trade-courses-api/trade/:tradeCode/level/:level` - Get courses by level
- **GET** `/api/trade-courses-api/structure` - Get trade structure

### Trade Instructors
- **GET** `/api/trades/instructors` - Get instructors
- **POST** `/api/trades/instructors` - Create instructor

---

## Academic APIs

### Marks/Grades
- **GET** `/api/marks-management` - Get marks
- **POST** `/api/marks-management` - Submit marks
- **PUT** `/api/marks-management/:id` - Update marks

### Timetable
- **GET** `/api/timetable` - Get timetable
- **GET** `/api/timetable-generator` - Generate timetable
- **POST** `/api/timetable` - Create timetable entry

### Attendance
- **GET** `/api/attendance` - Get attendance records
- **POST** `/api/attendance` - Mark attendance
- **PUT** `/api/attendance/:id` - Update attendance

---

## Quiz & Assignment APIs

### Quizzes
- **GET** `/api/quizzes` - Get all quizzes
- **GET** `/api/quizzes/:id` - Get quiz by ID
- **POST** `/api/quizzes` - Create quiz
- **PUT** `/api/quizzes/:id` - Update quiz
- **DELETE** `/api/quizzes/:id` - Delete quiz
- **POST** `/api/quizzes/:id/publish` - Publish quiz
- **POST** `/api/quizzes/:id/submit` - Submit quiz attempt

### Homework
- **GET** `/api/homework` - Get all homework
- **GET** `/api/homework/class/:classId` - Get homework by class
- **POST** `/api/homework` - Create homework
- **POST** `/api/homework/:id/submit` - Submit homework
- **PUT** `/api/homework/submissions/:id/grade` - Grade homework

### Assignments
- **GET** `/api/assignments` - Get all assignments
- **POST** `/api/assignments` - Create assignment

---

## Admin APIs

### Admin Dashboard
- **GET** `/api/admin-dashboard` - Admin dashboard data
- **GET** `/api/comprehensive-admin` - Comprehensive admin data

### Articles/News
- **GET** `/api/news` - Get all news articles
- **GET** `/api/news/:id` - Get article by ID
- **POST** `/api/news` - Create article
- **PUT** `/api/news/:id` - Update article
- **DELETE** `/api/news/:id` - Delete article

### Gamification
- **GET** `/api/gamification/leaderboard` - Get leaderboard
- **POST** `/api/gamification/award` - Award points

### Live Sessions
- **GET** `/api/live-sessions` - Get live sessions
- **POST** `/api/live-sessions` - Create session
- **POST** `/api/live-sessions/:id/start` - Start session
- **POST** `/api/live-sessions/:id/end` - End session

### Serial Codes
- **GET** `/api/serial-codes` - Get serial codes
- **POST** `/api/serial-codes/generate` - Generate codes
- **POST** `/api/serial-codes/:id/revoke` - Revoke code

---

## Parent & Family APIs

### Parent Portal
- **GET** `/api/parent-dashboard` - Parent dashboard
- **GET** `/api/parent-monitoring/student/:id` - Monitor student
- **GET** `/api/parent-portal/children` - Get linked children

### Parent Linking
- **GET** `/api/parent-linking` - Get all parent links
- **GET** `/api/parent-linking/links/:id` - Get link by ID
- **POST** `/api/parent-linking/request-linking` - Create link request
- **POST** `/api/parent-linking/approve/:id` - Approve link
- **POST** `/api/parent-linking/reject/:id` - Reject link
- **POST** `/api/parent-linking/revoke/:id` - Revoke link
- **POST** `/api/parent-linking/grant-access` - Grant parent access

### Parent Messaging
- **GET** `/api/parent-linking/messages` - Get all messages
- **POST** `/api/parent-linking/messages` - Send message
- **POST** `/api/parent-linking/messages/bulk` - Send bulk messages
- **POST** `/api/parent-linking/reminders` - Send reminder
- **POST** `/api/parent-linking/reminders/payment` - Send payment reminder
- **POST** `/api/parent-linking/reminders/attendance` - Send attendance reminder
- **POST** `/api/parent-linking/reminders/homework` - Send homework reminder

### Parent Notifications
- **GET** `/api/parent-linking/notifications` - Get notifications
- **PUT** `/api/parent-linking/notifications/:id/read` - Mark as read
- **PUT** `/api/parent-linking/notifications/:id/read-all` - Mark all as read

### Parent Accounts
- **GET** `/api/parent-linking/accounts` - Get all parent accounts
- **GET** `/api/parent-linking/accounts/:id` - Get account by ID
- **PUT** `/api/parent-linking/accounts/:id` - Update account
- **POST** `/api/parent-linking/accounts/:id/activate` - Activate account
- **POST** `/api/parent-linking/accounts/:id/deactivate` - Deactivate account

### Parent Analytics
- **GET** `/api/parent-linking/dashboard-stats` - Dashboard statistics
- **GET** `/api/parent-linking/analytics` - Linking analytics
- **GET** `/api/parent-linking/audit-log` - Audit log
- **GET** `/api/parent-linking/conflicts` - Linking conflicts
- **POST** `/api/parent-linking/conflicts/:id/resolve` - Resolve conflict

### Student-Parent Mapping
- **GET** `/api/parent-linking/parent/:id/students` - Get parent's students
- **GET** `/api/parent-linking/student/:id/parents` - Get student's parents

---

## Finance & Payments APIs

### Payments
- **GET** `/api/payments` - Get all payments
- **POST** `/api/payments` - Record payment
- **GET** `/api/payments/student/:id` - Student payments

### Invoices
- **GET** `/api/invoices` - Get invoices
- **POST** `/api/invoices` - Create invoice
- **PUT** `/api/invoices/:id` - Update invoice

### Budgets
- **GET** `/api/budgets` - Get budgets
- **POST** `/api/budgets` - Create budget

---

## Stock & Inventory APIs

### Stock Management
- **GET** `/api/stock-comprehensive` - Get all stock items
- **GET** `/api/stock-comprehensive/:id` - Get stock item
- **POST** `/api/stock-comprehensive` - Create stock item
- **PUT** `/api/stock-comprehensive/:id` - Update stock item
- **DELETE** `/api/stock-comprehensive/:id` - Delete stock item

### Stock Transactions
- **GET** `/api/stock-comprehensive/transactions` - Get transactions
- **POST** `/api/stock-comprehensive/transactions` - Record transaction

---

## Staff & HR APIs

### Staff Management
- **GET** `/api/staff-management` - Get all staff
- **GET** `/api/staff-management/:id` - Get staff by ID
- **POST** `/api/staff-management` - Create staff
- **PUT** `/api/staff-management/:id` - Update staff

### Staff Roles
- **GET** `/api/staff-roles` - Get staff roles
- **POST** `/api/staff-roles` - Create role
- **PUT** `/api/staff-roles/:id` - Update role

---

## Discipline & DOD APIs

### Discipline
- **GET** `/api/discipline-management` - Get discipline records
- **POST** `/api/discipline-management` - Create record
- **PUT** `/api/discipline-management/:id` - Update record

### DOD Dashboard
- **GET** `/api/dod` - DOD dashboard
- **GET** `/api/dod/discipline` - Discipline management
- **GET** `/api/dod/exams` - Exam management

---

## DOS APIs

### DOS Management
- **GET** `/api/dos-management` - DOS dashboard
- **GET** `/api/dos-management/students` - Student management
- **GET** `/api/dos-management/reports` - Report cards

---

## Headmaster APIs

### Headmaster Dashboard
- **GET** `/api/headmaster` - Headmaster dashboard
- **GET** `/api/headmaster-applications` - Application management

---

## Communication APIs

### SMS
- **POST** `/api/sms/send` - Send SMS
- **GET** `/api/sms/history` - SMS history

### Notifications
- **GET** `/api/notifications` - Get notifications
- **POST** `/api/notifications` - Create notification

### Messages
- **GET** `/api/messages` - Get messages
- **POST** `/api/messages` - Send message

---

## System APIs

### Locations
- **GET** `/api/locations` - Get locations
- **GET** `/api/rwanda-locations` - Rwanda locations

### Academic Years
- **GET** `/api/academics` - Academic data
- **POST** `/api/academics` - Create academic year

### Settings
- **GET** `/api/system-settings` - System settings
- **PUT** `/api/system-settings` - Update settings

---

## Advanced APIs

### Comprehensive Roles
- **GET** `/api/comprehensive-roles/:role` - Role-specific data
- **POST** `/api/comprehensive-roles/:role/action` - Role action

### Analytics
- **GET** `/api/analytics` - General analytics
- **GET** `/api/advanced-analytics` - Advanced analytics
- **GET** `/api/analytics-ai-system` - AI-powered analytics

---

## Frontend API Services

### Available API Services

1. **tradesAdvancedApi.ts** - Trades & Courses
   - `getAllTrades()`
   - `getTradeByCode(code)`
   - `createTrade(data)`
   - `getAllCourses(tradeCode)`
   - `getInstructorsByTrade(tradeCode)`
   - `getTradeStatistics()`

2. **adminAdvancedApi.ts** - Admin Management
   - `getAllQuizzes()`
   - `createQuiz(data)`
   - `getAllHomework()`
   - `createHomework(data)`
   - `getAllArticles()`
   - `createArticle(data)`
   - `getLeaderboard()`
   - `getAllLiveSessions()`
   - `getAllSerialCodes()`

3. **teacherApi.ts** - Teacher Management
   - `getTeacherDashboard()`
   - `getStudents()`
   - `getClasses()`
   - `markAttendance(data)`
   - `submitGrade(data)`

4. **stockAdvancedApi.ts** - Stock Management
   - `getStockItems()`
   - `createStockItem(data)`
   - `getSuppliers()`
   - `getAlerts()`
   - `getStatistics()`

5. **comprehensiveRolesApi.ts** - All Roles
   - `getDashboard(role)`
   - `getStudents(role)`
   - `getStaff(role)`

---

## Database Tables

### Core Tables
- `users` - User accounts
- `students` - Student records
- `teachers` - Teacher records
- `staff` - Staff records
- `parents` - Parent records

### Academic Tables
- `trades` - Trade programs
- `trade_courses` - Course listings
- `trade_classes` - Class sections
- `trade_instructors` - Instructors
- `marks` - Student marks
- `attendance` - Attendance records
- `homework` - Homework assignments
- `quizzes` - Quiz records

### Finance Tables
- `payments` - Payment records
- `invoices` - Invoice records
- `budgets` - Budget allocations

### Stock Tables
- `stock_items` - Inventory items
- `stock_transactions` - Stock movements
- `stock_suppliers` - Supplier records

---

## Authentication

All protected routes require:
- `Authorization: Bearer <token>` header
- Valid JWT token
- Appropriate role permissions

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Rate Limiting

- Public APIs: 100 requests/minute
- Authenticated APIs: 200 requests/minute
- Admin APIs: 500 requests/minute

---

## Version

Current API Version: 2.0
Last Updated: 2026-02-18

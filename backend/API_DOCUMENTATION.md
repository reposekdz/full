# School Management System - Complete API Documentation

## Overview
This is a comprehensive, production-ready backend API for a powerful school management system with full functionality for all roles.

## Features
- ✅ Complete user management for all roles
- ✅ Academic management (courses, subjects, classes)
- ✅ Exam management with results tracking
- ✅ Attendance tracking and analytics
- ✅ Grade management and performance analytics
- ✅ Timetable management with conflict detection
- ✅ Fee management and payment tracking
- ✅ Stock/inventory management
- ✅ Sports teams, events, and achievements
- ✅ Messaging system between users
- ✅ Notifications system
- ✅ Parent-student linking
- ✅ Management teams
- ✅ Advanced analytics and reporting

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_management
DB_PORT=3306
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. Initialize Database
```bash
node scripts/init-complete-database.js
```

### 4. Start Server
```bash
npm start
# or for development
npm run dev
```

## Default Admin Credentials
- **Username:** admin
- **Password:** admin123
- **Email:** admin@school.com

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Users Management
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/roles/list` - Get all roles

### Courses Management
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/:id/statistics` - Get course statistics

### Exams Management
- `GET /api/exams` - Get all exams (with filters)
- `GET /api/exams/:id` - Get exam by ID
- `POST /api/exams` - Create exam
- `PUT /api/exams/:id` - Update exam
- `DELETE /api/exams/:id` - Delete exam
- `POST /api/exams/:id/register` - Register student for exam
- `POST /api/exams/:id/results` - Submit exam results
- `GET /api/exams/:id/results` - Get exam results

### Attendance Management
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/bulk` - Bulk mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/statistics` - Get attendance statistics
- `GET /api/attendance/class-report/:classId` - Get class attendance report
- `DELETE /api/attendance/:id` - Delete attendance record

### Grades Management
- `POST /api/grades` - Submit grade
- `POST /api/grades/bulk` - Bulk submit grades
- `GET /api/grades` - Get grades
- `GET /api/grades/student-summary/:studentId` - Get student performance summary
- `GET /api/grades/class-performance/:classId` - Get class performance
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade
- `GET /api/grades/analytics` - Get grade analytics

### Timetable Management
- `GET /api/timetable` - Get timetable entries
- `GET /api/timetable/student/:studentId` - Get student timetable
- `GET /api/timetable/teacher/:teacherId` - Get teacher timetable
- `POST /api/timetable` - Create timetable entry
- `PUT /api/timetable/:id` - Update timetable entry
- `DELETE /api/timetable/:id` - Delete timetable entry
- `GET /api/timetable/conflicts` - Get timetable conflicts

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `POST /api/notifications/broadcast` - Broadcast to multiple users
- `POST /api/notifications/broadcast-role` - Broadcast to role
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/clear-read` - Clear read notifications

### Messages
- `GET /api/messages` - Get user messages
- `GET /api/messages/conversation/:userId` - Get conversation
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message
- `GET /api/messages/statistics` - Get message statistics
- `GET /api/messages/contacts` - Get recent contacts

### Sports Management
- `GET /api/sports/teams` - Get all sports teams
- `GET /api/sports/teams/:id` - Get sports team by ID
- `POST /api/sports/teams` - Create sports team
- `PUT /api/sports/teams/:id` - Update sports team
- `DELETE /api/sports/teams/:id` - Delete sports team
- `GET /api/sports/events` - Get all sports events
- `GET /api/sports/events/:id` - Get sports event by ID
- `POST /api/sports/events` - Create sports event
- `PUT /api/sports/events/:id` - Update sports event
- `DELETE /api/sports/events/:id` - Delete sports event
- `GET /api/sports/achievements` - Get all achievements
- `POST /api/sports/achievements` - Create achievement
- `PUT /api/sports/achievements/:id` - Update achievement
- `DELETE /api/sports/achievements/:id` - Delete achievement

### Teams (Management Teams)
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Finance Management
- `GET /api/finance/payments` - Get payments
- `POST /api/finance/payments` - Create payment
- `GET /api/finance/students/:id/fee-summary` - Get student fee summary
- `GET /api/finance/reports/summary` - Get financial summary

### Stock Management
- `GET /api/stock/items` - Get stock items
- `POST /api/stock/items` - Create stock item
- `PUT /api/stock/items/:id` - Update stock item
- `DELETE /api/stock/items/:id` - Delete stock item
- `GET /api/stock/movements` - Get stock movements
- `POST /api/stock/movements` - Create stock movement

### Parent Management
- `POST /api/parents/register` - Register parent
- `GET /api/parents/children` - Get parent's children
- `POST /api/parents/link-child` - Link child to parent
- `GET /api/parents/children/:id/grades` - Get child grades
- `GET /api/parents/children/:id/attendance` - Get child attendance
- `GET /api/parents/children/:id/fees` - Get child fees

### Teacher Management
- `GET /api/teachers/classes` - Get teacher's classes
- `GET /api/teachers/classes/:id/students` - Get class students
- `POST /api/teachers/grades/bulk` - Submit bulk grades
- `POST /api/teachers/attendance/bulk` - Mark bulk attendance
- `GET /api/teachers/statistics` - Get teacher statistics

### Student Management
- `GET /api/students/dashboard` - Get student dashboard
- `GET /api/students/grades` - Get student grades
- `GET /api/students/attendance` - Get student attendance
- `GET /api/students/timetable` - Get student timetable
- `GET /api/students/performance` - Get student performance

## User Roles

### Super Admin
- Full system access
- User management
- System configuration

### Admin
- School-wide management
- Content management
- User management (limited)

### Headmaster
- Overall school oversight
- Staff management
- Strategic decisions

### Director of Studies
- Academic management
- Curriculum oversight
- Teacher coordination

### Director of Discipline
- Student conduct
- Attendance monitoring
- Disciplinary actions

### Teacher
- Class management
- Grade submission
- Attendance marking

### Student
- View grades
- View timetable
- View attendance

### Parent
- View children's performance
- Communication with teachers
- Fee payment tracking

### Accountant
- Financial management
- Fee collection
- Financial reporting

### Stock Manager
- Inventory management
- Stock tracking
- Purchase orders

## Query Parameters

### Common Filters
- `trade` - Filter by trade (SOD, BDC, AUT, General)
- `level` - Filter by level (Level 3, Level 4, Level 5)
- `search` - Search by name, code, etc.
- `status` - Filter by status
- `limit` - Limit results
- `offset` - Pagination offset

### Date Filters
- `start_date` - Start date for range
- `end_date` - End date for range
- `date` - Specific date

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

### Main Tables
- `users` - All system users
- `academic_years` - Academic year management
- `trade_courses` - Trade-specific courses
- `subjects` - Subject definitions
- `classes` - Class management
- `enrollments` - Student-class relationships
- `exams` - Exam definitions
- `exam_registrations` - Student exam registrations
- `exam_results` - Exam results
- `grades` - Grade records
- `attendance` - Attendance records
- `timetable_entries` - Timetable management
- `fee_structures` - Fee definitions
- `fee_payments` - Payment records
- `stock_items` - Inventory items
- `stock_movements` - Stock transactions
- `messages` - User messages
- `notifications` - System notifications
- `sports_teams` - Sports teams
- `sports_events` - Sports events
- `sports_achievements` - Sports achievements
- `teams` - Management teams
- `parent_student_links` - Parent-student relationships

## Advanced Features

### 1. Conflict Detection
- Timetable conflict detection
- Room booking conflicts
- Teacher schedule conflicts

### 2. Analytics
- Student performance analytics
- Class performance comparison
- Attendance analytics
- Financial analytics

### 3. Bulk Operations
- Bulk grade submission
- Bulk attendance marking
- Bulk notifications

### 4. Real-time Features
- Notification system
- Messaging system
- Live updates

## Security Features
- JWT authentication
- Password hashing (bcrypt)
- Role-based access control
- Input validation
- SQL injection prevention
- XSS protection

## Performance Optimizations
- Database indexing
- Query optimization
- Connection pooling
- Caching strategies

## Error Handling
- Comprehensive error messages
- Logging system
- Error tracking
- Graceful degradation

## Testing
```bash
# Run tests
npm test

# Test specific endpoint
npm run test:endpoint
```

## Deployment
1. Set production environment variables
2. Run database migrations
3. Build and deploy
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure monitoring

## Support
For issues or questions, contact the development team.

## License
Proprietary - All rights reserved

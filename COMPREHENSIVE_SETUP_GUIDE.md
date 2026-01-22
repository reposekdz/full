# Garden TVET School Management System - Complete Setup Guide

## 🎓 Overview

A comprehensive, enterprise-grade school management system with advanced features including:
- ✅ Multi-role authentication (Students, Parents, Teachers, Directors, Admin)
- ✅ Advanced contact management with live chat
- ✅ Comprehensive support ticket system
- ✅ Full academic management (Courses, Assignments, Grades, Exams)
- ✅ Interactive academics page with course details
- ✅ Gamification system with points and badges
- ✅ AI-powered grading
- ✅ Adaptive learning paths
- ✅ Real-time analytics
- ✅ Profile editing with password management
- ✅ Unified staff credentials with customization

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.x
- MySQL >= 8.0
- npm or yarn

### Installation Steps

#### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd Powerfulschoolmanagementsystem

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

#### 2. Configure Database

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school_management
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=24h
NODE_ENV=development
PORT=5000
```

#### 3. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE school_management;
exit;
```

#### 4. Run Comprehensive Setup

```bash
cd backend
node scripts/setup-comprehensive-system.js
```

This script will:
- ✅ Create all database tables
- ✅ Set up user roles
- ✅ Create default staff accounts
- ✅ Initialize trade programs (SOD, BDC, AUT)
- ✅ Set up academic year
- ✅ Populate knowledge base
- ✅ Create upload directories

#### 5. Start the Application

```bash
# Terminal 1: Start backend server
cd backend
npm start

# Terminal 2: Start frontend
cd ..
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔐 Default Login Credentials

### Unified Staff Credentials
**All staff roles use the same default credentials:**

```
Email: reponse@gmail.com
Password: 2026
```

### Available Staff Roles:
1. **Teacher** - Manage courses, assignments, and grades
2. **Director of Study (DOS)** - Academic oversight and curriculum management
3. **Director of Discipline (DOD)** - Student behavior and discipline
4. **Head Master** - Overall school administration
5. **Accountant** - Financial management
6. **Stock Manager** - Inventory and supplies
7. **Administrator** - System administration

### Changing Credentials
Staff members can change their email and password through:
1. Login with default credentials
2. Navigate to Dashboard
3. Click on Profile/Settings
4. Update email and/or password
5. Enter current password to confirm changes

## 📋 Features Overview

### 1. Contact Management
**Location:** Contact Us page

**Features:**
- Multi-department contact forms
- Priority levels (Low, Normal, High, Urgent)
- File attachments (up to 5MB)
- Callback request system
- Live chat support
- FAQ section with categories
- Office hours display
- Social media integration

**API Endpoints:**
- `POST /api/contact/submit` - Submit contact form
- `POST /api/contact/callback` - Request callback
- `POST /api/contact/chat/message` - Send chat message
- `GET /api/contact/submissions` - Get all submissions (Admin)

### 2. Support System
**Location:** Support page

**Features:**
- Ticket creation and tracking
- Priority and category management
- File attachments
- Response threading
- Knowledge base articles
- Article rating system
- Support statistics

**API Endpoints:**
- `POST /api/support/tickets` - Create ticket
- `GET /api/support/tickets` - Get user tickets
- `GET /api/support/tickets/:id` - Get ticket details
- `POST /api/support/tickets/:id/responses` - Add response
- `GET /api/support/knowledge-base` - Get articles

### 3. Academic Management
**Location:** Academics page

**Features:**
- Course catalog with filters
- Course details with materials
- Assignment submission
- Grade tracking and GPA calculation
- Exam schedule
- Timetable management
- Attendance tracking
- Learning resources library

**API Endpoints:**
- `GET /api/academics/courses` - Get all courses
- `GET /api/academics/my-courses` - Get student courses
- `GET /api/academics/assignments` - Get assignments
- `POST /api/academics/assignments/:id/submit` - Submit assignment
- `GET /api/academics/grades` - Get grades
- `GET /api/academics/exams` - Get exams
- `GET /api/academics/timetable` - Get timetable

### 4. Authentication & Profile
**Features:**
- Role-based login
- JWT token authentication
- Profile editing
- Password change with verification
- Email update
- Session management

**API Endpoints:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/register/parent` - Parent registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

## 🎨 UI Enhancements

### Header Updates
- Logo size increased by 20px (now 24px height)
- School name: "Garden TVET School" (removed "Garden" duplication)
- Improved responsive design
- Enhanced search functionality

### Contact Page
- Modern gradient design
- Interactive contact methods
- Live chat widget
- Callback scheduling
- FAQ accordion
- File upload with preview
- Status notifications

### Support Page
- Ticket management dashboard
- Knowledge base search
- Category filtering
- Priority indicators
- Response timeline
- Attachment support

### Academics Page
- Course cards with images
- Instructor profiles
- Progress tracking
- Material downloads
- Assignment deadlines
- Grade visualization
- Interactive timetable

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts
- `roles` - User roles
- `admin_users` - Admin accounts
- `trades` - Trade programs
- `trade_levels` - Program levels
- `academic_years` - Academic periods

### Contact & Support
- `contact_submissions` - Contact form submissions
- `callback_requests` - Callback requests
- `chat_messages` - Live chat messages
- `support_tickets` - Support tickets
- `ticket_responses` - Ticket responses
- `knowledge_base` - Help articles

### Academic
- `courses` - Course catalog
- `course_materials` - Course resources
- `assignments` - Assignments
- `assignment_submissions` - Student submissions
- `exams` - Exam schedule
- `grades` - Student grades
- `timetable` - Class schedule
- `attendance` - Attendance records

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school_management
DB_PORT=3306

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h

# Server
NODE_ENV=development
PORT=5000
```

### File Upload Limits
- Contact attachments: 5MB
- Assignment submissions: 10MB
- Ticket attachments: 5MB
- Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG

## 📱 API Documentation

### Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## 🧪 Testing

### Test Default Login
```bash
# Test staff login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reponse@gmail.com","password":"2026"}'
```

### Test Contact Submission
```bash
curl -X POST http://localhost:5000/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "phone":"0788123456",
    "department":"admissions",
    "subject":"Test",
    "message":"Test message",
    "priority":"normal"
  }'
```

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check user permissions
SHOW GRANTS FOR 'root'@'localhost';
```

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Module Not Found
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Advanced Features Guide](./ADVANCED_FEATURES_DOCUMENTATION.md)
- [Database Schema](./backend/scripts/comprehensive-features-schema.sql)

## 🤝 Support

For issues or questions:
- Email: support@gardentvet.rw
- Phone: +250 788 987 830
- Create a support ticket through the system

## 📄 License

Copyright © 2024 Garden TVET School. All rights reserved.

---

**Built with ❤️ for Garden TVET School**

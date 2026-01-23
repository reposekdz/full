# 🔐 AUTHENTICATION API DOCUMENTATION
## Garden TVET School Management System

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [API Endpoints](#api-endpoints)
4. [Authentication Flow](#authentication-flow)
5. [Testing](#testing)

---

## 🎯 Overview

This system provides comprehensive authentication and user management for:
- **Students** - Register, login, view grades, attendance, timetable
- **Parents** - Register with phone, login, monitor children's performance
- **Teachers** - Manage classes, grades, attendance
- **Admins** - Full system access and management

### Key Features
✅ JWT-based authentication (24-hour expiry)
✅ Role-based access control (RBAC)
✅ Secure password hashing (bcrypt)
✅ Parent-student linking
✅ Automatic student ID generation
✅ Trade-based enrollment system
✅ Complete database persistence

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` file in backend folder:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=development
```

### 3. Initialize Database
```bash
node scripts/init-auth-database.js
```

### 4. Start Server
```bash
npm start
```

Server will run on: `http://localhost:5000`

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

---

## 👤 STUDENT ENDPOINTS

### 1. Student Registration
**POST** `/auth/register/student`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "0788123456",
  "password": "securepass123",
  "date_of_birth": "2005-05-15",
  "gender": "Male",
  "trade_code": "SOD",
  "level_number": 4,
  "level_suffix": "A",
  "address": "Kigali, Rwanda",
  "emergency_contact": "0788999999",
  "medical_info": "No allergies",
  "parent_info": {
    "first_name": "Jane",
    "last_name": "Doe",
    "phone": "0788888888",
    "email": "jane.doe@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "2024SOD4A001",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "student_id": "2024SOD4A001",
    "role": "student"
  }
}
```

### 2. Student Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "john.doe@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "2024SOD4A001",
    "email": "john.doe@example.com",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe",
    "student_id": "2024SOD4A001",
    "user_type": "user"
  }
}
```

### 3. Get Student Dashboard
**GET** `/students/dashboard`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enrollments": [...],
    "recent_grades": [...],
    "attendance": {
      "total": 100,
      "present": 85,
      "absent": 10,
      "late": 5
    },
    "average_grade": 78.5
  }
}
```

### 4. Get Student Grades
**GET** `/students/grades`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "grades": [
    {
      "id": 1,
      "subject_name": "Mathematics",
      "obtained_marks": 85,
      "max_marks": 100,
      "assessment_date": "2024-01-15",
      "teacher_name": "John Teacher"
    }
  ]
}
```

---

## 👨‍👩‍👧 PARENT ENDPOINTS

### 1. Parent Registration (Phone-based)
**POST** `/auth/register/parent-phone`

**Request Body:**
```json
{
  "phone": "0788654321",
  "password": "parentpass123",
  "first_name": "Mary",
  "last_name": "Smith",
  "email": "mary.smith@example.com",
  "address": "Kigali, Rwanda"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Parent account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "parent_0788654321",
    "email": "mary.smith@example.com",
    "phone": "0788654321",
    "role": "parent",
    "first_name": "Mary",
    "last_name": "Smith",
    "user_type": "parent"
  }
}
```

### 2. Parent Login (Phone-based)
**POST** `/auth/login/parent`

**Request Body:**
```json
{
  "phone": "0788654321",
  "password": "parentpass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Parent login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "parent_0788654321",
    "email": "mary.smith@example.com",
    "phone": "0788654321",
    "role": "parent",
    "first_name": "Mary",
    "last_name": "Smith",
    "user_type": "parent",
    "linked_children": 2
  }
}
```

### 3. Get Parent's Children
**GET** `/parents/children`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "children": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "student_id": "2024SOD4A001",
      "class_name": "Software Development S4A",
      "average_grade": 78.5,
      "present_count": 85,
      "total_attendance": 100
    }
  ]
}
```

### 4. Link Child to Parent
**POST** `/parents/link-child`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "student_code": "2024SOD4A001",
  "relationship": "mother"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Child linked successfully"
}
```

### 5. Get Child Grades
**GET** `/parents/children/:childId/grades`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "grades": [...]
}
```

### 6. Get Child Attendance
**GET** `/parents/children/:childId/attendance`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "attendance": [...]
}
```

---

## 🔧 UTILITY ENDPOINTS

### 1. Get Available Trades
**GET** `/auth/registration/trades`

**Response:**
```json
{
  "success": true,
  "trades": [
    {
      "id": 1,
      "trade_code": "SOD",
      "trade_name": "Software Development",
      "level_number": 4,
      "level_suffix": "A",
      "full_name": "Software Development S4A",
      "description": "Learn modern software development",
      "capacity": 30,
      "class_count": 1,
      "total_students": 25
    }
  ]
}
```

### 2. Check Email Availability
**POST** `/auth/check-email`

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "available": true
}
```

### 3. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "2024SOD4A001",
    "email": "john.doe@example.com",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### 4. Update Profile
**PUT** `/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "phone": "0788111111",
  "address": "New Address"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {...}
}
```

### 5. Change Password
**PUT** `/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## 🔐 Authentication Flow

### Student Registration & Login Flow
```
1. Student fills registration form
2. POST /auth/register/student
3. System generates unique student_id (e.g., 2024SOD4A001)
4. Password is hashed with bcrypt
5. Student record created in database
6. JWT token generated and returned
7. Student can immediately login with email/password
8. Use token in Authorization header for protected routes
```

### Parent Registration & Login Flow
```
1. Parent fills registration form with phone number
2. POST /auth/register/parent-phone
3. System creates parent account
4. Password is hashed with bcrypt
5. JWT token generated and returned
6. Parent can login with phone/password
7. Parent can link children using student codes
8. Use token in Authorization header for protected routes
```

---

## 🧪 Testing

### Run Complete API Tests
```bash
cd backend
node test-complete-auth.js
```

### Manual Testing with cURL

**Student Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register/student \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@test.com",
    "phone": "0788123456",
    "password": "test123",
    "trade_code": "SOD",
    "level_number": 4,
    "level_suffix": "A"
  }'
```

**Student Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@test.com",
    "password": "test123"
  }'
```

**Parent Registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register/parent-phone \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0788654321",
    "password": "parent123",
    "first_name": "Mary",
    "last_name": "Smith"
  }'
```

---

## 📊 Database Schema

### Key Tables
- **users** - All users (students, parents, teachers)
- **admin_users** - Admin accounts (separate for security)
- **roles** - User roles and permissions
- **parent_student** - Parent-child relationships
- **trade_levels** - Available trades and levels
- **trade_classes** - Classes for each trade level
- **enrollments** - Student enrollments
- **grades** - Student grades
- **attendance** - Attendance records
- **payments** - Fee payments

---

## 🔒 Security Features

✅ **Password Hashing** - bcrypt with salt rounds
✅ **JWT Authentication** - Secure token-based auth
✅ **Role-Based Access** - RBAC for all endpoints
✅ **Input Validation** - express-validator
✅ **SQL Injection Protection** - Parameterized queries
✅ **CORS Enabled** - Cross-origin resource sharing
✅ **Error Handling** - Comprehensive error responses

---

## 📞 Support

For issues or questions:
- Check server logs in `backend/server.log`
- Review API responses for error messages
- Ensure database is properly initialized
- Verify .env configuration

---

## 🎉 Demo Accounts

After running `init-auth-database.js`:

**Admin:**
- Email: admin@gardentvet.com
- Password: admin123

**Student:**
- Email: student@gardentvet.com
- Password: student123

**Parent:**
- Phone: 0788654321
- Password: parent123

---

**Last Updated:** 2024
**Version:** 4.0.0
**Status:** ✅ Production Ready

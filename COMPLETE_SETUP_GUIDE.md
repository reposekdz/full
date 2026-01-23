# 🚀 COMPLETE SETUP GUIDE
## Garden TVET School Management System - Full Stack Application

---

## 📦 Installation & Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

### 2. Database Initialization

```bash
# Initialize complete database with all tables
node scripts/init-auth-database.js
```

### 3. Start Backend Server

```bash
npm start
```

Server runs on: `http://localhost:5000`

### 4. Frontend Setup

```bash
# From root directory
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🎯 FEATURES IMPLEMENTED

### ✅ Authentication System
- Student Registration & Login
- Parent Registration & Login (Phone-based)
- Teacher & Admin Login
- JWT Token Authentication
- Role-Based Access Control

### ✅ Admin Management System
- **Student Management**: Full CRUD operations
- **Teacher Management**: Add, edit, view teachers
- **Class Management**: Create and manage classes
- **Grade Management**: Record and track grades
- **Attendance Management**: Mark and monitor attendance
- **Dashboard Statistics**: Real-time analytics

### ✅ Trade Pages
- Interactive trade showcase
- Full-page trade details
- Modern image galleries
- Tools & technology display
- Career paths information
- Instructor profiles
- Workshop information

### ✅ Database Integration
- All data stored in MySQL database
- Real-time data synchronization
- Secure API endpoints
- Transaction support

---

## 🔌 API ENDPOINTS

### Authentication APIs

#### Student Registration
```
POST /api/auth/register/student
Body: {
  first_name, last_name, email, phone, password,
  trade_code, level_number, level_suffix
}
```

#### Parent Registration
```
POST /api/auth/register/parent-phone
Body: {
  phone, password, first_name, last_name, email
}
```

#### Login
```
POST /api/auth/login
Body: { username, password }
```

#### Parent Login
```
POST /api/auth/login/parent
Body: { phone, password }
```

### Admin Management APIs

#### Get Students
```
GET /api/admin/students?search=&trade_code=&level=&page=1
Headers: { Authorization: Bearer <token> }
```

#### Create Student
```
POST /api/admin/students
Headers: { Authorization: Bearer <token> }
Body: { first_name, last_name, email, phone, password, trade_code, level_number }
```

#### Update Student
```
PUT /api/admin/students/:id
Headers: { Authorization: Bearer <token> }
Body: { first_name, last_name, email, phone, address, is_active }
```

#### Delete Student
```
DELETE /api/admin/students/:id
Headers: { Authorization: Bearer <token> }
```

#### Get Teachers
```
GET /api/admin/teachers
Headers: { Authorization: Bearer <token> }
```

#### Create Teacher
```
POST /api/admin/teachers
Headers: { Authorization: Bearer <token> }
Body: { first_name, last_name, email, phone, password, specialization }
```

#### Get Classes
```
GET /api/admin/classes
Headers: { Authorization: Bearer <token> }
```

#### Create Class
```
POST /api/admin/classes
Headers: { Authorization: Bearer <token> }
Body: { trade_level_id, academic_year_id, class_name, capacity, teacher_id }
```

#### Get Grades
```
GET /api/admin/grades?student_id=&class_id=&subject_id=
Headers: { Authorization: Bearer <token> }
```

#### Create Grade
```
POST /api/admin/grades
Headers: { Authorization: Bearer <token> }
Body: {
  student_id, subject_id, class_id, assessment_type,
  assessment_name, obtained_marks, max_marks, assessment_date, remarks
}
```

#### Get Attendance
```
GET /api/admin/attendance?student_id=&class_id=&date_from=&date_to=
Headers: { Authorization: Bearer <token> }
```

#### Mark Attendance
```
POST /api/admin/attendance
Headers: { Authorization: Bearer <token> }
Body: { student_id, subject_id, class_id, attendance_date, status, remarks }
```

#### Dashboard Statistics
```
GET /api/admin/dashboard/stats
Headers: { Authorization: Bearer <token> }
```

---

## 🎨 ADMIN PAGES

### Navigation Structure

```
Admin Dashboard
├── Students Management (/admin/students)
├── Teachers Management (/admin/teachers)
├── Classes Management (/admin/classes)
├── Grades Management (/admin/grades)
├── Attendance Management (/admin/attendance)
├── Reports & Analytics
├── Settings
└── User Management
```

### Page Features

#### Student Management
- Search and filter students
- Add new students
- Edit student information
- View student details
- Export to CSV
- Pagination support
- Real-time statistics

#### Teacher Management
- View all teachers
- Add new teachers
- Assign classes
- Track performance
- Contact information

#### Class Management
- Create classes
- Assign teachers
- Manage capacity
- Track enrollment
- View class details

#### Grade Management
- Record grades
- Multiple assessment types
- Grade analytics
- Performance tracking
- Export reports

#### Attendance Management
- Mark attendance
- View attendance records
- Generate reports
- Track patterns
- Export data

---

## 🗄️ DATABASE SCHEMA

### Key Tables

```sql
users - All users (students, parents, teachers)
admin_users - Admin accounts
roles - User roles
parent_student - Parent-child relationships
trade_levels - Available trades
trade_classes - Classes
enrollments - Student enrollments
grades - Student grades
attendance - Attendance records
subjects - Subjects/courses
academic_years - Academic years
payments - Fee payments
```

---

## 🔐 SECURITY FEATURES

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ SQL injection protection
- ✅ Input validation
- ✅ CORS enabled
- ✅ Secure API endpoints

---

## 📱 FRONTEND ROUTES

```
/ - Home Page
/trades - Trades Showcase
/trade-sod - Software Development Details
/trade-bdc - Building Construction Details
/trade-aut - Automobile Technology Details
/login - Login Page
/register - Registration Page
/admin/students - Student Management
/admin/teachers - Teacher Management
/admin/classes - Class Management
/admin/grades - Grade Management
/admin/attendance - Attendance Management
```

---

## 🧪 TESTING

### Test Authentication
```bash
cd backend
node test-complete-auth.js
```

### Manual Testing

1. **Register Student**
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

2. **Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@test.com",
    "password": "test123"
  }'
```

3. **Get Students (Admin)**
```bash
curl -X GET http://localhost:5000/api/admin/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 DEMO ACCOUNTS

After running database initialization:

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

## 🚀 DEPLOYMENT

### Production Build

```bash
# Frontend
npm run build

# Backend
npm start
```

### Environment Variables

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_management
JWT_SECRET=your_secret_key
JWT_EXPIRE=24h
PORT=5000
NODE_ENV=production
```

---

## 📞 SUPPORT

For issues:
1. Check server logs
2. Verify database connection
3. Ensure all dependencies installed
4. Check API responses
5. Review browser console

---

## ✨ KEY FEATURES

### For Students
- ✅ Easy registration
- ✅ View grades
- ✅ Check attendance
- ✅ Access timetable
- ✅ View performance

### For Parents
- ✅ Phone-based login
- ✅ Monitor children
- ✅ View grades
- ✅ Track attendance
- ✅ Receive updates

### For Teachers
- ✅ Manage classes
- ✅ Record grades
- ✅ Mark attendance
- ✅ View students
- ✅ Generate reports

### For Admins
- ✅ Full system control
- ✅ User management
- ✅ Data analytics
- ✅ Report generation
- ✅ System configuration

---

**Version:** 4.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** 2024

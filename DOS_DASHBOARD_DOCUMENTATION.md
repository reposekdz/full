# Garden TVET School - Director of Studies (DOS) Management System

## 📋 Overview

The **Director of Studies (DOS) Management System** is a comprehensive academic management portal designed for Garden TVET School. It provides full functionality for managing students, teachers, examinations, timetables, report cards, and SMS notifications.

---

## 🎓 Garden TVET Branding

- **School Name**: Garden TVET School
- **Role**: Umuyobozi w'Amasomo (Director of Studies)
- **System**: Comprehensive academic management and reporting

---

## ✨ Features

### 1. **Dashboard Overview**
- Real-time statistics:
  - Total Students
  - Total Teachers
  - Active Timetables
  - Reports Generated
  - Average GPA
  - Attendance Rate
  - Active Classes
  - Pending Exams
- Interactive charts (Bar, Pie, Line, Area)
- Performance analytics

### 2. **Student Management**
- View all students with search & filters
- Add new students with guardian information
- Track GPA and attendance
- Export student data

### 3. **Teacher Management**
- View all teachers with specializations
- Add new teachers
- Track class assignments
- Contact information management

### 4. **Examination Management**
- Schedule new exams
- View scheduled exams
- Track exam status (scheduled, in_progress, completed)
- Set exam duration and room

### 5. **Timetable Management**
- Visual timetable by day and period
- Edit periods and subjects
- Assign teachers to classes
- Track room assignments

### 6. **Report Cards**
- Generate report cards from marks
- Publish/unpublish reports
- Export reports to JSON/CSV
- View student performance

### 7. **SMS Notifications**
- Send bulk SMS to:
  - All students & parents
  - Students only
  - Parents only
  - Teachers only
  - Specific classes
- Track SMS delivery status

### 8. **Analytics**
- Performance trends by level
- Trade comparison
- Monthly enrollment trends
- Attendance analytics

---

## 🔧 API Endpoints

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dos-dashboard/dashboard/stats` | Get dashboard statistics |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dos-dashboard/students` | Get all students |
| POST | `/api/dos-dashboard/students/add` | Add new student |

### Teachers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dos-dashboard/teachers` | Get all teachers |
| POST | `/api/dos-dashboard/teachers/add` | Add new teacher |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dos-dashboard/exams` | Get all exams |
| POST | `/api/dos-dashboard/exams/schedule` | Schedule new exam |

### Timetables
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dos-dashboard/timetables` | Get all timetables |

### Report Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dos-dashboard/report-cards` | Get all report cards |
| PUT | `/api/dos-dashboard/report-cards/:id/publish` | Publish report card |

### SMS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dos-dashboard/sms/notifications` | Get SMS history |
| POST | `/api/dos-dashboard/sms/send` | Send SMS notification |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dos-dashboard/analytics/performance` | Get performance analytics |

---

## 🚀 Setup Instructions

### 1. Database Migration
Run the DOS Dashboard migration to create necessary tables:

```bash
# Windows
run-dos-dashboard-migration.bat

# Manual
cd backend
node run-dos-dashboard-migration.js
```

### 2. Start the Backend Server
```bash
cd backend
npm start
# or
node server.js
```

### 3. Start the Frontend Development Server
```bash
npm start
# or
cd src
npm start
```

### 4. Test API Endpoints
```bash
node backend/scripts/dos-dashboard-api-tester.js
```

---

## 📁 File Structure

```
backend/
├── routes/
│   ├── dos-dashboard-api.js      # Main DOS Dashboard API routes
│   └── dos-management.js         # Legacy DOS management routes
├── migrations/
│   └── dos-dashboard-tables.sql  # Database migration script
├── scripts/
│   └── dos-dashboard-api-tester.js # API tester script
└── server.js                      # Main server with route registration

src/app/pages/dashboards/
└── DOSDashboardUltraAdvanced.tsx  # Main DOS Dashboard frontend

run-dos-dashboard-migration.bat     # Windows migration runner
```

---

## 🔐 Authentication

All DOS Dashboard endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Required roles: `dos`, `director_study`, `admin`, `headmaster`

---

## 📊 Database Tables Created

1. **sms_notifications** - SMS notification history
2. **report_cards** - Student report cards
3. **report_card_marks** - Marks for each report card
4. **timetables** - Class timetables
5. **exams** - Examination schedules
6. **teacher_curriculum_progress** - Teacher curriculum tracking

---

## 🎨 UI Components

The DOS Dashboard uses:
- **Material-UI (MUI)** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React** - Frontend framework

---

## 📝 License

This is part of the Garden TVET School Management System.

---

## 👨‍💼 Support

For support, contact the Garden TVET IT Department.

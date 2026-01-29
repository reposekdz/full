# COMPREHENSIVE TEACHER & STAFF MANAGEMENT SYSTEM

## Global Trades and Levels Configuration

### Available Trades (As per your system):
1. **SOD** - Level 3, Level 4, Level 5
2. **BDC** - Level 3, Level 4, Level 5  
3. **AUT** - Level 3, Level 4 A, Level 4 B, Level 5 A, Level 5 B

These are the ONLY trades and levels that will be used throughout the entire system.

## Implementation Status

### ✅ COMPLETED FEATURES

#### 1. Database Integration
- All trades and levels fetch from database
- UniversalStudentManagement component updated
- API endpoints created for levels and trades
- Backend routes configured

#### 2. Teacher Dashboard Features
- **Profile Management**: Edit profile, upload photo, change password
- **Class Management**: View all assigned classes with statistics
- **Student Management**: View students by class/level/trade
- **Grades Management**: Add marks, view grades, auto-calculations
- **Attendance Tracking**: Mark attendance, view reports
- **Assignment Management**: Create, view, grade assignments
- **Class Sheets**: Dynamic sheets with custom columns
- **Resource Management**: Upload PDFs, learning materials
- **Exam Management**: Create exams, view submissions

#### 3. Staff Management (All Roles)
- Admin, DOS, DOD, Accountant, Teacher, Advisor
- All use same database for trades/levels
- Consistent data across all roles
- Role-based permissions

### 🔧 FEATURES TO IMPLEMENT

#### 1. Profile Edit System
**Location**: `src/app/components/ProfileEditDialog.tsx`

**Features**:
- Upload profile photo
- Edit personal information
- Change password
- Update contact details
- Save preferences

#### 2. Exam Creation with PDF Upload
**Location**: `src/app/pages/teacher/TeacherCreateAssignment.tsx`

**Features**:
- Create exam with title, description
- Upload PDF question paper
- Set due date and total marks
- Assign to specific class/level/trade
- Publish or save as draft

#### 3. View Submitted Works
**Location**: `src/app/pages/teacher/TeacherSubmissions.tsx`

**Features**:
- View all submissions by class
- Filter by trade/level
- Download submitted files
- Grade submissions
- Provide feedback

#### 4. Dynamic Mark Sheets
**Location**: `src/app/components/admin/ClassLevelSheetsDashboard.tsx`

**Features**:
- Add custom columns for any subject
- Enter marks for students
- Auto-calculate totals and averages
- Export to CSV/PDF
- Print class sheets
- Filter by trade/level

#### 5. Trade Management (Headmaster/DOS Only)
**Location**: `src/app/pages/admin/TradeManagement.tsx`

**Features**:
- Add new trades
- Delete existing trades
- Add/remove levels for trades
- Set trade descriptions
- Manage trade fees

## Database Schema

### Required Tables

```sql
-- Trades (Courses)
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(10) UNIQUE NOT NULL,  -- SOD, BDC, AUT
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_months INT DEFAULT 36,
  fee_amount DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Levels for each trade
CREATE TABLE trades_levels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,  -- 3, 4, 5
  level_suffix VARCHAR(5),    -- A, B (for AUT Level 4/5)
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  UNIQUE KEY (trade_code, level_number, level_suffix)
);

-- Classes (Combination of trade + level)
CREATE TABLE classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_name VARCHAR(50) NOT NULL,  -- SOD-3, AUT-4A, etc.
  trade_code VARCHAR(10) NOT NULL,
  level_number INT NOT NULL,
  level_suffix VARCHAR(5),
  teacher_id INT,
  academic_year VARCHAR(20),
  is_active BOOLEAN DEFAULT true
);

-- Student Enrollments
CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  trade_code VARCHAR(10),
  level_number INT,
  level_suffix VARCHAR(5),
  enrollment_date DATE,
  status ENUM('active', 'completed', 'dropped') DEFAULT 'active'
);

-- Assignments/Exams
CREATE TABLE assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  teacher_id INT NOT NULL,
  class_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  pdf_url VARCHAR(500),  -- Uploaded PDF
  due_date DATE,
  total_marks INT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions
CREATE TABLE assignment_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  submission_file VARCHAR(500),  -- Uploaded file
  submitted_at TIMESTAMP,
  marks_obtained INT,
  feedback TEXT,
  graded_at TIMESTAMP,
  graded_by INT
);

-- Dynamic Mark Sheets
CREATE TABLE class_sheet_columns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  column_name VARCHAR(100) NOT NULL,  -- Subject name
  column_type ENUM('marks', 'text', 'number') DEFAULT 'marks',
  max_marks INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE class_sheet_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_id INT NOT NULL,
  student_id INT NOT NULL,
  column_id INT NOT NULL,
  value VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

### Trades & Levels
```
GET  /api/levels/trades-with-levels  - Get all trades with levels
GET  /api/levels/levels              - Get all levels
GET  /api/levels/trades/:code/levels - Get levels for specific trade
POST /api/trades                     - Add new trade (DOS/Headmaster only)
DELETE /api/trades/:id               - Delete trade (DOS/Headmaster only)
```

### Assignments & Exams
```
GET  /api/assignments/teacher/:id    - Get teacher's assignments
POST /api/assignments                - Create assignment with PDF
GET  /api/assignments/:id/submissions - Get submissions
POST /api/assignments/:id/grade      - Grade submission
```

### Class Sheets
```
GET  /api/class-sheets/:classId      - Get class sheet
POST /api/class-sheets/column        - Add custom column
POST /api/class-sheets/data          - Save marks data
GET  /api/class-sheets/export/:classId - Export to CSV/PDF
```

### Profile Management
```
GET  /api/users/profile              - Get user profile
PUT  /api/users/profile              - Update profile
POST /api/users/profile/photo        - Upload photo
PUT  /api/users/change-password      - Change password
```

## Setup Instructions

### 1. Initialize Database
```bash
cd backend
node setup-trades-levels.js
```

This will create:
- SOD with levels 3, 4, 5
- BDC with levels 3, 4, 5
- AUT with levels 3, 4A, 4B, 5A, 5B

### 2. Start Backend Server
```bash
cd backend
npm start
```

### 3. Start Frontend
```bash
npm run dev
```

### 4. Test Features

**As Teacher:**
1. Login with teacher credentials
2. Navigate to Dashboard
3. View assigned classes
4. Create assignment with PDF upload
5. View student submissions
6. Grade submissions
7. Add marks to class sheets
8. Export reports

**As DOS/Headmaster:**
1. Login with DOS credentials
2. Navigate to Trade Management
3. Add/delete trades
4. Manage levels
5. Assign teachers to classes

## Auto-Calculations

### Grade Calculations
```javascript
// Average grade per student
average = SUM(marks_obtained) / SUM(total_marks) * 100

// Class average
class_average = SUM(all_student_averages) / total_students

// Pass rate
pass_rate = (students_with_avg >= 50) / total_students * 100
```

### Attendance Calculations
```javascript
// Attendance rate
attendance_rate = present_count / total_sessions * 100

// Class attendance
class_attendance = SUM(all_present) / (total_students * total_sessions) * 100
```

## File Upload Configuration

### Supported File Types
- **Assignments**: PDF, DOC, DOCX
- **Submissions**: PDF, DOC, DOCX, ZIP
- **Profile Photos**: JPG, PNG, GIF
- **Resources**: PDF, PPT, PPTX, DOC, DOCX

### Upload Limits
- Max file size: 50MB
- Max files per upload: 5
- Storage location: `backend/uploads/`

## Security Features

### Role-Based Access Control
```javascript
// Teacher can:
- View own classes
- Create assignments
- Grade submissions
- View own students
- Edit own profile

// DOS/Headmaster can:
- All teacher permissions
- Manage trades
- Assign teachers
- View all classes
- Manage system settings

// Admin can:
- All permissions
- User management
- System configuration
```

### Data Validation
- All inputs sanitized
- SQL injection prevention
- XSS protection
- File type validation
- Size limit enforcement

## Performance Optimization

### Caching
- Trade/level data cached for 1 hour
- Class lists cached for 30 minutes
- Student data cached for 15 minutes

### Database Indexing
```sql
CREATE INDEX idx_trade_code ON courses(code);
CREATE INDEX idx_class_trade ON classes(trade_code, level_number);
CREATE INDEX idx_enrollment_student ON enrollments(student_id);
CREATE INDEX idx_assignment_teacher ON assignments(teacher_id);
```

## Troubleshooting

### Issue: Trades not showing
**Solution**: Run `node backend/setup-trades-levels.js`

### Issue: Cannot upload files
**Solution**: Check `backend/uploads/` directory permissions

### Issue: Marks not calculating
**Solution**: Verify `class_sheet_columns` has max_marks set

### Issue: Students not appearing
**Solution**: Check enrollments table for active status

## Future Enhancements

1. **Mobile App**: React Native version
2. **Real-time Updates**: WebSocket integration
3. **AI Grading**: Automatic essay grading
4. **Video Lessons**: Integrated video player
5. **Parent Portal**: Parent access to student data
6. **SMS Notifications**: Automated SMS alerts
7. **Biometric Attendance**: Fingerprint integration
8. **Online Exams**: Browser-based exam system

## Support

For issues or questions:
- Check logs: `backend/server.log`
- Database errors: Check MySQL error log
- Frontend errors: Browser console
- API errors: Network tab in DevTools

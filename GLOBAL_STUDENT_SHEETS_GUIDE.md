# 🎓 GLOBAL STUDENT SHEETS SYSTEM

## Overview
A **comprehensive, role-based student management system** where all roles access the same global student sheets with different permissions and can create custom columns based on their role.

## ✨ Key Features

### 🌐 Global Access
- **Single Source of Truth**: All students in one global sheet
- **Trade & Level Based**: Organized by trades and levels
- **Role-Based Access**: Different permissions for different roles
- **Real-Time Updates**: Auto-calculated scores and statistics

### 📊 Core Functionality

#### 1. Academic Performance
- Subject-wise marks (Quiz, Midterm, Final)
- Auto-calculated grades and GPA
- Term-wise performance tracking
- Class ranking

#### 2. Attendance Management
- Daily attendance marking
- Monthly/yearly summaries
- Auto-calculated attendance rates
- Multiple status types (present, absent, late, excused, sick)

#### 3. Discipline Tracking
- Incident recording with severity levels
- Auto-calculated conduct scores
- Category-based tracking
- Parent notification system

#### 4. Finance Management
- Payment recording
- Multiple payment types
- Auto-calculated balances
- Payment status tracking

#### 5. Custom Columns
- **Role-Based Creation**: Each role can create their own columns
- **Flexible Types**: text, number, date, boolean, select, textarea, calculated
- **Access Control**: Define who can view and edit
- **Scope Options**: global, trade, level, class

### 👥 Role-Based Functionality

#### Teacher
- Mark attendance
- Enter subject marks
- View student performance
- Create custom columns for their subjects
- Add remarks

#### Director of Studies (DOS)
- View all students
- Manage discipline records
- Generate term reports
- Create custom columns for academic tracking
- Add DOS comments

#### Director of Discipline (DOD)
- Manage discipline incidents
- Track conduct scores
- View discipline history
- Create custom columns for behavior tracking
- Parent notifications

#### Accountant
- Record payments
- Track fee status
- Generate financial reports
- Create custom columns for payment tracking
- View payment history

#### Admin
- Full access to all features
- Create global custom columns
- Manage all student data
- Generate comprehensive reports
- System configuration

## 🚀 Setup

### 1. Run Setup Script
```bash
setup-global-student-sheets.bat
```

### 2. Verify Installation
- Check database tables created
- Verify existing students migrated
- Confirm default custom columns created

## 📡 API Endpoints

### Base URL: `/api/global-sheets`

### Students

#### Get All Students
```http
GET /api/global-sheets/students
Query Params: trade_code, level_number, status, academic_year
```

#### Get Single Student
```http
GET /api/global-sheets/students/:studentId
```

#### Create/Update Student Sheet
```http
POST /api/global-sheets/students
Body: {
  student_id, student_code, first_name, last_name, email, phone,
  gender, date_of_birth, trade_code, trade_name, level_number,
  level_suffix, class_name, academic_year
}
```

### Academic Performance

#### Add/Update Marks
```http
POST /api/global-sheets/students/:studentId/marks
Body: {
  subject_code, subject_name, term, academic_year,
  quiz_marks, midterm_marks, final_marks, remarks
}
```

### Attendance

#### Mark Attendance
```http
POST /api/global-sheets/students/:studentId/attendance
Body: {
  attendance_date, status, subject, period, remarks
}
```

### Discipline

#### Add Discipline Record
```http
POST /api/global-sheets/students/:studentId/discipline
Body: {
  incident_date, incident_type, severity, category,
  description, location, witnesses, action_taken,
  punishment, punishment_start, punishment_end
}
```

### Finance

#### Add Payment
```http
POST /api/global-sheets/students/:studentId/payments
Body: {
  payment_date, payment_type, amount, payment_method,
  receipt_number, reference_number, term, academic_year,
  description, notes
}
```

### Custom Columns

#### Create Custom Column
```http
POST /api/global-sheets/custom-columns
Body: {
  column_name, column_label, column_type,
  select_options, calculation_formula,
  visible_to_roles, editable_by_roles,
  scope, scope_value, display_order, is_required
}
```

#### Get Custom Columns
```http
GET /api/global-sheets/custom-columns
Query Params: scope, scope_value
```

#### Set Custom Value
```http
POST /api/global-sheets/students/:studentId/custom-values
Body: {
  column_id, value_text, value_number, value_date, value_boolean
}
```

### Reports

#### Generate Term Report
```http
POST /api/global-sheets/students/:studentId/generate-report
Body: {
  term, academic_year, class_teacher_comment,
  dos_comment, principal_comment
}
```

### Analytics

#### Get Analytics
```http
GET /api/global-sheets/analytics
Query Params: trade_code, level_number, academic_year
```

## 🎯 Usage Examples

### Example 1: Teacher Marks Entry
```javascript
// Teacher enters marks for a student
const response = await fetch('/api/global-sheets/students/123/marks', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    subject_code: 'MATH101',
    subject_name: 'Mathematics',
    term: 'Term 1',
    academic_year: '2024',
    quiz_marks: 18,
    midterm_marks: 25,
    final_marks: 45,
    remarks: 'Excellent performance'
  })
});
```

### Example 2: Create Custom Column
```javascript
// DOS creates a custom column for leadership tracking
const response = await fetch('/api/global-sheets/custom-columns', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    column_name: 'leadership_position',
    column_label: 'Leadership Position',
    column_type: 'select',
    select_options: ['None', 'Class Monitor', 'Prefect', 'Head Boy/Girl'],
    visible_to_roles: ['teacher', 'dos', 'admin'],
    editable_by_roles: ['dos', 'admin'],
    scope: 'global',
    display_order: 1,
    is_required: false
  })
});
```

### Example 3: Mark Attendance
```javascript
// Teacher marks attendance for a student
const response = await fetch('/api/global-sheets/students/123/attendance', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    attendance_date: '2024-01-15',
    status: 'present',
    subject: 'Mathematics',
    period: 'Period 1',
    remarks: ''
  })
});
```

## 🔒 Security Features

- **Role-Based Access Control**: Each role has specific permissions
- **Audit Logging**: All actions are logged with user details
- **Data Validation**: Input validation on all endpoints
- **Authentication Required**: All endpoints require valid JWT token

## 📈 Auto-Calculations

### Academic Performance
- Total marks = Quiz + Midterm + Final
- Percentage = (Total / Max) × 100
- Grade = Based on percentage (A, B, C, D, F)
- GPA = Average of all grade points

### Attendance
- Attendance Rate = (Present Days / Total Days) × 100
- Monthly summaries auto-updated
- Overall statistics calculated

### Conduct Score
- Base Score = 100
- Deductions based on severity:
  - Critical: -20 points
  - High: -10 points
  - Medium: -5 points
  - Low: -2 points
- Conduct Grade = Based on final score

### Finance
- Total Paid = Sum of all confirmed payments
- Balance = Total Fees - Total Paid
- Payment Status = paid/partial/unpaid

## 🎨 Custom Column Types

### 1. Text
Simple text input field

### 2. Number
Numeric input with validation

### 3. Date
Date picker

### 4. Boolean
Checkbox (true/false)

### 5. Select
Dropdown with predefined options

### 6. Textarea
Multi-line text input

### 7. Calculated
Auto-calculated based on formula

## 📊 Database Tables

1. **global_student_sheets** - Master student records
2. **student_subject_performance** - Academic marks
3. **student_attendance_records** - Daily attendance
4. **student_attendance_summary** - Monthly/yearly summaries
5. **student_discipline_records** - Discipline incidents
6. **student_conduct_tracking** - Conduct scores
7. **student_payment_records** - Payment transactions
8. **student_sheet_custom_columns** - Custom column definitions
9. **student_sheet_custom_values** - Custom column values
10. **student_term_reports** - Generated reports
11. **student_sheet_access_log** - Audit trail

## 🚀 Benefits

### For Teachers
- Easy marks entry
- Quick attendance marking
- View student progress
- Create subject-specific columns

### For DOS
- Comprehensive academic overview
- Generate term reports
- Track overall performance
- Manage academic policies

### For DOD
- Discipline management
- Conduct tracking
- Parent communication
- Behavior analysis

### For Accountant
- Payment tracking
- Fee management
- Financial reports
- Payment reminders

### For Admin
- Complete system control
- Global configurations
- Comprehensive reports
- System analytics

## 📝 Best Practices

1. **Regular Updates**: Update marks and attendance regularly
2. **Custom Columns**: Create meaningful custom columns for your needs
3. **Reports**: Generate term reports at end of each term
4. **Audit**: Review access logs periodically
5. **Backups**: Regular database backups recommended

## 🔧 Maintenance

### Update Student Data
```sql
UPDATE global_student_sheets 
SET trade_code = 'NEW_CODE', level_number = 2 
WHERE student_id = 123;
```

### Recalculate Statistics
Run the setup script again to recalculate all statistics.

### Archive Old Data
```sql
UPDATE global_student_sheets 
SET enrollment_status = 'graduated' 
WHERE academic_year < '2023';
```

## 📞 Support

For issues or questions:
- Check API documentation
- Review error logs
- Contact system administrator

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ Production Ready

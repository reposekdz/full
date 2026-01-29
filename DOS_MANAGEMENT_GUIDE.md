# 📚 DOS COMPREHENSIVE MANAGEMENT SYSTEM

## Overview
Complete Director of Studies (DOS) management system with teacher assignments, timetable generation, report cards with PDF download, SMS notifications to parents, and powerful analytics.

## ✨ Features

### 1. 👨‍🏫 Teacher Management
- **Class Assignments**: Assign teachers to classes (class teacher, subject teacher, assistant)
- **Course Assignments**: Assign teachers to specific subjects for trades/levels
- **View Assignments**: See all teacher assignments by teacher or by class
- **Real Management**: No mock data, full database integration

### 2. 📅 Timetable Generation
- **Manual Creation**: Create timetables slot by slot
- **Auto-Generation**: Automatically generate timetables based on course assignments
- **Smart Scheduling**: Distributes subjects across days and periods
- **Teacher Tracking**: Links teachers to their scheduled slots
- **Room Assignment**: Assign rooms to classes

### 3. 📄 Report Card Generation
- **Single Generation**: Generate report for individual student
- **Bulk Generation**: Generate reports for entire class/trade/level
- **PDF Download**: Download professional PDF report cards
- **Comprehensive Data**: Includes marks, attendance, conduct, comments
- **Class Ranking**: Auto-calculated ranks within class
- **Real Data**: Fetches from global_student_sheets and related tables

### 4. 📱 SMS to Parents
- **No Smartphone Required**: Works with basic phones
- **Report Notifications**: Auto-send report summaries to parents
- **Custom Messages**: Send discipline, attendance, fee reminders
- **Delivery Tracking**: Track SMS status (sent, delivered, failed)
- **Cost Tracking**: Monitor SMS costs
- **Multiple Parents**: Send to all linked parents

### 5. 📊 Powerful Analytics
- **Comprehensive Stats**: Overall performance, attendance, conduct
- **Grade Distribution**: Visual breakdown of grades
- **Top Performers**: Identify best students
- **Subject Performance**: Average performance per subject
- **Attendance Trends**: Monthly attendance patterns
- **Teacher Performance**: Track teacher effectiveness
- **Cached Results**: Fast analytics with 1-hour cache

## 🚀 Setup

```bash
setup-dos-management.bat
```

## 📡 API Endpoints

### Base URL: `/api/dos-management`

### Teacher Assignments

#### Assign Teacher to Class
```http
POST /api/dos-management/assign-teacher-class
Body: {
  teacher_id, teacher_name, trade_code, level_number,
  class_name, role, academic_year
}
```

#### Assign Teacher to Course
```http
POST /api/dos-management/assign-teacher-course
Body: {
  teacher_id, teacher_name, subject_code, subject_name,
  trade_code, level_number, academic_year
}
```

#### Get Teacher Assignments
```http
GET /api/dos-management/teacher-assignments/:teacherId
```

#### Get Class Assignments
```http
GET /api/dos-management/class-assignments/:tradeCode/:levelNumber
```

### Timetables

#### Create Timetable
```http
POST /api/dos-management/timetables
Body: {
  timetable_name, trade_code, level_number,
  academic_year, term, start_date, end_date
}
```

#### Add Timetable Slot
```http
POST /api/dos-management/timetables/:id/slots
Body: {
  day_of_week, period_number, start_time, end_time,
  subject_code, subject_name, teacher_id, teacher_name,
  room, notes
}
```

#### Get Timetable
```http
GET /api/dos-management/timetables/:id
```

#### Get Timetables by Class
```http
GET /api/dos-management/timetables/class/:tradeCode/:levelNumber
```

#### Auto-Generate Timetable
```http
POST /api/dos-management/timetables/auto-generate
Body: {
  trade_code, level_number, academic_year, term
}
```

### Report Cards

#### Generate Single Report
```http
POST /api/dos-management/report-cards/generate/:studentId
Body: {
  term, academic_year,
  class_teacher_comment, dos_comment, principal_comment
}
```

#### Generate Bulk Reports
```http
POST /api/dos-management/report-cards/generate-bulk
Body: {
  trade_code, level_number, term, academic_year
}
```

#### Download PDF Report
```http
GET /api/dos-management/report-cards/:studentId/pdf?term=Term1&academic_year=2024
```

### SMS Notifications

#### Send SMS to Parent
```http
POST /api/dos-management/sms/send
Body: {
  student_id, parent_phone, message_type, message_content
}
```

#### Send Report Notification
```http
POST /api/dos-management/sms/send-report-notification/:studentId
Body: {
  term, academic_year
}
```

### Analytics

#### Get Comprehensive Analytics
```http
GET /api/dos-management/analytics/comprehensive
Query: trade_code, level_number, academic_year, term
```

#### Get Teacher Performance
```http
GET /api/dos-management/analytics/teacher-performance
Query: academic_year, term
```

## 💡 Usage Examples

### Example 1: Assign Teacher to Course
```javascript
const response = await fetch('/api/dos-management/assign-teacher-course', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    teacher_id: 5,
    teacher_name: 'John Doe',
    subject_code: 'MATH101',
    subject_name: 'Mathematics',
    trade_code: 'AUTO',
    level_number: 1,
    academic_year: '2024'
  })
});
```

### Example 2: Auto-Generate Timetable
```javascript
const response = await fetch('/api/dos-management/timetables/auto-generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trade_code: 'AUTO',
    level_number: 1,
    academic_year: '2024',
    term: 'Term 1'
  })
});
```

### Example 3: Generate Bulk Reports
```javascript
const response = await fetch('/api/dos-management/report-cards/generate-bulk', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trade_code: 'AUTO',
    level_number: 1,
    term: 'Term 1',
    academic_year: '2024'
  })
});
```

### Example 4: Send Report SMS to Parents
```javascript
const response = await fetch('/api/dos-management/sms/send-report-notification/123', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    term: 'Term 1',
    academic_year: '2024'
  })
});
```

### Example 5: Get Analytics
```javascript
const response = await fetch('/api/dos-management/analytics/comprehensive?trade_code=AUTO&level_number=1&academic_year=2024&term=Term1', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

## 📊 Report Card PDF Format

The generated PDF includes:
- School header
- Student information
- Academic performance (all subjects with marks and grades)
- Overall GPA and grade
- Class rank
- Attendance statistics
- Conduct score and grade
- Teacher comments
- DOS comments
- Principal comments

## 📱 SMS Format

Report card SMS example:
```
Dear Parent, John Doe's Term 1 report: GPA 3.5, Grade B, Rank 5/30. Attendance: 95%. Visit school for full report. - GARDEN TVET
```

## 🎯 Auto-Generated Timetable Logic

1. Fetches all course assignments for the class
2. Creates 6 periods per day (Monday-Friday)
3. Distributes subjects evenly across the week
4. Assigns teachers to their respective subjects
5. Includes break times (10:00-10:30, 12:30-14:00)

## 📈 Analytics Metrics

### Overall Stats
- Total students
- Average GPA
- Average attendance
- Average conduct score
- Payment statistics

### Grade Distribution
- Count per grade (A, B, C, D, F)

### Top Performers
- Top 10 students by GPA

### Subject Performance
- Average percentage per subject
- Student count per subject

### Attendance Trends
- Monthly attendance rates

### Teacher Performance
- Subjects taught
- Classes taught
- Average student performance
- Total marks entered

## 🔒 Security

- All endpoints require authentication
- Role-based access (DOS only)
- Audit logging for all actions
- SMS cost tracking

## 📁 Database Tables

1. `dos_teacher_class_assignments` - Teacher-class links
2. `dos_teacher_course_assignments` - Teacher-course links
3. `dos_timetables` - Timetable master records
4. `dos_timetable_slots` - Individual time slots
5. `dos_report_cards` - Generated report cards
6. `dos_parent_sms_notifications` - SMS history
7. `dos_analytics_cache` - Cached analytics
8. `dos_bulk_report_queue` - Bulk generation tracking

## 🎨 Integration with Global Sheets

All data is fetched from:
- `global_student_sheets` - Student master data
- `student_subject_performance` - Marks from teachers
- `student_attendance_summary` - Attendance data
- `student_conduct_tracking` - Conduct scores
- `parents` table - Parent contact info

## ⚡ Performance

- Analytics cached for 1 hour
- Bulk operations use queue system
- PDF generation is async
- SMS sending is batched

## 📝 Best Practices

1. **Assign Teachers First**: Before generating timetables
2. **Generate Reports End of Term**: After all marks entered
3. **Send SMS After Report Generation**: Notify parents immediately
4. **Review Analytics Weekly**: Track performance trends
5. **Cache Clearing**: Analytics auto-refresh hourly

## 🔧 Maintenance

### Clear Analytics Cache
```sql
DELETE FROM dos_analytics_cache WHERE expires_at < NOW();
```

### View SMS History
```sql
SELECT * FROM dos_parent_sms_notifications 
WHERE sent_at > DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### Check Bulk Report Status
```sql
SELECT * FROM dos_bulk_report_queue 
WHERE status='processing';
```

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**All Features**: Fully Functional  
**No Mock Data**: Real Database Integration

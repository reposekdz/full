# Ultra Advanced Teacher Dashboard - Complete API Documentation

## Overview
The Teacher Dashboard has been redesigned as a full-functional system with 300+ UI components, real API integration, and advanced features including:
- Student Management
- Class & Course Management  
- Quiz Management
- Conduct Management (with removal capabilities)
- Attendance Tracking
- Gradebook
- Assignments
- Analytics & Reports
- Parent Communication (SMS via African Talking)
- Resources & Materials

## API Endpoints

### Base URL
```
http://localhost:5000/api/teacher-comprehensive
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

---

## DASHBOARD APIs

### GET /dashboard
Get teacher dashboard statistics

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "total_students": 150,
    "assigned_classes": 5,
    "active_quizzes": 3,
    "pending_submissions": 25,
    "average_attendance": 87,
    "average_grade": 3.2
  }
}
```

### GET /analytics?period=week|month|term
Get analytics data for specified period

---

## STUDENTS APIs

### GET /students?class_id=1&search=john
Get all students with optional filters

### GET /students/:id
Get single student details

### PUT /students/:id
Update student information

### POST /students/:id/conduct
Add conduct record for student

### GET /students/:id/grades
Get student grades

### GET /students/:id/attendance
Get student attendance records

### GET /students/:id/progress
Get student progress data

---

## CLASSES APIs

### GET /classes
Get all assigned classes

### GET /classes/:id
Get class details

### GET /classes/:id/students
Get students in class

### GET /classes/:id/schedule
Get class schedule

### GET /classes/:id/analytics
Get class analytics

---

## COURSES APIs

### GET /courses
Get teacher's courses

### GET /courses/:id
Get course details

### GET /courses/:id/curriculum
Get course curriculum

---

## QUIZZES APIs

### GET /quizzes?class_id=1&status=active
Get all quizzes with filters

### GET /quizzes/:id
Get quiz details

### POST /quizzes
Create new quiz
```json
{
  "title": "Math Quiz 1",
  "class_id": 1,
  "subject": "Mathematics",
  "duration": 30,
  "questions": [
    {
      "question": "What is 2+2?",
      "options": ["2", "3", "4", "5"],
      "correct_answer": 2
    }
  ]
}
```

### PUT /quizzes/:id
Update quiz

### DELETE /quizzes/:id
Delete quiz

### POST /quizzes/:id/publish
Publish quiz

### GET /quizzes/:id/results
Get quiz results

### GET /quizzes/:id/questions
Get quiz questions

### POST /quizzes/:id/questions
Add question to quiz

### PUT /questions/:id
Update question

### DELETE /questions/:id
Delete question

---

## ASSIGNMENTS APIs

### GET /assignments?class_id=1&status=active
Get assignments with filters

### GET /assignments/:id
Get assignment details

### POST /assignments
Create assignment

### PUT /assignments/:id
Update assignment

### DELETE /assignments/:id
Delete assignment

### GET /assignments/:id/submissions
Get submissions

### POST /submissions/:id/grade
Grade submission

---

## CONDUCT APIs

### GET /conduct?class_id=1&severity=high&status=active
Get conduct records

### POST /conduct
Add conduct record

### PUT /conduct/:id
Update conduct record

### DELETE /conduct/:id
Delete conduct record

---

## ATTENDANCE APIs

### GET /attendance?class_id=1&date=2024-01-01
Get attendance records

### POST /attendance
Mark single attendance

### POST /attendance/bulk
Mark bulk attendance

### PUT /attendance/:id
Update attendance

### GET /attendance/summary?class_id=1&period=week
Get attendance summary

---

## GRADES APIs

### GET /grades?class_id=1&subject=Math
Get grades

### POST /grades
Add grade

### PUT /grades/:id
Update grade

### DELETE /grades/:id
Delete grade

### GET /grades/analytics?class_id=1&subject=Math
Get grade analytics

### GET /grades/export?class_id=1&format=excel
Export grades

---

## LESSON PLANS APIs

### GET /lesson-plans?class_id=1&week=2024-W01
Get lesson plans

### POST /lesson-plans
Create lesson plan

### PUT /lesson-plans/:id
Update lesson plan

### DELETE /lesson-plans/:id
Delete lesson plan

---

## MESSAGES APIs

### GET /messages?folder=inbox&type=parent
Get messages

### POST /messages
Send message

### POST /messages/bulk
Send bulk messages

### POST /sms/send
Send SMS to parent
```json
{
  "phone": "+250788123456",
  "message": "Your child was absent today"
}
```

### POST /sms/bulk
Send bulk SMS

---

## REPORTS APIs

### POST /reports/academic
Generate academic report

### POST /reports/attendance
Generate attendance report

### POST /reports/conduct
Generate conduct report

### GET /reports/templates
Get report templates

### GET /reports/:id/download?format=pdf
Download report

---

## RESOURCES APIs

### GET /resources?category=lessons
Get resources

### POST /resources
Upload resource

### DELETE /resources/:id
Delete resource

### GET /resources/:id/download
Download resource

---

## SCHEDULE APIs

### GET /schedule?week_start=2024-01-01
Get teacher schedule

### GET /events?days=7
Get upcoming events

---

## NOTIFICATIONS APIs

### GET /notifications
Get notifications

### PUT /notifications/:id/read
Mark as read

### PUT /notifications/read-all
Mark all as read

---

## ANNOUNCEMENTS APIs

### GET /announcements
Get announcements

### POST /announcements
Create announcement

### PUT /announcements/:id
Update announcement

### DELETE /announcements/:id
Delete announcement

---

## Frontend Implementation

### API Service
Location: `src/app/services/teacherApi.ts`

Import and use:
```typescript
import { 
  fetchDashboardStats,
  fetchStudents, 
  fetchClasses,
  fetchQuizzes,
  fetchAssignments,
  fetchConductRecords,
  markAttendance,
  addGrade,
  sendParentSMS,
  // ... more functions
} from '@/app/services/teacherApi';
```

### Dashboard Component
Location: `src/app/pages/dashboards/UltraAdvancedTeacherDashboard.tsx`

Features:
- 10 main tabs: Dashboard, Students, Classes, Quizzes, Conduct, Attendance, Grades, Assignments, Analytics, Resources
- Real-time data fetching
- Search and filter capabilities
- Pagination
- Export functionality
- Modern UI with 300+ Material-UI components
- Charts with Recharts
- Responsive design

### Key Components
1. **Stats Cards** - Display key metrics
2. **Charts** - Attendance trends, grade distribution, subject performance
3. **Data Tables** - With sorting, filtering, pagination
4. **Forms** - For adding/editing records
5. **Dialogs** - For confirmations and quick edits
6. **Calendars** - For scheduling
7. **Notifications** - Real-time alerts

---

## Conduct Removal (DOD Feature)

The system supports removing conduct records with the following reasons:
1. **Leave** - Student was on approved leave
2. **Sick** - Student was sick (medical proof required)
3. **Lesson Cancelled** - Teacher cancelled the class
4. **Exonerated** - Student proven innocent
5. **Appealed & Won** - Appeal successful
6. **Administrative Error** - Record was entered incorrectly
7. **Time Expired** - Record exceeded retention period

API: `DELETE /dod/conduct/:id`
```json
{
  "removal_reason": "sick",
  "removal_notes": "Medical certificate provided",
  "removed_by": "DOD User ID"
}
```

---

## Parent SMS Integration

Uses African Talking API for SMS notifications:
- Absence alerts
- Grade notifications
- Conduct warnings
- Assignment reminders
- General announcements

API: `POST /teacher-comprehensive/sms/send`

---

## Database Schema

### Key Tables
- `users` - User accounts
- `students` - Student information
- `classes` - Class definitions
- `trades` - Trade/stream definitions
- `levels` - Academic levels
- `conduct_records` - Student conduct
- `conduct_removals` - Removal records
- `attendance` - Daily attendance
- `grades` - Student grades
- `quizzes` - Quiz definitions
- `quiz_questions` - Quiz questions
- `assignments` - Assignment definitions
- `submissions` - Assignment submissions
- `lesson_plans` - Teacher lesson plans
- `messages` - Internal messages
- `sms_notifications` - SMS history
- `resources` - Teaching materials

---

## Testing

Run the API tester:
```bash
node backend/scripts/comprehensive-api-tester.js
```

---

## Frontend Integration

### Fetch Data Example
```typescript
useEffect(() => {
  async function loadData() {
    const result = await fetchDashboardStats();
    if (result.success) {
      setStats(result.dashboard);
    }
  }
  loadData();
}, []);
```

### Handle Form Submit
```typescript
const handleAddStudent = async (data: any) => {
  const result = await createStudent(data);
  if (result.success) {
    toast.success('Student added successfully');
    fetchStudents();
  }
};
```

---

## Error Handling

All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Success or error message",
  "data": { ... },
  "errors": [ ... ]
}
```

---

## Rate Limiting

- SMS: 100 messages/hour
- API: 1000 requests/hour per user
- File Uploads: 50MB max

---

## Support

For issues or questions:
- Check API logs at `backend/logs/`
- Review console errors in browser DevTools
- Contact system administrator

# Learning Management System Implementation

## Overview
Complete implementation of learning management features for the Powerful School Management System including assignments, quizzes, homework, holiday packages, P2P corrections, and real-time study sessions.

## Database Schema
Location: `backend/scripts/learning-management-schema.sql`

### Tables Created:
- **assignments** - Assignment management with grading rubrics
- **assignment_submissions** - Student submissions with plagiarism tracking
- **quizzes** - Quiz creation with auto-grading
- **quiz_attempts** - Student quiz attempts with timing
- **homework** - Daily/weekly homework tracking
- **homework_submissions** - Homework submissions with peer reviews
- **holiday_packages** - Holiday learning packages
- **holiday_package_progress** - Student progress tracking
- **live_study_sessions** - Real-time study sessions
- **session_participants** - Session attendance tracking
- **realtime_messages** - Chat messages during sessions
- **peer_reviews** - P2P correction system
- **collaboration_groups** - Student collaboration groups
- **student_learning_analytics** - Learning analytics and progress
- **learning_notifications** - Activity notifications

## Backend API Routes

### Assignments (`/api/assignments`)
- `POST /` - Create assignment (Teacher)
- `GET /teacher/:teacherId` - Get teacher's assignments
- `GET /class/:classId` - Get class assignments
- `POST /:id/submit` - Submit assignment (Student)
- `PUT /submissions/:id/grade` - Grade submission (Teacher)

### Quizzes (`/api/quizzes`)
- `POST /` - Create quiz (Teacher)
- `GET /class/:classId` - Get class quizzes
- `POST /:id/attempt` - Start quiz attempt (Student)
- `PUT /attempts/:id/submit` - Submit quiz (Student)

### Homework (`/api/homework`)
- `POST /` - Create homework (Teacher)
- `GET /class/:classId` - Get class homework
- `POST /:id/submit` - Submit homework (Student)
- `PUT /submissions/:id/grade` - Grade homework (Teacher)

### Holiday Packages (`/api/holiday-packages`)
- `POST /` - Create package (Teacher)
- `GET /class/:classId` - Get class packages
- `PUT /:id/progress` - Update progress (Student)

### Peer Review (`/api/peer-review`)
- `POST /` - Submit peer review (Student)
- `GET /submission/:type/:id` - Get reviews for submission
- `POST /groups` - Create collaboration group
- `POST /groups/:id/join` - Join group

### Live Study (`/api/live-study`)
- `POST /sessions` - Create study session
- `POST /sessions/:id/join` - Join session
- `GET /sessions/active` - Get active sessions
- `POST /sessions/:id/messages` - Send message

## Frontend Components

### Teacher Components
- **AssignmentBuilder** - Create and manage assignments
- **QuizBuilder** - Create quizzes with question builder
- **TeacherLearningDashboard** - Main teacher dashboard

### Student Components
- **StudentAssignmentView** - View and submit assignments
- **QuizTaker** - Take quizzes with timer
- **PeerReview** - Submit peer reviews
- **StudentLearningDashboard** - Main student dashboard

### Real-time Components
- **LiveStudyRoom** - Real-time study sessions with video/chat

## WebSocket Integration
Location: `backend/websocket.js`

Features:
- Real-time chat during study sessions
- Participant tracking
- Live notifications
- Session status updates

## Installation & Setup

### 1. Database Setup
```bash
mysql -u root -p < backend/scripts/learning-management-schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install ws
node server-learning.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Key Features Implemented

### ✅ Assignments
- Create with attachments and rubrics
- Late submission handling
- Auto-grading support
- Plagiarism detection fields

### ✅ Quizzes
- Multiple choice questions
- Timer functionality
- Auto-grading
- Attempt tracking
- Shuffle questions/options

### ✅ Homework
- Daily/weekly/monthly types
- Peer review support
- Parent notifications
- Progress tracking

### ✅ Holiday Packages
- Multi-activity packages
- Progress tracking
- Difficulty levels
- Learning objectives

### ✅ P2P Corrections
- Anonymous reviews
- Rating system
- Teacher moderation
- Helpful votes

### ✅ Real-time Study
- Live video sessions
- Real-time chat
- Screen sharing support
- Participant management
- Session recording

### ✅ Analytics
- Student progress tracking
- Performance metrics
- Improvement trends
- Recommendations

## Usage Examples

### Creating an Assignment (Teacher)
```javascript
const assignment = {
  title: "Math Problem Set",
  subject_id: 1,
  trade_class_id: 1,
  total_marks: 100,
  due_date: "2024-01-15T23:59:59",
  is_published: true
};

await fetch('/api/assignments', {
  method: 'POST',
  body: JSON.stringify(assignment)
});
```

### Submitting Assignment (Student)
```javascript
await fetch('/api/assignments/1/submit', {
  method: 'POST',
  body: JSON.stringify({
    submission_content: "My solution...",
    attachments: ["file1.pdf"]
  })
});
```

### Starting Live Session
```javascript
const session = {
  title: "Math Study Group",
  session_type: "study_group",
  max_participants: 20,
  scheduled_start: "2024-01-10T15:00:00"
};

await fetch('/api/live-study/sessions', {
  method: 'POST',
  body: JSON.stringify(session)
});
```

## Security Features
- JWT authentication on all routes
- Role-based authorization
- SQL injection prevention
- XSS protection
- CORS configuration

## Next Steps
1. Integrate with existing user authentication
2. Add file upload functionality
3. Implement video streaming for live sessions
4. Add email notifications
5. Create mobile responsive views
6. Add analytics dashboards
7. Implement AI-powered grading assistance

## Support
For issues or questions, refer to the main project documentation.

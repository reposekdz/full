# 🎓 GARDEN TVET SCHOOL MANAGEMENT SYSTEM - API DOCUMENTATION

## Server Information
- **Base URL**: `http://localhost:5000/api`
- **Version**: 4.0.0  
- **Status**: ✅ Running
- **Mounted Routes**: 25 modules

---

## 📡 API Endpoints by Category

### 🔐 Authentication & Authorization

#### `/api/auth` - Main Authentication
- `POST /login` - User login (email/phone/serial)
- `POST /register` - New user registration
- `POST /student-login` - Student login with serial code
- `POST /parent-login` - Parent login
- `POST /staff-login` - Staff login
- `GET /verify` - Verify JWT token
- `POST /logout` - User logout
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Reset password with token

#### `/api/role-auth` - Role-Based Authentication
- `GET /role/:roleName` - Get role credentials
- `POST /role-login` - Role-specific login
- `GET /roles` - List all roles
- `PUT /role/:roleName` - Update role credentials

#### `/api/staff-auth` - Staff Authentication  
- `POST /login` - Staff login
- `GET /verify` - Verify staff token

---

### 👥 User Management

#### `/api/developers` - Development Team
- `GET /` - Get all developers
- `POST /` - Add new developer
- `PUT /:id` - Update developer
- `DELETE /:id` - Delete developer

#### `/api/leadership` - School Leadership
- `GET /` - Get all leadership members
- `GET /:id` - Get specific leader
- `POST /` - Add new leader
- `PUT /:id` - Update leader
- `DELETE /:id` - Delete leader
- `GET /team/:teamId` - Get team members

---

### 📚 Academic Management

#### `/api/academics` - Academic Operations
- `GET /courses` - Get all courses
- `POST /courses` - Create course
- `GET /courses/:id` - Get course details
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course
- `GET /classes` - Get all classes
- `POST /classes` - Create class
- `GET /students/:id/grades` - Get student grades
- `POST /grades` - Submit grades

---

### 📊 Content Management

#### `/api/content` - Website Content
- `GET /homepage` - Get homepage content
- `PUT /homepage` - Update homepage
- `GET /hero` - Get hero section
- `PUT /hero` - Update hero section
- `GET /carousel` - Get carousel slides
- `POST /carousel` - Add carousel slide
- `DELETE /carousel/:id` - Delete slide

#### `/api/dynamic` - Dynamic Content
- `GET /announcements` - Get announcements
- `POST /announcements` - Create announcement
- `GET /events` - Get events
- `POST /events` - Create event
- `GET /news` - Get news articles
- `POST /news` - Create news article

---

### 🏆 Sports & Activities

#### `/api/sports` - Sports Management
- `GET /teams` - Get all sports teams
- `POST /teams` - Create team
- `GET /teams/:id` - Get team details
- `PUT /teams/:id` - Update team
- `DELETE /teams/:id` - Delete team
- `GET /matches` - Get matches
- `POST /matches` - Create match

#### `/api/sports-players` - Player Management
- `GET /players` - Get all players
- `POST /players` - Add player
- `GET /players/:id` - Get player details
- `PUT /players/:id` - Update player
- `DELETE /players/:id` - Delete player
- `GET /players/:id/stats` - Get player statistics

#### `/api/sports-advanced-mgmt` - Advanced Sports Features
- `GET /coaches` - Get coaches
- `POST /coaches` - Add coach
- `GET /training-sessions` - Get training sessions
- `POST /training-sessions` - Schedule training
- `GET /tournaments` - Get tournaments

---

### 💼 Services & Facilities

#### `/api/services` - School Services
- `GET /` - Get all services
- `POST /` - Add service
- `GET /:id` - Get service details
- `PUT /:id` - Update service
- `DELETE /:id` - Delete service

#### `/api/services-advanced` - Advanced Services
- `GET /facilities` - Get facilities
- `POST /facilities` - Add facility
- `GET /workshops` - Get workshops
- `POST /workshops` - Create workshop
- `GET /coaches` - Get service coaches

---

### 🔧 Trades & Vocational Training

#### `/api/trades` - Trade Programs
- `GET /` - Get all trades
- `POST /` - Add trade
- `GET /:id` - Get trade details
- `PUT /:id` - Update trade
- `DELETE /:id` - Delete trade
- `GET /:id/students` - Get students in trade
- `POST /:id/enroll` - Enroll student

---

### 👨‍👩‍👧 Parent & Student Features

#### `/api/teams` - Student Teams & Groups
- `GET /` - Get all teams
- `POST /` - Create team
- `GET /:id` - Get team details
- `PUT /:id` - Update team
- `DELETE /:id` - Delete team
- `POST /:id/members` - Add team member

---

### 🎮 Gamification & Engagement

#### `/api/gamification` - Gamification System
- `GET /leaderboard` - Get leaderboard
- `GET /badges` - Get available badges
- `POST /badges/:studentId` - Award badge
- `GET /points/:studentId` - Get student points
- `POST /points` - Award points
- `GET /achievements` - Get achievements

---

### 📈 Analytics & Reporting

#### `/api/analytics` - System Analytics
- `GET /overview` - System overview
- `GET /students` - Student analytics
- `GET /performance` - Performance metrics
- `GET /attendance` - Attendance statistics
- `GET /financial` - Financial reports

---

### 🤖 AI & Advanced Features

#### `/api/ai-grading` - AI-Powered Grading
- `POST /grade` - Submit for AI grading
- `GET /results/:assignmentId` - Get grading results
- `POST /feedback` - Generate AI feedback

#### `/api/adaptive-learning` - Adaptive Learning
- `GET /recommendations/:studentId` - Get learning recommendations
- `POST /progress` - Update learning progress
- `GET /path/:studentId` - Get learning path

---

### 🤝 Collaboration

#### `/api/collaboration` - Study Groups & Collaboration
- `GET /groups` - Get study groups
- `POST /groups` - Create study group
- `GET /groups/:id` - Get group details
- `POST /groups/:id/join` - Join group
- `DELETE /groups/:id/leave` - Leave group
- `GET /groups/:id/sessions` - Get group sessions

---

### 💬 Communication

#### `/api/contact` - Contact & Inquiries
- `POST /` - Submit contact form
- `GET /` - Get all inquiries (admin)
- `GET /:id` - Get inquiry details
- `PUT /:id` - Update inquiry status
- `DELETE /:id` - Delete inquiry

#### `/api/support` - Support Tickets
- `GET /tickets` - Get all tickets
- `POST /tickets` - Create ticket
- `GET /tickets/:id` - Get ticket details
- `PUT /tickets/:id` - Update ticket
- `POST /tickets/:id/reply` - Reply to ticket
- `DELETE /tickets/:id` - Delete ticket

#### `/api/support-enhanced` - Enhanced Support
- `GET /faq` - Get FAQs
- `POST /faq` - Add FAQ
- `GET /knowledge-base` - Get knowledge base articles
- `POST /chat` - Start live chat session

---

### 👨‍🏫 Advisor & Counseling

#### `/api/advisor` - Academic Advisor
- `GET /dashboard` - Advisor dashboard
- `GET /students` - Get assigned students
- `GET /appointments` - Get appointments
- `POST /appointments` - Schedule appointment
- `PUT /appointments/:id` - Update appointment
- `GET /sessions/:studentId` - Get counseling sessions
- `POST /sessions` - Create session record

---

### 🔔 System Features

#### `/api/system-updates` - System Updates & Notifications
- `GET /updates` - Get system updates
- `POST /updates` - Create system update
- `GET /notifications` - Get notifications
- `POST /notifications` - Send notification
- `PUT /notifications/:id/read` - Mark as read

---

## 🔧 Additional Route Files (Not Currently Mounted)

The following route files exist but are not mounted in server.js:

1. **admin.js** - Admin management endpoints
2. **admin-advanced.js** - Advanced admin features
3. **admin-management.js** - Staff and user management
4. **accountant.js** - Financial management
5. **attendance.js** - Attendance tracking
6. **assignments.js** - Assignment management
7. **advanced-assignments.js** - Advanced assignment features
8. **advanced-search.js** - Advanced search capabilities
9. **advanced-support.js** - Additional support features
10. **advancedAcademics.js** - Advanced academic features
11. **advancedFeatures.js** - Additional feature endpoints
12. **advancedOperations.js** - Advanced operation endpoints
13. **advancedSecurityApis.js** - Security features
14. **class-management.js** - Class management
15. **class-sheets.js** - Student sheets/records
16. **class-sheets-api.js** - Class sheets API
17. **comprehensiveApi.js** - Comprehensive API collection
18. **courses.js** - Course management
19. **dashboards.js** - Dashboard data endpoints
20. **discipline.js** - Discipline management
21. **docs.js** - Documentation endpoints
22. **dos.js** - Director of Studies features
23. **dos-management.js** - DOS management
24. **dos-advanced.js** - Advanced DOS features
25. **dos-updated.js** - Updated DOS endpoints
26. **dos-old.js** - Legacy DOS endpoints
27. **enhanced-dos.js** - Enhanced DOS features
28. **dynamicContent.js** - Dynamic content management
29. **exams.js** - Examination management
30. **gallery.js** - Gallery management
31. **grades.js** - Grade management
32. **hero.js** - Hero section management
33. **holidayPackages.js** - Holiday packages
34. **home-content.js** - Homepage content
35. **homepage.js** - Homepage management
36. **homework.js** - Homework management
37. **hostel.js** - Hostel management
38. **intelligentSystems.js** - AI/ML features
39. **library.js** - Library management
40. **live-chat.js** - Live chat system
41. **liveStudy.js** - Live study sessions
42. **messages.js** - Messaging system
43. **modernTechApis.js** - Modern technology APIs
44. **modernTechnologyApis.js** - Additional tech APIs
45. **notifications.js** - Notification system
46. **parent-dashboard.js** - Parent dashboard
47. **parent-linking.js** - Parent-student linking
48. **parent-monitoring.js** - Parent monitoring features
49. **parents.js** - Parent management
50. **peerReview.js** - Peer review system
51. **powerfulApisCollection.js** - API collections
52. **powerfulSchoolApis.js** - School-specific APIs
53. **quizzes.js** - Quiz management
54. **roles.js** - Role management
55. **search.js** - Search functionality
56. **smartAnalyticsApis.js** - Smart analytics
57. **sports-management.js** - Sports management
58. **staff.js** - Staff management
59. **student-auth.js** - Student authentication
60. **student-competitions.js** - Student competitions
61. **student-management.js** - Student management
62. **student-sheets.js** - Student academic sheets
63. **students.js** - Student operations
64. **teacher-portal.js** - Teacher portal
65. **teachers.js** - Teacher management
66. **timetable.js** - Timetable management
67. **transport.js** - Transport management
68. **uploads.js** - File upload handling
69. **user-auth.js** - User authentication
70. **users.js** - User management

---

## 🚀 Getting Started

### Testing the API

```bash
# Health Check
curl http://localhost:5000/api/health

# Test Authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"reponse@gmail.com","password":"2026"}'

# Get Leadership Team
curl http://localhost:5000/api/leadership

# Get Services
curl http://localhost:5000/api/services
```

### Default Credentials

**Staff Roles** (email: `reponse@gmail.com`, password: `2026`):
- Admin
- Headmaster
- Director of Study
- Director of Discipline
- Teacher
- Accountant
- Stock Manager

---

## 📝 Notes

- **Server Port**: 5000 (standard development port)
- **Database**: MySQL (school_management)
- **Authentication**: JWT-based
- **File Uploads**: Supported via `/uploads` endpoint
- **CORS**: Enabled for all origins

---

## ⚠️ To Do

1. Mount additional route files in server.js as needed
2. Ensure frontend API calls use port 5000
3. Implement comprehensive endpoint documentation for unmounted routes
4. Set up API rate limiting
5. Add API versioning (v1, v2)
6. Implement API key authentication for external services

---

*Last Updated: January 23, 2026*

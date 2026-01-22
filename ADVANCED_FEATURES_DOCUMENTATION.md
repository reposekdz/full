# Advanced School Management System - Complete Documentation

## Overview
This is a comprehensive, enterprise-grade school management system with full database integration, advanced features, and role-based management for Garden TVET School.

## Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: MySQL with full relational schema
- **File Upload**: Multer (10-20MB limits)
- **Authentication**: JWT + bcrypt
- **Image Formats**: JPEG, JPG, PNG, GIF, WEBP
- **Document Formats**: PDF, DOC, DOCX, XLS, XLSX
- **Media Formats**: MP4, MP3

---

## 🏆 Sports Management System (`/api/sports-management`)

### Features
- **Match Management**: Schedule and track football, volleyball, basketball, athletics matches
- **Player Profiles**: Complete player database with images, stats, positions
- **Trophy Cabinet**: Digital trophy/cup collection with images and descriptions
- **Sports Gallery**: Event photos organized by sport type
- **Player Statistics**: Goals, assists, cards, minutes played per match
- **Team Management**: Full team rosters with jersey numbers

### API Endpoints

#### Matches
```javascript
GET    /api/sports-management/matches
POST   /api/sports-management/matches
PUT    /api/sports-management/matches/:id/result
```

**Create Match Example:**
```json
{
  "home_team_id": 1,
  "away_team_id": 2,
  "match_date": "2025-06-15T14:00:00",
  "venue": "Garden TVET Stadium",
  "sport_type": "football",
  "competition": "Inter-School Championship",
  "status": "scheduled"
}
```

#### Players
```javascript
GET    /api/sports-management/players?sport_type=football&team_id=1
POST   /api/sports-management/players (with image upload)
PUT    /api/sports-management/players/:id (with image upload)
```

**Add Player Example:**
```javascript
// Form Data
{
  name: "John Doe",
  jersey_number: 10,
  position: "Forward",
  team_id: 1,
  sport_type: "football",
  date_of_birth: "2005-03-15",
  height: 175.5,
  weight: 70.2,
  image: [File]
}
```

#### Trophies
```javascript
GET    /api/sports-management/trophies
POST   /api/sports-management/trophies (with image upload)
```

#### Sports Gallery
```javascript
GET    /api/sports-management/gallery?sport_type=football
POST   /api/sports-management/gallery (upload up to 20 images)
```

#### Player Statistics
```javascript
POST   /api/sports-management/players/:id/stats
GET    /api/sports-management/players/:id/stats
```

**Database Tables:**
- `matches` - Match schedules and results
- `players` - Player profiles with images
- `trophies` - Trophy collection
- `sports_gallery` - Event photos
- `player_stats` - Individual match statistics

---

## 🎓 DOS Advanced Management (`/api/dos-advanced`)

### Features
- **Academic Year Management**: Rwanda format (2025-2026)
- **Teacher Management**: Full teacher profiles with credentials
- **Class Management**: Classes with capacity, room numbers, trade assignments
- **Workshop Management**: Workshops with multiple images
- **Student Lifecycle**: Track from enrollment to graduation
- **Student Transfers**: Class and trade transfers with history
- **Dashboard Statistics**: Real-time DOS metrics

### API Endpoints

#### Academic Years
```javascript
GET    /api/dos-advanced/academic-years
POST   /api/dos-advanced/academic-years
```

**Create Academic Year:**
```json
{
  "year_name": "2025-2026",
  "start_date": "2025-01-01",
  "end_date": "2026-12-31",
  "is_current": true
}
```

#### Teacher Management
```javascript
GET    /api/dos-advanced/teachers
POST   /api/dos-advanced/teachers (with profile image)
PUT    /api/dos-advanced/teachers/:id (with profile image)
```

**Add Teacher:**
```javascript
{
  first_name: "Jane",
  last_name: "Smith",
  email: "jane.smith@gardentvet.edu.rw",
  phone: "+250788123456",
  password: "2026", // Default password
  specialization: "Electrical Engineering",
  qualification: "Master's Degree",
  experience_years: 5,
  date_of_birth: "1990-05-20",
  address: "Kigali, Rwanda",
  emergency_contact: "+250788654321",
  profile_image: [File]
}
```

#### Class Management
```javascript
GET    /api/dos-advanced/classes?academic_year_id=1
POST   /api/dos-advanced/classes
POST   /api/dos-advanced/classes/:classId/teachers
```

**Create Class:**
```json
{
  "name": "Electrical Year 1A",
  "level": "Year 1",
  "section": "A",
  "academic_year_id": 1,
  "trade_code": "ELE",
  "capacity": 30,
  "room_number": "B101"
}
```

#### Workshop Management
```javascript
GET    /api/dos-advanced/workshops
POST   /api/dos-advanced/workshops (upload up to 15 images)
GET    /api/dos-advanced/workshops/:id/images
```

**Create Workshop:**
```javascript
{
  title: "Advanced Welding Techniques",
  description: "Hands-on workshop for welding students",
  facilitator: "Mr. John Doe",
  start_date: "2025-07-01T09:00:00",
  end_date: "2025-07-03T17:00:00",
  venue: "Workshop Building A",
  target_audience: "Year 2 Welding Students",
  max_participants: 25,
  workshop_images: [File, File, File...]
}
```

#### Student Lifecycle
```javascript
GET    /api/dos-advanced/students/lifecycle?status=active&academic_year_id=1
POST   /api/dos-advanced/students/graduate
POST   /api/dos-advanced/students/:id/transfer
```

**Graduate Students:**
```json
{
  "student_ids": [1, 2, 3, 4, 5],
  "graduation_date": "2025-12-15",
  "certificate_issued": true
}
```

**Transfer Student:**
```json
{
  "new_class_id": 5,
  "new_trade_code": "ELE",
  "reason": "Student requested trade change",
  "effective_date": "2025-06-01"
}
```

#### Dashboard
```javascript
GET    /api/dos-advanced/dashboard/stats
```

**Response:**
```json
{
  "active_teachers": 45,
  "active_students": 320,
  "active_classes": 18,
  "upcoming_workshops": 3,
  "graduates_this_year": 85
}
```

**Database Tables:**
- `academic_years` - Academic year records
- `teachers` - Teacher profiles
- `classes` - Class information
- `teacher_classes` - Teacher-class assignments
- `workshops` - Workshop details
- `workshop_images` - Workshop photos
- `workshop_participants` - Workshop attendance
- `students` - Student records
- `enrollments` - Student enrollments
- `student_transfers` - Transfer history

---

## 🔧 Admin Advanced Management (`/api/admin-advanced`)

### Features
- **News Management**: Full news system with categories, images, featured posts
- **Event Management**: Events with multiple images, participant tracking
- **Announcement System**: Targeted announcements with file attachments
- **Media Library**: Centralized media storage and management
- **System Settings**: Configurable school settings
- **Activity Log**: Complete audit trail
- **Dashboard Statistics**: Real-time admin metrics

### API Endpoints

#### News Management
```javascript
GET    /api/admin-advanced/news?category=academic&status=published&limit=10
POST   /api/admin-advanced/news (with image upload)
PUT    /api/admin-advanced/news/:id (with image upload)
DELETE /api/admin-advanced/news/:id
```

**Create News:**
```javascript
{
  title: "New Computer Lab Opening",
  content: "Full article content here...",
  excerpt: "Short summary for preview",
  category: "infrastructure",
  author_id: 1,
  tags: "technology,infrastructure,computers",
  published_date: "2025-06-01T10:00:00",
  featured: true,
  news_image: [File]
}
```

#### Event Management
```javascript
GET    /api/admin-advanced/events?type=academic&upcoming=true
POST   /api/admin-advanced/events (upload up to 10 images)
PUT    /api/admin-advanced/events/:id
GET    /api/admin-advanced/events/:id/images
```

**Create Event:**
```javascript
{
  title: "Annual Sports Day",
  description: "School-wide sports competition",
  type: "sports",
  start_date: "2025-08-15T08:00:00",
  end_date: "2025-08-15T18:00:00",
  venue: "Main Sports Ground",
  organizer: "Sports Department",
  max_participants: 500,
  registration_deadline: "2025-08-10T23:59:59",
  event_images: [File, File, File...]
}
```

#### Announcement System
```javascript
GET    /api/admin-advanced/announcements?target_audience=students&priority=high
POST   /api/admin-advanced/announcements (upload up to 5 files)
```

**Create Announcement:**
```javascript
{
  title: "Exam Schedule Released",
  content: "The final exam schedule has been published...",
  target_audience: "students", // all, students, teachers, staff, parents
  priority: "high", // low, medium, high, urgent
  start_date: "2025-06-01T00:00:00",
  end_date: "2025-06-30T23:59:59",
  created_by: 1,
  send_email: true,
  send_sms: false,
  announcement_files: [File, File...]
}
```

#### Media Library
```javascript
GET    /api/admin-advanced/media?type=image&category=events
POST   /api/admin-advanced/media (upload up to 20 files)
```

**Upload Media:**
```javascript
{
  category: "events",
  uploaded_by: 1,
  media_files: [File, File, File...]
}
```

#### System Settings
```javascript
GET    /api/admin-advanced/settings
PUT    /api/admin-advanced/settings
```

**Update Settings:**
```json
{
  "school_name": "Garden TVET School",
  "school_email": "info@gardentvet.edu.rw",
  "school_phone": "+250 788 000 000",
  "enable_email_notifications": "1",
  "enable_sms_notifications": "0"
}
```

#### Activity Log
```javascript
GET    /api/admin-advanced/activity-log?user_id=1&action_type=login&limit=50
```

#### Dashboard
```javascript
GET    /api/admin-advanced/dashboard/stats
```

**Response:**
```json
{
  "total_users": 450,
  "published_news": 25,
  "active_events": 5,
  "active_announcements": 3,
  "media_files": 1250,
  "active_students": 320,
  "active_teachers": 45
}
```

**Database Tables:**
- `news` - News articles
- `events` - Event information
- `event_images` - Event photos
- `event_participants` - Event registrations
- `announcements` - Announcements
- `announcement_attachments` - Announcement files
- `media_library` - Media files
- `system_settings` - System configuration
- `activity_log` - Audit trail

---

## 🗂️ Upload Directory Structure

```
backend/
└── uploads/
    ├── carousel/          # Hero carousel images
    ├── trades/            # Trade program images
    ├── gallery/           # School gallery
    ├── news/              # News article images
    ├── sports/            # Sports photos (players, trophies, gallery)
    ├── teachers/          # Teacher profile images
    ├── workshops/         # Workshop event photos
    ├── events/            # Event images
    ├── announcements/     # Announcement attachments
    ├── media/             # Media library files
    ├── profiles/          # User profile images
    ├── documents/         # General documents
    ├── contact/           # Contact form attachments
    ├── assignments/       # Assignment submissions
    └── tickets/           # Support ticket attachments
```

---

## 🔐 Authentication & Credentials

### Default Staff Credentials
- **Email**: reponse@gmail.com
- **Password**: 2026

Works for all roles:
- Admin
- DOS (Director of Studies)
- DOD (Director of Discipline)
- Teacher
- Headmaster
- Accountant
- Stock Manager

### Creating New Users
All staff can be created through their respective management endpoints with custom credentials.

---

## 📊 Database Schema Summary

### Core Tables
- `users` - All system users
- `academic_years` - Academic year records
- `trades` - Trade programs
- `classes` - Class information
- `teachers` - Teacher profiles
- `students` - Student records
- `enrollments` - Student enrollments

### Sports Tables
- `matches` - Match schedules
- `players` - Player profiles
- `trophies` - Trophy collection
- `sports_gallery` - Sports photos
- `player_stats` - Player statistics

### Content Tables
- `news` - News articles
- `events` - Events
- `announcements` - Announcements
- `workshops` - Workshops
- `media_library` - Media files

### Management Tables
- `teacher_classes` - Teacher assignments
- `student_transfers` - Transfer history
- `workshop_participants` - Workshop attendance
- `event_participants` - Event registrations
- `activity_log` - System audit trail
- `system_settings` - Configuration

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database
Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

### 3. Run Database Schema
```bash
mysql -u root -p school_management < scripts/advanced-features-schema.sql
```

### 4. Start Server
```bash
npm start
```

Server runs on `http://localhost:5000`

---

## 🎯 Key Features

### ✅ Fully Functional
- No mock data or placeholders
- Real database integration
- Automatic updates
- File upload with validation
- Error handling
- Transaction support

### ✅ Advanced Technology
- RESTful API design
- Multer file handling
- MySQL relational database
- JWT authentication
- bcrypt password hashing
- Express middleware
- CORS enabled

### ✅ Role-Based Access
- Admin: Full system control
- DOS: Academic management
- Teachers: Course management
- Students: Learning access
- Staff: Department-specific features

### ✅ Modern Features
- Image upload and storage
- Multi-file uploads
- Real-time statistics
- Activity logging
- Audit trails
- Lifecycle management
- Transfer tracking
- Graduation processing

---

## 📝 Usage Examples

### Frontend Integration

#### Upload Player with Image
```javascript
const formData = new FormData();
formData.append('name', 'John Doe');
formData.append('jersey_number', 10);
formData.append('position', 'Forward');
formData.append('team_id', 1);
formData.append('sport_type', 'football');
formData.append('image', fileInput.files[0]);

const response = await fetch('http://localhost:5000/api/sports-management/players', {
  method: 'POST',
  body: formData
});
```

#### Create Workshop with Multiple Images
```javascript
const formData = new FormData();
formData.append('title', 'Welding Workshop');
formData.append('description', 'Advanced techniques');
formData.append('start_date', '2025-07-01T09:00:00');
formData.append('end_date', '2025-07-03T17:00:00');

// Add multiple images
for (let file of imageFiles) {
  formData.append('workshop_images', file);
}

const response = await fetch('http://localhost:5000/api/dos-advanced/workshops', {
  method: 'POST',
  body: formData
});
```

#### Publish News Article
```javascript
const formData = new FormData();
formData.append('title', 'New Lab Opening');
formData.append('content', 'Full article content...');
formData.append('category', 'infrastructure');
formData.append('author_id', userId);
formData.append('featured', true);
formData.append('news_image', imageFile);

const response = await fetch('http://localhost:5000/api/admin-advanced/news', {
  method: 'POST',
  body: formData
});
```

---

## 🔄 Auto-Update Flow

1. **Admin/DOS uploads content** → Stored in database + file system
2. **Database updated** → Triggers automatic refresh
3. **Frontend fetches data** → Gets latest from database
4. **UI updates** → Shows new content immediately

No manual intervention required!

---

## 📈 Performance Features

- Optimized queries with JOINs
- Indexed database tables
- File size limits (10-20MB)
- Image format validation
- Error handling and logging
- Transaction support
- Connection pooling

---

## 🛡️ Security Features

- Password hashing (bcrypt)
- JWT authentication
- File type validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Input sanitization
- Role-based access control

---

## 📞 Support

For issues or questions:
- Check API endpoints in server logs
- Verify database connections
- Review upload directory permissions
- Check file size limits
- Validate file formats

---

**Version**: 3.0.0  
**Last Updated**: 2025  
**Status**: Production Ready ✅

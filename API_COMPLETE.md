# Complete API Documentation - All Roles

## 🔐 Authentication
All protected routes require: `Authorization: Bearer <token>`

## 📊 Admin APIs (`/api/admin`)

### Dashboard
- `GET /api/admin/dashboard` - Get admin dashboard stats

### Carousel Management
- `GET /api/admin/carousel` - Get all carousel slides
- `POST /api/admin/carousel` - Upload new slide (multipart/form-data)
  - Fields: title, subtitle, button_text, button_link, display_order
  - File: image (max 10MB)
- `PUT /api/admin/carousel/:id` - Update slide
- `DELETE /api/admin/carousel/:id` - Delete slide

### Trades Management
- `GET /api/admin/trades` - Get all trades
- `POST /api/admin/trades` - Create trade with image
- `PUT /api/admin/trades/:id` - Update trade
- `DELETE /api/admin/trades/:id` - Delete trade

### Gallery Management
- `GET /api/admin/gallery?category=<category>` - Get gallery images
- `POST /api/admin/gallery` - Upload multiple images (max 10)
- `DELETE /api/admin/gallery/:id` - Delete image

### News Management
- `GET /api/admin/news` - Get all news
- `POST /api/admin/news` - Create news with image
- `PUT /api/admin/news/:id` - Update news
- `DELETE /api/admin/news/:id` - Delete news

### User Management
- `GET /api/admin/users?role=<role>&search=<query>` - Get users
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `DELETE /api/admin/users/:id` - Delete user

### System Settings
- `GET /api/admin/settings` - Get all settings
- `PUT /api/admin/settings` - Update setting

## 📚 DOS APIs (`/api/dos`)

### Dashboard
- `GET /api/dos/dashboard` - Get DOS dashboard stats

### Course Management
- `POST /api/dos/courses` - Create course with image
- `PUT /api/dos/courses/:id` - Update course
- `DELETE /api/dos/courses/:id` - Deactivate course

### Timetable Management
- `POST /api/dos/timetable` - Create timetable entry

### Exam Management
- `POST /api/dos/exams` - Schedule exam

### Reports
- `GET /api/dos/reports/performance?trade=<>&level=<>&period=<>` - Performance reports

### Teacher Assignment
- `POST /api/dos/assign-teacher` - Assign teacher to course

### Academic Calendar
- `GET /api/dos/calendar` - Get calendar events
- `POST /api/dos/calendar` - Create calendar event

## 👨‍🏫 Teacher APIs (`/api/roles/teacher`)

### Dashboard
- `GET /api/roles/teacher/dashboard` - Get teacher dashboard

### Courses
- `GET /api/roles/teacher/courses` - Get my courses

### Assignments
- `POST /api/roles/teacher/assignments` - Create assignment

### Grading
- `POST /api/roles/teacher/grades` - Submit grades

## 🏫 Headmaster APIs (`/api/roles/headmaster`)

### Dashboard
- `GET /api/roles/headmaster/dashboard` - Get overview stats

### Reports
- `GET /api/roles/headmaster/reports?type=<academic|financial>&period=<days>` - Generate reports

## 💰 Accountant APIs (`/api/roles/accountant`)

### Dashboard
- `GET /api/roles/accountant/dashboard` - Get financial stats

### Payments
- `GET /api/roles/accountant/payments?status=<>&student_id=<>` - Get payments
- `POST /api/roles/accountant/payments` - Record payment

## 📦 Stock Manager APIs (`/api/roles/stock`)

### Dashboard
- `GET /api/roles/stock/dashboard` - Get inventory stats

### Items
- `GET /api/roles/stock/items?category=<>&search=<>` - Get items
- `POST /api/roles/stock/items` - Add item
- `PUT /api/roles/stock/items/:id` - Update item

## 👮 Director of Discipline APIs (`/api/roles/dod`)

### Dashboard
- `GET /api/roles/dod/dashboard` - Get discipline stats

### Incidents
- `GET /api/roles/dod/incidents?status=<>` - Get incidents
- `POST /api/roles/dod/incidents` - Report incident

## 📝 Content APIs (`/api/content`)

- `GET /api/content/news` - Get published news
- `GET /api/content/slides` - Get active slides
- `GET /api/content/trades` - Get active trades
- `GET /api/content/testimonials` - Get testimonials
- `GET /api/content/stats` - Get school stats
- `GET /api/content/achievements` - Get achievements

## 🎯 Dynamic APIs (`/api/dynamic`)

- `GET /api/dynamic/features` - Get features
- `GET /api/dynamic/events?status=<>&limit=<>` - Get events
- `GET /api/dynamic/sports/categories` - Get sports categories
- `GET /api/dynamic/sports/matches?status=<>&limit=<>` - Get matches
- `GET /api/dynamic/sports/achievements?featured=<>&limit=<>` - Get achievements

## 📞 Contact APIs (`/api/contact`)

- `POST /api/contact/submit` - Submit contact form (multipart/form-data)
- `POST /api/contact/callback` - Request callback
- `POST /api/contact/chat/message` - Send chat message
- `GET /api/contact/submissions` - Get submissions (admin)

## 🎫 Support APIs (`/api/support`)

- `POST /api/support/tickets` - Create ticket
- `GET /api/support/tickets` - Get user tickets
- `GET /api/support/tickets/:id` - Get ticket details
- `POST /api/support/tickets/:id/responses` - Add response
- `GET /api/support/knowledge-base` - Get articles

## 📖 Academic APIs (`/api/academics`)

- `GET /api/academics/courses` - Get courses
- `GET /api/academics/my-courses` - Get student courses
- `GET /api/academics/assignments` - Get assignments
- `POST /api/academics/assignments/:id/submit` - Submit assignment
- `GET /api/academics/grades` - Get grades
- `GET /api/academics/exams` - Get exams
- `GET /api/academics/timetable` - Get timetable
- `GET /api/academics/attendance` - Get attendance

## 🏆 Teams APIs (`/api/teams`)

- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team details
- `POST /api/teams` - Create team (admin)
- `PUT /api/teams/:id` - Update team (admin)
- `DELETE /api/teams/:id` - Delete team (admin)

## Image Upload Guidelines

### Supported Formats
- JPEG, JPG, PNG, GIF, WEBP

### Size Limits
- Carousel: 10MB
- Trades: 10MB
- Gallery: 10MB per image
- News: 10MB
- Profiles: 2MB

### Upload Directories
- `/uploads/carousel/` - Hero slides
- `/uploads/trades/` - Trade images
- `/uploads/gallery/` - Gallery images
- `/uploads/news/` - News images
- `/uploads/dos/` - DOS uploads
- `/uploads/profiles/` - Profile pictures

### Example Upload Request
```javascript
const formData = new FormData();
formData.append('title', 'New Slide');
formData.append('subtitle', 'Description');
formData.append('image', fileInput.files[0]);

fetch('/api/admin/carousel', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

## Auto-Update Features

### Automatic Updates
- Course images update when DOS uploads new image
- Trade images update when admin uploads new image
- Gallery auto-displays new uploads
- News feed updates automatically
- Carousel rotates with new slides
- Stats update in real-time

### Database Triggers
- Image URLs stored in database
- Old images can be replaced
- Deletion removes database entry
- All changes reflect immediately

## Response Format

### Success
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

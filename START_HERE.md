# 🚀 START HERE - Garden TVET School Management System

## Quick Start (3 Steps)

### Step 1: Setup Database (One Time Only)
```bash
cd backend
npm run setup
```

This will:
- Create all database tables
- Set up default staff accounts
- Initialize sample data
- Create upload directories

### Step 2: Start Servers
**Option A - Automatic (Recommended):**
```bash
# Double-click this file:
start-servers.bat
```

**Option B - Manual:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
npm run dev
```

### Step 3: Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Default Login Credentials

```
Email: reponse@gmail.com
Password: 2026
```

Works for ALL staff roles:
- Teacher
- Director of Study
- Director of Discipline
- Head Master
- Accountant
- Stock Manager
- Administrator

## Troubleshooting

### "Cannot connect to database"
```bash
# Start MySQL
# Then run:
cd backend
npm run setup
```

### "Port 5000 already in use"
```bash
# Windows - Kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Module not found"
```bash
cd backend
npm install

cd ..
npm install
```

## Features Available

✅ Multi-role authentication
✅ Contact management with live chat
✅ Support ticket system
✅ Academic management (courses, assignments, grades)
✅ Profile editing with password change
✅ All CRUD operations for admin
✅ Real-time notifications
✅ File uploads
✅ Modern responsive UI

## Admin Panel Access

1. Login with default credentials
2. Select "Administrator" role
3. Access admin dashboard
4. Manage all content:
   - News & Announcements
   - Hero Slides
   - Courses & Programs
   - Events & Activities
   - Sports Teams
   - Testimonials
   - Achievements
   - And more...

## API Endpoints

All APIs are now running on http://localhost:5000/api/

- `/auth` - Authentication
- `/contact` - Contact forms
- `/support` - Support tickets
- `/academics` - Courses & grades
- `/content` - News, slides, testimonials
- `/dynamic` - Events, features
- `/teams` - Sports teams
- `/sports` - Sports data
- `/gamification` - Points & badges
- `/analytics` - Performance data

## Need Help?

1. Check COMPREHENSIVE_SETUP_GUIDE.md
2. Check QUICK_REFERENCE.md
3. Email: support@gardentvet.rw
4. Phone: +250 788 987 830

---

**System is ready to use! Start the servers and login.**

# 🚀 Quick Start Guide

## Get Started in 5 Minutes!

### Step 1: Install Dependencies (2 minutes)

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Setup Database (1 minute)

1. Make sure MySQL is running
2. Create `.env` file in `backend` folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_management
DB_PORT=3306
PORT=5000
JWT_SECRET=change_this_secret_key_in_production
NODE_ENV=development
```

3. Run database setup:

```bash
cd backend
npm run setup-db
```

✅ This creates all tables, inserts sample data, and creates admin user!

### Step 3: Start the Application (1 minute)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✅ Frontend running on http://localhost:5173

### Step 4: Login (30 seconds)

Open http://localhost:5173 and login:
- **Username:** `admin`
- **Password:** `admin123`

## 🎉 You're Done!

You now have access to:
- ✅ Complete user management
- ✅ Academic management system
- ✅ Exam management with results
- ✅ Attendance tracking
- ✅ Grade management
- ✅ Timetable system
- ✅ Financial management
- ✅ Stock management
- ✅ Messaging system
- ✅ Notifications
- ✅ Sports management
- ✅ Parent portal
- ✅ And much more!

## 📚 Next Steps

1. **Explore the System**
   - Navigate through different pages
   - Try different roles
   - Test features

2. **Read Documentation**
   - `SETUP_GUIDE.md` - Detailed setup
   - `backend/API_DOCUMENTATION.md` - API reference
   - `IMPLEMENTATION_SUMMARY.md` - Feature overview

3. **Create Users**
   - Add teachers, students, parents
   - Assign roles
   - Test role-based features

4. **Configure System**
   - Add courses
   - Create classes
   - Setup academic year

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
# Windows:
net start MySQL80

# Linux/Mac:
sudo systemctl start mysql
```

### Port Already in Use
```bash
# Change PORT in backend/.env
PORT=5001
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📞 Need Help?

Check these files:
- `SETUP_GUIDE.md` - Comprehensive setup
- `backend/API_DOCUMENTATION.md` - API details
- `IMPLEMENTATION_SUMMARY.md` - System overview

## 🎯 What You Can Do Now

### As Admin
- Manage all users
- Create courses and classes
- Setup exams
- View all reports
- Configure system

### Test Different Roles
Create users with different roles to test:
- Teacher features
- Student portal
- Parent access
- Accountant functions
- Stock manager tools

## 🌟 Key Features to Try

1. **Exam Management**
   - Create an exam
   - Register students
   - Submit results
   - View analytics

2. **Attendance System**
   - Mark attendance
   - View reports
   - Check statistics

3. **Grade Management**
   - Submit grades
   - View performance
   - Generate reports

4. **Messaging**
   - Send messages
   - Create notifications
   - Broadcast to roles

5. **Sports Management**
   - Create teams
   - Add events
   - Track achievements

## 💡 Pro Tips

1. **Use Bulk Operations**
   - Bulk attendance marking
   - Bulk grade submission
   - Saves time!

2. **Explore Analytics**
   - Student performance
   - Class comparisons
   - Attendance trends

3. **Try Notifications**
   - Broadcast to roles
   - Send targeted messages
   - Keep everyone informed

4. **Check Conflicts**
   - Timetable conflicts
   - Room bookings
   - Teacher schedules

## 🎓 Ready to Manage Your School!

Everything is set up and ready to use. No placeholders, no demos - just a fully functional, powerful school management system!

---

**Happy Managing! 🚀**

# Garden TVET DOS Dashboard - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Database Migration
```bash
# Double-click this file in Windows Explorer
run-dos-dashboard-migration.bat
```

Or manually:
```bash
cd backend
node run-dos-dashboard-migration.js
```

### Step 2: Start the Backend Server
```bash
cd backend
node server.js
```
Server runs at: `http://localhost:5000`

### Step 3: Start the Frontend
```bash
npm start
```
App opens at: `http://localhost:3000`

---

## 📱 DOS Dashboard Features

### Dashboard Overview
The main dashboard shows:
- 📊 **4 Stat Cards** - Students, Teachers, Timetables, Reports
- 📈 **Performance Charts** - GPA, Attendance, Enrollment trends
- 📋 **Quick Actions** - Add student, generate report, send SMS

### Managing Students
1. Click **"Students"** in the sidebar
2. Use filters to search by trade/level
3. Click **"Add Student"** to register new students
4. View GPA, attendance, and status

### Managing Teachers
1. Click **"Teachers"** in the sidebar
2. View teacher cards with specializations
3. Click **"Add Teacher"** to register new teachers
4. Track class assignments

### Scheduling Exams
1. Click **"Exams"** in the sidebar
2. View upcoming exams in the table
3. Click **"Schedule Exam"** to add new exam
4. Set date, time, duration, and room

### Managing Timetables
1. Click **"Timetable"** in the sidebar
2. View weekly timetable grid
3. Filter by trade and level
4. See periods, subjects, and teachers

### Report Cards
1. Click **"Report Cards"** in the sidebar
2. Filter by trade, level, and term
3. Click **"Generate Report"** to create new reports
4. Click **"Export Reports"** to download
5. **Publish** reports when ready

### Sending SMS
1. Click **"SMS"** in the sidebar
2. View SMS statistics (sent, delivered, failed)
3. Click **"Send SMS"** to compose message
4. Select recipient type (all, students, parents, teachers)
5. Click **"Send"** to deliver

### Analytics
1. Click **"Analytics"** in the sidebar
2. View performance trends by level
3. Compare trade performance
4. See enrollment trends over time

---

## 🔑 API Testing

Test all endpoints:
```bash
node backend/scripts/dos-dashboard-api-tester.js
```

---

## 🐛 Troubleshooting

### "Database connection failed"
- Check MySQL/MariaDB is running
- Verify `.env` file has correct credentials

### "Token expired"
- Log out and log in again to get new token
- Check server time is synchronized

### "Charts not loading"
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors

### "SMS not sending"
- Check SMS gateway configuration
- Verify recipient phone numbers are valid

---

## 📞 Need Help?

1. Check the full documentation: `DOS_DASHBOARD_DOCUMENTATION.md`
2. Check console logs for errors
3. Run the API tester to verify endpoints

---

## ✅ Checklist

- [ ] Database migration ran successfully
- [ ] Backend server started without errors
- [ ] Frontend loads without errors
- [ ] Can log in as DOS user
- [ ] Dashboard shows statistics
- [ ] Can add students
- [ ] Can schedule exams
- [ ] Can generate reports
- [ ] Can send SMS

---

**Garden TVET School - Director of Studies Management System v2.0**

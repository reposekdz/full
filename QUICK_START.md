# 🚀 QUICK START GUIDE - Student Application System

## ⚡ ONE-COMMAND SETUP

```bash
SETUP-APPLICATION-SYSTEM.bat
```

This will:
1. ✅ Install multer package
2. ✅ Run database migration
3. ✅ Create upload directories
4. ✅ Setup all tables and procedures

---

## 🎯 IMMEDIATE ACCESS

### For Students (Public):
1. Go to homepage
2. Click "Apply Now" button in hero section
3. Fill 4-step application form
4. Upload profile photo & report card
5. Submit and get application number

### For DOS (Director of Study):
1. Login with DOS credentials
2. Click "Ibyifuzo byo Kwiga" in sidebar
3. Or navigate to: `/application-management`
4. Review pending applications
5. Score and approve/reject

### For Headmaster:
1. Login with Headmaster credentials
2. Click "Ibyifuzo byo Kwiga" in sidebar
3. Or navigate to: `/application-management`
4. Review DOS-approved applications
5. Make final decision

---

## 📱 TEST THE SYSTEM

### Test Application Submission:
1. Open browser: `http://localhost:3000`
2. Click "Apply Now" in hero
3. Fill form with test data:
   - Name: Test Student
   - Phone: 0788123456
   - Upload a photo
   - Upload report card image
   - Select trade & level
4. Submit and note application number

### Test DOS Review:
1. Login as DOS
2. Go to Application Management
3. See the test application
4. Click "Review"
5. Give score and approve

### Test Headmaster Approval:
1. Login as Headmaster
2. Go to Application Management
3. See DOS-approved application
4. Click "Decide"
5. Approve or reject

---

## 🔑 KEY FEATURES

✅ **Profile Photo Upload** - Circular preview, required
✅ **Report Card Upload** - Full image preview, required
✅ **Trade & Level Selection** - From database
✅ **DOS Review** - Score 0-100, approve/reject
✅ **Headmaster Approval** - Final decision
✅ **SMS Notifications** - Automatic updates
✅ **Status Tracking** - Complete history
✅ **Statistics Dashboard** - Real-time data

---

## 📊 SYSTEM STATUS

After setup, verify:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ MySQL database connected
- ✅ Upload directories created
- ✅ Routes mounted in server.js

---

## 🆘 TROUBLESHOOTING

### If multer not installed:
```bash
cd backend
npm install multer
```

### If database migration fails:
- Check MySQL is running
- Verify database credentials
- Ensure database exists

### If uploads fail:
- Check directory permissions
- Verify multer is installed
- Check file size limits (5MB max)

---

## 🎉 SUCCESS INDICATORS

You'll know it's working when:
1. ✅ Application form shows profile photo upload
2. ✅ Report card upload appears in step 2
3. ✅ DOS can see applications with photos
4. ✅ Headmaster can make final decisions
5. ✅ Statistics show real-time data

---

## 📞 QUICK REFERENCE

**Application Form**: Hero section → "Apply Now"
**DOS Dashboard**: `/application-management`
**Headmaster Dashboard**: `/application-management`
**Check Status**: `/check-status`

**API Base**: `http://localhost:5000/api/student-applications`

---

## ✨ READY TO GO!

The system is **production-ready** and **fully functional**!

Start using it now! 🚀

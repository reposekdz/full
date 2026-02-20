# 🔔 Parent Notifications - Quick Setup

## What This Does

When DOD or Admin removes conduct from a student, **all linked parents automatically see a notification** on their dashboard.

## 🚀 Quick Setup

```bash
setup-parent-notifications.bat
```

Then add this line to `backend/server.js`:
```javascript
app.use('/api/parent', require('./routes/parent-notifications'));
```

Restart backend and you're done!

## 📊 How It Works

### When Conduct is Removed
```
DOD removes conduct → Notification created → Parent sees it on dashboard
```

### When Conduct is Restored
```
DOD deletes conduct record → Notification created → Parent sees restoration
```

## 📝 Notification Types

1. **Conduct Removed** (Red/Orange)
   - Shows incident type, severity, points deducted
   - New conduct score displayed

2. **Conduct Restored** (Green/Blue)
   - Shows incident was removed
   - Points restored, new score displayed

## 🎯 Parent Dashboard

Parents will see:
- Unread notification count (badge)
- List of all notifications
- Student name and details
- Conduct score changes
- Mark as read/delete options

## 📡 API Endpoints

```javascript
GET  /api/parent/notifications          // Get all notifications
GET  /api/parent/notifications?unread_only=true  // Unread only
PUT  /api/parent/notifications/:id/read // Mark as read
PUT  /api/parent/notifications/read-all // Mark all as read
DELETE /api/parent/notifications/:id    // Delete notification
```

## ✅ What Gets Notified

- ✅ Conduct incident added (with details)
- ✅ Conduct incident removed (restoration)
- ✅ Points deducted/restored
- ✅ New conduct score
- ✅ Severity level

## 🔍 Database

Table: `parent_notifications`
- Stores all notifications
- Links to parent and student
- Tracks read/unread status
- Includes severity and type

## 📱 Example Notification

**Conduct Removed:**
```
Title: Conduct Incident: Disrespect
Message: Your child John Doe received a moderate conduct 
incident for Disrespect. 2 points deducted. 
New score: 38/40. Student was disrespectful to teacher.
```

**Conduct Restored:**
```
Title: Conduct Record Removed
Message: Good news! A conduct incident (Disrespect) for 
John Doe has been removed. 2 points restored. 
New score: 40/40.
```

## ✨ Summary

- **Setup Time:** < 2 minutes
- **Automatic:** Yes, no manual work needed
- **Real-time:** Notifications created instantly
- **Visible:** On parent dashboard immediately
- **Status:** ✅ READY TO USE

---

**Last Updated:** 2024

# 🎓 Parent Application System - Quick Reference

## ⚡ 30-Second Overview

**What**: Advanced parent-child linking system with SMS notifications  
**Who**: DOD, Admin, Headmaster  
**Where**: DOD Dashboard → Parent Applications tab  
**SMS**: Automatic Kinyarwanda messages with sender ID "GARDEN TVET"

---

## 🎯 Quick Actions

### ✅ Approve Application
```
1. Click "Approve & Link" button
2. Review details and SMS preview
3. Click "Approve & Send SMS"
4. ✅ Done! Parent receives welcome SMS
```

### ❌ Reject Application
```
1. Click "Reject" button
2. Enter rejection reason
3. Click "Reject & Send SMS"
4. ✅ Done! Parent receives rejection SMS
```

### 🗑️ Delete Application
```
1. Click trash icon
2. Confirm deletion
3. ✅ Done! No SMS sent
```

---

## 📱 SMS Messages

### Welcome SMS (Approval)
```
🎓 MURAKAZA NEZA KURI GARDEN TVET SCHOOL! 🎓

Includes:
✓ Child's full details
✓ Portal features list
✓ Notification system info
✓ School contact

Sender: GARDEN TVET
```

### Rejection SMS
```
Includes:
✓ Rejection reason
✓ Reapply instructions
✓ School contact

Sender: GARDEN TVET
```

---

## 📊 Statistics Dashboard

| Card | Color | Shows |
|------|-------|-------|
| Total | Purple | All applications |
| Pending | Yellow | Awaiting review |
| Approved | Green | Successfully linked |
| Rejected | Red | Rejected applications |

---

## 🔍 Search & Filter

**Search by:**
- Parent name
- Child name
- Application code

**Filter by:**
- All status
- Pending only
- Approved only
- Rejected only

---

## 📋 Application Card Info

### Parent Details
- Full name
- Phone number
- Email address
- Physical address

### Student Details
- Full name
- Gender
- Trade code
- Level number

### Matched Student
- Database match status
- Student code
- Confirmation badge

---

## 🔐 Permissions Granted

When approved, parents can view:
- ✅ Grades & results
- ✅ Attendance records
- ✅ Conduct (40/40 system)
- ✅ Fees & payments
- ✅ Messages from teachers
- ✅ Assignments
- ✅ Timetable
- ✅ Report cards

---

## 🎨 Status Badges

| Status | Color | Icon | Text |
|--------|-------|------|------|
| Pending | Yellow | ⏰ | Tegereza |
| Approved | Green | ✅ | Byemejwe |
| Rejected | Red | ❌ | Byanze |

---

## 🚀 API Endpoints

```javascript
// Get all applications
GET /api/parent-child-linking-advanced/all-applications

// Approve
POST /api/parent-child-linking-advanced/approve/:id

// Reject
POST /api/parent-child-linking-advanced/reject/:id
Body: { reason: "..." }

// Delete
DELETE /api/parent-child-linking-advanced/delete/:id

// Bulk approve
POST /api/parent-child-linking-advanced/bulk-approve
Body: { applicationIds: [1, 2, 3] }

// Bulk delete
POST /api/parent-child-linking-advanced/bulk-delete
Body: { applicationIds: [1, 2, 3] }
```

---

## 🔧 Troubleshooting

### SMS not sending?
- Check Africa's Talking credentials
- Verify sender ID "GARDEN TVET" is registered
- Check phone number format (+250...)

### Student not matching?
- Verify exact name spelling
- Check trade code and level
- Confirm student exists in database

### Can't delete?
- Verify DOD/Admin role
- Check application exists
- Review error logs

---

## 📞 Quick Support

**Email**: support@gardentvet.rw  
**Phone**: +250 788 123 456  
**Docs**: PARENT_APPLICATION_ADVANCED_COMPLETE.md

---

## ✅ Checklist

Before approving:
- [ ] Parent details are correct
- [ ] Student match is accurate
- [ ] Phone number is valid
- [ ] SMS preview looks good

Before rejecting:
- [ ] Reason is clear and professional
- [ ] Reason is in Kinyarwanda (optional)
- [ ] Parent can understand and fix issue

Before deleting:
- [ ] Application is duplicate/spam
- [ ] No need to notify parent
- [ ] Action is logged in audit trail

---

**Status**: ✅ FULLY OPERATIONAL  
**Version**: 2.0 - Advanced Complete

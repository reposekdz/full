# 🔐 Staff Access Code - Quick Reference

## 🚀 Quick Setup (3 Steps)

```bash
# 1. Run setup
setup-staff-access-codes.bat

# 2. Restart server
npm run dev

# 3. Access admin panel and update code
```

---

## 🔑 Current Configuration

| Setting | Value |
|---------|-------|
| **Default Code** | `g@2026` |
| **Minimum Length** | 4 characters |
| **Who Can Update** | Admin, Headmaster |
| **Who Uses It** | All staff roles |

---

## 👥 Staff Roles Using Access Code

✅ Super Admin  
✅ System Admin  
✅ Headmaster  
✅ Director of Studies (DOS)  
✅ Director of Discipline (DOD)  
✅ Accountant  
✅ Stock Manager  
✅ School Patron  
✅ Academic Advisor  
✅ Teachers  

---

## 📖 How to Update Code

### For Admin/Headmaster:

1. **Login** to admin dashboard
2. **Navigate** to Staff Access Code Manager
3. **Enter** new code (min 4 chars)
4. **Add** reason (optional)
5. **Click** Update Access Code
6. **Confirm** the change
7. **Communicate** new code to staff

---

## 🔐 How Staff Login

1. Go to staff login page
2. Enter access code: `g@2026` (or current)
3. Select your role
4. Enter your credentials
5. Access dashboard

---

## 📊 API Endpoints

```http
# Get current code
GET /api/staff-access-codes/access-code

# Update code
PUT /api/staff-access-codes/access-code
Body: { "new_code": "newcode", "change_reason": "reason" }

# Get history
GET /api/staff-access-codes/access-code/history

# Verify code
POST /api/staff-access-codes/verify-access-code
Body: { "access_code": "g@2026" }

# Get roles
GET /api/staff-access-codes/roles
```

---

## 🗄️ Database Tables

- `staff_access_codes` - Current access codes
- `staff_access_code_history` - Change history
- `staff_roles_config` - Staff role configuration

---

## 🔒 Security Tips

✅ Change default code immediately  
✅ Use strong codes (letters + numbers + symbols)  
✅ Update code every 3-6 months  
✅ Always document reason for changes  
✅ Keep code confidential  
✅ Monitor change history regularly  

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't access manager | Login as Admin/Headmaster |
| Update fails | Check code length (min 4) |
| Staff can't login | Verify they have new code |
| History not showing | Click "Show History" button |

---

## 📱 Frontend Component

```tsx
import StaffAccessCodeManager from '@/app/components/StaffAccessCodeManager';

// Use in admin dashboard
<StaffAccessCodeManager />
```

---

## 🎯 Key Features

✨ **Dynamic Updates** - Change anytime  
✨ **Audit Logging** - Complete history  
✨ **Role-Based** - Admin/Headmaster only  
✨ **Secure** - Database-driven  
✨ **Flexible** - No code changes needed  

---

## 📞 Emergency Code Reset

```sql
-- Run in database if needed
UPDATE staff_access_codes 
SET code_value = 'emergency_code', 
    updated_at = NOW() 
WHERE code_name = 'staff_portal_access';
```

---

## ✅ System Status

**Status**: ✅ Fully Functional  
**Default Code**: `g@2026`  
**Can Be Updated**: ✅ Yes  
**Audit Logging**: ✅ Active  
**History Tracking**: ✅ Enabled  

---

## 📚 Full Documentation

See: `STAFF_ACCESS_CODE_SYSTEM.md`

---

**Quick Start**: Run `setup-staff-access-codes.bat` and you're ready! 🚀

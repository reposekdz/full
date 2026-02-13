# 🔐 Staff Access Code Management System

## Complete Guide for Managing Staff Portal Access

---

## 🌟 Overview

The **Staff Access Code Management System** provides a secure, flexible way to control access to the staff portal. Admin and Headmaster can update the access code at any time, with full audit logging and history tracking.

---

## ✨ Features

### 🔑 Access Code Management
- **Dynamic Updates**: Change access code anytime through admin panel
- **Secure Storage**: Codes stored securely in database
- **Default Code**: `g@2026` (can be changed)
- **Minimum Length**: 4 characters required

### 👥 Role-Based Access
- **Admin**: Full access to manage codes
- **Headmaster**: Full access to manage codes
- **Other Staff**: Use code to access portal (cannot change it)

### 📊 Audit & History
- **Complete Logging**: Every change is logged with:
  - Timestamp
  - User who made the change
  - Old and new code values
  - Reason for change
  - IP address
- **History View**: See all past changes in chronological order

### 🔒 Security Features
- **Validation**: Minimum 4 characters required
- **Confirmation**: Requires confirmation before updating
- **Audit Trail**: Complete history of all changes
- **IP Tracking**: Records IP address of changes

---

## 🚀 Quick Setup

### Step 1: Run Setup Script

**Windows:**
```bash
setup-staff-access-codes.bat
```

**Manual (from backend folder):**
```bash
cd backend
node scripts/setup-staff-access-codes.js
```

### Step 2: Restart Server

```bash
npm run dev
```

### Step 3: Access Management Interface

1. Login as **Admin** or **Headmaster**
2. Navigate to **Staff Access Code Manager**
3. View current code and update as needed

---

## 📖 How to Use

### For Admin/Headmaster

#### View Current Access Code
1. Login to admin dashboard
2. Go to **Staff Access Code Manager**
3. Current code is displayed (click eye icon to reveal)

#### Update Access Code
1. In the **Update Access Code** section:
   - Enter new code (minimum 4 characters)
   - Optionally add reason for change
   - Click **Update Access Code**
2. Confirm the change
3. New code is immediately active

#### View Change History
1. Click **Show History** button
2. See all past changes with:
   - Date and time
   - User who made change
   - Old and new codes
   - Reason for change
   - IP address

### For Staff Members

#### Using Access Code to Login
1. Go to staff login page
2. Enter access code: `g@2026` (or current code)
3. Select your role
4. Enter your credentials
5. Access your dashboard

---

## 🔧 Technical Details

### Database Tables

#### `staff_access_codes`
Stores the current access code configuration:
```sql
- id: Primary key
- code_name: Identifier (e.g., 'staff_portal_access')
- code_value: The actual access code
- description: What the code is for
- is_active: Whether code is active
- created_by: User who created it
- updated_by: User who last updated it
- created_at: Creation timestamp
- updated_at: Last update timestamp
```

#### `staff_access_code_history`
Logs all changes to access codes:
```sql
- id: Primary key
- access_code_id: Reference to staff_access_codes
- old_value: Previous code value
- new_value: New code value
- changed_by: User who made the change
- change_reason: Why the change was made
- ip_address: IP address of the change
- changed_at: When the change occurred
```

#### `staff_roles_config`
Defines staff roles and their requirements:
```sql
- id: Primary key
- role_name: Internal role name
- display_name: User-friendly name
- requires_access_code: Whether role needs access code
- is_active: Whether role is active
```

### API Endpoints

#### Get Current Access Code
```http
GET /api/staff-access-codes/access-code
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "accessCode": {
    "id": 1,
    "code_name": "staff_portal_access",
    "code_value": "g@2026",
    "description": "Main access code for staff portal login",
    "is_active": true,
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Access Code
```http
PUT /api/staff-access-codes/access-code
Authorization: Bearer <token>
Content-Type: application/json

{
  "new_code": "newcode123",
  "change_reason": "Security update"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Access code updated successfully",
  "oldCode": "g@2026",
  "newCode": "newcode123"
}
```

#### Get Change History
```http
GET /api/staff-access-codes/access-code/history?limit=50&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "old_value": "g@2026",
      "new_value": "newcode123",
      "changed_by_username": "admin",
      "first_name": "John",
      "last_name": "Doe",
      "change_reason": "Security update",
      "ip_address": "192.168.1.1",
      "changed_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

#### Verify Access Code (for login)
```http
POST /api/staff-access-codes/verify-access-code
Content-Type: application/json

{
  "access_code": "g@2026"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Access code verified"
}
```

#### Get Staff Roles
```http
GET /api/staff-access-codes/roles
```

**Response:**
```json
{
  "success": true,
  "roles": [
    {
      "role_name": "admin",
      "display_name": "System Admin",
      "requires_access_code": true,
      "is_active": true
    },
    {
      "role_name": "headmaster",
      "display_name": "Headmaster",
      "requires_access_code": true,
      "is_active": true
    }
  ]
}
```

---

## 🎯 Staff Roles

All staff roles require the access code for portal login:

1. **Super Admin** - Full system control
2. **System Admin** - Complete admin dashboard
3. **Headmaster** - School oversight
4. **Director of Studies (DOS)** - Academic management
5. **Director of Discipline (DOD)** - Discipline management
6. **Accountant** - Financial management
7. **Stock Manager** - Inventory management
8. **School Patron** - General oversight
9. **Academic Advisor** - Student guidance
10. **Teachers** - Class management

---

## 🔐 Security Best Practices

### For Administrators

1. **Change Default Code**: Update from `g@2026` to a unique code
2. **Regular Updates**: Change code periodically (e.g., every 3-6 months)
3. **Strong Codes**: Use combination of letters, numbers, and symbols
4. **Document Changes**: Always provide reason when updating
5. **Communicate Changes**: Inform staff when code changes
6. **Monitor History**: Regularly review change history
7. **Restrict Access**: Only Admin and Headmaster can change codes

### For Staff Members

1. **Keep Confidential**: Don't share access code with unauthorized persons
2. **Secure Storage**: Store code securely
3. **Report Issues**: Report if code is compromised
4. **Use Properly**: Only use for authorized access

---

## 📱 Frontend Integration

### Import Component
```tsx
import StaffAccessCodeManager from '@/app/components/StaffAccessCodeManager';
```

### Use in Admin Dashboard
```tsx
<StaffAccessCodeManager />
```

### API Service Integration
```typescript
// Get current code
const response = await apiService.get('/api/staff-access-codes/access-code');

// Update code
const response = await apiService.put('/api/staff-access-codes/access-code', {
  new_code: 'newcode123',
  change_reason: 'Security update'
});

// Get history
const response = await apiService.get('/api/staff-access-codes/access-code/history');
```

---

## 🐛 Troubleshooting

### Issue: Cannot access management interface
**Solution**: Ensure you're logged in as Admin or Headmaster

### Issue: Code update fails
**Solution**: 
- Check code is at least 4 characters
- Ensure you have proper permissions
- Check server logs for errors

### Issue: Staff cannot login with new code
**Solution**:
- Verify code was updated successfully
- Check staff are using the correct new code
- Clear browser cache

### Issue: History not showing
**Solution**:
- Click "Show History" button
- Check database connection
- Verify history table exists

---

## 📊 Database Queries

### Check Current Code
```sql
SELECT * FROM staff_access_codes 
WHERE code_name = 'staff_portal_access' AND is_active = TRUE;
```

### View All Changes
```sql
SELECT h.*, a.username, a.first_name, a.last_name
FROM staff_access_code_history h
LEFT JOIN admin_users a ON h.changed_by = a.id
ORDER BY h.changed_at DESC;
```

### Update Code Manually (Emergency)
```sql
UPDATE staff_access_codes 
SET code_value = 'emergency_code', updated_at = NOW() 
WHERE code_name = 'staff_portal_access';
```

---

## 🎉 Benefits

### For Administration
- ✅ **Centralized Control**: Manage all staff access from one place
- ✅ **Security**: Change codes when needed for security
- ✅ **Audit Trail**: Complete history of all changes
- ✅ **Flexibility**: Update codes without code changes

### For Staff
- ✅ **Simple Access**: One code for all staff roles
- ✅ **Secure**: Codes can be updated if compromised
- ✅ **Consistent**: Same login process for all staff

### For System
- ✅ **Scalable**: Easy to add new roles
- ✅ **Maintainable**: No hardcoded values
- ✅ **Traceable**: Full audit logging
- ✅ **Secure**: Database-driven access control

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review server logs
3. Check database tables
4. Contact system administrator

---

## 🔄 Version History

### Version 1.0.0 (Current)
- Initial release
- Basic access code management
- Admin/Headmaster access
- Full audit logging
- Change history tracking
- Frontend management interface

---

## ✅ System Status

**Status**: ✅ Fully Functional

**Features**:
- ✅ Database tables created
- ✅ API endpoints working
- ✅ Frontend interface ready
- ✅ Audit logging active
- ✅ Role-based access control
- ✅ Change history tracking
- ✅ Security validation

**Default Configuration**:
- Access Code: `g@2026`
- Minimum Length: 4 characters
- Authorized Roles: Admin, Headmaster
- Audit Logging: Enabled

---

## 🎯 Next Steps

1. ✅ Run setup script: `setup-staff-access-codes.bat`
2. ✅ Restart server
3. ✅ Login as Admin or Headmaster
4. ✅ Access Staff Access Code Manager
5. ✅ Update default code to your preferred code
6. ✅ Communicate new code to staff
7. ✅ Monitor change history regularly

---

**System Ready! 🚀**

All staff can now login using the access code system with full admin control and audit logging!

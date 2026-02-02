# 🔧 FIX: Parent Redirects to Admin Dashboard

## ❌ Problem
When parent logs in, they are redirected to **admin dashboard** instead of **parent dashboard**.

## 🎯 Root Cause
The user's `role` in the database is set to **"student"** instead of **"parent"**.

## ✅ Solution

### Quick Fix (Choose One):

#### Option 1: Using MySQL Command Line
```bash
mysql -u root -p
# Enter your MySQL password
USE garden_tvet_school;
source FIX-PARENT-ROLE-NOW.sql
```

#### Option 2: Using phpMyAdmin
1. Open phpMyAdmin
2. Select database: `garden_tvet_school`
3. Click "SQL" tab
4. Copy and paste this:
```sql
-- Fix parent role
INSERT IGNORE INTO roles (name, description) 
VALUES ('parent', 'Parent/Guardian');

SET @parent_role_id = (SELECT id FROM roles WHERE name = 'parent' LIMIT 1);

UPDATE users 
SET role = 'parent', role_id = @parent_role_id
WHERE phone = '0796329328';
```
5. Click "Go"

#### Option 3: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open `FIX-PARENT-ROLE-NOW.sql` file
4. Execute the script

### After Running the Fix:

1. **Restart Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Login Again:**
   - Phone: `0796329328`
   - Password: `1234567`
   - ✅ Should redirect to **Parent Dashboard**

## 🔍 Verify the Fix

Run this SQL to check:
```sql
SELECT id, username, email, phone, role, first_name, last_name
FROM users 
WHERE phone = '0796329328';
```

Should show:
- `role`: **parent** (not "student")

## 📝 Why This Happened

During registration, the role was incorrectly set to "student" instead of "parent". The login system reads the `role` field to determine which dashboard to show.

## ✅ Expected Behavior After Fix

**Login Flow:**
```
Parent Login (Phone: 0796329328)
    ↓
Backend checks role = "parent"
    ↓
Returns user with role: "parent"
    ↓
Frontend redirects to: dashboard-parent
    ↓
✅ Parent Dashboard Loads
```

---

**Run `FIX-PARENT-DASHBOARD.bat` or execute the SQL manually!** 🚀

# 🔧 Fix Parent Login Issue

## ❌ Problem
Login fails with:
- Phone: `0796329328`
- Password: `1234567`
- Error: "Invalid phone number or password"

## ✅ Solution

### Quick Fix (Recommended):
```bash
# Run this script
fix-parent-login.bat

# Choose option 2 to create/update the account
```

### Manual Fix:

#### Step 1: Check if account exists
```bash
cd backend
node check-parent-login.js
```

#### Step 2: Create/Update account
```bash
cd backend
node create-test-parent.js
```

## 📝 What the Script Does

### Check Script (`check-parent-login.js`):
- Searches for phone `0796329328` in `parents` table
- Searches for phone `0796329328` in `users` table
- Shows all existing parent accounts
- Displays account details if found

### Create Script (`create-test-parent.js`):
- Checks if parent with phone `0796329328` exists
- If exists: Updates password to `1234567`
- If not exists: Creates new parent account
- Hashes password properly with bcrypt
- Sets account as active

## 🎯 After Running the Script

You'll have a working parent account:

**Login Credentials:**
- Phone: `0796329328`
- Password: `1234567`
- Email: `parent_0796329328@garden.tvet` (auto-generated)

**How to Login:**

### Option 1: Phone Login
1. Go to http://localhost:5173
2. Click "Injira" (Login)
3. Select "Telefoni" tab
4. Enter phone: `0796329328`
5. Enter password: `1234567`
6. Click "Injira"

### Option 2: Email Login
1. Go to http://localhost:5173
2. Click "Injira" (Login)
3. Select "Email" tab
4. Enter email: `parent_0796329328@garden.tvet`
5. Enter password: `1234567`
6. Click "Injira"

## 🔍 Common Issues

### Issue 1: "Cannot find module 'mysql2'"
**Solution:**
```bash
cd backend
npm install mysql2
```

### Issue 2: "Cannot find module 'bcryptjs'"
**Solution:**
```bash
cd backend
npm install bcryptjs
```

### Issue 3: "Cannot connect to database"
**Solution:**
- Make sure MySQL is running
- Check `.env` file in backend folder
- Verify database credentials

### Issue 4: "Table 'parents' doesn't exist"
**Solution:**
```bash
cd backend
# Run the migration to create parents table
node migrations/create_parents_table.js
```

## 📊 Database Tables

### Parents Table Structure:
```sql
CREATE TABLE parents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Quick Test

After running the fix script:

1. **Open browser**: http://localhost:5173
2. **Click**: "Injira" (Login)
3. **Select**: "Telefoni" tab
4. **Enter**:
   - Phone: `0796329328`
   - Password: `1234567`
5. **Click**: "Injira"
6. **Result**: Should redirect to Parent Dashboard ✅

## 📞 Support

If you still have issues:

1. Check backend console for errors
2. Check browser console (F12) for errors
3. Verify backend is running on port 5000
4. Verify frontend is running on port 5173
5. Check database connection in `.env` file

---

**Run `fix-parent-login.bat` to fix the issue now!** 🚀

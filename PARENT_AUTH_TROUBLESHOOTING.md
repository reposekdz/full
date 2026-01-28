# Parent Authentication Troubleshooting Guide

## Issues Identified and Fixed

### Issue 1: Parent Registration Not Redirecting to Dashboard

**Problem:**
- Parent registers successfully
- Token is stored in localStorage
- But page doesn't redirect to parent dashboard

**Root Cause:**
- RegisterPage.tsx was using `onNavigate()` instead of `window.location.href`
- The navigation function wasn't properly handling the dashboard route

**Fix Applied:**
```typescript
// Changed from:
setTimeout(() => onNavigate(dashboardPage), 1500);

// To:
setTimeout(() => {
  window.location.href = `/${dashboardPage}`;
}, 1500);
```

**Location:** `src/app/pages/RegisterPage.tsx` (Line ~160)

---

### Issue 2: Parent Login with Phone Not Working

**Problem:**
- Parent tries to login with phone number
- Login fails or uses wrong endpoint

**Root Cause:**
- LoginPage.tsx wasn't using the correct endpoint for parent login
- Backend has separate endpoint: `/api/auth/login/parent`
- Frontend was sending all logins to generic `/api/auth/login`

**Fix Applied:**
```typescript
// Added endpoint routing based on login method:
if (loginMethod === 'phone') {
  endpoint = 'http://localhost:5000/api/auth/login/parent';
  loginData = { phone: formData.phone, password: formData.password };
}
```

**Location:** `src/app/pages/LoginPage.tsx` (Line ~30)

---

### Issue 3: Token Storage Inconsistency

**Problem:**
- Token stored with different keys in different places
- Sometimes `token`, sometimes `authToken`

**Fix Applied:**
- Standardized to use `token` and `user` keys
- Updated both registration and login flows

---

## Backend Endpoints

### Parent Registration
```
POST http://localhost:5000/api/auth/register/parent
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "0788123456",
  "password": "password123",
  "address": "Kigali, Rwanda"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Parent registration successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "parent_1234567890",
    "email": "john@example.com",
    "phone": "0788123456",
    "first_name": "John",
    "last_name": "Doe",
    "role": "parent"
  }
}
```

### Parent Login
```
POST http://localhost:5000/api/auth/login/parent
```

**Request Body:**
```json
{
  "phone": "0788123456",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "parent_1234567890",
    "email": "john@example.com",
    "phone": "0788123456",
    "first_name": "John",
    "last_name": "Doe",
    "role": "parent",
    "children_count": 0
  }
}
```

---

## Testing Steps

### Test Parent Registration

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Navigate to Registration:**
   - Go to `http://localhost:3000/register`
   - Or click "Register" from login page

4. **Fill Registration Form:**
   - Step 1: Enter first name, last name, email, phone
   - Step 2: Enter password, confirm password, select "Parent" role
   - Step 3: Enter date of birth, gender, address
   - Step 4: Accept terms and conditions

5. **Submit and Verify:**
   - Click "Register"
   - Should see success message
   - Should redirect to `/dashboard-parent` after 1.5 seconds
   - Check browser console for any errors
   - Check localStorage for `token` and `user` keys

### Test Parent Login

1. **Navigate to Login:**
   - Go to `http://localhost:3000/login`

2. **Select Phone Login Method:**
   - Click on "Telefoni" tab

3. **Enter Credentials:**
   - Phone: Your registered phone number
   - Password: Your password

4. **Submit and Verify:**
   - Click "Login"
   - Should see success message
   - Should redirect to `/dashboard-parent` after 1 second
   - Check localStorage for `token` and `user` keys

---

## Common Issues and Solutions

### Issue: "Invalid phone number or password"

**Possible Causes:**
1. Phone number not in database
2. Wrong password
3. Parent account not active

**Solution:**
```sql
-- Check if parent exists
SELECT * FROM parents WHERE phone = '0788123456';

-- Check if parent is active
SELECT * FROM parents WHERE phone = '0788123456' AND is_active = true;

-- Reset password if needed
UPDATE parents 
SET password_hash = '$2a$10$...' -- Use bcrypt to hash new password
WHERE phone = '0788123456';
```

### Issue: "Parents table does not exist"

**Solution:**
```bash
# Run migrations
cd backend
node scripts/run-migrations.js
```

### Issue: Redirect not working after login/registration

**Check:**
1. Browser console for errors
2. Network tab for API response
3. localStorage for token storage

**Debug:**
```javascript
// Open browser console and check:
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));
```

### Issue: Token stored but still not logged in

**Solution:**
1. Clear localStorage: `localStorage.clear()`
2. Clear sessionStorage: `sessionStorage.clear()`
3. Hard refresh: `Ctrl + Shift + R`
4. Try login again

---

## Database Schema

### Parents Table
```sql
CREATE TABLE parents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  occupation VARCHAR(100),
  relationship ENUM('father', 'mother', 'guardian'),
  profile_image VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Parent-Student Linking Table
```sql
CREATE TABLE parent_student (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  student_id INT NOT NULL,
  relationship ENUM('father', 'mother', 'guardian'),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parents(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);
```

---

## Quick Fix Commands

### Create Test Parent
```bash
cd backend
node scripts/test-parent-auth.js
```

### Check Database
```bash
mysql -u root -p school_management
```

```sql
-- Check parents table
SELECT * FROM parents;

-- Check parent_student links
SELECT * FROM parent_student;

-- Check roles
SELECT * FROM roles WHERE name = 'parent';
```

### Reset Everything
```bash
# Stop servers
# Clear database
mysql -u root -p school_management < backend/migrations/create_parents_table.sql

# Run migrations
cd backend
node scripts/run-migrations.js

# Create test parent
node scripts/test-parent-auth.js

# Restart servers
npm run dev
```

---

## Support

If issues persist:

1. Check backend logs for errors
2. Check browser console for frontend errors
3. Verify database connection
4. Ensure all migrations have run
5. Test with the test parent account created by `test-parent-auth.js`

---

## Files Modified

1. `src/app/pages/RegisterPage.tsx` - Fixed redirect after registration
2. `src/app/pages/LoginPage.tsx` - Fixed parent login endpoint routing
3. `backend/routes/auth.js` - Parent registration and login endpoints (already correct)
4. `backend/migrations/create_parents_table.sql` - Parents table schema (already exists)

---

## Next Steps

After fixing these issues:

1. Test parent registration flow completely
2. Test parent login flow completely
3. Test parent dashboard access
4. Test linking parent to student
5. Test parent viewing student information

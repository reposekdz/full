# Student Serial Code Authentication System

## Overview
Students login using unique serial codes instead of email. Registration requires minimal information: serial code, password, parent phone, and location.

## How It Works

### 1. DOS Generates Serial Code
- DOS accesses the serial code generator
- Generates unique code (format: `STD2026123456`)
- Gives code to student manually

### 2. Student Registers
- Student receives serial code from DOS
- Goes to registration page
- Enters:
  - Serial code (from DOS)
  - Parent phone number
  - Location
  - Password
- No name, email, or other personal info required

### 3. Student Logs In
- Uses serial code + password
- Gets access to student dashboard

---

## API Endpoints

### DOS: Generate Serial Code
```http
POST /api/student-auth/dos/generate-code
Authorization: Bearer <token>
```

**Request:**
```json
{
  "class_id": "optional",
  "student_name": "optional"
}
```

**Response:**
```json
{
  "success": true,
  "serialCode": "STD2026123456",
  "message": "Serial code generated. Give this to the student for registration."
}
```

### Student Registration
```http
POST /api/student-auth/student/register
```

**Request:**
```json
{
  "serial_code": "STD2026123456",
  "password": "student_password",
  "parent_phone": "+250 XXX XXX XXX",
  "location": "Kigali, Gasabo"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! You can now login with your serial code.",
  "userId": 123
}
```

### Student Login
```http
POST /api/student-auth/student/login
```

**Request:**
```json
{
  "serial_code": "STD2026123456",
  "password": "student_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 123,
    "serial_code": "STD2026123456",
    "role": "student",
    "parent_phone": "+250 XXX XXX XXX",
    "location": "Kigali, Gasabo"
  }
}
```

### Get Student Profile
```http
GET /api/student-auth/student/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 123,
    "serial_code": "STD2026123456",
    "parent_phone": "+250 XXX XXX XXX",
    "address": "Kigali, Gasabo",
    "profile_picture": null,
    "last_login": "2026-01-15 10:30:00",
    "role": "student"
  }
}
```

### Update Student Profile
```http
PUT /api/student-auth/student/profile
Authorization: Bearer <token>
```

**Request:**
```json
{
  "parent_phone": "+250 XXX XXX XXX",
  "location": "New Location",
  "profile_picture": "url_to_image"
}
```

### Change Password
```http
PUT /api/student-auth/student/change-password
Authorization: Bearer <token>
```

**Request:**
```json
{
  "current_password": "old_password",
  "new_password": "new_password"
}
```

---

## Database Schema Changes

### Users Table Updates
```sql
-- Add serial_code column
ALTER TABLE users 
ADD COLUMN serial_code VARCHAR(50) UNIQUE NULL;

-- Add parent_phone column
ALTER TABLE users 
ADD COLUMN parent_phone VARCHAR(20) NULL;

-- Make email optional
ALTER TABLE users 
MODIFY COLUMN email VARCHAR(255) NULL;

-- Make username optional
ALTER TABLE users 
MODIFY COLUMN username VARCHAR(100) NULL;

-- Create index for faster lookups
CREATE INDEX idx_serial_code ON users(serial_code);
```

---

## Setup Instructions

### Step 1: Update Database Schema
```bash
cd backend
node scripts/update-student-auth-schema.js
```

**Expected Output:**
```
🔄 Updating database schema for student authentication...

Adding serial_code column...
✅ serial_code column added

Adding parent_phone column...
✅ parent_phone column added

Creating index on serial_code...
✅ Index created

Making email optional...
✅ Email is now optional

Making username optional...
✅ Username is now optional

✅ Database schema updated successfully!

📋 Summary:
   - serial_code column added (unique)
   - parent_phone column added
   - Index created on serial_code
   - Email made optional
   - Username made optional

✅ Done!
```

### Step 2: Restart Backend Server
```bash
npm start
```

### Step 3: Add Routes to Frontend
```typescript
// In App.tsx
import StudentAuth from '@/app/pages/StudentAuth';
import DOSSerialCodeGenerator from '@/app/pages/admin/DOSSerialCodeGenerator';

// Add routes
<Route path="/student-auth" element={<StudentAuth onNavigate={navigate} />} />
<Route path="/dos/generate-code" element={<DOSSerialCodeGenerator />} />
```

---

## Usage Flow

### For DOS (Director of Studies)

1. **Access Code Generator**
   - Navigate to `/dos/generate-code`
   - Login with DOS credentials

2. **Generate Code**
   - Optionally enter student name and class ID
   - Click "Generate Serial Code"
   - Copy the generated code

3. **Give to Student**
   - Write down or print the code
   - Give it to the student manually
   - Inform student about registration requirements

### For Students

1. **Receive Serial Code**
   - Get serial code from DOS
   - Keep it safe

2. **Register**
   - Go to `/student-auth`
   - Click "Register"
   - Enter:
     - Serial code (from DOS)
     - Parent phone number
     - Location (address)
     - Password (create new)
     - Confirm password

3. **Login**
   - Go to `/student-auth`
   - Enter serial code
   - Enter password
   - Click "Login"

4. **Access Dashboard**
   - Redirected to student dashboard
   - Can view grades, attendance, etc.

---

## Serial Code Format

**Format:** `STD{YEAR}{RANDOM}`

**Example:** `STD2026123456`

- `STD` - Prefix for student
- `2026` - Current year
- `123456` - Random 6-digit number

**Uniqueness:** System checks database to ensure no duplicates

---

## Security Features

1. **Unique Serial Codes**
   - Each code is unique
   - Cannot be reused
   - Validated against database

2. **Password Hashing**
   - Passwords hashed with bcrypt
   - Salt rounds: 10
   - Never stored in plain text

3. **JWT Authentication**
   - Token expires in 24 hours
   - Includes user ID, serial code, and role
   - Required for protected routes

4. **Input Validation**
   - All fields validated
   - SQL injection prevention
   - XSS protection

---

## Frontend Components

### StudentAuth Component
- Combined login/register page
- Toggle between modes
- Form validation
- Error handling
- Success messages

### DOSSerialCodeGenerator Component
- Generate serial codes
- Copy to clipboard
- Display instructions
- Track generated codes

---

## Error Handling

### Common Errors

**Serial code already registered:**
```json
{
  "success": false,
  "message": "This serial code is already registered"
}
```

**Invalid serial code or password:**
```json
{
  "success": false,
  "message": "Invalid serial code or password"
}
```

**Missing required fields:**
```json
{
  "success": false,
  "message": "Serial code, password, parent phone, and location are required"
}
```

---

## Testing

### Test Serial Code Generation
```bash
curl -X POST http://localhost:5000/api/student-auth/dos/generate-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"student_name": "Test Student"}'
```

### Test Student Registration
```bash
curl -X POST http://localhost:5000/api/student-auth/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "serial_code": "STD2026123456",
    "password": "test123",
    "parent_phone": "+250 XXX XXX XXX",
    "location": "Kigali"
  }'
```

### Test Student Login
```bash
curl -X POST http://localhost:5000/api/student-auth/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "serial_code": "STD2026123456",
    "password": "test123"
  }'
```

---

## Benefits

1. ✅ **Privacy** - No personal names required
2. ✅ **Simple** - Only 4 fields for registration
3. ✅ **Secure** - Unique codes, password hashing
4. ✅ **Controlled** - DOS manages code generation
5. ✅ **Parent Contact** - Parent phone stored
6. ✅ **Location Tracking** - Student location recorded

---

## Troubleshooting

### Issue: Serial code not working
**Solution:** 
- Verify code was generated by DOS
- Check if code already registered
- Ensure correct format (STD2026XXXXXX)

### Issue: Registration fails
**Solution:**
- Check all required fields filled
- Verify passwords match
- Ensure parent phone format correct

### Issue: Login fails
**Solution:**
- Verify serial code correct
- Check password correct
- Ensure account registered

---

**Last Updated:** January 2026  
**Version:** 1.0.0

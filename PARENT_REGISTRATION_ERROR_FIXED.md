# 🔧 Parent Registration Error - FIXED!

## ❌ Error Message
```
Ntushobora guhuza na seriveri. Kugenzura niba seriveri irakoze.
```
**Translation**: "Cannot connect to server. Check if server is running."

## 🎯 Root Cause
**Backend server is NOT running!**

The frontend is trying to call:
```
POST http://localhost:5000/api/parent-registration/register
```

But the backend server at `localhost:5000` is not responding.

## ✅ Solution (30 seconds)

### Option 1: Run Fix Script
```bash
FIX-PARENT-REGISTRATION-ERROR.bat
```

### Option 2: Manual Fix
```bash
# 1. Open terminal in backend folder
cd backend

# 2. Start server
npm start

# 3. Wait for this message:
# "🚀 Server: http://localhost:5000"
```

## 🧪 Verify Fix

### 1. Check if server is running
```bash
# Windows
netstat -ano | findstr :5000

# Should show something like:
# TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    12345
```

### 2. Test API endpoint
```bash
# Open browser and go to:
http://localhost:5000/api/health

# Should return:
{
  "status": "ok",
  "message": "Garden TVET School Management System API",
  "version": "4.0.0"
}
```

### 3. Try parent registration again
1. Go to `http://localhost:5173`
2. Click "Iyandikisha nk'Umubyeyi" (Register as Parent)
3. Fill in the form
4. Click "Iyandikisha" (Register)
5. ✅ Should work now!

## 🔍 Troubleshooting

### Still getting the error?

#### Check 1: Is MySQL running?
```bash
# Windows Services
services.msc
# Look for "MySQL" - should be "Running"
```

#### Check 2: Database credentials correct?
```bash
# Check backend/.env file
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=garden_tvet
```

#### Check 3: Port 5000 available?
```bash
# If port 5000 is busy, server will try 5001, 5002, etc.
# Check backend console for actual port:
# "🚀 Server: http://localhost:5001"

# Update frontend API_BASE_URL if needed
```

#### Check 4: Frontend API URL correct?
```typescript
// src/app/config/apiBase.ts
export const API_BASE_URL = 'http://localhost:5000/api';
```

## 📊 Route Registration Status

✅ Route is registered in `server.js`:
```javascript
// Line ~450
app.use('/api/parent-registration', require('./routes/parent-registration'));
```

✅ Route file exists:
```
backend/routes/parent-registration.js
```

✅ Endpoints available:
- `POST /api/parent-registration/register` - Register parent
- `POST /api/parent-registration/search-students` - Search students
- `POST /api/parent-registration/verify-student` - Verify student
- `POST /api/parent-registration/add-student` - Add student link

## 🎯 Summary

**Problem**: Backend not running
**Solution**: Start backend with `npm start`
**Time**: 30 seconds
**Impact**: HIGH - Parents can now register!

## 🚀 Quick Start Commands

```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend (if not running)
cd ..
npm run dev

# Open browser
http://localhost:5173
```

That's it! 🎉

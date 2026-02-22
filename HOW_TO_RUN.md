# 🚀 HOW TO RUN THE SETUP

## Step 1: Run Setup Script

Open Command Prompt in the project root and run:

```bash
setup-parent-system-complete.bat
```

### What It Does:
1. ✅ Creates database tables
2. ✅ Installs dependencies (bcryptjs, etc.)
3. ✅ Registers API routes
4. ✅ Creates SMS service
5. ✅ Creates .env file
6. ✅ Verifies all files

### Expected Output:
```
========================================
COMPLETE PARENT SYSTEM SETUP
Auto SMS + Full Dashboard + Payments
========================================

[1/6] Running database migrations...
[OK] Database tables created

[2/6] Installing backend dependencies...
[OK] Dependencies installed

[3/6] Registering API routes...
[OK] Routes registered

[4/6] Creating SMS service...
[OK] SMS service created

[5/6] Verifying file structure...
[OK] All route files present

[6/6] Creating environment configuration...
[OK] .env file created

========================================
SETUP COMPLETE! ✓✓✓
========================================
```

---

## Step 2: Configure Environment

Edit `backend/.env` file:

```env
# SMS Configuration
AT_API_KEY=your_africastalking_api_key
AT_USERNAME=your_africastalking_username

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_management

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Server
PORT=5000
```

---

## Step 3: Run Verification

```bash
verify-parent-system.bat
```

### Expected Output:
```
========================================
PARENT SYSTEM VERIFICATION
Testing All Components
========================================

[1/10] Checking database tables...
[OK] Database tables exist

[2/10] Checking backend routes...
[OK] dodParentLink.js exists
[OK] parentDashboard.js exists
[OK] parentPayments.js exists

[3/10] Checking SMS service...
[OK] SMS service exists

[4/10] Checking environment configuration...
[OK] .env file exists

[5/10] Checking frontend components...
[OK] ParentDashboard component exists

[6/10] Checking migrations...
[OK] Migration file exists

[7/10] Checking documentation...
[OK] Documentation exists

[8/10] Testing database connection...
[OK] Database connection successful

[9/10] Checking Node.js dependencies...
[OK] bcryptjs installed

[10/10] Checking server configuration...
[OK] Routes registered in server.js

========================================
VERIFICATION RESULTS
========================================
Tests Passed: 10
Tests Failed: 0

[SUCCESS] All tests passed! System is ready!
```

---

## Step 4: Start Backend

```bash
cd backend
npm start
```

Expected output:
```
Server running on port 5000
Database connected
SMS service initialized
```

---

## Step 5: Start Frontend

Open new terminal:

```bash
npm run dev
```

Expected output:
```
VITE ready in 500ms
Local: http://localhost:5173
```

---

## Step 6: Test the System

### 6.1 Login as DOD
- Go to `http://localhost:5173`
- Login with DOD credentials

### 6.2 Link Parent to Student
- Navigate to Students tab
- Click on a student
- Click "Link Parent" button
- Enter parent details:
  - Name: John Doe
  - Phone: 0788123456
  - Relationship: Father
- Click "Submit"

### 6.3 Verify SMS Sent
Check console logs:
```
SMS sent to +250788123456
Message: Muraho! Mwahawe konti ya Parent Portal...
Status: Success
```

### 6.4 Login as Parent
- Logout from DOD
- Login with parent credentials:
  - Phone: 0788123456
  - Password: (from SMS)

### 6.5 Verify Dashboard
Parent should see:
- ✅ Student information
- ✅ Grades
- ✅ Conduct (X/40)
- ✅ Attendance
- ✅ Fees & Balance
- ✅ All tabs working

### 6.6 Test Payment
- Click "Fees" tab
- Click "Pay Fees"
- Enter amount: 50000
- Select: Mobile Money
- Enter phone: 0788123456
- Click "Pay Now"
- Verify SMS confirmation received

---

## Troubleshooting

### Issue: Database migration fails
```bash
# Solution: Check MySQL credentials
mysql -u root -p
# Then manually run:
source backend/migrations/parent_system_complete.sql
```

### Issue: SMS not sending
```bash
# Solution: Check .env configuration
# Make sure AT_API_KEY and AT_USERNAME are correct
# Test SMS service:
node backend/test-sms.js
```

### Issue: Routes not registered
```bash
# Solution: Manually add to backend/server.js
const dodParentLink = require('./routes/dodParentLink');
const parentDashboard = require('./routes/parentDashboard');
const parentPayments = require('./routes/parentPayments');

app.use('/api/dod-parent-link', dodParentLink);
app.use('/api/parent-dashboard', parentDashboard);
app.use('/api/parent-payments', parentPayments);
```

### Issue: Dependencies not installed
```bash
cd backend
npm install bcryptjs express-validator multer socket.io
```

---

## Success Indicators

✅ Setup script completes without errors  
✅ Verification shows 10/10 tests passed  
✅ Backend starts on port 5000  
✅ Frontend starts on port 5173  
✅ DOD can link parents  
✅ SMS sent automatically  
✅ Parent can login  
✅ Dashboard shows all data  
✅ Payments work  
✅ SMS confirmations sent  

---

## Quick Commands

```bash
# Full setup
setup-parent-system-complete.bat

# Verify
verify-parent-system.bat

# Start backend
cd backend && npm start

# Start frontend (new terminal)
npm run dev

# Check logs
tail -f backend/logs/error.log
```

---

## What Happens When You Run Setup

1. **Database Migration** (30 seconds)
   - Creates 5 new tables
   - Updates 2 existing tables
   - Adds indexes

2. **Install Dependencies** (1-2 minutes)
   - bcryptjs for password hashing
   - express-validator for input validation
   - multer for file uploads
   - socket.io for real-time updates

3. **Register Routes** (instant)
   - Adds 4 new API routes to server.js
   - Configures middleware

4. **Create SMS Service** (instant)
   - Creates smsService.js
   - Configures Africa's Talking

5. **Create .env** (instant)
   - Creates environment configuration
   - Sets default values

6. **Verify Files** (instant)
   - Checks all files exist
   - Validates structure

---

## After Setup

Your system will have:

✅ **11 new/updated files**
✅ **7 database tables**
✅ **4 API routes**
✅ **1 SMS service**
✅ **5 SMS templates**
✅ **Complete documentation**

---

## Ready to Go!

Just run:
```bash
setup-parent-system-complete.bat
```

Then:
```bash
verify-parent-system.bat
```

Then start your servers and you're live! 🚀

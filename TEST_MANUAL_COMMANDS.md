# 🧪 Quick Test - Manual Commands

## Run these commands in order:

### Step 1: Navigate to backend folder
```bash
cd backend
```

### Step 2: Install dependencies (if not already installed)
```bash
npm install africastalking jsonwebtoken dotenv
```

### Step 3: Run basic test
```bash
node test-sms-jwt.js
```

### OR run advanced test (with SMS sending)
```bash
node test-sms-advanced.js
```

---

## Expected Output

### ✅ Success:
```
========================================
TEST RESULTS
========================================
JWT: ✅ WORKING
Africa's Talking Connection: ✅ WORKING

🎉 All systems functional!
```

### ⚠️ Not Configured:
```
JWT: ✅ WORKING
Africa's Talking: ⚠️  NOT CONFIGURED
```

---

## If You Get Errors

### "Cannot find module"
**Solution**: Install dependencies first
```bash
cd backend
npm install africastalking jsonwebtoken dotenv
```

### "EPERM: operation not permitted"
**Solution**: Run Command Prompt as Administrator, or use manual commands above

### "Connection failed"
**Solution**: Check your `.env` file has correct credentials:
```env
AFRICATALKING_API_KEY=your_key
AFRICATALKING_USERNAME=your_username
```

---

## Quick Test (Copy & Paste)

Open Command Prompt in project folder and paste:

```bash
cd backend && npm install africastalking jsonwebtoken dotenv && node test-sms-jwt.js
```

This will install dependencies and run the test in one command!

# 🧪 SMS & JWT Testing Guide

## 🚀 Quick Test

Run one of these batch files:

### Basic Test (Recommended)
```bash
test-sms-jwt.bat
```
**Tests:**
- ✅ JWT token generation and verification
- ✅ Africa's Talking configuration check
- ✅ Connection to Africa's Talking API
- ✅ Balance check

### Advanced Test (With SMS Sending)
```bash
test-sms-advanced.bat
```
**Tests:**
- ✅ JWT token generation and verification
- ✅ Africa's Talking configuration check
- ✅ Connection to Africa's Talking API
- ✅ Balance check
- ✅ **Send actual test SMS** (optional)

---

## 📋 What Gets Tested

### 1. JWT Authentication ✅
- Token creation with user payload
- Token verification
- Expiration handling
- Secret key validation

### 2. Africa's Talking Configuration ✅
- API Key presence
- Username presence
- Credentials format validation

### 3. Africa's Talking Connection ✅
- API authentication
- Balance retrieval
- Service availability

### 4. SMS Sending (Advanced Test) ✅
- Send test message to real phone
- Delivery status check
- Cost calculation
- Message ID tracking

---

## 🔧 Before Testing

### 1. Ensure Dependencies Installed
```bash
cd backend
npm install africastalking jsonwebtoken dotenv
```

### 2. Configure .env File
```env
# JWT
JWT_SECRET=your-secret-key-here

# Africa's Talking
AFRICATALKING_API_KEY=your_api_key_here
AFRICATALKING_USERNAME=your_username_here
AFRICATALKING_SHORTCODE=SCHOOL
```

### 3. Get Africa's Talking Credentials
1. Sign up at https://africastalking.com
2. Go to Dashboard
3. Copy API Key and Username
4. Add to `.env` file

---

## 📊 Expected Results

### ✅ All Working
```
========================================
TEST RESULTS
========================================
JWT: ✅ WORKING
Africa's Talking Connection: ✅ WORKING
SMS Sending: ✅ WORKING

🎉 All systems functional!
```

### ⚠️ Not Configured
```
========================================
TEST RESULTS
========================================
JWT: ✅ WORKING
Africa's Talking: ⚠️  NOT CONFIGURED

To configure Africa's Talking:
1. Edit backend/.env
2. Add AFRICATALKING_API_KEY=your_key
3. Add AFRICATALKING_USERNAME=your_username
```

### ❌ Connection Failed
```
========================================
TEST RESULTS
========================================
JWT: ✅ WORKING
Africa's Talking: ❌ CONNECTION FAILED

Check:
1. API credentials are correct
2. Internet connection is active
3. Africa's Talking service is up
```

---

## 🐛 Troubleshooting

### JWT Not Working
**Problem**: Token generation/verification fails  
**Solution**: 
- Check `JWT_SECRET` in `.env`
- Ensure `jsonwebtoken` package installed
- Verify Node.js version (12+)

### Africa's Talking Not Configured
**Problem**: Credentials missing  
**Solution**:
1. Sign up at https://africastalking.com
2. Get API Key and Username
3. Add to `backend/.env`:
   ```env
   AFRICATALKING_API_KEY=your_key
   AFRICATALKING_USERNAME=your_username
   ```

### Connection Failed
**Problem**: Can't connect to Africa's Talking  
**Solution**:
- Verify API credentials are correct
- Check internet connection
- Try again (service might be temporarily down)
- Check account status on Africa's Talking dashboard

### SMS Not Sending
**Problem**: SMS fails to send  
**Solution**:
- Check account balance
- Verify phone number format (+250...)
- Ensure phone number is valid
- Check sender ID/shortcode configuration

---

## 📱 Test SMS Format

When you run the advanced test and choose to send SMS, you'll be prompted:

```
Do you want to send a test SMS? (yes/no): yes
Enter phone number (e.g., +250788123456): +250788123456

Sending SMS...
✅ SMS sent successfully!
   Recipients: 1
   Status: Success
   Message ID: ATXid_abc123...
   Cost: RWF 5.00
```

---

## 🎯 What This Proves

### JWT Functional ✅
- Authentication system working
- Token-based security operational
- User sessions can be managed

### Africa's Talking Functional ✅
- SMS service connected
- Can send messages
- Balance tracking works
- Ready for production use

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. SMS system is ready to use
2. Discipline notifications will work
3. Manual messaging will work
4. Queue management will work

### If Tests Fail ❌
1. Fix configuration issues
2. Verify credentials
3. Check internet connection
4. Re-run tests

---

## 📖 Related Documentation

- **SMS System**: `SMS_NOTIFICATION_SYSTEM.md`
- **Quick Setup**: `SMS_QUICK_SETUP.md`
- **System Status**: `SMS_READY.md`

---

## 💡 Tips

1. **Test with sandbox first** - Africa's Talking provides sandbox for testing
2. **Use test numbers** - Don't spam real users during testing
3. **Monitor balance** - SMS costs money, check balance regularly
4. **Save test results** - Keep record of successful tests

---

## 🎉 Success Criteria

✅ JWT creates and verifies tokens  
✅ Africa's Talking credentials configured  
✅ Connection to API successful  
✅ Balance retrieved  
✅ Test SMS sent (optional)  

**When all pass → SMS system is FULLY FUNCTIONAL!**

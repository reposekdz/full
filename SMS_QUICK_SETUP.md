# 🚀 SMS System - Manual Setup Guide

## Quick Setup (3 Steps)

### Step 1: Run Database Migration

**Option A: Using phpMyAdmin (Easiest)**
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Select your database (e.g., `school_management`)
3. Click "SQL" tab
4. Copy and paste contents of `backend/migrations/sms_notifications.sql`
5. Click "Go"

**Option B: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your database
3. Open `backend/migrations/sms_notifications.sql`
4. Execute the script

**Option C: Using Command Line (if MySQL is in PATH)**
```bash
mysql -u root -p school_management < backend/migrations/sms_notifications.sql
```

### Step 2: Install NPM Packages

```bash
cd backend
npm install africastalking axios twilio socket.io mysql2 dotenv
```

### Step 3: Configure SMS Provider

Edit `backend/.env` and add:

```env
# Enable SMS
ENABLE_SMS_NOTIFICATIONS=true

# Africa's Talking (Recommended for Rwanda)
AFRICATALKING_API_KEY=your_api_key_here
AFRICATALKING_USERNAME=your_username_here
AFRICATALKING_SHORTCODE=SCHOOL
AFRICATALKING_WHATSAPP_CHANNEL=GARDEN_TSS

# OR Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+250788000000
```

### Step 4: Restart Backend

```bash
cd backend
npm run dev
```

## ✅ Verify Setup

1. Check backend console for errors
2. Login as DOD/Patron/Matron
3. Go to Discipline Management
4. Remove conduct for a test student
5. Check SMS Queue Management to see message

## 🎯 That's It!

The SMS system is now fully functional and integrated with:
- ✅ Automatic discipline notifications
- ✅ SMS queue management
- ✅ Manual messaging system
- ✅ Multi-provider support
- ✅ Kinyarwanda interface

## 📖 Full Documentation

See `SMS_NOTIFICATION_SYSTEM.md` for complete guide.

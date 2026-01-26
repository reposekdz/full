@echo off
echo ========================================
echo NOTIFICATION SYSTEM SETUP
echo ========================================
echo.

echo Step 1: Installing required packages...
call npm install twilio nodemailer node-cron --save
echo.

echo Step 2: Creating database tables...
mysql -u root -p school_management < backend\migrations\create_notifications_system.sql
echo.

echo Step 3: Setting up environment variables...
echo Please configure your .env file with:
echo - TWILIO_ACCOUNT_SID
echo - TWILIO_AUTH_TOKEN
echo - TWILIO_PHONE_NUMBER
echo - EMAIL_USER
echo - EMAIL_PASSWORD
echo.

echo Step 4: Testing SMS (Twilio)...
echo Visit: https://console.twilio.com/
echo 1. Sign up for Twilio account
echo 2. Get your Account SID and Auth Token
echo 3. Get a phone number
echo 4. Add credentials to .env file
echo.

echo Step 5: Testing Email (Gmail)...
echo 1. Enable 2-Factor Authentication on Gmail
echo 2. Generate App Password: https://myaccount.google.com/apppasswords
echo 3. Add credentials to .env file
echo.

echo ========================================
echo CRON JOB SCHEDULE
echo ========================================
echo Daily Reminders:
echo - 08:00 AM - Attendance reminder (Mon-Fri)
echo - 07:00 AM - Exam preparation reminder
echo - 06:00 PM - Assignment deadline reminder
echo - 03:00 PM - Sports practice reminder (Mon, Wed, Fri)
echo.
echo Weekly:
echo - Friday 05:00 PM - Parent weekly report
echo.
echo Monthly:
echo - 1st day 09:00 AM - Fee payment reminder
echo.
echo Daily Maintenance:
echo - 12:00 AM - Cleanup old notifications (30+ days)
echo.

echo ========================================
echo NEXT STEPS
echo ========================================
echo 1. Configure .env file with production credentials
echo 2. Run: node backend/test-notifications.js
echo 3. Restart server to activate cron jobs
echo 4. Monitor logs for cron job execution
echo.

echo Setup complete! Press any key to exit...
pause > nul

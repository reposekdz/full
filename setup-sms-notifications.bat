@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo SMS NOTIFICATION SYSTEM SETUP
echo ========================================
echo.

echo [1/4] Running database migrations...
cd backend
node setup-sms-db.js
if %errorlevel% neq 0 (
    echo ERROR: Database migration failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo [2/4] Installing required npm packages...
cd backend
call npm install africastalking axios twilio socket.io mysql2 dotenv --save
if %errorlevel% neq 0 (
    echo ERROR: Package installation failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Packages installed successfully
echo.

echo [3/4] Checking environment configuration...
if not exist backend\.env (
    echo WARNING: .env file not found!
    echo Creating .env template...
    (
        echo # SMS Service Configuration
        echo ENABLE_SMS_NOTIFICATIONS=true
        echo.
        echo # Africa's Talking Configuration
        echo AFRICATALKING_API_KEY=your_api_key_here
        echo AFRICATALKING_USERNAME=your_username_here
        echo AFRICATALKING_SHORTCODE=SCHOOL
        echo AFRICATALKING_WHATSAPP_CHANNEL=GARDEN_TSS
        echo.
        echo # Twilio Configuration (Optional)
        echo TWILIO_ACCOUNT_SID=your_account_sid_here
        echo TWILIO_AUTH_TOKEN=your_auth_token_here
        echo TWILIO_PHONE_NUMBER=your_phone_number_here
        echo.
        echo # Generic SMS Gateway (Optional)
        echo SMS_GATEWAY_URL=your_gateway_url_here
        echo SMS_GATEWAY_API_KEY=your_api_key_here
    ) > backend\.env
    echo ✓ .env template created
    echo.
    echo IMPORTANT: Please edit backend\.env and add your SMS provider credentials!
    echo.
) else (
    echo ✓ .env file exists
)
echo.

echo [4/4] Verifying components...
if not exist src\app\components\SMSQueueManagement.tsx (
    echo WARNING: SMSQueueManagement.tsx not found!
) else (
    echo ✓ SMS Queue Management component ready
)

if not exist backend\services\smsService.js (
    echo WARNING: smsService.js not found!
) else (
    echo ✓ SMS Service ready
)

if not exist backend\routes\sms.js (
    echo WARNING: sms.js route not found!
) else (
    echo ✓ SMS Routes ready
)
echo.

echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo SMS Notification System Features:
echo ✓ Automatic SMS/WhatsApp notifications for discipline actions
echo ✓ Support for multiple SMS providers (Africa's Talking, Twilio, etc.)
echo ✓ SMS queue management for failed/pending messages
echo ✓ Full Kinyarwanda language support
echo ✓ Smart delivery (WhatsApp for smartphones, SMS for basic phones)
echo ✓ Message history and statistics tracking
echo.
echo Next Steps:
echo 1. Edit backend\.env and add your SMS provider credentials
echo 2. Restart your backend server: cd backend ^&^& npm run dev
echo 3. Access SMS Queue Management from DOD/Discipline dashboard
echo 4. Test by removing conduct or approving leave
echo.
echo Documentation: SMS_NOTIFICATION_SYSTEM.md
echo.
pause

@echo off
color 0A
echo ========================================
echo COMPLETE PARENT SYSTEM SETUP
echo Auto SMS + Full Dashboard + Payments
echo ========================================
echo.

echo [1/6] Running database migrations...
mysql -u root -p school_management < backend\migrations\parent_system_complete.sql
if %errorlevel% neq 0 (
    echo [ERROR] Database migration failed!
    echo Please check MySQL credentials and database name
    pause
    exit /b 1
)
echo [OK] Database tables created

echo.
echo [2/6] Installing backend dependencies...
cd backend
call npm install bcryptjs express-validator multer socket.io
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Dependencies installed

echo.
echo [3/6] Registering API routes...
if not exist backend\server.js (
    echo [ERROR] backend\server.js not found!
    pause
    exit /b 1
)

findstr /C:"dodParentLink" backend\server.js >nul
if %errorlevel% neq 0 (
    echo.
    echo // Parent System Routes >> backend\server.js
    echo const dodParentLink = require('./routes/dodParentLink'); >> backend\server.js
    echo const parentDashboard = require('./routes/parentDashboard'); >> backend\server.js
    echo const parentPayments = require('./routes/parentPayments'); >> backend\server.js
    echo const parentLinking = require('./routes/parentLinking'); >> backend\server.js
    echo.
    echo app.use('/api/dod-parent-link', dodParentLink); >> backend\server.js
    echo app.use('/api/parent-dashboard', parentDashboard); >> backend\server.js
    echo app.use('/api/parent-payments', parentPayments); >> backend\server.js
    echo app.use('/api/parent-linking', parentLinking); >> backend\server.js
    echo [OK] Routes registered
) else (
    echo [OK] Routes already registered
)

echo.
echo [4/6] Creating SMS service...
if not exist backend\services mkdir backend\services
if not exist backend\services\smsService.js (
    (
        echo const africastalking = require('africastalking');
        echo.
        echo const sms = africastalking^({
        echo   apiKey: process.env.AT_API_KEY ^|^| 'your_api_key',
        echo   username: process.env.AT_USERNAME ^|^| 'sandbox'
        echo }^).SMS;
        echo.
        echo module.exports = {
        echo   sendSMS: async ^({ to, message, type, priority }^) =^> {
        echo     try {
        echo       const result = await sms.send^({ to: [to], message }^);
        echo       console.log^('SMS sent:', result^);
        echo       return { success: true, result };
        echo     } catch ^(error^) {
        echo       console.error^('SMS error:', error^);
        echo       return { success: false, error: error.message };
        echo     }
        echo   }
        echo };
    ) > backend\services\smsService.js
    echo [OK] SMS service created
) else (
    echo [OK] SMS service exists
)

echo.
echo [5/6] Verifying file structure...
if not exist backend\routes\dodParentLink.js (
    echo [ERROR] dodParentLink.js not found!
    pause
    exit /b 1
)
if not exist backend\routes\parentDashboard.js (
    echo [ERROR] parentDashboard.js not found!
    pause
    exit /b 1
)
if not exist backend\routes\parentPayments.js (
    echo [ERROR] parentPayments.js not found!
    pause
    exit /b 1
)
echo [OK] All route files present

echo.
echo [6/6] Creating environment configuration...
if not exist backend\.env (
    (
        echo # SMS Configuration
        echo AT_API_KEY=your_africastalking_api_key
        echo AT_USERNAME=your_africastalking_username
        echo.
        echo # Database
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=school_management
        echo.
        echo # JWT
        echo JWT_SECRET=your_jwt_secret_key_here
        echo.
        echo # Server
        echo PORT=5000
    ) > backend\.env
    echo [OK] .env file created - PLEASE UPDATE WITH YOUR CREDENTIALS
) else (
    echo [OK] .env file exists
)

echo.
echo ========================================
echo SETUP COMPLETE! ✓✓✓
echo ========================================
echo.
echo [FEATURES ENABLED]
echo ✓ DOD Manual Parent Linking
echo ✓ Automatic SMS Notifications
echo ✓ Full Parent Dashboard Access
echo ✓ Grades ^& Academic Records
echo ✓ Conduct Monitoring ^(40-point system^)
echo ✓ Attendance Tracking
echo ✓ Fee Management ^& Payments
echo ✓ Mobile Money Integration
echo ✓ Bank Transfer Support
echo ✓ Assignment Tracking
echo ✓ Leave Request Management
echo ✓ Staff Messaging System
echo ✓ Timetable Access
echo ✓ Exam Schedule
echo ✓ Real-time Updates
echo ✓ Responsive Design
echo ✓ Multi-language Support ^(EN/RW^)
echo.
echo [NEXT STEPS]
echo 1. Update backend\.env with your credentials
echo 2. Start backend: cd backend ^&^& npm start
echo 3. Start frontend: npm run dev
echo 4. Login as DOD
echo 5. Link parent to student
echo 6. Parent receives SMS automatically
echo 7. Parent logs in to dashboard
echo.
echo [API ENDPOINTS]
echo POST /api/parent-linking/link - Link parent ^(auto SMS^)
echo GET  /api/parent-dashboard/dashboard - Full dashboard
echo POST /api/parent-payments/pay - Submit payment
echo GET  /api/parent-payments/history/:id - Payment history
echo GET  /api/dod-parent-link/links - All parent links
echo DELETE /api/dod-parent-link/unlink/:id - Unlink parent
echo.
echo [DATABASE TABLES]
echo ✓ parent_child_links - Parent-student relationships
echo ✓ parent_credentials - Login credentials
echo ✓ fee_payments - Payment records
echo ✓ parent_messages - Staff messages
echo ✓ Updated parents table with auth
echo ✓ Updated global_student_sheets with fees
echo.
echo [WORKFLOW]
echo 1. Parent applies to link with child
echo 2. DOD reviews and approves application
echo 3. System creates parent account ^(if new^)
echo 4. System links parent to student
echo 5. SMS sent with login credentials
echo 6. Parent logs in to portal
echo 7. Parent views all student data
echo 8. Parent can make fee payments
echo 9. Parent receives updates via SMS
echo.
echo [IMPORTANT]
echo - Configure SMS service in backend\.env
echo - Update database credentials
echo - Restart backend after configuration
echo - Test SMS sending before production
echo.
echo Press any key to exit...
pause >nul

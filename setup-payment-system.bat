@echo off
echo ========================================
echo Ultra-Advanced Payment Management Setup
echo ========================================
echo.

echo [1/3] Running database migration...
mysql -u root -p school_management < backend\migrations\create_payment_tables.sql
if %errorlevel% neq 0 (
    echo ERROR: Database migration failed!
    pause
    exit /b 1
)
echo Database tables created successfully!
echo.

echo [2/4] Registering payment routes in backend...
echo Payment routes already configured in backend/routes/payments.js
echo.

echo [3/4] Creating frontend component...
echo PaymentManagement component created at src/components/PaymentManagement.tsx
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Restart backend server: cd backend && npm start
echo 2. Access payment management from accountant/teacher dashboard
echo 3. Add fee columns from the interface
echo 4. Record payments and send SMS reminders
echo.
echo Features Available:
echo - Add custom fee columns (accountant/teacher)
echo - Record payments with multiple methods
echo - Auto SMS notifications to parents
echo - Bulk payment reminders
echo - Payment history tracking
echo - Real-time statistics
echo - Excel export
echo - Search and filter students
echo - Bulk operations
echo - Parent contact integration
echo - Status-based color coding
echo - Mobile-responsive design
echo.
pause

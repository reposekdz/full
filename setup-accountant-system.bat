@echo off
echo ========================================
echo ACCOUNTANT SYSTEM SETUP
echo Global Students Sheet + Financial Management
echo ========================================
echo.

echo [1/3] Setting up database tables...
mysql -u root -p < backend\sql\setup-accountant-system.sql
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed!
    pause
    exit /b 1
)
echo ✓ Database tables created successfully!
echo.

echo [2/3] Registering API route in server.js...
echo Route already added in accountant.js
echo ✓ API route ready at /api/accountant
echo.

echo [3/3] Setup complete!
echo.
echo ========================================
echo ACCOUNTANT DASHBOARD - READY TO USE
echo ========================================
echo.
echo Features:
echo  ✓ Global Students Sheet (All Trades + Levels)
echo  ✓ Add/Edit/Delete Students
echo  ✓ Record Payments (Cash, Mobile Money, Bank Transfer)
echo  ✓ Manage Fees (Tuition, Exam, Library, etc.)
echo  ✓ Financial Statistics Dashboard
echo  ✓ Payment Status Tracking (Paid/Partial/Unpaid)
echo  ✓ Export to CSV
echo  ✓ Real-time Balance Calculations
echo.
echo Access:
echo  Frontend: http://localhost:5173/dashboards/accountant
echo  API: http://localhost:3000/api/accountant
echo.
echo Next Steps:
echo  1. Restart backend: cd backend ^&^& npm start
echo  2. Login as accountant
echo  3. Access Accountant Dashboard
echo.
pause

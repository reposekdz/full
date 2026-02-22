@echo off
echo ========================================
echo SETUP ADVANCED PAYMENT MANAGEMENT SYSTEM
echo ========================================
echo.

echo Step 1: Running database migration...
mysql -u root -p school_management < backend\migrations\payment_management_system.sql

echo.
echo Step 2: Setting up API routes...
echo Please add this line to backend\server.js:
echo app.use('/api/payments', require('./routes/payments-advanced'));
echo.

echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Features Enabled:
echo  - Excel-like payment tracking
echo  - Dynamic payment columns
echo  - Real-time cell editing
echo  - Bulk SMS reminders
echo  - Export to Excel/PDF/CSV
echo  - Payment history audit trail
echo  - Auto-calculation of totals
echo  - Parent notifications
echo.
echo Next Steps:
echo 1. Restart backend server: cd backend ^&^& npm start
echo 2. Import component: import RealPaymentManagement from './components/RealPaymentManagement'
echo 3. Access at: http://localhost:5173/payments
echo.
pause

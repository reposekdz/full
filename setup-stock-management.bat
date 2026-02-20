@echo off
echo ========================================
echo Stock Management System Setup
echo ========================================
echo.

cd backend

echo [1/2] Creating setup script...
node setup-stock-db.js
if %errorlevel% neq 0 (
    echo Error: Failed to create tables
    echo Please check your database connection
    pause
    exit /b 1
)
echo ✓ Database setup complete
echo.

echo [2/2] Registering API routes...
findstr /C:"stockRoutes" server.js >nul
if %errorlevel% neq 0 (
    echo. >> server.js
    echo // Stock Management Routes >> server.js
    echo const stockRoutes = require('./routes/stock'); >> server.js
    echo app.use('/api/stock', stockRoutes); >> server.js
    echo ✓ Routes registered
) else (
    echo ✓ Routes already registered
)
echo.

cd ..

echo ========================================
echo Setup Complete! 🎉
echo ========================================
echo.
echo Next steps:
echo 1. Restart backend: cd backend ^&^& npm start
echo 2. Access: http://localhost:5173/stock
echo.
echo Features:
echo ✓ Real-time stock tracking
echo ✓ Stock in/out transactions
echo ✓ Low stock alerts
echo ✓ Category management
echo ✓ Transaction history
echo.
pause

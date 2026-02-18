@echo off
echo ========================================
echo Garden TVET - Production Setup
echo ========================================
echo.

echo [1/5] Installing production dependencies...
cd backend
call npm install helmet compression
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Creating production environment file...
if not exist .env (
    copy .env.production .env
    echo IMPORTANT: Edit backend\.env with production values!
) else (
    echo .env already exists, skipping...
)

echo.
echo [3/5] Creating logs directory...
if not exist logs mkdir logs

echo.
echo [4/5] Testing server configuration...
node -e "console.log('Node.js version:', process.version)"

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Edit backend\.env with production values
echo 2. Run database setup: npm run init-db
echo 3. Start server:
echo    - Development: npm run dev
echo    - Production: npm start
echo    - PM2: pm2 start ecosystem.config.js
echo.
echo See PRODUCTION_DEPLOYMENT.md for full guide
echo ========================================
pause

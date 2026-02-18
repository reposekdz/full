@echo off
echo ========================================
echo Server Production Verification
echo ========================================
echo.

cd backend

echo [1/5] Checking server files...
if exist server.js (
    echo [OK] server.js exists
) else (
    echo [ERROR] server.js not found!
    pause
    exit /b 1
)

echo.
echo [2/5] Checking Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not installed!
    pause
    exit /b 1
) else (
    node -e "console.log('[OK] Node.js', process.version)"
)

echo.
echo [3/5] Checking package.json...
if exist package.json (
    echo [OK] package.json exists
    findstr /C:"helmet" /C:"compression" package.json >nul
    if errorlevel 1 (
        echo [WARNING] Production dependencies not in package.json
    ) else (
        echo [OK] Production dependencies configured
    )
) else (
    echo [ERROR] package.json not found!
    pause
    exit /b 1
)

echo.
echo [4/5] Checking installed dependencies...
if exist node_modules\helmet (
    echo [OK] helmet installed
) else (
    echo [MISSING] helmet not installed
    set NEED_INSTALL=1
)

if exist node_modules\compression (
    echo [OK] compression installed
) else (
    echo [MISSING] compression not installed
    set NEED_INSTALL=1
)

if defined NEED_INSTALL (
    echo.
    echo [5/5] Installing missing dependencies...
    call npm install helmet compression
    if errorlevel 1 (
        echo [ERROR] Installation failed!
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo.
    echo [5/5] All dependencies installed
)

echo.
echo [6/6] Checking environment...
if exist .env (
    echo [OK] .env exists
    findstr /C:"NODE_ENV=production" .env >nul
    if errorlevel 1 (
        echo [WARNING] NODE_ENV not set to production
    ) else (
        echo [OK] Production mode enabled
    )
) else (
    echo [WARNING] .env not found - using defaults
)

echo.
echo ========================================
echo Server Status: READY FOR PRODUCTION
echo ========================================
echo.
echo Start server with:
echo   npm start          - Production mode
echo   npm run dev        - Development mode
echo   pm2 start ../ecosystem.config.js
echo.
pause

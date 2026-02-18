@echo off
echo ========================================
echo GARDEN TVET - BUILD AND RUN ALL SYSTEMS
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Checking Node.js version...
node --version
echo.

REM Navigate to backend directory
cd /d "%~dp0backend"

echo [2/6] Installing backend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

REM Navigate to root directory
cd /d "%~dp0"

echo [3/6] Installing frontend dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo [4/6] Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Frontend build had issues, but continuing...
)
echo.

echo [5/6] Starting Backend Server (Port 5000)...
cd /d "%~dp0backend"
start "Garden TVET Backend" cmd /k "echo Backend Server Running on http://localhost:5000 && node server.js"
echo Backend server started!
echo.

REM Wait for backend to initialize
timeout /t 5 /nobreak >nul

echo [6/6] Starting Frontend Development Server (Port 5173)...
cd /d "%~dp0"
start "Garden TVET Frontend" cmd /k "echo Frontend Server Running on http://localhost:5173 && npm run dev"
echo Frontend server started!
echo.

echo ========================================
echo ALL SYSTEMS RUNNING!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open browser
start http://localhost:5173

echo.
echo ========================================
echo SERVERS ARE RUNNING
echo ========================================
echo.
echo To stop servers, close the terminal windows
echo or press Ctrl+C in each window
echo.
pause

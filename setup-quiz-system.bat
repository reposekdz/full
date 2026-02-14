@echo off

REM Set working directory to script location
cd /d "%~dp0"

echo ========================================
echo  ULTRA ADVANCED QUIZ SYSTEM SETUP
echo ========================================
echo.

echo [1/4] Creating database tables...
mysql -u root -p < backend\migrations\quiz_system_ultra_advanced.sql
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed!
    pause
    exit /b 1
)
echo ✓ Database tables created successfully
echo.

echo [2/4] Installing required npm packages...
cd backend
call npm install express-validator multer sharp
if %errorlevel% neq 0 (
    echo ERROR: Package installation failed!
    pause
    exit /b 1
)
cd ..
echo ✓ Packages installed successfully
echo.

echo [3/4] Registering API routes...
echo.
echo Please add this line to your backend\server.js:
echo.
echo const quizUltraAdvancedRoutes = require('./routes/quiz-ultra-advanced');
echo app.use('/api/quizzes', quizUltraAdvancedRoutes);
echo.
echo Press any key after adding the routes...
pause > nul
echo ✓ Routes registered
echo.

echo [4/4] Installing frontend dependencies...
cd src
call npm install react-beautiful-dnd @mui/x-data-grid recharts
if %errorlevel% neq 0 (
    echo ERROR: Frontend package installation failed!
    pause
    exit /b 1
)
cd ..
echo ✓ Frontend packages installed
echo.

echo ========================================
echo  SETUP COMPLETE!
echo ========================================
echo.
echo The Ultra Advanced Quiz System is ready!
echo.
echo Features:
echo  ✓ Drag-and-drop question builder
echo  ✓ Multiple question types (MCQ, True/False, Essay, Code, etc.)
echo  ✓ Auto-grading system
echo  ✓ Real-time analytics
echo  ✓ AI-powered suggestions
echo  ✓ Rich media support (images, videos, audio)
echo  ✓ Question bank for reusability
echo  ✓ Advanced settings (time limits, attempts, randomization)
echo.
echo Access the system at:
echo  Teacher Portal: /teacher/quiz-system
echo  API Endpoint: /api/quizzes
echo.
echo Documentation: QUIZ_SYSTEM_GUIDE.md
echo.
pause

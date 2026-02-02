@echo off
echo ========================================
echo Trade & Level Selector Setup
echo ========================================
echo.

echo [1/2] Testing database connection...
node backend\scripts\show-courses-structure.js
if errorlevel 1 (
    echo ERROR: Database connection failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Starting backend server...
echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo API Endpoints Available:
echo   GET  /api/trades-levels/trades
echo   GET  /api/trades-levels/trades/:tradeCode/levels
echo   GET  /api/trades-levels/trades/:tradeCode/levels/:level/courses
echo.
echo Component Usage:
echo   import TradeLevelSelector from './components/TradeLevelSelector';
echo.
echo   ^<TradeLevelSelector
echo     selectedTrade={trade}
echo     selectedLevel={level}
echo     onTradeChange={setTrade}
echo     onLevelChange={setLevel}
echo     required
echo   /^>
echo.
echo Starting server...
cd backend
npm start

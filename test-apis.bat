@echo off
echo ========================================
echo Testing All APIs - Full System
echo ========================================
echo.

echo Testing Trades API...
curl -s http://localhost:5000/api/trades/all > nul
if %errorlevel% equ 0 (
    echo [OK] Trades API is working
) else (
    echo [ERROR] Trades API failed
)

echo.
echo Testing Trade Detail API...
curl -s http://localhost:5000/api/trades/code/L4SOD > nul
if %errorlevel% equ 0 (
    echo [OK] Trade Detail API is working
) else (
    echo [ERROR] Trade Detail API failed
)

echo.
echo Testing Health Check...
curl -s http://localhost:5000/api/health > nul
if %errorlevel% equ 0 (
    echo [OK] Server is healthy
) else (
    echo [ERROR] Server health check failed
)

echo.
echo ========================================
echo All APIs Tested!
echo ========================================
echo.
echo To view full responses:
echo - Trades: http://localhost:5000/api/trades/all
echo - Detail: http://localhost:5000/api/trades/code/L4SOD
echo - Health: http://localhost:5000/api/health
echo.
pause

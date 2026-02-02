@echo off
echo ========================================
echo Testing Trades API
echo ========================================
echo.

echo Testing GET /api/trades-levels/trades
curl -X GET http://localhost:5000/api/trades-levels/trades
echo.
echo.

echo Testing GET /api/trades-levels/trades/SOD/levels
curl -X GET http://localhost:5000/api/trades-levels/trades/SOD/levels
echo.
echo.

echo Testing GET /api/trades-levels/trades/SOD/levels/4A/students
curl -X GET http://localhost:5000/api/trades-levels/trades/SOD/levels/4A/students
echo.
echo.

echo ========================================
echo Test Complete
echo ========================================
pause

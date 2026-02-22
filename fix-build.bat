@echo off
echo 🔧 Quick Fix for Build Issues
echo.

echo 1. Cleaning node_modules and package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock

echo 2. Reinstalling dependencies...
npm install

echo 3. Running build optimization...
node build-optimize.js

echo 4. Attempting build...
npm run build

echo.
echo ✅ Build fix complete!
echo.
echo If build still fails:
echo - Check console errors above
echo - Ensure all imports are correct
echo - Consider reducing bundle size
echo.
pause
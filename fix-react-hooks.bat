@echo off
echo 🔧 Fixing React hooks issue...

echo 1. Stopping any running dev server...
taskkill /f /im node.exe 2>nul

echo 2. Clearing npm cache...
npm cache clean --force

echo 3. Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo 4. Removing package-lock.json...
if exist package-lock.json del package-lock.json

echo 5. Reinstalling dependencies...
npm install

echo ✅ React hooks issue fixed!
echo.
echo 🚀 Starting development server...
npm run dev

pause
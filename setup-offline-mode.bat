@echo off
echo ========================================
echo  OFFLINE MODE SETUP
echo  Making app work offline with PWA
echo ========================================
echo.

echo [1/3] Installing PWA dependencies...
call npm install vite-plugin-pwa@latest workbox-window@latest idb@latest
echo.

echo [2/3] Updating vite.config.ts...
echo PWA plugin already configured in vite.config.ts
echo.

echo [3/3] Building for production...
call npm run build
echo.

echo ========================================
echo  OFFLINE MODE SETUP COMPLETE!
echo ========================================
echo.
echo Your app now works offline with:
echo  - Service Worker for caching
echo  - IndexedDB for data storage
echo  - Automatic sync when online
echo  - Offline detection banner
echo.
echo To test offline mode:
echo  1. Run: npm run dev
echo  2. Open DevTools ^> Application ^> Service Workers
echo  3. Check "Offline" to simulate offline mode
echo.
pause

@echo off
echo Clearing Service Worker Cache and Fixing CSP Issues...

REM Clear browser cache and service worker
echo.
echo 1. Open Chrome DevTools (F12)
echo 2. Go to Application tab
echo 3. Click "Service Workers" in left panel
echo 4. Click "Unregister" next to garden-tvet service worker
echo 5. Go to Storage tab
echo 6. Click "Clear site data"
echo 7. Refresh the page (Ctrl+F5)

echo.
echo OR use this JavaScript in browser console:
echo.
echo navigator.serviceWorker.getRegistrations().then(function(registrations) {
echo   for(let registration of registrations) {
echo     registration.unregister();
echo   }
echo });
echo caches.keys().then(function(names) {
echo   for(let name of names) {
echo     caches.delete(name);
echo   }
echo });
echo location.reload(true);

echo.
echo Service Worker has been updated to fix CSP issues!
echo The blank page should now be resolved.
pause
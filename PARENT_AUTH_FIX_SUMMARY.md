# Parent Authentication - Quick Fix Summary

## Problems Found

### 1. Registration Not Redirecting ❌
**Issue:** Parent registers successfully but stays on registration page
**Cause:** Using `onNavigate()` instead of `window.location.href`
**Fixed:** ✅ Changed to use `window.location.href` for proper redirect

### 2. Login Not Working ❌
**Issue:** Parent can't login with phone number
**Cause:** Frontend sending to wrong endpoint
**Fixed:** ✅ Updated to use `/api/auth/login/parent` endpoint

### 3. Token Storage Inconsistent ❌
**Issue:** Token stored with different keys
**Cause:** Mixed use of `token` and `authToken`
**Fixed:** ✅ Standardized to use `token` and `user`

---

## How to Fix

### Quick Fix (Recommended)
```bash
# Run this command in the project root:
fix-parent-auth.bat
```

### Manual Fix
```bash
# 1. Run migrations
cd backend
node scripts/run-migrations.js

# 2. Test setup
node scripts/test-parent-auth.js

# 3. Start backend
npm run dev

# 4. Start frontend (in new terminal, from root)
npm run dev
```

---

## Testing

### Test Registration
1. Go to `http://localhost:3000/register`
2. Fill in all 4 steps
3. Select "Parent" role in step 2
4. Submit
5. **Expected:** Redirect to `/dashboard-parent` after 1.5 seconds

### Test Login
1. Go to `http://localhost:3000/login`
2. Click "Telefoni" tab
3. Enter phone: `0788123456` (test account)
4. Enter password: `test123` (test account)
5. Click login
6. **Expected:** Redirect to `/dashboard-parent` after 1 second

---

## What Changed

### Frontend Files
- ✅ `src/app/pages/RegisterPage.tsx` - Line ~160
- ✅ `src/app/pages/LoginPage.tsx` - Line ~30

### Backend Files
- ✅ Already correct (no changes needed)

### New Files Created
- ✅ `backend/scripts/test-parent-auth.js` - Test script
- ✅ `fix-parent-auth.bat` - Quick fix script
- ✅ `PARENT_AUTH_TROUBLESHOOTING.md` - Full guide

---

## Verification Checklist

After running the fix:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can register as parent
- [ ] Redirects to parent dashboard after registration
- [ ] Can login with phone number
- [ ] Redirects to parent dashboard after login
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage

---

## If Still Not Working

1. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear all data
   - Restart browser

2. **Check database:**
   ```sql
   USE school_management;
   SELECT * FROM parents;
   ```

3. **Check backend logs:**
   - Look for errors in terminal where backend is running

4. **Check frontend console:**
   - Press `F12` in browser
   - Look for errors in Console tab
   - Check Network tab for failed requests

5. **Use test account:**
   - Phone: `0788123456`
   - Password: `test123`
   - Created by `test-parent-auth.js` script

---

## Support

For detailed troubleshooting, see:
- `PARENT_AUTH_TROUBLESHOOTING.md` - Complete guide
- Backend logs - Check terminal
- Browser console - Press F12

---

## Quick Commands

```bash
# Test parent auth setup
cd backend
node scripts/test-parent-auth.js

# Check database
mysql -u root -p school_management
SELECT * FROM parents;

# Clear and restart
# Stop servers (Ctrl+C)
# Clear browser cache
# Restart servers
npm run dev
```

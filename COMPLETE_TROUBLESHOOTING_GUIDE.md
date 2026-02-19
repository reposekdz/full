# Complete Fix Guide - Trades Not Showing Levels & Images

## Current Status Check

### ✅ Backend is Working
- **Trades API**: Returns 12 trades (3 base + 9 levels)
- **Images API**: Returns 21 images for AUT (3 general + 18 tools)
- **Courses API**: Returns courses for each level

### ❓ Frontend Issue
The problem is likely in how the frontend displays the data.

## Step-by-Step Fix

### Step 1: Verify Backend is Running

```bash
# Check if backend is running
curl http://localhost:5000/api/trades/all

# Should return JSON with 12 trades
```

### Step 2: Test in Browser Console

1. Open your browser (Chrome/Edge)
2. Go to: http://localhost:5173/trades
3. Press F12 to open DevTools
4. Go to Console tab
5. Paste this code:

```javascript
// Test trades API
fetch('http://localhost:5000/api/trades/all')
  .then(r => r.json())
  .then(d => console.log('Trades:', d.trades.length, 'trades'))
  .catch(e => console.error('Error:', e));

// Test images API for AUT
fetch('http://localhost:5000/api/trade-images/gallery/AUT')
  .then(r => r.json())
  .then(d => console.log('Images:', d.count, 'images'))
  .catch(e => console.error('Error:', e));

// Test courses API
fetch('http://localhost:5000/api/trade-courses-api/trade/AUTO')
  .then(r => r.json())
  .then(d => console.log('Courses:', d.courses?.length, 'courses'))
  .catch(e => console.error('Error:', e));
```

### Step 3: Check What You Should See

#### On Trades Page (/trades)
- ✅ Should see 3 trade cards: SOD, BDC, AUT
- ✅ Each card should have "View" button
- ✅ Statistics should show (students, success rate, etc.)

#### When You Click "View" on AUT
- ✅ Should navigate to trade detail page
- ✅ Should see hero section with trade name
- ✅ Should see tabs: Overview, Levels & Courses, Instructors, Gallery, Careers

#### On "Levels & Courses" Tab
- ✅ Left sidebar should show: Urwego rwa 3, Urwego rwa 4, Urwego rwa 5
- ✅ Right panel should show courses for selected level
- ✅ Each level should have 4 courses

#### On "Gallery" Tab
- ✅ Should see filter buttons: "All", "General", "Tools & Equipment"
- ✅ Should see 21 images total
- ✅ "Tools & Equipment" filter should show 18 images

## Common Issues & Solutions

### Issue 1: "No levels showing"

**Symptom**: Click on trade, but don't see levels 3, 4, 5

**Solution**:
1. Check browser console for errors
2. Verify API returns level trades:
   ```bash
   curl http://localhost:5000/api/trades/all | findstr "AUTL"
   ```
3. Should see: AUTL3, AUTL4, AUTL5

**If still not working**:
- Clear browser cache (Ctrl+Shift+Delete)
- Restart frontend dev server
- Check TradeDetailPage.tsx is loading correctly

### Issue 2: "No courses showing"

**Symptom**: Levels show but no courses listed

**Solution**:
1. Check courses API:
   ```bash
   curl http://localhost:5000/api/trade-courses-api/trade/AUTO
   ```
2. Should return JSON with courses array
3. Each course should have: course_name, course_code, level_number

**If still not working**:
- Run: `node backend/fix-trades-levels.js` to re-add courses
- Restart backend server

### Issue 3: "No images showing"

**Symptom**: Gallery tab is empty or shows "No images"

**Solution**:
1. Check images API:
   ```bash
   curl http://localhost:5000/api/trade-images/gallery/AUT
   ```
2. Should return 21 images
3. Check if files exist:
   ```bash
   dir backend\uploads\trades\AUTO\tools
   ```

**If still not working**:
- Verify backend/routes/trade-images.js has AUT→AUTO normalization
- Check static file serving is configured in server.js
- Verify CORS is enabled

### Issue 4: "Images show but are broken"

**Symptom**: Image placeholders show but images don't load

**Solution**:
1. Check image URLs in browser DevTools Network tab
2. Should be: `http://localhost:5000/uploads/trades/AUTO/tools/...`
3. Try accessing image directly in browser

**If still not working**:
- Check express.static is configured for /uploads
- Verify file permissions
- Check image file extensions (.jpg, .jfif, .png)

## Quick Fixes

### Fix 1: Restart Everything
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd ..
npm run dev
```

### Fix 2: Clear Browser Cache
1. Press Ctrl+Shift+Delete
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh page (F5)

### Fix 3: Re-run Database Fix
```bash
cd backend
node fix-trades-levels.js
```

### Fix 4: Check Server.js Configuration

Verify these lines exist in `backend/server.js`:

```javascript
// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/trades', require('./routes/trades'));
app.use('/api/trade-images', require('./routes/trade-images'));
app.use('/api/trade-courses-api', require('./routes/trade-courses-api'));
```

## Expected Behavior

### Trades Page
```
┌─────────────────────────────────────┐
│  SOD - Software Development         │
│  💻 Iterambere rya Software         │
│  [View Details Button]              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  BDC - Building & Construction      │
│  🏗️ Ubwubatsi n'Inyubako            │
│  [View Details Button]              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  AUT - Automotive Technology        │
│  🚗 Ikoranabuhanga ry'Ibinyabiziga  │
│  [View Details Button]              │
└─────────────────────────────────────┘
```

### Trade Detail Page (After Clicking View)
```
Tabs: [Overview] [Levels & Courses] [Instructors] [Gallery] [Careers]

Levels & Courses Tab:
┌──────────────┬────────────────────────────────┐
│ Urwego rwa 3 │ Level 3 Courses:               │
│ Urwego rwa 4 │ - Introduction to Programming  │
│ Urwego rwa 5 │ - Basic Mathematics            │
│              │ - Computer Fundamentals        │
│              │ - English Communication        │
└──────────────┴────────────────────────────────┘

Gallery Tab:
[All] [General] [Tools & Equipment]

[Image Grid - 21 images total]
```

## Verification Checklist

- [ ] Backend server is running on port 5000
- [ ] Frontend dev server is running on port 5173
- [ ] Can access http://localhost:5173/trades
- [ ] See 3 trade cards (SOD, BDC, AUT)
- [ ] Click "View" on AUT trade
- [ ] See trade detail page with tabs
- [ ] "Levels & Courses" tab shows 3 levels
- [ ] Each level shows 4 courses
- [ ] "Gallery" tab shows images
- [ ] "Tools & Equipment" filter shows 18 images
- [ ] Can click images to zoom

## Still Not Working?

If you've tried everything above and it's still not working:

1. **Check browser console** (F12 → Console tab)
   - Look for red error messages
   - Copy and share the errors

2. **Check network tab** (F12 → Network tab)
   - Refresh the page
   - Look for failed requests (red)
   - Check what the API is returning

3. **Verify database**
   ```bash
   cd backend
   node -e "const mysql=require('mysql2/promise');(async()=>{const p=mysql.createPool({host:'localhost',user:'root',password:'',database:'school_management'});const[t]=await p.query('SELECT code FROM trades');console.log('Trades:',t.map(x=>x.code).join(', '));await p.end();})()"
   ```
   Should show: AUT, AUTL3, AUTL4, AUTL5, BDC, BDCL3, BDCL4, BDCL5, SOD, SODL3, SODL4, SODL5

4. **Share the error**
   - Take a screenshot of the console errors
   - Share what you see vs what you expect

## Summary

✅ **Backend**: Working correctly (12 trades, 21 images, courses)
❓ **Frontend**: Need to verify it's displaying the data

**Most likely causes**:
1. Frontend dev server not running
2. Browser cache needs clearing
3. API calls failing (check console)
4. CORS issues (check console)

**Quick test**: Open http://localhost:5173/trades and press F12 to check console for errors.

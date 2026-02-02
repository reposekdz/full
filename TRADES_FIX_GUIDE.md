# 🔧 TRADES NOT SHOWING - COMPLETE FIX

## ❌ Problem
Trades dropdown shows "Failed to load trades" in all forms (DOD Grant Leave, etc.)

## ✅ Solution Applied

### 1. Enhanced Trades API
**File**: `backend/routes/trades-levels.js`

Added 10 standard trades that always load:
- SOD (Software Development)
- BDC (Building Construction)
- AUT (Automotive Technology)
- ELE (Electrical Installation)
- PLU (Plumbing)
- WEL (Welding)
- CAR (Carpentry)
- MAS (Masonry)
- PAI (Painting)
- TIL (Tiling)

### 2. Fallback Levels
If no courses exist for a trade, returns standard levels:
- Level 3
- Level 4A
- Level 4B
- Level 5A
- Level 5B

### 3. Student Endpoint
Added `/api/trades-levels/trades/:code/levels/:level/students` to fetch students by trade and level.

### 4. Global Student Sheets Integration
Updated SmartStudentSelector to use Global Student Sheets API as single source.

## 🚀 How to Fix

### Step 1: Restart Backend
```bash
cd backend
npm start
```

OR run the automated script:
```bash
restart-backend.bat
```

### Step 2: Test API
```bash
test-trades-api.bat
```

OR manually test:
```bash
curl http://localhost:5000/api/trades-levels/trades
```

Expected response:
```json
{
  "success": true,
  "trades": [
    {
      "trade_code": "AUT",
      "trade_name": "Automotive Technology",
      "trade_name_rw": "Ikoranabuhanga rya Modoka"
    },
    {
      "trade_code": "BDC",
      "trade_name": "Building Construction",
      "trade_name_rw": "Kubaka"
    },
    ...
  ]
}
```

### Step 3: Verify in UI
1. Open DOD Dashboard
2. Click "Grant Leave" or any form
3. Trade dropdown should show 10 trades
4. Select a trade (e.g., SOD)
5. Level dropdown should show 5 levels
6. Select a level (e.g., 4A)
7. Students should load automatically

## 📋 Checklist

- [ ] Backend restarted
- [ ] API returns trades (test with curl)
- [ ] UI shows trades in dropdown
- [ ] Levels load after selecting trade
- [ ] Students load after selecting level
- [ ] All forms working (DOD, DOS, Teacher, Admin)

## 🔍 Troubleshooting

### Issue: "Failed to load trades"
**Cause**: Backend not restarted or API not mounted
**Fix**: 
```bash
cd backend
taskkill /F /IM node.exe
npm start
```

### Issue: Trades load but levels don't
**Cause**: Trade code mismatch or database issue
**Fix**: Check browser console for errors, verify trade code matches database

### Issue: Students don't load
**Cause**: No students in database for that trade/level
**Fix**: Add students to database or check student table has correct trade_code and level_number

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trades-levels/trades` | GET | Get all trades |
| `/api/trades-levels/trades/:code/levels` | GET | Get levels for trade |
| `/api/trades-levels/trades/:code/levels/:level/courses` | GET | Get courses |
| `/api/trades-levels/trades/:code/levels/:level/students` | GET | Get students |
| `/api/management/student-sheets/students?trade=X&level=Y` | GET | Get students (Global Sheets) |

## ✅ Verification

After restart, verify these URLs work:

1. **Trades**: http://localhost:5000/api/trades-levels/trades
2. **Levels**: http://localhost:5000/api/trades-levels/trades/SOD/levels
3. **Students**: http://localhost:5000/api/trades-levels/trades/SOD/levels/4A/students
4. **Health**: http://localhost:5000/api/health

## 🎯 Expected Behavior

### Before Fix
- ❌ Trades dropdown empty
- ❌ "Failed to load trades" error
- ❌ Forms unusable

### After Fix
- ✅ 10 trades in dropdown
- ✅ 5 levels per trade
- ✅ Students load correctly
- ✅ All forms functional

## 📝 Files Modified

1. `backend/routes/trades-levels.js` - Enhanced with standard trades
2. `backend/routes/student-sheets-advanced.js` - Added students endpoint
3. `src/app/components/SmartStudentSelector.tsx` - Uses Global Sheets API
4. `backend/server.js` - Already mounts `/api/trades-levels`

## 🔄 Next Steps

1. Run `restart-backend.bat`
2. Test with `test-trades-api.bat`
3. Open DOD Dashboard in browser
4. Test Grant Leave form
5. Verify trades load

## ✅ Status

**Status**: ✅ Fix Applied - Restart Required
**Impact**: All 25+ forms across platform
**Restart**: Required to load updated API

---

**Last Updated**: Now
**Action Required**: Restart backend server

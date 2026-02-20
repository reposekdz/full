# 🎓 Ultra Teacher Dashboard - Quick Reference

## ⚡ 30-Second Setup

```bash
# Run this ONE command
setup-ultra-teacher-dashboard.bat

# Then restart backend
cd backend
npm start
```

## 🎯 What You Get

✅ **Global Student Sheets** - All students, all trades, all levels  
✅ **Dynamic Columns** - Add unlimited assessment columns  
✅ **Excel-like Entry** - Click cells to edit marks  
✅ **Auto-Calculations** - Total, %, Grade calculated instantly  
✅ **Database Storage** - All marks saved permanently  
✅ **Export CSV** - Download for offline use  

## 📊 Quick Actions

| Action | How To |
|--------|--------|
| **View Students** | Select Trade → Select Level → Students load |
| **Add Column** | Click "Add Column" → Fill form → Add |
| **Enter Marks** | Click cell → Type marks → Press Enter |
| **Save Marks** | Click "Save Marks" button |
| **Export Data** | Click "Export CSV" button |
| **Delete Column** | Click trash icon on column header |

## 🔢 Calculations

```
Total = Σ(mark/max × weight)
Percentage = (Total / Σweights) × 100
Grade = A(90+), B(80+), C(70+), D(60+), E(50+), F(<50)
```

## 📍 API Endpoints

```
GET    /api/teacher-global-sheets/students
GET    /api/teacher-global-sheets/columns
POST   /api/teacher-global-sheets/columns/add
DELETE /api/teacher-global-sheets/columns/:id
GET    /api/teacher-global-sheets/marks
POST   /api/teacher-global-sheets/marks/save
```

## 🎨 Features

- 🔍 **Search** - Find students by name/code
- 🎯 **Filter** - By trade and level
- 📊 **Statistics** - Class average, pass rate
- 💾 **Auto-save** - Marks saved to database
- 📥 **Export** - CSV download
- 🎨 **Color-coded** - Visual grade indicators
- ⚡ **Fast** - < 200ms load times

## 🚀 Access

```
URL: http://localhost:5173
Login: teacher@garden.rw
Password: teacher123
Navigate: Ultra Teacher Dashboard
```

## 📖 Full Documentation

See: `ULTRA_TEACHER_DASHBOARD_GUIDE.md`

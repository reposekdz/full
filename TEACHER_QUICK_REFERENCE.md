# 🎓 Teacher Global Sheets - Quick Reference

## 🚀 30-Second Setup

```bash
# 1. Setup database
setup-teacher-global-sheets.bat

# 2. Start backend
cd backend && npm start

# 3. Start frontend
npm run dev

# 4. Login
Username: teacher@garden.rw
Password: teacher123
```

## 📊 Dashboard Tabs

| Tab | Purpose | Key Features |
|-----|---------|--------------|
| **Overview** | Statistics | Total students, subjects, filtered count |
| **All Students** | Student list | Filter by trade/level, search, refresh |
| **Marks Sheet** | Enter marks | Excel-like, auto-calc, save/load |
| **Amanota** | Competency | 70% threshold, competent/not yet |
| **Attendance** | Daily tracking | Present/absent, real-time stats |

## 🎯 Quick Actions

### Enter Marks (3 steps)
1. **Select:** Trade → Level → Term
2. **Add Columns:** Click "Add Column" → Enter name, max, weight
3. **Enter & Save:** Click cells → Enter marks → Click "Save Marks"

### Load Previous Marks
1. Select Trade + Level + Term
2. Click "Load Saved"
3. Edit and save again

### Export Data
Click "Export CSV" → Downloads spreadsheet

## 📝 Marks Sheet Features

| Feature | How It Works |
|---------|--------------|
| **Add Column** | Plus button → Name, Max Marks, Weight % |
| **Delete Column** | Trash icon on column header (min 1 required) |
| **Edit Mark** | Click cell → Type number → Click outside |
| **Auto Total** | Σ(mark/max × weight) |
| **Auto %** | (total/Σweights) × 100 |
| **Auto Grade** | A(90+), B(80+), C(70+), D(60+), E(50+), F(<50) |

## 🎨 Color Codes

### Grades
- 🟢 **A** - Green (90-100%)
- 🔵 **B** - Blue (80-89%)
- 🟡 **C** - Yellow (70-79%)
- 🟠 **D** - Orange (60-69%)
- 🟠 **E** - Light Red (50-59%)
- 🔴 **F** - Red (0-49%)

### Competency
- 🟢 **Competent** - ≥70 marks
- 🔴 **Not Yet Competent** - <70 marks

## 🔌 API Quick Reference

```javascript
// Get all students
GET /api/global-sheets/students?trade=SOD&level=4

// Save marks
POST /api/teacher-marks/save
Body: { columns, marks, trade, level, term }

// Load saved marks
GET /api/teacher-marks/marks?trade=SOD&level=4&term=Term%201

// Get statistics
GET /api/global-sheets/statistics
```

## 📊 Statistics Displayed

- **Total Students** - All in database
- **Filtered** - Current view
- **Class Average** - Mean percentage
- **Pass Rate** - % ≥50%
- **Highest/Lowest** - Top/bottom scores

## 🎯 Pro Tips

1. **Always select specific trade & level** before saving
2. **Use "Load Saved"** to resume previous work
3. **Export CSV regularly** for backup
4. **Click cells directly** - no need for edit button
5. **Weights must sum to 100%** for accurate percentage

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| No students showing | Check filters, refresh data |
| Can't save marks | Select specific trade & level (not "ALL") |
| Marks not loading | Verify trade/level/term match previous save |
| Wrong calculations | Check column weights sum to 100% |

## 🔐 Permissions

- ✅ View all students in `global_student_sheets`
- ✅ Save marks for any trade/level
- ✅ Load own saved marks
- ✅ Export data to CSV
- ❌ Cannot modify student records
- ❌ Cannot delete other teachers' marks

## 📱 Keyboard Shortcuts

- **Tab** - Move to next cell
- **Enter** - Save cell and move down
- **Esc** - Cancel cell edit
- **Ctrl+S** - Save marks (if implemented)

## 🎓 Example Workflow

```
1. Login as teacher
2. Navigate to "Marks Sheet" tab
3. Select: SOD → Level 4 → Term 1
4. Click "Load Saved" (if continuing)
5. Click "Add Column":
   - Name: "Midterm Exam"
   - Max Marks: 50
   - Weight: 50%
6. Click cells and enter marks
7. Watch auto-calculations happen
8. Click "Save Marks"
9. Click "Export CSV" for records
10. Done! ✅
```

## 📞 Support

- **Documentation:** `TEACHER_GLOBAL_SHEETS_COMPLETE.md`
- **Backend:** `backend/routes/global-sheets.js`
- **Frontend:** `src/app/pages/dashboards/ModernTeacherDashboard.tsx`

---

**Quick Access:** `/dashboards/modern-teacher`
**Version:** 1.0.0

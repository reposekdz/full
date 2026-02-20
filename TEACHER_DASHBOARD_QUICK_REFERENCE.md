# 🎓 Modern Teacher Dashboard - Quick Reference

## 🚀 Quick Start (30 seconds)

```bash
# 1. Login as teacher
Username: teacher@garden.rw
Password: teacher123

# 2. Dashboard loads automatically
# 3. Start using!
```

## 📊 Three Main Tabs

### 1️⃣ Overview
- **Total Students**: Count of students in class
- **Subjects**: Number of assessment columns
- **Average %**: Real-time class average
- **Statistics**: Pass rate, highest, lowest scores

### 2️⃣ Students
- Select Trade (SOD/BDC/AUT)
- Select Level (3/4/5)
- View student list
- Click "Refresh" to load

### 3️⃣ Marks Sheet (Excel-like)
- Add/delete columns
- Click cells to edit marks
- Auto-calculations
- Save & export

## ⚡ Quick Actions

| Action | Steps |
|--------|-------|
| **Add Column** | Click "Add Column" → Enter name, max marks, weight → Add |
| **Enter Marks** | Click cell → Type number → Press Enter |
| **Delete Column** | Click trash icon on column header |
| **Save Marks** | Click "Save Marks" button |
| **Export CSV** | Click "Export CSV" button |
| **Change Class** | Select trade/level → Click "Refresh" |

## 🎯 Auto-Calculations

```
Total = Σ (Mark / MaxMarks × Weight)
Percentage = (Total / Σ Weights) × 100

Grades:
A: ≥90%  |  B: 80-89%  |  C: 70-79%
D: 60-69%  |  E: 50-59%  |  F: <50%
```

## 🎨 Color Guide

| Color | Meaning |
|-------|---------|
| 🟢 Green | Grade A |
| 🔵 Blue | Grade B |
| 🟡 Yellow | Grade C |
| 🟠 Orange | Grade D |
| 🔴 Red | Grade E/F |

## 📱 Navigation

- **Sidebar**: Click tabs to switch views
- **Top Bar**: Shows current section
- **Buttons**: Hover for tooltips

## 💡 Pro Tips

1. **Weighted Scoring**: Set weights to match your grading policy
   - Example: Test 1 (20%), Test 2 (20%), Exam (60%)

2. **Quick Entry**: Use Tab key to move between cells

3. **Validation**: System highlights marks exceeding max

4. **Export Often**: Download CSV backups regularly

5. **Save Frequently**: Click "Save Marks" after each session

## 🔧 Common Tasks

### Record Test Marks
```
1. Click "Add Column"
2. Name: "Test 1", Max: 20, Weight: 20%
3. Click cells and enter marks
4. Click "Save Marks"
```

### Change Class
```
1. Select new Trade
2. Select new Level
3. Click "Refresh"
```

### Export Results
```
1. Enter all marks
2. Click "Export CSV"
3. File downloads automatically
```

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| Students not showing | Click "Refresh" button |
| Can't edit cell | Click cell again |
| Wrong calculation | Check column weights |
| Save failed | Check internet connection |

## 📊 Example Setup

### Standard Assessment Structure
```
Column 1: Test 1 (Max: 20, Weight: 20%)
Column 2: Test 2 (Max: 20, Weight: 20%)
Column 3: Final Exam (Max: 60, Weight: 60%)
Total Weight: 100%
```

### Marks Entry Example
```
Student: John Doe
Test 1: 18/20 → 18%
Test 2: 16/20 → 16%
Exam: 54/60 → 54%
Total: 88%
Grade: B
```

## 🎯 Key Features

✅ **Excel-like Interface**: Familiar spreadsheet feel
✅ **Auto-Calculations**: No manual math needed
✅ **Dynamic Columns**: Add/remove as needed
✅ **Real-time Stats**: Live class performance
✅ **CSV Export**: Download for records
✅ **Color-Coded**: Visual grade indicators
✅ **Responsive**: Works on all devices
✅ **Secure**: JWT authentication

## 📞 Need Help?

- **Documentation**: MODERN_TEACHER_DASHBOARD_GUIDE.md
- **Support**: support@garden.rw
- **Phone**: +250 788 123 456

## 🎨 Design Colors

```css
Sidebar: Dark slate gradient
Cards: Blue, Green, Purple gradients
Grades: Green (A) → Red (F)
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Next cell |
| Enter | Save & next row |
| Esc | Cancel edit |

## 📈 Statistics Explained

- **Class Average**: Mean of all student percentages
- **Pass Rate**: % of students with ≥50%
- **Highest Score**: Best student percentage
- **Lowest Score**: Lowest student percentage

## 🔐 Security

- JWT token authentication
- Teacher role required
- Secure API endpoints
- Data validation

## 🎓 Best Practices

1. **Set up columns first** before entering marks
2. **Save frequently** to avoid data loss
3. **Export backups** after each grading session
4. **Verify calculations** by spot-checking
5. **Use consistent weights** across assessments

---

**Quick Access**: Login → Dashboard → Marks Sheet → Start!

**Version**: 1.0.0 | **Built for**: Garden TVET School

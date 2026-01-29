# 🚀 GLOBAL STUDENT SHEETS - QUICK START

## What's New?

✅ **ONE GLOBAL SYSTEM** for all student sheets  
✅ **ROLE-BASED ACCESS** - Each role sees what they need  
✅ **CUSTOM COLUMNS** - Create your own fields  
✅ **AUTO-CALCULATIONS** - Grades, attendance, conduct scores  
✅ **FULL FUNCTIONAL** - Marks, attendance, discipline, payments  

## Setup (2 Steps)

### 1. Run Setup
```bash
setup-global-student-sheets.bat
```

### 2. Start Server
```bash
cd backend
npm start
```

## API Endpoint
```
/api/global-sheets
```

## Key Features by Role

### 👨‍🏫 Teacher
- ✅ Enter marks (quiz, midterm, final)
- ✅ Mark attendance
- ✅ View student performance
- ✅ Create custom columns for subjects

### 📚 Director of Studies (DOS)
- ✅ View all students
- ✅ Generate term reports
- ✅ Track academic performance
- ✅ Create academic tracking columns

### ⚖️ Director of Discipline (DOD)
- ✅ Record discipline incidents
- ✅ Track conduct scores
- ✅ Notify parents
- ✅ Create behavior tracking columns

### 💰 Accountant
- ✅ Record payments
- ✅ Track fee status
- ✅ Generate financial reports
- ✅ Create payment tracking columns

### 👑 Admin
- ✅ Full system access
- ✅ Create global columns
- ✅ Manage all data
- ✅ System configuration

## Quick API Examples

### Get All Students
```javascript
GET /api/global-sheets/students?trade_code=AUTO&level_number=1
```

### Add Marks
```javascript
POST /api/global-sheets/students/123/marks
{
  "subject_code": "MATH101",
  "term": "Term 1",
  "quiz_marks": 18,
  "midterm_marks": 25,
  "final_marks": 45
}
```

### Mark Attendance
```javascript
POST /api/global-sheets/students/123/attendance
{
  "attendance_date": "2024-01-15",
  "status": "present"
}
```

### Create Custom Column
```javascript
POST /api/global-sheets/custom-columns
{
  "column_name": "sports_team",
  "column_label": "Sports Team",
  "column_type": "select",
  "select_options": ["Football", "Basketball", "Volleyball"],
  "visible_to_roles": ["teacher", "dos", "admin"],
  "editable_by_roles": ["teacher", "admin"],
  "scope": "global"
}
```

## Database Tables Created

1. ✅ `global_student_sheets` - Master records
2. ✅ `student_subject_performance` - Marks
3. ✅ `student_attendance_records` - Daily attendance
4. ✅ `student_attendance_summary` - Monthly stats
5. ✅ `student_discipline_records` - Incidents
6. ✅ `student_conduct_tracking` - Conduct scores
7. ✅ `student_payment_records` - Payments
8. ✅ `student_sheet_custom_columns` - Custom fields
9. ✅ `student_sheet_custom_values` - Custom data
10. ✅ `student_term_reports` - Reports
11. ✅ `student_sheet_access_log` - Audit trail

## Auto-Calculations

### Grades
- **A**: 90-100%
- **B**: 80-89%
- **C**: 70-79%
- **D**: 60-69%
- **F**: Below 60%

### Conduct Score
- Base: 100 points
- Critical incident: -20
- High incident: -10
- Medium incident: -5
- Low incident: -2

### Attendance Rate
```
Rate = (Present Days / Total Days) × 100
```

## Custom Column Types

1. **text** - Simple text
2. **number** - Numeric value
3. **date** - Date picker
4. **boolean** - Yes/No
5. **select** - Dropdown
6. **textarea** - Long text
7. **calculated** - Auto-calculated

## Benefits

### 🎯 For Everyone
- Single source of truth
- Real-time updates
- No data duplication
- Easy access

### 🔒 Security
- Role-based permissions
- Audit logging
- Data validation
- Secure authentication

### 📊 Insights
- Auto-calculated statistics
- Performance analytics
- Attendance tracking
- Financial overview

## Files Created

1. ✅ `backend/migrations/global_student_sheets_system.sql` - Database schema
2. ✅ `backend/routes/global-student-sheets.js` - API routes
3. ✅ `backend/setup-global-student-sheets.js` - Setup script
4. ✅ `setup-global-student-sheets.bat` - Setup command
5. ✅ `GLOBAL_STUDENT_SHEETS_GUIDE.md` - Full documentation

## Next Steps

1. ✅ Run setup script
2. ✅ Test API endpoints
3. ✅ Create custom columns for your needs
4. ✅ Start using the system

## Support

📖 Full Documentation: `GLOBAL_STUDENT_SHEETS_GUIDE.md`  
🔗 API Endpoint: `/api/global-sheets`  
📊 Database: All tables prefixed with `global_student_` or `student_`

---

**Status**: ✅ Ready to Use  
**Version**: 1.0.0  
**All Roles**: Fully Functional  
**Custom Columns**: Enabled  
**Auto-Calculations**: Active

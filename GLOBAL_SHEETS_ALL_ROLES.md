# 📊 Global Student Sheets - Universal Access for All Staff Roles

## ✅ SYSTEM STATUS: FULLY OPERATIONAL

The Global Student Sheets system is now **FULLY ACCESSIBLE** to ALL staff roles with appropriate permissions.

---

## 🎯 Accessible Roles

### Full Access (View, Edit, Delete, Export)
- ✅ **Headmaster** - Complete control over all student data
- ✅ **DOS (Director of Studies)** - Full academic management
- ✅ **Admin** - System-wide administration

### Edit Access (View, Edit, Export)
- ✅ **Accountant** - Financial data management
- ✅ **DOD (Director of Discipline)** - Conduct and discipline
- ✅ **Teacher** - Student performance and marks
- ✅ **Advisor** - Student guidance and counseling
- ✅ **Matron/Patron** - Student welfare

### View Access (View, Export)
- ✅ **Stock Manager** - Inventory and supplies tracking

---

## 🚀 Quick Setup

### Run Integration Script
```bash
# Windows
integrate-global-sheets-all-roles.bat

# Or manually
cd backend
node integrate-global-sheets-all-roles.js
```

This script will:
1. ✅ Create/verify global_student_sheets table
2. ✅ Set up role permissions
3. ✅ Sync all student data
4. ✅ Update financial information
5. ✅ Update academic records
6. ✅ Update attendance data
7. ✅ Update conduct scores
8. ✅ Create database views
9. ✅ Create stored procedures

---

## 📋 Database Structure

### Main Table: `global_student_sheets`
```sql
- id (Primary Key)
- student_id (Foreign Key to users)
- first_name, last_name
- student_code (Unique)
- email, phone
- trade_id, trade_code, trade_name
- level_id, level_number, level_name
- status (active/inactive/graduated/suspended)
- average_marks
- attendance_percentage
- conduct_score
- total_fees, paid_amount, balance
- payment_status (paid/partial/unpaid)
- created_at, updated_at
```

### Permissions Table: `role_permissions`
```sql
- id (Primary Key)
- role_name
- permission_name
- can_view (Boolean)
- can_edit (Boolean)
- can_delete (Boolean)
- can_export (Boolean)
```

### View: `v_global_student_sheets`
Enhanced view with calculated fields:
- full_name
- performance_grade (Excellent/Very Good/Good/Fair/Poor)
- attendance_grade
- conduct_grade
- trade_full_name
- level_full_name

---

## 🔌 API Endpoints

### Base URL: `/api/global-sheets`

All endpoints require authentication token.

### 1. Get All Students
```http
GET /api/global-sheets/students
Authorization: Bearer <token>

Query Parameters:
- trade_id (optional) - Filter by trade
- level_id (optional) - Filter by level
- status (optional) - Filter by status
- search (optional) - Search by name, code, or email

Response:
{
  "success": true,
  "students": [...],
  "permissions": {
    "can_view": true,
    "can_edit": true,
    "can_delete": false,
    "can_export": true
  },
  "userRole": "accountant"
}
```

### 2. Get Single Student
```http
GET /api/global-sheets/students/:id
Authorization: Bearer <token>

Response:
{
  "success": true,
  "student": {...},
  "permissions": {...}
}
```

### 3. Get Statistics
```http
GET /api/global-sheets/statistics
Authorization: Bearer <token>

Response:
{
  "success": true,
  "statistics": {
    "total_students": 1248,
    "active_students": 1200,
    "paid_students": 800,
    "unpaid_students": 200,
    "avg_marks": 75.5,
    "avg_attendance": 92.3,
    "avg_conduct": 85.7,
    "total_fees": 45000000,
    "total_paid": 38000000,
    "total_balance": 7000000
  }
}
```

### 4. Sync Data (Admin/Headmaster Only)
```http
POST /api/global-sheets/sync
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Global student sheets synced successfully"
}
```

---

## 🎨 Frontend Integration

### Import Component
```tsx
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';
```

### Use in Dashboard
```tsx
// In your dashboard component
<TabsContent value="global-sheets">
  <GlobalStudentSheets onNavigate={onNavigate} />
</TabsContent>
```

### Example: Accountant Dashboard
```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="global-sheets">Global Student Sheets</TabsTrigger>
    <TabsTrigger value="payments">Payments</TabsTrigger>
  </TabsList>
  
  <TabsContent value="global-sheets">
    <GlobalStudentSheets onNavigate={onNavigate} />
  </TabsContent>
</Tabs>
```

---

## 🔐 Role-Based Permissions

### Permission Matrix

| Role           | View | Edit | Delete | Export | Use Case                          |
|----------------|------|------|--------|--------|-----------------------------------|
| Headmaster     | ✅   | ✅   | ✅     | ✅     | Full system oversight             |
| DOS            | ✅   | ✅   | ✅     | ✅     | Academic management               |
| DOD            | ✅   | ✅   | ❌     | ✅     | Discipline tracking               |
| Accountant     | ✅   | ✅   | ❌     | ✅     | Financial management              |
| Teacher        | ✅   | ✅   | ❌     | ✅     | Student performance               |
| Advisor        | ✅   | ✅   | ❌     | ✅     | Student counseling                |
| Matron/Patron  | ✅   | ✅   | ❌     | ✅     | Student welfare                   |
| Stock Manager  | ✅   | ❌   | ❌     | ✅     | Resource allocation               |
| Admin          | ✅   | ✅   | ✅     | ✅     | System administration             |

---

## 📊 Features by Role

### Accountant
- View all student financial data
- Update payment information
- Track outstanding balances
- Export financial reports
- Filter by payment status
- Contact parents about fees

### DOS (Director of Studies)
- View academic performance
- Update student marks
- Manage class assignments
- Track attendance
- Export academic reports
- Full student data management

### DOD (Director of Discipline)
- View conduct scores
- Update discipline records
- Track incidents
- Remove conduct points
- Contact parents
- Export discipline reports

### Headmaster
- Complete system oversight
- All permissions enabled
- Strategic decision making
- Full data access
- System-wide reports

### Teacher
- View class students
- Update marks and grades
- Track attendance
- View student performance
- Export class reports

### Advisor
- View assigned students
- Update counseling notes
- Track student progress
- Export guidance reports

### Stock Manager
- View student data for resource planning
- Export inventory reports
- Track resource allocation

---

## 🛠️ Maintenance

### Sync Student Data
Run this periodically to keep data up-to-date:

```sql
CALL sp_sync_global_student_sheets();
```

Or via API:
```bash
curl -X POST http://localhost:5000/api/global-sheets/sync \
  -H "Authorization: Bearer <admin_token>"
```

### Manual Data Update
```sql
-- Update specific student
UPDATE global_student_sheets 
SET average_marks = 85.5, 
    attendance_percentage = 95.0
WHERE student_id = 123;

-- Recalculate financial data
UPDATE global_student_sheets gss
LEFT JOIN (
  SELECT student_id, SUM(amount) as total
  FROM student_fees
  GROUP BY student_id
) sf ON gss.student_id = sf.student_id
SET gss.total_fees = COALESCE(sf.total, 0);
```

---

## 🔍 Troubleshooting

### Issue: "Access Denied"
**Solution**: Check role permissions
```sql
SELECT * FROM role_permissions 
WHERE role_name = 'your_role' 
AND permission_name = 'global_student_sheets';
```

### Issue: "No students found"
**Solution**: Sync the data
```bash
cd backend
node integrate-global-sheets-all-roles.js
```

### Issue: "Outdated data"
**Solution**: Run sync procedure
```sql
CALL sp_sync_global_student_sheets();
```

### Issue: "Missing permissions"
**Solution**: Re-run integration script
```bash
integrate-global-sheets-all-roles.bat
```

---

## 📈 Performance Optimization

### Indexes Created
- `idx_trade` - Fast filtering by trade
- `idx_level` - Fast filtering by level
- `idx_status` - Fast filtering by status
- `idx_student_code` - Fast student lookup

### View Usage
Use `v_global_student_sheets` for enhanced queries:
```sql
SELECT * FROM v_global_student_sheets
WHERE performance_grade = 'Excellent'
AND attendance_grade = 'Good';
```

---

## 🎯 Best Practices

### 1. Regular Syncing
- Sync data daily or after major updates
- Use cron job for automatic syncing

### 2. Permission Management
- Review permissions quarterly
- Update as roles change

### 3. Data Validation
- Verify student data accuracy
- Check for missing information

### 4. Export Functionality
- Use CSV export for reports
- Filter before exporting large datasets

### 5. Search Optimization
- Use specific filters to reduce results
- Combine trade and level filters

---

## 📞 Support

### Common Questions

**Q: Can I add custom columns?**
A: Yes, use the dynamic columns feature in the API.

**Q: How do I export data?**
A: Use the export button in the UI or call the API endpoint.

**Q: Can I filter by multiple criteria?**
A: Yes, combine query parameters in the API call.

**Q: How often should I sync?**
A: Daily or after significant data changes.

**Q: Can I customize permissions?**
A: Yes, update the `role_permissions` table.

---

## ✅ Verification Checklist

After integration, verify:

- [ ] All staff roles can access `/api/global-sheets/students`
- [ ] Permissions are correctly set in database
- [ ] Student data is synced and up-to-date
- [ ] Financial data is accurate
- [ ] Academic records are current
- [ ] Attendance data is correct
- [ ] Conduct scores are updated
- [ ] Export functionality works
- [ ] Search and filter work properly
- [ ] Role-based UI elements display correctly

---

## 🎉 Success Criteria

✅ **System is working correctly when:**

1. All staff roles can log in and access global sheets
2. Data displays correctly for each role
3. Permissions are enforced (edit/delete based on role)
4. Search and filter work smoothly
5. Export generates correct CSV files
6. Statistics are accurate
7. No console errors
8. Performance is acceptable (<2s load time)

---

**Status**: ✅ FULLY OPERATIONAL  
**Last Updated**: January 2026  
**Version**: 2.0  
**Maintained By**: Development Team

---

## 📚 Related Documentation

- [Global Student Sheets Guide](GLOBAL_STUDENT_SHEETS_GUIDE.md)
- [Global Student Sheets Complete](GLOBAL_STUDENT_SHEETS_COMPLETE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Role Management](ROLE_MANAGEMENT.md)

---

**Need Help?** Contact the development team or check the troubleshooting section above.

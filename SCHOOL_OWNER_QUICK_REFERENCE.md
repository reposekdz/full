# School Owner Role - Quick Reference

## 🚀 Quick Start

### Setup (One-time)
```bash
setup-school-owner.bat
```

### Create Owner Account
1. Staff Management → Add Staff
2. Role: **school_owner**
3. Login with credentials

## 📊 API Endpoints

### Base URL
```
http://localhost:5000/api/school-owner
```

### Endpoints

| Endpoint | Description | Key Data |
|----------|-------------|----------|
| `/dashboard` | Supreme overview | Financial, Academic, Stock, Staff |
| `/finances/analytics` | Financial deep dive | Revenue, Expenses, Trends |
| `/performance/analytics` | Academic performance | GPA, Attendance, Top students |
| `/stock/analytics` | Inventory management | Stock levels, Movements, Alerts |
| `/system/analytics` | System health | Users, Activity, Health |
| `/reports/comprehensive` | Generate reports | Financial, Academic reports |
| `/students/all` | All students | Paginated student list |
| `/staff/all` | All staff | Complete staff list |

## 🎯 Key Features

### Financial Management
- ✅ Total revenue tracking
- ✅ Collection rate monitoring
- ✅ Expense breakdown
- ✅ Profit/loss analysis
- ✅ Payment method analytics

### Performance Analytics
- ✅ School-wide GPA
- ✅ Attendance rates
- ✅ Trade performance comparison
- ✅ Top performers list
- ✅ Subject-wise analysis

### Stock Management
- ✅ Inventory value tracking
- ✅ Low stock alerts
- ✅ Stock movement history
- ✅ Category-wise breakdown

### System Analytics
- ✅ User activity monitoring
- ✅ Database statistics
- ✅ System health indicators
- ✅ Real-time insights

## 🔐 Access Level

**School Owner = Supreme Access**
- All financial data ✅
- All student records ✅
- All staff information ✅
- All system analytics ✅
- All management features ✅

## 📱 Quick Examples

### Fetch Dashboard
```javascript
fetch('/api/school-owner/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### Get Financial Analytics
```javascript
fetch('/api/school-owner/finances/analytics?trade_code=AUTO', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### Generate Report
```javascript
fetch('/api/school-owner/reports/comprehensive?report_type=financial', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

## 📈 Key Metrics

### Financial
- Expected Revenue
- Collected Revenue
- Outstanding Balance
- Collection Rate %
- Net Profit
- Profit Margin %

### Academic
- Total Students
- Average GPA
- Average Attendance %
- Honors Students
- At-Risk Students

### Stock
- Total Items
- Total Value
- Low Stock Count
- Out of Stock Count

### System
- Active Users
- Pending Payments
- Open Incidents
- System Health

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Role not found | Run `setup-school-owner.bat` |
| Permission denied | Check user has `school_owner` role |
| No data | Verify database has data |
| API error | Check server is running |

## 📞 Support

- Documentation: `SCHOOL_OWNER_DOCUMENTATION.md`
- API Docs: `/api/docs`
- System Admin: Contact IT department

---

**Quick Access:** All endpoints require authentication token in header

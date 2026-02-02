# School Owner Role - Complete Documentation

## 🎯 Overview

The **School Owner** role provides supreme access to all system data with comprehensive analytics, financial management, performance tracking, stock management, and real-time insights.

## 🚀 Quick Setup

### 1. Run Database Migration
```bash
setup-school-owner.bat
```

### 2. Create School Owner User
1. Go to Staff Management
2. Click "Add New Staff"
3. Fill in details:
   - First Name: [Owner's First Name]
   - Last Name: [Owner's Last Name]
   - Email: [owner@school.com]
   - Phone: [Phone Number]
   - **Role: school_owner** ⭐
4. Click "Save"

### 3. Login
- Use the email and default password (Staff@123)
- Change password on first login

## 📊 Features & Capabilities

### 1. Supreme Dashboard (`GET /api/school-owner/dashboard`)
Complete overview of the entire school system:

**Financial Metrics:**
- Total expected revenue
- Total collected revenue
- Outstanding balances
- Collection rate percentage
- Payment status breakdown (fully paid, partial, unpaid)
- Total expenses and expense count
- Staff salaries and salary count
- Net profit and profit margin

**Academic Performance:**
- Total students, honors students, at-risk students
- Average GPA across all students
- Average attendance percentage
- Performance breakdown by trade
- Top performers list

**Stock & Inventory:**
- Total items in stock
- Total inventory value
- Low stock alerts
- Out of stock items

**Staff Analytics:**
- Staff count by role
- Active staff members

**Discipline Metrics:**
- Total incidents (last 30 days)
- High severity incidents
- Resolved incidents
- Average conduct score

**Recent Activities:**
- Latest 10 payments
- Latest 10 expenses

### 2. Financial Analytics (`GET /api/school-owner/finances/analytics`)
Deep dive into financial data:

**Revenue Analysis:**
- Revenue by trade (expected, collected, outstanding)
- Collection rate by trade
- Student count per trade

**Trends:**
- Monthly revenue trend (last 12 months)
- Payment count per month

**Expense Breakdown:**
- Expenses by category
- Average expense per category
- Total expenses per category

**Payment Methods:**
- Transaction count by payment method
- Total amount by payment method

**Query Parameters:**
- `start_date` - Filter by start date
- `end_date` - Filter by end date
- `trade_code` - Filter by specific trade

### 3. Performance Analytics (`GET /api/school-owner/performance/analytics`)
School-wide academic performance:

**Overall Metrics:**
- Average, highest, and lowest GPA
- Average attendance percentage
- Student distribution (honors, good standing, satisfactory, at-risk)

**Performance by Trade:**
- Average GPA per trade and level
- Average attendance per trade and level
- Average conduct score per trade and level
- Student count per trade and level

**Top Performers:**
- Top 20 students by GPA
- Includes attendance and conduct scores

**Subject Performance:**
- Average marks per subject
- Average grade point per subject
- Student count per subject

**Attendance Trends:**
- Monthly attendance rates (last 12 months)
- Present vs absent counts
- Unique student counts

### 4. Stock Management Analytics (`GET /api/school-owner/stock/analytics`)
Complete inventory oversight:

**Stock Summary:**
- Items by category
- Total quantity per category
- Total value per category
- Low stock count per category

**Recent Movements:**
- Last 50 stock movements
- Includes item details and staff who recorded

**Low Stock Alerts:**
- All items at or below reorder level
- Sorted by quantity (lowest first)

**Value Trends:**
- Monthly stock in/out value (last 12 months)
- Track inventory investment

### 5. System Analytics (`GET /api/school-owner/system/analytics`)
Real-time system insights:

**User Activity:**
- User count by role
- Active users today
- Active users this week

**Database Statistics:**
- Total users, students, payments
- Total attendance records
- Total assignments, news, notifications

**System Health:**
- Pending payments count
- Overdue assignments count
- Low stock items count
- Open discipline incidents
- Open support tickets

### 6. Comprehensive Reports (`GET /api/school-owner/reports/comprehensive`)
Generate detailed reports:

**Financial Reports:**
- Revenue summary
- Expenses summary
- Salaries summary
- Transaction counts

**Academic Reports:**
- Performance by trade
- Average GPA and attendance
- Honors students count

**Query Parameters:**
- `report_type` - 'financial', 'academic', or omit for both
- `start_date` - Report start date
- `end_date` - Report end date

### 7. All Students Access (`GET /api/school-owner/students/all`)
Complete student database access:

**Features:**
- View all students with pagination
- Filter by trade, level, payment status
- Search by name or student code

**Query Parameters:**
- `trade_code` - Filter by trade
- `level_number` - Filter by level
- `payment_status` - Filter by payment status
- `search` - Search term
- `limit` - Results per page (default: 100)
- `offset` - Pagination offset (default: 0)

### 8. All Staff Access (`GET /api/school-owner/staff/all`)
Complete staff database access:

**Features:**
- View all staff members
- Staff summary by role
- Includes role descriptions

## 🔐 Security & Access Control

### Role Hierarchy
```
school_owner (Supreme Access)
    ↓
admin, headmaster (Elevated Access)
    ↓
patron, matron (Comprehensive Access)
    ↓
Other Staff Roles (Limited Access)
```

### Permissions
- School Owner has ALL permissions automatically
- Access to ALL financial data
- Access to ALL student records
- Access to ALL staff information
- Access to ALL system analytics
- Can view and manage everything

### Audit Trail
All School Owner activities are logged in `school_owner_analytics` table:
- Action type
- Action details (JSON)
- IP address
- Timestamp

## 📱 API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/school-owner/dashboard` | GET | Supreme dashboard overview |
| `/api/school-owner/finances/analytics` | GET | Financial deep dive |
| `/api/school-owner/performance/analytics` | GET | Academic performance |
| `/api/school-owner/stock/analytics` | GET | Stock management |
| `/api/school-owner/system/analytics` | GET | System insights |
| `/api/school-owner/reports/comprehensive` | GET | Generate reports |
| `/api/school-owner/students/all` | GET | All students access |
| `/api/school-owner/staff/all` | GET | All staff access |

## 🎨 Frontend Integration

### Authentication Header
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Example: Fetch Dashboard
```javascript
const fetchDashboard = async () => {
  const response = await fetch('http://localhost:5000/api/school-owner/dashboard', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  const data = await response.json();
  return data.dashboard;
};
```

### Example: Fetch Financial Analytics
```javascript
const fetchFinancialAnalytics = async (tradeCode = null) => {
  const url = new URL('http://localhost:5000/api/school-owner/finances/analytics');
  if (tradeCode) url.searchParams.append('trade_code', tradeCode);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  const data = await response.json();
  return data.analytics;
};
```

## 📊 Sample Response Structures

### Dashboard Response
```json
{
  "success": true,
  "dashboard": {
    "financial": {
      "revenue": {
        "expected": 50000000,
        "collected": 35000000,
        "outstanding": 15000000,
        "collection_rate": "70.00"
      },
      "expenses": { "total": 10000000, "count": 150 },
      "salaries": { "total": 8000000, "staff_count": 45 },
      "profit": { "net": 17000000, "margin": "48.57" }
    },
    "academic": {
      "students": { "total": 500, "honors": 75, "at_risk": 20 },
      "performance": { "avg_gpa": "3.25", "avg_attendance": "92.50" }
    },
    "stock": {
      "total_items": 250,
      "total_value": 15000000,
      "low_stock": 15,
      "out_of_stock": 3
    }
  }
}
```

## 🛠️ Troubleshooting

### Issue: Role not found
**Solution:** Run `setup-school-owner.bat` to add the role to database

### Issue: Permission denied
**Solution:** Ensure user has `school_owner` role assigned

### Issue: No data showing
**Solution:** Check database has sample data, verify API endpoints are working

## 📈 Best Practices

1. **Regular Monitoring:** Check dashboard daily for key metrics
2. **Financial Review:** Review financial analytics weekly
3. **Performance Tracking:** Monitor academic performance monthly
4. **Stock Management:** Check low stock alerts regularly
5. **System Health:** Monitor system analytics for issues
6. **Report Generation:** Generate comprehensive reports quarterly

## 🔄 Updates & Maintenance

### Database Maintenance
- Regular backups recommended
- Monitor database size
- Optimize queries if slow

### Security
- Change default password immediately
- Use strong passwords
- Enable two-factor authentication (if available)
- Review audit logs regularly

## 📞 Support

For technical support or questions:
- Check system documentation
- Contact system administrator
- Review API documentation

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅

# Comprehensive Advanced School Management System - API Documentation

## Table of Contents
1. [Universal Staff Management](#universal-staff-management)
2. [Admin Dashboard Advanced](#admin-dashboard-advanced)
3. [Accountant Comprehensive](#accountant-comprehensive)
4. [Stock Management Advanced](#stock-management-advanced)
5. [Teacher Portal Advanced](#teacher-portal-advanced)
6. [Student Portal Comprehensive](#student-portal-comprehensive)
7. [Parent Portal Comprehensive](#parent-portal-comprehensive)

---

## Universal Staff Management

**Base URL**: `/api/universal-management`

### Dynamic Column Management

#### Get Custom Columns
```
GET /columns/:entityType
```
**Description**: Get all custom columns for a specific entity type

**Parameters**:
- `entityType` (path): Entity type (students, teachers, staff, parents)

**Response**:
```json
{
  "success": true,
  "columns": [
    {
      "id": 1,
      "entity_type": "students",
      "column_name": "blood_type",
      "column_label": "Blood Type",
      "column_type": "select",
      "options": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
    }
  ]
}
```

#### Create Custom Column
```
POST /columns
```
**Authorization**: Admin, Headmaster

**Body**:
```json
{
  "entity_type": "students",
  "column_name": "blood_type",
  "column_label": "Blood Type",
  "column_type": "select",
  "data_type": "string",
  "is_required": 0,
  "is_searchable": 1,
  "options": ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
}
```

#### Update Custom Column
```
PUT /columns/:id
```
**Authorization**: Admin, Headmaster

#### Delete Custom Column
```
DELETE /columns/:id?permanent=false
```
**Authorization**: Admin, Headmaster

**Query Parameters**:
- `permanent`: true/false (soft delete by default)

### Universal Entity Management

#### Get All Entities
```
GET /entities/:entityType
```
**Description**: Get all entities with dynamic columns and advanced filtering

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `search`: Search term
- `sortBy`: Sort field (default: created_at)
- `sortOrder`: ASC/DESC (default: DESC)
- `filters`: JSON string of custom field filters

**Response**:
```json
{
  "success": true,
  "entities": [...],
  "customColumns": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

#### Get Single Entity
```
GET /entities/:entityType/:id
```

#### Update Entity Custom Fields
```
PUT /entities/:entityType/:id/custom-fields
```

**Body**:
```json
{
  "custom_fields": {
    "blood_type": "A+",
    "emergency_contact": "0788888888"
  }
}
```

#### Bulk Update Custom Fields
```
POST /entities/:entityType/bulk-update-fields
```

#### Export Entities
```
GET /entities/:entityType/export?format=csv
```

---

## Admin Dashboard Advanced

**Base URL**: `/api/admin-dashboard-advanced`

### Dashboard Overview

#### Get Comprehensive Statistics
```
GET /overview?timeframe=30d
```
**Authorization**: Admin, Headmaster

**Query Parameters**:
- `timeframe`: 7d, 30d, 90d, 1y

**Response**:
```json
{
  "success": true,
  "statistics": {
    "students": {
      "total": 1500,
      "active": 1450,
      "suspended": 50,
      "new_this_period": 120
    },
    "financial": {
      "total_revenue": 45000000,
      "pending_payments": 5000000,
      "overdue_payments": 2000000
    },
    "attendance": {
      "total_records": 30000,
      "attendance_rate": 92.5
    }
  }
}
```

### Analytics

#### Enrollment Trends
```
GET /analytics/enrollment-trends?period=monthly&months=12
```

#### Financial Analytics
```
GET /analytics/financial?startDate=2024-01-01&endDate=2024-12-31
```

#### Academic Performance
```
GET /analytics/academic-performance?academicYear=2024-2025&term=Term1
```

#### Attendance Analytics
```
GET /analytics/attendance?startDate=2024-01-01&endDate=2024-12-31
```

### User Management

#### Get All Users
```
GET /users?role=teacher&status=active&page=1&limit=50
```

#### Create User
```
POST /users
```

#### Bulk Operations
```
POST /users/bulk-activate
POST /users/bulk-deactivate
POST /users/bulk-role-update
```

### System Settings

#### Get All Settings
```
GET /settings?category=general
```

#### Update Settings
```
PUT /settings/:key
```

### Activity Logs

#### Get Activity Logs
```
GET /activity-logs?userId=123&action=login&startDate=2024-01-01
```

---

## Accountant Comprehensive

**Base URL**: `/api/accountant-comprehensive`

### Fee Structure Management

#### Get Fee Structures
```
GET /fee-structures?academicYear=2024-2025&tradeCode=ICT
```

#### Create Fee Structure
```
POST /fee-structures
```

**Body**:
```json
{
  "academic_year": "2024-2025",
  "term": "Term 1",
  "trade_code": "ICT",
  "trade_name": "Information Technology",
  "level_number": 3,
  "fee_type": "Tuition",
  "fee_category": "Academic",
  "amount": 150000,
  "currency": "RWF",
  "due_date": "2024-09-30",
  "installment_allowed": 1,
  "installment_count": 3
}
```

### Payment Management

#### Get All Payments
```
GET /payments?status=paid&startDate=2024-01-01&studentId=STU2024001
```

#### Record Payment
```
POST /payments
```

**Body**:
```json
{
  "student_id": "STU2024001",
  "fee_type": "Tuition",
  "amount": 50000,
  "payment_method": "Mobile Money",
  "payment_reference": "MM123456789",
  "payment_date": "2024-02-01"
}
```

#### Get Student Balance
```
GET /students/:studentId/balance
```

**Response**:
```json
{
  "success": true,
  "student_id": "STU2024001",
  "total_fees": 450000,
  "total_paid": 300000,
  "balance": 150000,
  "payment_history": [...]
}
```

### Receipt Management

#### Get Receipt
```
GET /receipts/:receiptNumber
GET /receipts/payment/:paymentId
```

#### Generate Receipt (PDF)
```
GET /receipts/:receiptNumber/pdf
```

### Financial Reports

#### Outstanding Balances
```
GET /reports/outstanding-balances?tradeCode=ICT&level=3
```

#### Daily Revenue
```
GET /reports/daily-revenue?date=2024-02-01
```

#### Monthly Revenue
```
GET /reports/monthly-revenue?month=2024-02
```

#### Collection Efficiency
```
GET /reports/collection-efficiency?academicYear=2024-2025
```

### Budget Management

#### Get Budgets
```
GET /budgets?academicYear=2024-2025&category=Operations
```

#### Create Budget
```
POST /budgets
```

#### Update Budget
```
PUT /budgets/:id
```

### Expense Management

#### Record Expense
```
POST /expenses
```

**Body**:
```json
{
  "category": "Utilities",
  "subcategory": "Electricity",
  "amount": 500000,
  "expense_date": "2024-02-01",
  "description": "Monthly electricity bill",
  "vendor": "EUCL",
  "payment_method": "Bank Transfer"
}
```

#### Get Expense Reports
```
GET /expenses/reports?startDate=2024-01-01&endDate=2024-12-31
```

---

## Stock Management Advanced

**Base URL**: `/api/stock-advanced`

### Inventory Management

#### Get All Stock Items
```
GET /inventory?category=Electronics&lowStock=true&page=1
```

**Query Parameters**:
- `category`: Filter by category
- `status`: available, low_stock, out_of_stock
- `search`: Search term
- `lowStock`: true/false
- `supplier`: Supplier ID
- `location`: Storage location

#### Get Single Item
```
GET /inventory/:id
```

**Response**: Includes transaction history and distribution records

#### Add Stock Item
```
POST /inventory
```

**Body**:
```json
{
  "item_code": "LAP-001",
  "item_name": "HP Laptop",
  "category": "Electronics",
  "unit_of_measure": "piece",
  "quantity": 50,
  "unit_price": 800000,
  "reorder_level": 10,
  "supplier_id": 1,
  "storage_location": "Warehouse A"
}
```

#### Update Stock Item
```
PUT /inventory/:id
```

### Supplier Management

#### Get All Suppliers
```
GET /suppliers?status=active
```

#### Create Supplier
```
POST /suppliers
```

#### Get Supplier Performance
```
GET /suppliers/:id/performance
```

### Transaction Management

#### Record Purchase
```
POST /transactions/purchase
```

**Body**:
```json
{
  "item_id": 1,
  "quantity": 100,
  "unit_price": 800000,
  "supplier_id": 1,
  "purchase_order_number": "PO-2024-001",
  "transaction_date": "2024-02-01"
}
```

#### Record Adjustment
```
POST /transactions/adjustment
```

### Distribution Management

#### Record Distribution
```
POST /distributions
```

**Body**:
```json
{
  "item_id": 1,
  "quantity": 5,
  "distributed_to": "ICT Department",
  "distributed_to_type": "department",
  "purpose": "New semester equipment",
  "distribution_date": "2024-02-01",
  "return_expected": 0
}
```

#### Record Return
```
PUT /distributions/:id/return
```

### Stock Reports

#### Inventory Valuation
```
GET /reports/valuation?category=Electronics
```

#### Stock Movement
```
GET /reports/movement?itemId=1&startDate=2024-01-01
```

#### Low Stock Alerts
```
GET /reports/low-stock-alerts
```

#### Expiring Items
```
GET /reports/expiring-items?days=30
```

#### Audit Report
```
GET /reports/audit?startDate=2024-01-01&endDate=2024-12-31
```

---

## Teacher Portal Advanced

**Base URL**: `/api/teacher-portal-advanced`

### Dashboard

#### Get Teacher Dashboard
```
GET /dashboard
```
**Authorization**: Teacher

**Response**:
```json
{
  "success": true,
  "dashboard": {
    "classes": [...],
    "todaySchedule": [...],
    "pendingGrading": 25,
    "attendanceStats": {...}
  }
}
```

### Class Management

#### Get Teacher's Classes
```
GET /classes?academicYear=2024-2025&term=Term1
```

#### Get Class Students
```
GET /classes/:classId/students
```

### Attendance Management

#### Mark Attendance
```
POST /attendance
```

**Body**:
```json
{
  "class_id": 1,
  "attendance_date": "2024-02-01",
  "attendance_records": [
    {"student_id": "STU001", "status": "present"},
    {"student_id": "STU002", "status": "absent", "reason": "Sick"}
  ]
}
```

#### Bulk Mark Attendance
```
POST /attendance/bulk
```

#### Get Attendance Report
```
GET /attendance/report?classId=1&startDate=2024-01-01
```

### Grade Management

#### Record Marks
```
POST /grades
```

**Body**:
```json
{
  "class_id": 1,
  "subject_id": 5,
  "academic_year": "2024-2025",
  "term": "Term 1",
  "marks": [
    {
      "student_id": "STU001",
      "cat_marks": 15,
      "exam_marks": 65,
      "final_marks": 80
    }
  ]
}
```

#### Update Marks
```
PUT /grades/:id
```

#### Get Class Performance
```
GET /classes/:classId/performance?term=Term1
```

### Assignment Management

#### Create Assignment
```
POST /assignments
```

**Body**:
```json
{
  "class_id": 1,
  "subject_id": 5,
  "title": "JavaScript Basics",
  "description": "Complete exercises 1-10",
  "due_date": "2024-02-15",
  "total_marks": 20,
  "assignment_type": "homework"
}
```

#### Get Assignment Submissions
```
GET /assignments/:id/submissions
```

#### Grade Submission
```
PUT /assignments/submissions/:id/grade
```

**Body**:
```json
{
  "grade": "A",
  "graded_marks": 18,
  "feedback": "Excellent work!"
}
```

### Performance Analytics

#### Student Performance Report
```
GET /analytics/student/:studentId/performance?classId=1
```

#### Class Analytics
```
GET /analytics/class/:classId/statistics
```

---

## Student Portal Comprehensive

**Base URL**: `/api/student-portal-comprehensive`

### Dashboard

#### Get Student Dashboard
```
GET /dashboard
```
**Authorization**: Student

**Response**:
```json
{
  "success": true,
  "dashboard": {
    "profile": {...},
    "academicStats": {...},
    "attendanceStats": {...},
    "pendingAssignments": [...],
    "feeBalance": 150000
  }
}
```

### Academic Records

#### Get Marks/Grades
```
GET /academic/marks?academicYear=2024-2025&term=Term1
```

#### Get Attendance Records
```
GET /academic/attendance?startDate=2024-01-01&endDate=2024-12-31
```

#### Get Timetable
```
GET /academic/timetable
```

### Assignments

#### Get All Assignments
```
GET /assignments?status=pending
```

#### Submit Assignment
```
POST /assignments/:id/submit
```

**Body**:
```json
{
  "submission_text": "My assignment solution...",
  "submission_files": ["file1.pdf", "file2.docx"]
}
```

#### View Assignment Feedback
```
GET /assignments/:id/feedback
```

### Conduct & Achievements

#### Get Conduct Records
```
GET /conduct/records
```

#### Get Achievements
```
GET /achievements
```

### Fee Management

#### Get Fee Statement
```
GET /fees/statement?academicYear=2024-2025
```

#### Get Payment Receipts
```
GET /fees/receipts
```

#### Get Receipt PDF
```
GET /fees/receipts/:receiptNumber/pdf
```

### Profile Management

#### Get Profile
```
GET /profile
```

#### Update Profile
```
PUT /profile
```

### Communication

#### Get Messages
```
GET /messages?type=teacher
```

#### Send Message
```
POST /messages
```

---

## Parent Portal Comprehensive

**Base URL**: `/api/parent-portal-comprehensive`

### Dashboard

#### Get Parent Dashboard
```
GET /dashboard
```
**Authorization**: Parent

**Response**:
```json
{
  "success": true,
  "dashboard": {
    "children": [
      {
        "student": {...},
        "academicStats": {...},
        "attendanceStats": {...},
        "feeBalance": 150000
      }
    ],
    "totalFeeBalance": 300000
  }
}
```

### Child Monitoring

#### Get Child's Academic Performance
```
GET /children/:studentId/academic?academicYear=2024-2025
```

#### Get Child's Attendance
```
GET /children/:studentId/attendance?startDate=2024-01-01
```

#### Get Child's Discipline Records
```
GET /children/:studentId/discipline
```

#### Get Child's Assignments
```
GET /children/:studentId/assignments?status=pending
```

### Fee Management

#### Get Child's Fee Statement
```
GET /children/:studentId/fees/statement
```

#### Submit Payment Proof
```
POST /children/:studentId/fees/payment-proof
```

**Body**:
```json
{
  "amount": 50000,
  "payment_method": "Mobile Money",
  "transaction_reference": "MM123456789",
  "payment_date": "2024-02-01",
  "proof_document": "receipt.jpg"
}
```

#### Get Payment Receipts
```
GET /children/:studentId/fees/receipts
```

### Communication

#### Send Message to Teacher
```
POST /messages/teacher
```

#### Send Message to Admin
```
POST /messages/admin
```

#### Get Messages
```
GET /messages?studentId=STU001
```

### Notifications

#### Get Notifications
```
GET /notifications?studentId=STU001&unreadOnly=true
```

#### Mark as Read
```
PUT /notifications/:id/read
```

### Reports

#### Get Comprehensive Child Report
```
GET /children/:studentId/report?academicYear=2024-2025&term=Term1
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

---

## Authentication

All endpoints require JWT authentication unless specified otherwise.

**Authorization Header**:
```
Authorization: Bearer <jwt_token>
```

**Role-Based Access Control**:
- Admin/Headmaster: Full system access
- Accountant: Financial and fee management
- Teacher: Class, attendance, grades, assignments
- Student: Personal academic records
- Parent: Children's records and monitoring
- Stock Manager: Inventory and stock management

---

## Database Migration

To set up the database for these advanced features, run:

```bash
mysql -u root -p school_management < backend/migrations/comprehensive_advanced_features.sql
```

This will create all necessary tables for:
- Custom columns system
- Fee structures and payments
- Stock management
- Budgets and expenses
- Assignments and submissions
- Discipline records
- Achievements
- Parent links
- Activity logs
- And more...

---

## API Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get custom columns
curl http://localhost:5000/api/universal-management/columns/students \
  -H "Authorization: Bearer <token>"

# Create payment
curl -X POST http://localhost:5000/api/accountant-comprehensive/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"student_id":"STU001","amount":50000,...}'
```

### Using Postman

Import the collection file (if available) or manually create requests following the API documentation above.

---

## Notes

1. **All dates** should be in `YYYY-MM-DD` format
2. **All amounts** are in the smallest currency unit (e.g., RWF)
3. **Pagination** defaults to page 1, limit 50
4. **Soft deletes** are used where applicable
5. **Transactions** are used for critical operations
6. **Activity logging** tracks all important actions
7. **Custom fields** can be added dynamically without code changes

---

## Support

For issues or questions, contact the development team or refer to the main project documentation.

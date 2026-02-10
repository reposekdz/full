# Staff Advanced Management System

## ✅ Setup Complete!

The Staff Advanced Management System has been successfully configured and is ready to use.

## 🚀 Quick Start

### Database Setup
```bash
# Run the migration script
node backend/scripts/setup-staff-advanced-tables.js

# OR use the batch file
setup-staff-advanced.bat
```

### Access Points

- **Frontend Dashboard**: `/staff-management-advanced`
- **API Endpoint**: `/api/staff-advanced`

## 📊 Database Tables Created

1. **staff_profiles** - Extended staff profile information
2. **staff_reviews** - Performance reviews and evaluations
3. **staff_schedule** - Weekly schedules and timetables
4. **staff_documents** - Document management (contracts, certificates, etc.)
5. **staff_notifications** - Staff notification system
6. **staff_activity_log** - Activity tracking and audit logs
7. **staff_leaves** - Leave management system
8. **staff_attendance** - Attendance tracking

## 🔑 Key Features

### Core Management
- ✅ Full CRUD operations for staff
- ✅ Advanced filtering and search
- ✅ Bulk operations (update, delete)
- ✅ CSV export functionality
- ✅ Real-time analytics

### Performance Tracking
- ✅ Performance reviews
- ✅ Rating system
- ✅ Goals and recommendations
- ✅ Historical tracking

### Scheduling
- ✅ Weekly schedule management
- ✅ Calendar view
- ✅ Multi-staff scheduling

### Document Management
- ✅ File upload (PDF, DOC, XLS, images)
- ✅ Category organization
- ✅ Storage tracking
- ✅ Secure file handling

### Communication
- ✅ Individual notifications
- ✅ Broadcast messaging
- ✅ Role-based filtering
- ✅ Priority levels

### Leave Management
- ✅ Leave balance tracking
- ✅ Leave applications
- ✅ Approval workflow
- ✅ Leave history

### Reports & Analytics
- ✅ Comprehensive staff reports
- ✅ Attendance reports
- ✅ Leave reports
- ✅ Performance analytics
- ✅ Salary distribution
- ✅ Hiring trends

## 🔐 API Endpoints

### Staff Management
- `GET /api/staff-advanced` - Get all staff (with filters)
- `GET /api/staff-advanced/:id` - Get single staff
- `POST /api/staff-advanced` - Create staff
- `PUT /api/staff-advanced/:id` - Update staff
- `DELETE /api/staff-advanced/:id` - Delete/deactivate staff

### Bulk Operations
- `POST /api/staff-advanced/bulk-update` - Bulk update
- `POST /api/staff-advanced/bulk-delete` - Bulk delete
- `GET /api/staff-advanced/export/csv` - Export to CSV

### Performance
- `GET /api/staff-advanced/:id/performance` - Get reviews
- `POST /api/staff-advanced/:id/performance` - Add review

### Scheduling
- `GET /api/staff-advanced/:id/schedule` - Get schedule
- `PUT /api/staff-advanced/:id/schedule` - Update schedule
- `GET /api/staff-advanced/schedules/calendar` - Calendar view

### Documents
- `GET /api/staff-advanced/:id/documents` - Get documents
- `POST /api/staff-advanced/:id/documents` - Upload document
- `DELETE /api/staff-advanced/:id/documents/:doc_id` - Delete document

### Notifications
- `GET /api/staff-advanced/:id/notifications` - Get notifications
- `POST /api/staff-advanced/:id/notifications` - Send notification
- `POST /api/staff-advanced/notifications/broadcast` - Broadcast
- `PUT /api/staff-advanced/notifications/:id/read` - Mark as read

### Activities
- `GET /api/staff-advanced/:id/activities` - Get activity log
- `GET /api/staff-advanced/activities/all` - All activities (admin)

### Reports
- `GET /api/staff-advanced/reports/comprehensive` - Full report
- `GET /api/staff-advanced/reports/attendance` - Attendance report
- `GET /api/staff-advanced/reports/leave` - Leave report

### Leave Management
- `GET /api/staff-advanced/:id/leave` - Get leave data
- `POST /api/staff-advanced/:id/leave` - Apply for leave
- `PUT /api/staff-advanced/leave/:leave_id` - Approve/reject leave

### Metadata
- `GET /api/staff-advanced/meta/roles` - Get staff roles

## 🎯 Query Parameters

### Filtering
- `search` - Search by name, email, phone, employee ID
- `role` - Filter by role
- `department` - Filter by department
- `status` - Filter by status (active/inactive)
- `sort_by` - Sort column
- `sort_order` - ASC/DESC
- `page` - Page number
- `limit` - Items per page
- `analytics=true` - Include analytics data

## 👥 Staff Roles

1. School Owner
2. Administrator
3. Headmaster
4. Director of Studies
5. Discipline Director
6. Accountant
7. Stock Manager
8. Teacher
9. Advisor
10. Patron
11. Matron
12. Support Staff

## 🔒 Authorization

Most endpoints require authentication via JWT token:
```javascript
headers: {
  'Authorization': 'Bearer <token>'
}
```

Admin-only endpoints require roles:
- `school_owner`
- `admin`
- `headmaster`

## 📝 Example Usage

### Get All Staff with Analytics
```javascript
fetch('/api/staff-advanced?analytics=true&page=1&limit=50', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### Create New Staff
```javascript
fetch('/api/staff-advanced', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@school.com',
    phone: '0788123456',
    role_name: 'teacher',
    department: 'Mathematics',
    hire_date: '2024-01-15',
    salary: 500000
  })
})
```

### Upload Document
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('category', 'contract');
formData.append('description', 'Employment contract');

fetch('/api/staff-advanced/123/documents', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
})
```

## 🎨 Frontend Integration

The system integrates with the React frontend at:
```
src/app/pages/dos/DOSManagementUltraAdvanced.tsx
```

## 📦 Dependencies

- Express.js
- MySQL2
- Multer (file uploads)
- JWT authentication
- CORS

## 🔧 Configuration

File upload settings:
- Max file size: 10MB
- Allowed types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG
- Upload path: `uploads/staff/documents/`

## 🚨 Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 📈 Performance

- Optimized queries with proper indexing
- Pagination support
- Efficient bulk operations
- Activity logging for audit trails

## 🔄 Future Enhancements

- Real-time notifications via WebSocket
- Advanced analytics dashboard
- Automated report generation
- Integration with payroll system
- Mobile app support

## 📞 Support

For issues or questions, contact the development team.

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2024

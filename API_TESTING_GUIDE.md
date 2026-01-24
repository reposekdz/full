# API Testing Guide

## Quick Test Commands

### 1. Knowledge Base Management

```bash
# Get all articles
curl http://localhost:5000/api/knowledge-base/articles

# Search articles
curl "http://localhost:5000/api/knowledge-base/articles?search=student&category=Administration"

# Create article
curl -X POST http://localhost:5000/api/knowledge-base/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "content": "This is a test article content",
    "category": "Testing",
    "tags": "test,demo",
    "author_id": 1
  }'

# Get categories
curl http://localhost:5000/api/knowledge-base/categories
```

### 2. Real-time Notifications

```bash
# Get user notifications
curl http://localhost:5000/api/realtime-notifications/1

# Create notification
curl -X POST http://localhost:5000/api/realtime-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "title": "Test Notification",
    "message": "This is a test notification",
    "type": "info",
    "priority": "normal"
  }'

# Mark as read
curl -X PUT http://localhost:5000/api/realtime-notifications/1/read

# Get preferences
curl http://localhost:5000/api/realtime-notifications/preferences/1
```

### 3. Admissions

```bash
# Get all applications
curl http://localhost:5000/api/admissions/applications

# Get statistics
curl http://localhost:5000/api/admissions/stats

# Submit application (multipart/form-data)
curl -X POST http://localhost:5000/api/admissions/apply \
  -F "first_name=John" \
  -F "last_name=Doe" \
  -F "email=john@example.com" \
  -F "phone=+250788123456" \
  -F "dob=2005-01-15" \
  -F "gender=male" \
  -F "program=Computer Science" \
  -F "guardian_name=Jane Doe" \
  -F "guardian_phone=+250788654321"

# Update application status
curl -X PUT http://localhost:5000/api/admissions/applications/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "stage": "final",
    "reviewer_id": 1,
    "notes": "Application approved"
  }'
```

### 4. Exam Scheduling

```bash
# Create exam schedule
curl -X POST http://localhost:5000/api/exam-scheduling/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "exam_name": "Midterm Exams 2024",
    "exam_type": "midterm",
    "academic_year": "2024",
    "term": "Term 1",
    "start_date": "2024-06-01",
    "end_date": "2024-06-15",
    "created_by": 1
  }'

# Add exam session
curl -X POST http://localhost:5000/api/exam-scheduling/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "schedule_id": 1,
    "subject_id": 1,
    "exam_date": "2024-06-05",
    "start_time": "09:00:00",
    "end_time": "11:00:00",
    "duration": 120,
    "room_id": 1,
    "max_students": 40
  }'

# Get schedule details
curl http://localhost:5000/api/exam-scheduling/schedule/1

# Get available rooms
curl "http://localhost:5000/api/exam-scheduling/rooms/available?exam_date=2024-06-05&start_time=09:00:00&end_time=11:00:00"

# Publish schedule
curl -X PUT http://localhost:5000/api/exam-scheduling/schedule/1/publish
```

### 5. Certificate Generation

```bash
# Generate certificate
curl -X POST http://localhost:5000/api/certificates/generate \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "certificate_type": "completion",
    "template_id": 1,
    "issue_date": "2024-05-20",
    "data": {
      "course_name": "Web Development",
      "grade": "A"
    }
  }'

# Bulk generate
curl -X POST http://localhost:5000/api/certificates/generate/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "student_ids": [1, 2, 3, 4, 5],
    "certificate_type": "graduation",
    "template_id": 3,
    "issue_date": "2024-06-30"
  }'

# Verify certificate
curl http://localhost:5000/api/certificates/verify/abc123def456

# Get student certificates
curl http://localhost:5000/api/certificates/student/1

# Get templates
curl http://localhost:5000/api/certificates/templates/list

# Get statistics
curl http://localhost:5000/api/certificates/stats/overview
```

### 6. Alumni Management

```bash
# Register alumni
curl -X POST http://localhost:5000/api/alumni/register \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "graduation_year": 2023,
    "current_occupation": "Software Engineer",
    "company": "Tech Corp",
    "position": "Senior Developer",
    "email": "alumni@example.com",
    "phone": "+250788123456"
  }'

# Get alumni directory
curl http://localhost:5000/api/alumni/directory

# Search alumni
curl "http://localhost:5000/api/alumni/directory?search=John&graduation_year=2023"

# Create event
curl -X POST http://localhost:5000/api/alumni/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Alumni Reunion 2024",
    "description": "Annual alumni gathering",
    "event_date": "2024-07-15",
    "event_time": "18:00:00",
    "location": "School Campus",
    "organizer_id": 1,
    "max_attendees": 100
  }'

# Get events
curl "http://localhost:5000/api/alumni/events/list?upcoming=true"

# Post job
curl -X POST http://localhost:5000/api/alumni/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Junior Developer",
    "company": "Tech Startup",
    "description": "Looking for talented developers",
    "requirements": "2+ years experience",
    "location": "Kigali",
    "salary_range": "$30k-$50k",
    "posted_by": 1,
    "application_url": "https://example.com/apply"
  }'

# Get jobs
curl http://localhost:5000/api/alumni/jobs/list

# Get statistics
curl http://localhost:5000/api/alumni/stats/overview
```

### 7. SMS/Email Integration

```bash
# Send email
curl -X POST http://localhost:5000/api/messaging/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["student@example.com"],
    "subject": "Test Email",
    "body": "This is a test email message",
    "sender_id": 1
  }'

# Send SMS
curl -X POST http://localhost:5000/api/messaging/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["+250788123456"],
    "message": "This is a test SMS",
    "sender_id": 1
  }'

# Bulk send
curl -X POST http://localhost:5000/api/messaging/bulk/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email",
    "group_type": "class",
    "group_ids": [1, 2],
    "subject": "Important Announcement",
    "message": "This is an important message for all students",
    "sender_id": 1
  }'

# Get email templates
curl http://localhost:5000/api/messaging/templates/email

# Get SMS templates
curl http://localhost:5000/api/messaging/templates/sms

# Get message history
curl "http://localhost:5000/api/messaging/history/email?limit=50"

# Get statistics
curl http://localhost:5000/api/messaging/stats/overview
```

### 8. Advanced Reporting

```bash
# Generate student performance report
curl -X POST http://localhost:5000/api/reporting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "student_performance",
    "filters": {
      "class_id": 1,
      "date_from": "2024-01-01",
      "date_to": "2024-05-31"
    },
    "format": "json",
    "created_by": 1
  }'

# Generate attendance summary
curl -X POST http://localhost:5000/api/reporting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "attendance_summary",
    "filters": {
      "date_from": "2024-01-01",
      "date_to": "2024-05-31"
    },
    "format": "json",
    "created_by": 1
  }'

# Generate financial summary
curl -X POST http://localhost:5000/api/reporting/generate \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "financial_summary",
    "filters": {
      "date_from": "2024-01-01",
      "date_to": "2024-05-31"
    },
    "format": "json",
    "created_by": 1
  }'

# Export report as CSV
curl "http://localhost:5000/api/reporting/1/export?format=csv" -o report.csv

# Export report as JSON
curl "http://localhost:5000/api/reporting/1/export?format=json"

# Get saved reports
curl http://localhost:5000/api/reporting/list

# Get dashboard analytics
curl http://localhost:5000/api/reporting/analytics/dashboard

# Create custom report
curl -X POST http://localhost:5000/api/reporting/custom \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Custom Student Report",
    "description": "Custom report for student analysis",
    "query_config": {
      "table": "students",
      "columns": ["first_name", "last_name", "email"]
    },
    "created_by": 1
  }'

# Schedule report
curl -X POST http://localhost:5000/api/reporting/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "report_type": "attendance_summary",
    "filters": {},
    "frequency": "weekly",
    "recipients": ["admin@school.com"],
    "format": "csv"
  }'
```

## Testing with Postman

### Import Collection

Create a Postman collection with these endpoints:

1. **Knowledge Base**
   - GET Articles
   - Create Article
   - Update Article
   - Delete Article

2. **Notifications**
   - Get Notifications
   - Create Notification
   - Mark as Read

3. **Admissions**
   - Submit Application
   - Get Applications
   - Update Status

4. **Exam Scheduling**
   - Create Schedule
   - Add Session
   - Assign Invigilators

5. **Certificates**
   - Generate Certificate
   - Verify Certificate
   - Get Templates

6. **Alumni**
   - Register Alumni
   - Get Directory
   - Create Event

7. **Messaging**
   - Send Email
   - Send SMS
   - Bulk Send

8. **Reporting**
   - Generate Report
   - Export Report
   - Get Analytics

## Environment Variables

Set these in Postman environment:

```
BASE_URL = http://localhost:5000
API_PREFIX = /api
AUTH_TOKEN = your_jwt_token_here
```

## Authentication

Most endpoints require authentication. Include JWT token in headers:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/knowledge-base/articles
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```

## Testing Checklist

- [ ] Knowledge Base CRUD operations
- [ ] Notification creation and retrieval
- [ ] Admission application workflow
- [ ] Exam schedule creation
- [ ] Certificate generation and verification
- [ ] Alumni registration and directory
- [ ] Email/SMS sending
- [ ] Report generation and export
- [ ] WebSocket connections
- [ ] File uploads
- [ ] Search and filtering
- [ ] Pagination
- [ ] Authentication
- [ ] Error handling

## Performance Testing

Test with multiple concurrent requests:

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/knowledge-base/articles

# Using wrk
wrk -t12 -c400 -d30s http://localhost:5000/api/knowledge-base/articles
```

## Database Verification

After testing, verify data in database:

```sql
-- Check knowledge base articles
SELECT * FROM knowledge_articles;

-- Check notifications
SELECT * FROM realtime_notifications;

-- Check applications
SELECT * FROM admission_applications;

-- Check certificates
SELECT * FROM certificates;

-- Check alumni
SELECT * FROM alumni;

-- Check messages
SELECT * FROM email_messages;
SELECT * FROM sms_messages;

-- Check reports
SELECT * FROM reports;
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure backend server is running
   - Check port 5000 is not in use

2. **404 Not Found**
   - Verify route is registered in server.js
   - Check endpoint URL spelling

3. **500 Internal Server Error**
   - Check database connection
   - Verify table exists
   - Check server logs

4. **Authentication Failed**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure user has permissions

## Next Steps

1. Test all endpoints
2. Verify database entries
3. Check file uploads
4. Test WebSocket connections
5. Validate error handling
6. Performance testing
7. Security testing
8. Integration testing

## Support

For issues or questions:
- Check server logs: `backend/server.log`
- Review documentation: `ADVANCED_FEATURES_GUIDE.md`
- Check database: Verify tables and data

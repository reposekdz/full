# 🔐 Quick Reference Card - Garden TVET School Management System

## Default Login Credentials

### Unified Staff Credentials
```
Email:    reponse@gmail.com
Password: 2026
```

**These credentials work for ALL staff roles:**
- ✅ Teacher
- ✅ Director of Study (DOS)
- ✅ Director of Discipline (DOD)
- ✅ Head Master
- ✅ Accountant
- ✅ Stock Manager
- ✅ Administrator

## Quick Start Commands

### Setup (First Time Only)
```bash
# Windows
quick-start.bat

# Or manually
cd backend
npm run setup
```

### Start Servers
```bash
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)
npm run dev
```

### Access URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

## Common Tasks

### Change Staff Credentials
1. Login with default credentials
2. Click Profile/Settings in dashboard
3. Update email and/or password
4. Enter current password to confirm
5. Save changes

### Create Student Account
1. Go to Login page
2. Click "Register"
3. Select "Student" role
4. Fill in required information
5. Submit and login

### Submit Contact Form
1. Go to "Contact Us" page
2. Fill in contact form
3. Select department and priority
4. Attach files if needed (optional)
5. Submit

### Create Support Ticket
1. Login to your account
2. Go to "Support" page
3. Click "Create Ticket"
4. Fill in details and category
5. Submit ticket

### View Courses
1. Login as student
2. Go to "Academics" page
3. Browse available courses
4. Click on course for details
5. Enroll or view materials

## Database Information

### Database Name
```
school_management
```

### Connection Details
```
Host: localhost
Port: 3306
User: root
Password: (your MySQL password)
```

### Reset Database
```bash
cd backend
mysql -u root -p school_management < scripts/comprehensive-features-schema.sql
npm run setup
```

## File Upload Limits

- Contact attachments: 5MB
- Assignment submissions: 10MB
- Support ticket attachments: 5MB
- Profile pictures: 2MB

**Allowed file types:**
- Documents: PDF, DOC, DOCX
- Images: JPG, JPEG, PNG
- Archives: ZIP (for assignments only)

## API Testing

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"reponse@gmail.com\",\"password\":\"2026\"}"
```

### Test Health Check
```bash
curl http://localhost:5000/api/health
```

## Troubleshooting

### Cannot Connect to Database
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;
```

### Port Already in Use
```bash
# Windows - Find process
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Module Not Found
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
```

### Login Not Working
1. Verify database is set up: `npm run setup`
2. Check credentials are correct
3. Clear browser cache and cookies
4. Try different browser

## Important Notes

⚠️ **Security:**
- Change default credentials in production
- Use strong passwords
- Enable HTTPS in production
- Keep JWT_SECRET secure

⚠️ **Backup:**
- Backup database regularly
- Keep uploaded files backed up
- Export important data periodically

⚠️ **Performance:**
- Monitor database size
- Clean old logs regularly
- Optimize images before upload
- Use pagination for large datasets

## Support Contacts

- **Email:** support@gardentvet.rw
- **Phone:** +250 788 987 830
- **Website:** www.gardentvet.rw

## Quick Links

- [Full Setup Guide](./COMPREHENSIVE_SETUP_GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION_COMPLETE.md)
- [Advanced Features](./ADVANCED_FEATURES_DOCUMENTATION.md)
- [API Documentation](./backend/API_DOCUMENTATION.md)

---

**Keep this card handy for quick reference!**

**Version 2.0.0 | Last Updated: 2024**

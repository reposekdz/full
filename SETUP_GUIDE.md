# Complete Setup Guide - School Management System

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Step 1: Clone and Install

```bash
# Navigate to project directory
cd Powerfulschoolmanagementsystem

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Step 2: Database Setup

1. **Create MySQL Database**
```sql
CREATE DATABASE school_management;
```

2. **Configure Environment**
Create `backend/.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_management
DB_PORT=3306
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

3. **Initialize Database**
```bash
cd backend
node scripts/init-complete-database.js
```

This will:
- Create all necessary tables
- Insert default data
- Create admin user (username: admin, password: admin123)

### Step 3: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend will run on http://localhost:5173

### Step 4: Login

Navigate to http://localhost:5173 and login with:
- **Username:** admin
- **Password:** admin123

## 📋 Complete Feature List

### ✅ User Management
- Multi-role support (10 different roles)
- User CRUD operations
- Profile management
- Role-based access control

### ✅ Academic Management
- Course management
- Subject management
- Class management
- Enrollment tracking
- Academic year management

### ✅ Exam System
- Exam creation and scheduling
- Student registration
- Result management
- Performance analytics
- Multiple exam types (midterm, final, quiz, practical)

### ✅ Attendance System
- Daily attendance marking
- Bulk attendance operations
- Attendance reports
- Statistics and analytics
- Late/excused tracking

### ✅ Grade Management
- Grade submission
- Bulk grade operations
- Performance tracking
- Grade analytics
- Student summaries
- Class performance reports

### ✅ Timetable Management
- Schedule creation
- Conflict detection
- Teacher schedules
- Student schedules
- Room management

### ✅ Financial Management
- Fee structure management
- Payment tracking
- Receipt generation
- Financial reports
- Student fee summaries

### ✅ Stock Management
- Inventory tracking
- Stock movements
- Reorder alerts
- Category management
- Supplier tracking

### ✅ Communication
- Internal messaging system
- Notification system
- Broadcast messages
- Role-based notifications
- Read receipts

### ✅ Sports Management
- Sports teams
- Events management
- Achievement tracking
- Student participation

### ✅ Parent Portal
- View children's grades
- Attendance tracking
- Fee payment status
- Communication with teachers

### ✅ Analytics & Reports
- Student performance
- Class analytics
- Attendance reports
- Financial reports
- Custom reports

## 🎯 Role-Specific Features

### Super Admin
- Full system access
- User management
- System configuration
- Database management

### Admin
- Content management
- User management (limited)
- School-wide operations
- Report generation

### Headmaster
- School oversight
- Staff management
- Strategic planning
- Performance monitoring

### Director of Studies
- Academic management
- Curriculum oversight
- Teacher coordination
- Academic reports

### Director of Discipline
- Student conduct
- Attendance monitoring
- Disciplinary actions
- Behavior reports

### Teacher
- Class management
- Grade submission
- Attendance marking
- Student communication

### Student
- View grades
- View timetable
- View attendance
- Access materials

### Parent
- Children's performance
- Attendance tracking
- Fee status
- Teacher communication

### Accountant
- Fee management
- Payment processing
- Financial reports
- Budget tracking

### Stock Manager
- Inventory management
- Stock tracking
- Purchase orders
- Supplier management

## 🔧 Configuration

### Frontend Configuration
Edit `src/app/services/apiService.ts`:
```typescript
const API_BASE = 'http://localhost:5000/api';
```

### Backend Configuration
Edit `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_management
DB_PORT=3306

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

## 📊 Database Schema

### Core Tables
- **users** - All system users
- **academic_years** - Academic periods
- **trade_courses** - Course definitions
- **subjects** - Subject catalog
- **classes** - Class management
- **enrollments** - Student enrollments

### Academic Tables
- **exams** - Exam definitions
- **exam_registrations** - Student registrations
- **exam_results** - Exam results
- **grades** - Grade records
- **attendance** - Attendance tracking
- **timetable_entries** - Schedule management

### Financial Tables
- **fee_structures** - Fee definitions
- **fee_payments** - Payment records

### Inventory Tables
- **stock_items** - Inventory items
- **stock_movements** - Stock transactions

### Communication Tables
- **messages** - User messages
- **notifications** - System notifications

### Sports Tables
- **sports_teams** - Sports teams
- **sports_events** - Events
- **sports_achievements** - Achievements

### Other Tables
- **teams** - Management teams
- **parent_student_links** - Parent relationships

## 🔐 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Role-based access control
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting (recommended for production)

## 🚀 Production Deployment

### 1. Build Frontend
```bash
npm run build
```

### 2. Configure Production Environment
```env
NODE_ENV=production
DB_HOST=your_production_db_host
JWT_SECRET=strong_random_secret
```

### 3. Use Process Manager
```bash
npm install -g pm2
pm2 start backend/server.js --name school-api
pm2 startup
pm2 save
```

### 4. Configure Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### 5. SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

## 📝 API Testing

### Using cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get exams
curl http://localhost:5000/api/exams \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Import API collection
2. Set environment variables
3. Test endpoints

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p
```

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
# or
netstat -ano | findstr :5000

# Kill process
kill -9 PID
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- API Documentation: `backend/API_DOCUMENTATION.md`
- Database Schema: `backend/scripts/complete-advanced-schema.sql`
- Frontend Guidelines: `guidelines/Guidelines.md`

## 🤝 Support

For issues or questions:
1. Check documentation
2. Review error logs
3. Contact development team

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for modern education management**

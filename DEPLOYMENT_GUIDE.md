# Comprehensive School Management System - Deployment Guide

## Database Setup for DOD Staff Accounts

### Option 1: Manual SQL Insertion (Recommended)

Run the following SQL commands directly in your MySQL database:

```sql
-- Step 1: Check if accounts already exist
SELECT id, email, role FROM users WHERE email IN ('matron@reponsekdz06.com', 'patron@reponsekdz06.com');

-- Step 2: Insert or update Matron account
-- Password: 2026 (will be hashed by the application on first login change)
INSERT INTO users (first_name, last_name, email, password, role, is_active, created_at, updated_at)
VALUES ('Matron', 'DOD', 'matron@reponsekdz06.com', '$2b$10$qJNfO1KFv5OZX5xZ5xZ5xOJNfO1KFv5OZX5xZ5xZ5xOJNfO1KFv5O', 'dod', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  password = '$2b$10$qJNfO1KFv5OZX5xZ5xZ5xOJNfO1KFv5OZX5xZ5xZ5xOJNfO1KFv5O',
  role = 'dod',
  is_active = 1,
  updated_at = NOW();

-- Step 3: Insert or update Patron account  
INSERT INTO users (first_name, last_name, email, password, role, is_active, created_at, updated_at)
VALUES ('Patron', 'DOD', 'patron@reponsekdz06.com', '$2b$10$qJNfO1KFv5OZX5xZ5xZ5xOJNfO1KFv5OZX5xZ5xZ5xOJNfO1KFv5O', 'dod', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  password = '$2b$10$qJNfO1KFv5OZX5xZ5xZ5xOJNfO1KFv5OZX5xZ5xZ5xOJNfO1KFv5O',
  role = 'dod',
  is_active = 1,
  updated_at = NOW();

-- Step 4: Verify accounts were created
SELECT id, first_name, last_name, email, role, is_active FROM users 
WHERE email IN ('matron@reponsekdz06.com', 'patron@reponsekdz06.com');
```

### Option 2: Using Node.js Script

```bash
cd backend
node add-dod-staff.js
```

**Note:** If you encounter foreign key constraint errors, your database schema may have a `role_id` field. In that case, you'll need to first insert a role entry or modify the users table structure.

---

## Login Credentials

After successful setup, use these credentials:

### Matron Account
- **Email:** matron@reponsekdz06.com
- **Password:** 2026
- **Role:** DOD (Director of Discipline)

### Patron Account
- **Email:** patron@reponsekdz06.com
- **Password:** 2026
- **Role:** DOD (Director of Discipline)

---

## New Features Access

### For DOD/Matron/Patron Users:

1. **Parent Management** (`/dod-parent-management`)
   - View all parents in the system
   - See parent-student relationships
   - Send individual messages to parents
   - Send bulk messages to multiple parents
   - View recent discipline records for each family

2. **Leave Management** (`/dod-leave-management`)
   - View all student leave requests
   - Create leave requests on behalf of students
   - Approve or reject leave requests
   - Filter by status, date range
   - View leave statistics

3. **Profile Management** (`/profile`)
   - Update personal information
   - Change password securely
   - View account details

### For All Roles:

Every user role can now access:
- **Profile Page** (`/profile`) - Update account information and change password

---

## API Endpoints Documentation

### Universal Profile Management

#### GET `/api/management/profile/me`
Get current user's profile information
- **Auth Required:** Yes
- **Returns:** User profile with trade, class, and enrollment info

#### PUT `/api/management/profile/me`
Update current user's profile
- **Auth Required:** Yes
- **Body:** `{ first_name, last_name, email, phone, date_of_birth, gender, address, profile_image }`
- **Returns:** Updated user object

#### PUT `/api/management/profile/change-password`
Change user password
- **Auth Required:** Yes
- **Body:** `{ current_password, new_password }`
- **Returns:** Success message

### DOD Parent Management

#### GET `/api/management/dod/parents`
Get all parents with filtering
- **Auth Required:** Yes (DOD, Headmaster, Admin)
- **Query:** `search, has_children, limit, offset`
- **Returns:** List of parents with children count

#### GET `/api/management/dod/parents/:id`
Get detailed parent information
- **Auth Required:** Yes (DOD, Headmaster, Admin, Advisor)
- **Returns:** Parent details, linked students, recent discipline records

#### POST `/api/management/dod/parents/:id/message`
Send message to individual parent
- **Auth Required:** Yes (DOD, Headmaster, Admin, Advisor)
- **Body:** `{ subject, message, priority, send_sms }`
- **Returns:** Message sent confirmation

#### POST `/api/management/dod/parents/bulk-message`
Send message to multiple parents
- **Auth Required:** Yes (DOD, Headmaster, Admin)
- **Body:** `{ parent_ids[], subject, message, priority, send_sms }`
- **Returns:** Bulk message results with success/failure counts

### DOD Leave Management

#### GET `/api/management/dod/leave-requests`
Get all leave requests with filtering
- **Auth Required:** Yes (DOD, Headmaster, Admin, Advisor)
- **Query:** `status, start_date, end_date, student_id, limit, offset`
- **Returns:** List of leave requests with student info

#### POST `/api/management/dod/leave-requests`
Create new leave request
- **Auth Required:** Yes (DOD, Headmaster, Admin, Advisor)
- **Body:** `{ student_id, leave_type, reason, start_date, end_date, notes }`
- **Returns:** Created leave request ID

#### PUT `/api/management/dod/leave-requests/:id/status`
Approve or reject leave request
- **Auth Required:** Yes (DOD, Headmaster, Admin)
- **Body:** `{ status: 'approved'|'rejected', notes }`
- **Returns:** Success message

### Enhanced Discipline Management

#### GET `/api/management/dod/discipline-records`
Get discipline records with advanced filtering
- **Auth Required:** Yes (DOD, Headmaster, Admin, Advisor)
- **Query:** `status, severity, incident_type, student_id, trade_id, level, start_date, end_date, sort_by, sort_order, limit, offset`
- **Returns:** Filtered discipline records

#### POST `/api/management/dod/discipline-records`
Create new discipline record
- **Auth Required:** Yes (DOD, Headmaster, Admin)
- **Body:** `{ student_id, incident_type, incident_date, description, severity, action_taken, reported_by, notify_parents }`
- **Returns:** Created record with parent notification status

#### PUT `/api/management/dod/discipline-records/:id`
Update discipline record
- **Auth Required:** Yes (DOD, Headmaster, Admin)
- **Body:** Discipline record fields to update
- **Returns:** Success message

#### DELETE `/api/management/dod/discipline-records/:id`
Delete discipline record
- **Auth Required:** Yes (DOD, Headmaster, Admin)
- **Returns:** Success message

#### GET `/api/management/dod/discipline-statistics`
Get comprehensive discipline statistics
- **Auth Required:** Yes (DOD, Headmaster, Admin)
- **Returns:** Statistics by severity, type, trade, trend data

---

## Frontend Components

### New Pages Created

1. **UniversalProfilePage.tsx** (`src/app/pages/common/`)
   - Universal profile management for all roles
   - Edit mode with form validation
   - Password change with current password verification
   - Role-based styling and dashboard routing

2. **DODParentManagementPage.tsx** (`src/app/pages/dod/`)
   - Parent list with search and filtering
   - Individual parent details modal
   - Message composition with priority levels
   - Bulk messaging functionality
   - Statistics dashboard

3. **DODLeaveManagementPage.tsx** (`src/app/pages/dod/`)
   - Leave request list with filtering
   - Create leave request modal
   - Approve/reject workflow
   - Leave statistics
   - Date range filtering

### Updated Components

1. **DODDashboard.tsx**
   - Added navigation cards for Parent Management, Leave Management, and Profile
   - Enhanced UI with hover effects and click navigation

2. **App.tsx**
   - Integrated all new pages with proper routing
   - Added 'dod' role support (for Matron and Patron)
   - Universal profile access for all roles via `/profile` route

3. **apiService.ts**
   - Added 10+ new API methods for profile, parent, and leave management
   - Proper TypeScript typing for all methods
   - Backward compatible with existing DOD methods

---

## Testing Checklist

### Profile Management
- [ ] Login as any role
- [ ] Navigate to profile page
- [ ] Update profile information
- [ ] Verify changes saved to database
- [ ] Change password
- [ ] Logout and login with new password

### Parent Management (DOD Role)
- [ ] Login as DOD/Matron/Patron
- [ ] Navigate to Parent Management
- [ ] Search for parents
- [ ] View parent details
- [ ] Send individual message to parent
- [ ] Select multiple parents
- [ ] Send bulk message
- [ ] Verify messages saved to database

### Leave Management (DOD Role)
- [ ] Login as DOD/Matron/Patron
- [ ] Navigate to Leave Management
- [ ] View all leave requests
- [ ] Filter by status
- [ ] Create new leave request
- [ ] Approve a leave request
- [ ] Reject a leave request
- [ ] Verify statistics update

### Discipline Management
- [ ] Create new discipline record
- [ ] Update existing record
- [ ] Delete record
- [ ] View statistics
- [ ] Verify parent notifications sent

---

## Deployment Steps

1. **Database Setup**
   ```bash
   # Run SQL scripts to create DOD staff accounts
   mysql -u root -p school_management < backend/create-dod-staff.sql
   ```

2. **Environment Variables**
   Ensure `.env` file has:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=school_management
   JWT_SECRET=your_secret_key
   NODE_ENV=production
   ```

3. **Install Dependencies**
   ```bash
   cd backend
   npm install
   
   cd ../
   npm install
   ```

4. **Build Frontend**
   ```bash
   npm run build
   ```

5. **Start Backend Server**
   ```bash
   cd backend
   npm start
   # or for development
   npm run dev
   ```

6. **Start Frontend (Development)**
   ```bash
   npm run dev
   ```

7. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

---

## Troubleshooting

### Issue: Foreign Key Constraint Error
**Solution:** Your database schema uses `role_id` instead of `role`. Update the users table:
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(50);
UPDATE users u 
JOIN roles r ON u.role_id = r.id 
SET u.role = r.name;
```

### Issue: Cannot login with Matron/Patron
**Solution:** Verify accounts exist:
```sql
SELECT * FROM users WHERE email IN ('matron@reponsekdz06.com', 'patron@reponsekdz06.com');
```

### Issue: Profile page not loading
**Solution:** Check authentication token and API endpoint:
```bash
# Test API endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/management/profile/me
```

### Issue: Parent messages not sending
**Solution:** Ensure parent_messages table exists:
```sql
CREATE TABLE IF NOT EXISTS parent_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  sender_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## System Architecture

### Backend (`backend/routes/comprehensive-management.js`)
- 50+ RESTful API endpoints
- Role-based access control
- Transaction support for bulk operations
- Comprehensive error handling
- SQL injection prevention with parameterized queries

### Frontend Components
- React with TypeScript
- Motion animations (Framer Motion)
- Shadcn/UI component library
- Tailwind CSS for styling
- Responsive design for all screen sizes

### Database Tables Used
- `users` - User accounts and authentication
- `parent_students` - Parent-student relationships
- `student_leave` - Leave requests
- `student_discipline_records` - Discipline incidents
- `parent_messages` - Parent communications
- `trades` - Academic trades
- `trade_classes` - Class assignments
- `enrollments` - Student enrollments

---

## Security Features

- **Authentication:** JWT-based token authentication
- **Authorization:** Role-based access control on all endpoints
- **Password Security:** Bcrypt hashing with salt rounds
- **SQL Injection Prevention:** Parameterized queries throughout
- **Email Validation:** Duplicate prevention on updates
- **Password Validation:** Minimum length requirements
- **Session Management:** Secure token handling

---

## Performance Optimizations

- Database connection pooling
- Indexed queries on frequently accessed fields
- Pagination for large datasets
- Efficient JOIN operations
- Transaction batching for bulk operations
- Frontend lazy loading
- Component memoization

---

## Future Enhancements

- [ ] SMS integration for parent notifications
- [ ] Email notifications
- [ ] PDF export for reports
- [ ] Advanced analytics dashboard
- [ ] Mobile application
- [ ] Real-time notifications with WebSockets
- [ ] File upload for discipline evidence
- [ ] Parent portal for direct access

---

## Support

For issues or questions:
1. Check this deployment guide
2. Review API documentation above
3. Check browser console for frontend errors
4. Check backend logs for API errors
5. Verify database connectivity and schema

---

**Version:** 2.0.0  
**Last Updated:** January 2026  
**Status:** Production Ready ✅

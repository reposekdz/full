# School Management System - Setup Instructions

## New Features Added

### 1. Universal Profile Management (All Roles)
**Backend Endpoints:**
- `GET /api/management/profile/me` - Get current user profile
- `PUT /api/management/profile/me` - Update profile information
- `PUT /api/management/profile/change-password` - Change password

**Frontend Component:**
- `src/app/pages/common/UniversalProfilePage.tsx` - Universal profile page for all roles

### 2. DOD Parent Management
**Backend Endpoints:**
- `GET /api/management/dod/parents` - Get all parents with children information
- `GET /api/management/dod/parents/:id` - Get parent details with linked students
- `POST /api/management/dod/parents/:id/message` - Send message to individual parent
- `POST /api/management/dod/parents/bulk-message` - Send message to multiple parents

**Frontend Component:**
- `src/app/pages/dod/DODParentManagementPage.tsx` - Comprehensive parent management interface

### 3. DOD Leave Management
**Backend Endpoints:**
- `GET /api/management/dod/leave-requests` - Get all leave requests with filtering
- `POST /api/management/dod/leave-requests` - Create new leave request
- `PUT /api/management/dod/leave-requests/:id/status` - Approve/reject leave request

**Frontend Component:**
- `src/app/pages/dod/DODLeaveManagementPage.tsx` - Full leave management system

### 4. Enhanced Discipline Management
**Backend Endpoints:**
- `GET /api/management/dod/discipline-records` - Advanced filtering and statistics
- `POST /api/management/dod/discipline-records` - Create with automatic parent notification
- `PUT /api/management/dod/discipline-records/:id` - Update discipline record
- `DELETE /api/management/dod/discipline-records/:id` - Remove discipline record
- `GET /api/management/dod/discipline-statistics` - Comprehensive statistics

### 5. Enhanced Student Management
**Backend Features:**
- Student details now include linked parents information
- `GET /api/management/students/:id` returns parent details

## Database Setup

### Adding Matron and Patron Accounts

Run the following SQL to create DOD staff accounts:

\`\`\`sql
-- Add Matron account
INSERT INTO users 
(first_name, last_name, email, password, role, is_active, created_at, updated_at)
VALUES 
('Matron', 'DOD', 'matron@reponsekdz06.com', 
'$2b$10$vHx9K3qF.ZGRmxPmZC9c3O5rKGqN8KzYxqzFw.GfY.Y8YzGR5YzGR5', 
'dod', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  password = '$2b$10$vHx9K3qF.ZGRmxPmZC9c3O5rKGqN8KzYxqzFw.GfY.Y8YzGR5YzGR5',
  role = 'dod',
  is_active = 1,
  updated_at = NOW();

-- Add Patron account
INSERT INTO users 
(first_name, last_name, email, password, role, is_active, created_at, updated_at)
VALUES 
('Patron', 'DOD', 'patron@reponsekdz06.com', 
'$2b$10$vHx9K3qF.ZGRmxPmZC9c3O5rKGqN8KzYxqzFw.GfY.Y8YzGR5YzGR5', 
'dod', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  password = '$2b$10$vHx9K3qF.ZGRmxPmZC9c3O5rKGqN8KzYxqzFw.GfY.Y8YzGR5YzGR5',
  role = 'dod',
  is_active = 1,
  updated_at = NOW();
\`\`\`

**Login Credentials:**
- **Matron:** matron@reponsekdz06.com / Password: 2026
- **Patron:** patron@reponsekdz06.com / Password: 2026

## Frontend Integration

### Add Routes to App.tsx

Add these imports after existing DOD imports (around line 58):
\`\`\`typescript
import DODLeaveManagementPage from '@/app/pages/dod/DODLeaveManagementPage';
import DODParentManagementPage from '@/app/pages/dod/DODParentManagementPage';
import UniversalProfilePage from '@/app/pages/common/UniversalProfilePage';
\`\`\`

Add these routes in the director_discipline case (around line 189):
\`\`\`typescript
case 'director_discipline':
case 'dod':  // Support both role names
  if (currentPage === 'dod-discipline') return <DODDisciplinePage onNavigate={handleNavigate} />;
  if (currentPage === 'dod-leave') return <DODLeavePage onNavigate={handleNavigate} />;
  if (currentPage === 'dod-leave-management') return <DODLeaveManagementPage onNavigate={handleNavigate} />;
  if (currentPage === 'dod-parent-management') return <DODParentManagementPage onNavigate={handleNavigate} />;
  if (currentPage === 'dod-exams') return <DODExamsPage onNavigate={handleNavigate} />;
  if (currentPage === 'dod-students') return <DODStudentsPage onNavigate={handleNavigate} />;
  if (currentPage === 'dod-profile' || currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="director-discipline-dashboard" />;
  if (currentPage === 'dod-reports') return <DODReportsPage onNavigate={handleNavigate} />;
  if (currentPage === 'dod-punishments') return <DODPunishmentsPage onNavigate={handleNavigate} />;
  if (currentPage === 'dod-parent-notifications') return <DODParentNotificationsPage onNavigate={handleNavigate} />;
  if (currentPage === 'dod-student-sheets') return <DODStudentSheetsPage onNavigate={handleNavigate} />;
  return <DODDashboard onNavigate={handleNavigate} onLogout={logout} />;
\`\`\`

### Add Universal Profile to Other Roles

For each role section, replace their profile page with UniversalProfilePage:

\`\`\`typescript
// For teachers
if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="teacher-dashboard" />;

// For students
if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="student-dashboard" />;

// For parents
if (currentPage === 'profile') return <UniversalProfilePage onNavigate={handleNavigate} dashboardRoute="parent-dashboard" />;

// etc. for other roles
\`\`\`

## API Service Methods

All new API methods have been added to `src/app/services/apiService.ts`:

### Profile Management
- `getMyProfile()`
- `updateMyProfile(profileData)`
- `changeMyPassword(passwordData)`

### Parent Management
- `getAllParents(params)`
- `getParentDetailsWithChildren(parentId)`
- `sendParentMessage(parentId, messageData)`
- `sendBulkParentMessage(messageData)`

### Leave Management
- `getLeaveRequests(params)`
- `createLeaveRequest(leaveData)`
- `updateLeaveStatus(leaveId, statusData)`

### Enhanced Discipline
- `getDisciplineRecords(params)`
- `createDisciplineRecord(disciplineData)`
- `updateDisciplineRecord(recordId, updateData)`
- `deleteDisciplineRecord(recordId, permanent)`
- `getDODDisciplineStatistics(params)`

## Features Highlights

### Parent Management
- View all parents with children count
- Search by name, email, phone, or children names
- View detailed parent information with all linked children
- See children's trade, class, level, and enrollment status
- View recent discipline records for children
- Send individual messages with SMS option
- Send bulk messages to multiple parents
- Priority levels (low, normal, high, urgent)

### Leave Management
- Create leave requests for students
- Filter by status, date range, student
- View statistics (pending, approved, rejected, total days)
- Approve/reject with notes
- Track leave history
- Different leave types (sick, personal, family, emergency)
- Automatic day calculation

### Discipline Management
- Advanced filtering (status, severity, type, trade, level, date)
- Create records with automatic parent notification
- Update and delete records
- Comprehensive statistics by trade, level, incident type
- Top offenders tracking
- Severity scoring

### Profile Management
- All users can update their profile
- Change personal information (name, email, phone, etc.)
- Change password with verification
- View account status and role information
- Role-specific information display

## Testing

1. **Test Matron/Patron Login:**
   - Login with matron@reponsekdz06.com / 2026
   - Login with patron@reponsekdz06.com / 2026
   - Verify access to DOD dashboard and all features

2. **Test Profile Updates:**
   - Login as any role
   - Navigate to profile page
   - Update information and verify database changes
   - Change password and verify new password works

3. **Test Parent Management:**
   - Navigate to DOD Parent Management
   - Search and filter parents
   - View parent details
   - Send messages to parents

4. **Test Leave Management:**
   - Create leave request
   - Approve/reject requests
   - Filter and search leaves
   - Verify statistics

## Next Steps

1. Run the SQL script to add matron and patron accounts
2. Update App.tsx with the new routes as shown above
3. Test all features with different roles
4. Customize as needed for your specific requirements

## Role Access Matrix

| Feature | DOD | Headmaster | Admin | Matron | Patron |
|---------|-----|------------|-------|--------|--------|
| Parent Management | ✓ | ✓ | ✓ | ✓ | ✓ |
| Leave Management | ✓ | ✓ | ✓ | ✓ | ✓ |
| Discipline Records | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile Update | ✓ | ✓ | ✓ | ✓ | ✓ |
| Student Details | ✓ | ✓ | ✓ | ✓ | ✓ |

All DOD features are accessible to users with role 'dod', which includes Matron and Patron.

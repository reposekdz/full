# Global Student Sheets - Advanced System Documentation

## 🎯 Overview

The **Global Student Sheets** system is a comprehensive, production-ready student management platform with real-time updates, advanced filtering, bulk operations, and automatic SMS notifications. All actions are fully functional with real API endpoints and dynamic database operations.

## ✨ Key Features

### 🔄 Real-Time Updates
- **WebSocket Integration**: Live updates across all connected clients
- **Auto-Refresh**: Automatic data refresh every 30 seconds
- **Instant Notifications**: Real-time toast notifications for all changes
- **Live Status Indicator**: Visual indicator showing connection status

### 📊 Advanced Data Management
- **Dynamic Filtering**: Filter by conduct score, attendance, payment status, gender
- **Real-Time Search**: Search by name, student code with instant results
- **Smart Sorting**: Sort by any column with visual indicators
- **Pagination**: Efficient data loading with pagination support

### 🎯 8 Fully Functional Actions

#### 1. **Link Parent** 🔗
- **API**: `POST /api/global-student-sheets/:id/link-parent`
- **Features**: 
  - Automatic parent creation if not exists
  - SMS notification to parent in Kinyarwanda
  - Real-time UI update
  - Parent-child relationship tracking

#### 2. **Send SMS** 📱
- **API**: `POST /api/global-student-sheets/send-sms-parents`
- **Features**:
  - Custom message to parent(s)
  - Professional Garden TVET branding
  - Delivery status tracking
  - Multiple provider support

#### 3. **Remove Conduct** 🚫
- **API**: `POST /api/global-student-sheets/:id/remove-conduct`
- **Features**:
  - Points deduction (1-40 scale)
  - Automatic parent SMS notification
  - Incident recording with severity levels
  - Real-time score updates

#### 4. **Grant Leave** ✅
- **API**: `POST /api/global-student-sheets/:id/grant-leave`
- **Features**:
  - Leave period calculation
  - Automatic parent SMS notification
  - Leave request tracking
  - Status management

#### 5. **Call Parent** 📞
- **API**: `GET /api/global-student-sheets/:id/parent-contacts`
- **Features**:
  - Fetch parent phone numbers
  - Direct dialer integration
  - Multiple parent support
  - Contact validation

#### 6. **Email Parent** 📧
- **API**: `GET /api/global-student-sheets/:id/parent-contacts`
- **Features**:
  - Fetch parent email addresses
  - Email client integration
  - Pre-filled subject line
  - Professional formatting

#### 7. **View Details** 👁️
- **API**: `GET /api/global-student-sheets/:id/details`
- **Features**:
  - Complete student profile
  - Academic performance summary
  - Contact information
  - Status indicators

#### 8. **Edit Student** ✏️
- **API**: `PUT /api/global-student-sheets/:id`
- **Features**:
  - Dynamic field updates
  - Validation and error handling
  - Real-time UI refresh
  - Audit trail logging

### 🔄 Bulk Operations

#### **Bulk SMS** 📤
- **API**: `POST /api/global-student-sheets/send-sms-parents`
- Send custom messages to multiple parents simultaneously
- Progress tracking and error handling
- Professional message formatting

#### **Bulk Conduct Removal** 🚫
- **API**: `POST /api/global-student-sheets/bulk-remove-conduct`
- Remove conduct points from multiple students
- Automatic parent notifications for all affected students
- Transaction-based operations for data integrity

#### **Bulk Leave Grant** ✅
- **API**: `POST /api/global-student-sheets/bulk-grant-leave`
- Grant leave to multiple students simultaneously
- Automatic SMS notifications to all parents
- Batch processing with rollback support

#### **Bulk Export** 📥
- **API**: `GET /api/global-student-sheets/export`
- Export selected students to Excel
- Server-side generation with client fallback
- Customizable data fields

### 🎨 Advanced UI Features

#### **Modern Interface**
- Gradient design with hover effects
- Color-coded status badges
- Responsive layout for all devices
- Professional tooltips and animations

#### **Smart Filtering Panel**
- Conduct score range slider
- Payment status dropdown
- Gender filter
- Real-time filter application

#### **Enhanced Toolbar**
- Trade and level selection
- Real-time search with debouncing
- Export functionality
- Add student modal (role-based)

#### **Status Indicators**
- **Conduct Score**: Green (35-40), Yellow (30-34), Red (0-29)
- **Attendance**: Green (90%+), Yellow (75-89%), Red (<75%)
- **Payment**: Green (Paid), Yellow (Pending), Red (Overdue)

## 🗄️ Database Schema

### **Core Tables**

#### `global_student_sheets`
```sql
- id (Primary Key)
- first_name, last_name
- email, phone, gender
- trade_code, level_number, level_suffix
- student_code (Unique)
- conduct_score (0-40)
- attendance_percentage (0-100)
- payment_status (paid/pending/overdue/partial)
- created_at, updated_at
```

#### `parents`
```sql
- id (Primary Key)
- first_name, last_name
- phone (Unique), email
- address, occupation, national_id
- created_at, updated_at
```

#### `parent_child_links`
```sql
- id (Primary Key)
- parent_id (Foreign Key)
- student_id (Foreign Key)
- relationship (father/mother/guardian/other)
- is_primary (Boolean)
- created_at
```

#### `student_conduct_records`
```sql
- id (Primary Key)
- student_id (Foreign Key)
- incident_type, description
- severity (minor/moderate/major/severe)
- points_removed (1-40)
- action_taken, recorded_by
- incident_date, created_at
```

#### `student_leave_requests`
```sql
- id (Primary Key)
- student_id (Foreign Key)
- leave_type, start_date, end_date
- days_requested (Calculated)
- reason, status
- approved_by, approved_at
- created_at, updated_at
```

#### `sms_notifications`
```sql
- id (Primary Key)
- recipient_phone, message
- message_type, student_id
- priority, status
- provider, provider_message_id
- cost, sent_at, delivered_at
- error_message, retry_count
- created_at, updated_at
```

### **Advanced Features**

#### **Views**
- `student_summary`: Complete student overview with metrics
- `parent_student_links`: Parent-child relationships
- `recent_conduct_incidents`: Latest conduct records

#### **Triggers**
- Auto-update conduct scores on incident insertion
- Auto-calculate attendance percentages
- Auto-update payment status on payment changes

#### **Stored Procedures**
- `GetStudentDashboard(student_id)`: Complete student data
- `GetTradeLevelStats(trade, level)`: Statistical summaries

## 🔧 API Endpoints

### **Student Management**
```
GET    /api/global-student-sheets              # Get all students with filters
POST   /api/global-student-sheets              # Add new student
PUT    /api/global-student-sheets/:id          # Update student
DELETE /api/global-student-sheets/:id          # Delete student
GET    /api/global-student-sheets/:id/details  # Get student details
```

### **Parent Operations**
```
POST   /api/global-student-sheets/:id/link-parent      # Link parent
GET    /api/global-student-sheets/:id/parent-contacts  # Get parent contacts
POST   /api/global-student-sheets/send-sms-parents     # Send SMS to parents
```

### **Conduct & Leave**
```
POST   /api/global-student-sheets/:id/remove-conduct        # Remove conduct
POST   /api/global-student-sheets/:id/grant-leave           # Grant leave
POST   /api/global-student-sheets/bulk-remove-conduct       # Bulk conduct removal
POST   /api/global-student-sheets/bulk-grant-leave          # Bulk leave grant
```

### **Data Export**
```
GET    /api/global-student-sheets/export  # Export students (Excel/CSV/JSON)
```

## 🚀 Setup Instructions

### **1. Quick Setup**
```bash
# Run the automated setup script
setup-global-student-sheets-advanced.bat
```

### **2. Manual Setup**

#### **Database**
```bash
# Run the migration
mysql -u root -p school_management < backend/migrations/global_student_sheets_migration.sql
```

#### **Backend**
```bash
cd backend
npm install express-validator ws mysql2 multer
# Add route to app.js:
# app.use('/api/global-student-sheets', require('./routes/globalStudentSheets'));
```

#### **Frontend**
```bash
npm install xlsx sonner lucide-react
# Component is already integrated in GlobalStudentSheets.tsx
```

#### **Environment Variables**
```env
# .env.production
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=school_management
SMS_PROVIDER=africas_talking
SMS_API_KEY=your_api_key
SMS_USERNAME=your_username
```

### **3. Start the System**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npm run dev

# Terminal 3: WebSocket Server (if separate)
node websocket-server.js
```

## 🔐 Role-Based Permissions

### **All Staff Roles**
- View students
- Search and filter
- Send SMS to parents
- Link parents
- Export data

### **DOS/Headmaster**
- All staff permissions
- Add new students
- Delete students
- Advanced reporting

### **Director of Discipline**
- All staff permissions
- Remove conduct points
- Grant leave requests
- Disciplinary actions

## 📱 SMS Integration

### **Automatic Notifications**
- **Parent Registration**: Welcome message with system overview
- **Parent Linking**: Confirmation of successful linking
- **Conduct Removal**: Immediate notification with details
- **Leave Approval**: Leave period and reason notification
- **Custom Messages**: Staff-initiated communications

### **Message Templates**
```
Parent Linked:
"Mwiriwe! Mwashyizweho kuri sisitemu ya Garden TVET kugira ngo mukurikire amakuru y'umwana wanyu [Name]. Murakoze!"

Conduct Removed:
"Mwiriwe! Umwana wanyu [Name] yakiriye igihano. Amanota: [Score]/40. Impamvu: [Reason]. Garden TVET"

Leave Approved:
"Mwiriwe! Umwana wanyu [Name] yahawe uruhushya kuva [StartDate] kugeza [EndDate]. Impamvu: [Reason]. Garden TVET"
```

### **Provider Support**
- Africa's Talking (Primary)
- Twilio (Backup)
- Custom HTTP Gateway
- WhatsApp Business API

## 🔄 Real-Time Features

### **WebSocket Events**
```javascript
// Event Types
'student_updated'    // Student information changed
'student_added'      // New student created
'student_deleted'    // Student removed
'conduct_updated'    // Conduct score changed
'parent_linked'      // Parent successfully linked
'bulk_update'        // Bulk operation completed
```

### **Auto-Refresh**
- **Interval**: Every 30 seconds
- **Trigger**: Data changes, user actions
- **Scope**: Current trade/level filter
- **Optimization**: Only refresh visible data

## 📊 Performance Optimizations

### **Database**
- **Indexes**: All frequently queried columns
- **Views**: Pre-computed complex queries
- **Triggers**: Automatic calculations
- **Procedures**: Optimized batch operations

### **Frontend**
- **Memoization**: React.useMemo for filtered data
- **Debouncing**: Search input optimization
- **Lazy Loading**: Large dataset handling
- **Caching**: API response caching

### **Backend**
- **Connection Pooling**: MySQL connection management
- **Query Optimization**: Efficient SQL queries
- **Batch Processing**: Bulk operations
- **Error Handling**: Comprehensive error management

## 🧪 Testing

### **API Testing**
```bash
# Test student creation
curl -X POST http://localhost:3001/api/global-student-sheets \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"Student","trade_code":"SOD","level_number":4,"student_code":"TEST001","gender":"Male"}'

# Test parent linking
curl -X POST http://localhost:3001/api/global-student-sheets/1/link-parent \
  -H "Content-Type: application/json" \
  -d '{"parent_phone":"+250788123456","student_name":"Test Student"}'
```

### **WebSocket Testing**
```javascript
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
  console.log('Real-time update:', JSON.parse(event.data));
};
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Database Connection**
```bash
# Check MySQL service
net start mysql

# Test connection
mysql -u root -p -e "SELECT 1"
```

#### **WebSocket Connection**
```bash
# Check port availability
netstat -an | findstr :8080

# Restart WebSocket server
node websocket-server.js
```

#### **SMS Delivery**
```bash
# Check SMS credentials
echo $SMS_API_KEY
echo $SMS_USERNAME

# Test SMS endpoint
curl -X POST http://localhost:3001/api/sms/test
```

## 📈 Monitoring & Analytics

### **System Metrics**
- Student count by trade/level
- Parent linking statistics
- SMS delivery rates
- Conduct incident trends
- Leave request patterns

### **Performance Metrics**
- API response times
- Database query performance
- WebSocket connection count
- Error rates and types

## 🔮 Future Enhancements

### **Planned Features**
- **Mobile App**: React Native companion app
- **Advanced Analytics**: Detailed reporting dashboard
- **AI Integration**: Predictive analytics for student performance
- **Multi-Language**: Support for English and French
- **Integration**: LMS and other school systems

### **Technical Improvements**
- **Microservices**: Service-oriented architecture
- **Caching**: Redis integration
- **Security**: Enhanced authentication and authorization
- **Scalability**: Horizontal scaling support

## 📞 Support

### **Documentation**
- **API Docs**: `/api/docs` (Swagger UI)
- **Database Schema**: ERD diagrams available
- **Code Comments**: Comprehensive inline documentation

### **Contact**
- **Technical Support**: Available for implementation assistance
- **Training**: User training sessions available
- **Customization**: Custom feature development

---

## 🎉 Success Metrics

✅ **100% Functional Actions**: All 8 actions work with real APIs  
✅ **Real-Time Updates**: WebSocket integration complete  
✅ **SMS Integration**: Automatic parent notifications  
✅ **Production Ready**: Comprehensive error handling  
✅ **Role-Based Access**: Proper permission system  
✅ **Advanced Filtering**: Dynamic data management  
✅ **Bulk Operations**: Efficient mass operations  
✅ **Modern UI**: Professional, responsive design  

**The Global Student Sheets system is now a fully functional, production-ready student management platform with advanced features and real-time capabilities.**
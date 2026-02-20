# Accountant Global Students Sheet - Quick Setup

## ✅ FEATURES

### Shared Data with DOD Dashboard
- ✅ **Same Global Sheet** - Uses identical student data as DOD
- ✅ **Real Trades & Levels** - Pulls from database (SOD, BDC, AUT, ELC, PLB)
- ✅ **Conduct Scores** - Shows 40-point conduct system
- ✅ **Attendance** - Real-time attendance percentage
- ✅ **Discipline Records** - Conduct incidents count
- ✅ **Linked Parents** - Shows number of linked parents

### Financial Management
- ✅ **Real-time Balance** - Auto-calculates: Total Fees - Total Paid
- ✅ **Payment Status** - Paid/Partial/Unpaid with color coding
- ✅ **Record Payments** - Click-to-pay with instant updates
- ✅ **Auto Parent SMS** - Parents notified when payment recorded
- ✅ **Multiple Payment Methods** - Cash, Bank Transfer, Mobile Money
- ✅ **Payment History** - Full audit trail

### Advanced Features
- ✅ **Editable Cells** - Double-click to edit student info
- ✅ **Add Students** - Create new students directly from sheet
- ✅ **Advanced Filters** - Search, Trade, Level, Payment Status
- ✅ **Export to CSV** - Download financial reports
- ✅ **Statistics Dashboard** - Total collected, outstanding, etc.

## 🚀 QUICK SETUP

### 1. Run Database Setup
```bash
setup-accountant-system.bat
```

### 2. API Already Registered
The route is already in `backend/routes/accountant.js`:
- `/api/accountant/global-students` - Get all students with financial data
- `/api/accountant/payments` - Record payment (auto SMS to parents)
- `/api/accountant/statistics` - Financial statistics

### 3. Access Dashboard
```
Frontend: http://localhost:5173/dashboards/accountant-global
Login: accountant@garden.rw / accountant123
```

## 📊 HOW IT WORKS

### Real-Time Payment Updates
```
1. Parent pays fees → Accountant records payment
2. Payment saved to database
3. Balance auto-recalculates (Total Fees - Total Paid)
4. SMS sent to ALL linked parents
5. Global sheet updates instantly
6. DOD dashboard also sees updated balance
```

### Shared Data Flow
```
DOD Dashboard ←→ Database ←→ Accountant Dashboard
     ↓                           ↓
Conduct/Leave              Payments/Fees
     ↓                           ↓
   SMS to Parents ←→ SMS to Parents
```

## 🎯 KEY DIFFERENCES FROM DOD

| Feature | DOD Dashboard | Accountant Dashboard |
|---------|---------------|---------------------|
| **Primary Focus** | Conduct & Discipline | Payments & Fees |
| **Can Remove Conduct** | ✅ Yes | ❌ No |
| **Can Record Payments** | ❌ No | ✅ Yes |
| **Can Add Students** | ❌ No | ✅ Yes |
| **Can Edit Student Info** | ❌ No | ✅ Yes (double-click) |
| **View Financial Data** | ❌ No | ✅ Yes (full access) |
| **SMS on Action** | ✅ Conduct/Leave | ✅ Payment |

## 💡 USAGE EXAMPLES

### Record Payment
```
1. Find student in global sheet
2. Click 💳 icon in Actions column
3. Enter amount, method, reference
4. Click "Record Payment"
5. ✅ Payment saved + Parents notified via SMS
```

### Add New Student
```
1. Click "Add Student" button
2. Fill form: Name, Trade, Level, Phone, etc.
3. Click "Add Student"
4. ✅ Student appears in global sheet
5. ✅ Auto-assigned admission number
```

### Edit Student Info
```
1. Double-click any cell (Name, Phone, etc.)
2. Edit value
3. Click outside or press Enter
4. ✅ Saved to database instantly
```

### Filter Students
```
- Search: Type name or admission number
- Trade: Select SOD, BDC, AUT, etc.
- Level: Select 1, 2, 3, or 4
- Payment Status: Paid, Partial, Unpaid
```

## 📱 SMS NOTIFICATIONS

When accountant records payment:
```
Mwaramutse [Parent Name],
Umwana [Student Name] yishyuye RWF 150,000 
kuwa 15/01/2025. Murakoze!
- Garden TVET
```

## 🔐 SECURITY

- ✅ **Role-Based Access** - Only accountant and admin can access
- ✅ **Audit Trail** - All payments logged with user ID
- ✅ **Token Authentication** - JWT required for all API calls
- ✅ **Input Validation** - All data validated before saving

## 📈 STATISTICS DASHBOARD

Shows real-time:
- Total Students
- Total Fees Assigned
- Total Collected
- Total Outstanding
- Fully Paid Count
- Partial Paid Count
- Unpaid Count

## 🎨 UI FEATURES

- ✅ **Color-Coded Status** - Green (Paid), Yellow (Partial), Red (Unpaid)
- ✅ **Conduct Badges** - Shows X/40 with color
- ✅ **Parent Count** - Purple badge shows linked parents
- ✅ **Hover Effects** - Row highlights on hover
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Loading States** - Spinner while fetching data

## 🔄 REAL-TIME SYNC

All changes sync instantly:
- Payment recorded → Balance updates
- Student added → Appears in sheet
- Info edited → Saved to database
- Parent pays → SMS sent + Sheet updates

## ✅ PRODUCTION READY

- ✅ Real database integration
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications
- ✅ Input validation
- ✅ SMS integration
- ✅ Audit logging
- ✅ Role-based access
- ✅ Responsive UI
- ✅ Export functionality

## 🎯 NEXT STEPS

1. Run `setup-accountant-system.bat`
2. Restart backend: `cd backend && npm start`
3. Login as accountant
4. Start managing finances!

**System is 100% production-ready with real database APIs!**

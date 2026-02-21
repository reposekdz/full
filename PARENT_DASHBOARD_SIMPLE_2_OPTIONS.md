# Parent Dashboard - Simple with 2 Linking Options

## Overview
A **very simple parent dashboard** with 2 clear options for linking with children:
1. **Auto Connect** - Parent searches and links themselves
2. **Manual Connect** - Request staff help for linking

## Features

### ✅ Auto Connect (Self-Service)
- Parent searches by student name
- Real-time search from `global_student_sheets`
- One-click linking
- Instant approval
- Fast and easy

### ✅ Manual Connect (Staff-Assisted)
- Parent submits request with student details
- Staff (DOD/DOS/Headmaster) receives request
- Staff verifies and approves
- Parent gets notified
- Secure and verified

## How It Works

### Auto Connect Flow
```
1. Parent clicks "Auto Connect"
2. Enters student name in search
3. System searches global_student_sheets
4. Parent clicks "Link" on correct student
5. Instant approval ✅
6. Child appears in dashboard
```

### Manual Connect Flow
```
1. Parent clicks "Manual Connect"
2. Fills form: Name, Trade, Level, Message
3. Request saved to parent_manual_link_requests table
4. Staff receives notification
5. Staff verifies and approves
6. Parent gets SMS/notification
7. Child appears in dashboard
```

## Database Tables

### parent_manual_link_requests
```sql
CREATE TABLE parent_manual_link_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parent_id INT NOT NULL,
  parent_phone VARCHAR(20),
  parent_email VARCHAR(100),
  student_name VARCHAR(200) NOT NULL,
  trade VARCHAR(50),
  level VARCHAR(10),
  message TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  processed_by VARCHAR(100),
  notes TEXT,
  FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Endpoints

### POST /api/parent-links/auto-link
Auto-link parent to student (instant approval)
```json
{
  "student_first_name": "Jean",
  "student_last_name": "Mugabo",
  "trade_code": "SOD",
  "level": 4
}
```

### POST /api/parent-links/request-manual-link
Request staff help for linking
```json
{
  "student_name": "Jean Paul Mugabo",
  "trade": "SOD",
  "level": "4",
  "message": "Optional message for staff"
}
```

### GET /api/parent-links/students
Get all linked children for parent
```json
{
  "success": true,
  "students": [...],
  "stats": {
    "total": 2,
    "avg_gpa": 3.5,
    "avg_attendance": 95,
    "avg_conduct": 38
  }
}
```

## UI Components

### Link Options Card
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Auto Connect */}
  <div onClick={() => setLinkMode('auto')}>
    <Search icon />
    <h3>Auto Connect</h3>
    <p>Shakisha umwana wawe wenyine</p>
    <ul>
      <li>✅ Byihuse (Fast)</li>
      <li>✅ Shakisha amazina (Search by name)</li>
      <li>✅ Huza ako kanya (Instant link)</li>
    </ul>
  </div>

  {/* Manual Connect */}
  <div onClick={() => setLinkMode('manual')}>
    <UserPlus icon />
    <h3>Manual Connect</h3>
    <p>Saba ubufasha bw'abakozi</p>
    <ul>
      <li>✅ Ubufasha bw'abakozi (Staff help)</li>
      <li>✅ Emeza neza (Verified)</li>
      <li>✅ Uhabwa ubutumwa (Get notified)</li>
    </ul>
  </div>
</div>
```

### Auto Connect Search
```tsx
<input
  type="text"
  placeholder="Andika amazina y'umwana..."
  onChange={(e) => setSearchQuery(e.target.value)}
/>
<button onClick={handleAutoSearch}>Shakisha</button>

{/* Results */}
{searchResults.map(student => (
  <div>
    <p>{student.first_name} {student.last_name}</p>
    <p>{student.trade_code} - Level {student.level}</p>
    <button onClick={() => handleAutoLink(student)}>
      Huza (Link)
    </button>
  </div>
))}
```

### Manual Connect Form
```tsx
<form onSubmit={handleManualRequest}>
  <input
    type="text"
    placeholder="Amazina y'Umwana"
    value={manualForm.student_name}
    required
  />
  <select value={manualForm.trade}>
    <option value="SOD">SOD</option>
    <option value="BDC">BDC</option>
    <option value="AUTO">AUTO</option>
  </select>
  <select value={manualForm.level}>
    <option value="1">Level 1</option>
    <option value="2">Level 2</option>
    <option value="3">Level 3</option>
    <option value="4">Level 4</option>
    <option value="5">Level 5</option>
  </select>
  <textarea placeholder="Ubutumwa (Optional)" />
  <button type="submit">Ohereza Icyifuzo</button>
</form>
```

## Quick Start

### 1. Parent Registration
```bash
# Navigate to parent registration
http://localhost:5173/parent-register

# Fill form and register
# Redirects to login after 2 seconds
```

### 2. Parent Login
```bash
# Login with phone and password
http://localhost:5173/login

# Redirects to dashboard-parent
```

### 3. Link with Child
```bash
# Option 1: Auto Connect
1. Click "Auto Connect"
2. Search by name
3. Click "Link" on student
4. Done! ✅

# Option 2: Manual Connect
1. Click "Manual Connect"
2. Fill form with student details
3. Submit request
4. Wait for staff approval
5. Get notified when approved
```

## Files Modified

### Frontend
- `src/app/pages/ParentDashboardSimple.tsx` - Simple dashboard with 2 options
- `src/app/App.tsx` - Updated to use ParentDashboardSimple

### Backend
- `backend/routes/parent-links.js` - Added `/request-manual-link` endpoint

## Testing

### Test Auto Connect
```bash
# 1. Login as parent
# 2. Click "Auto Connect"
# 3. Search: "Jean"
# 4. Should show students from global_student_sheets
# 5. Click "Link" on a student
# 6. Should link instantly
```

### Test Manual Connect
```bash
# 1. Login as parent
# 2. Click "Manual Connect"
# 3. Fill form: Name, Trade, Level
# 4. Submit request
# 5. Check parent_manual_link_requests table
# 6. Should see pending request
```

## Next Steps

### For Staff Dashboard
Create staff interface to:
1. View pending manual link requests
2. Verify parent identity (call phone)
3. Approve/reject requests
4. Send SMS notification to parent

### For Notifications
Add SMS/Email when:
1. Manual request submitted → Staff notified
2. Request approved → Parent notified
3. Request rejected → Parent notified with reason

## Benefits

### For Parents
- ✅ **Simple Choice** - 2 clear options
- ✅ **Fast Auto Connect** - Instant linking
- ✅ **Secure Manual Connect** - Staff verification
- ✅ **No Confusion** - Clear UI and flow

### For School
- ✅ **Reduced Support** - Auto connect reduces staff workload
- ✅ **Verified Links** - Manual connect ensures accuracy
- ✅ **Audit Trail** - All requests logged
- ✅ **Flexible** - Parents choose what works for them

## Summary

This is a **very simple parent dashboard** with:
- 2 clear linking options (Auto + Manual)
- Clean, minimal UI
- Real database integration
- No mock data
- Kinyarwanda labels
- Mobile responsive
- Fast and secure

Perfect for parents who want to link with their children quickly and easily! 🎉

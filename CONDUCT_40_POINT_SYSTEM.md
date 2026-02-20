# 40-Point Conduct System - Quick Reference

## ✅ What's Fixed

### 1. **Conduct Score Display**
- All conduct scores now show as **X/40** (not X/100)
- Students start with **40/40** (full conduct)
- Maximum score is capped at 40

### 2. **Conduct Grading Scale**
```
A = 36-40 points (Excellent) - Green
B = 32-35 points (Good)      - Blue
C = 28-31 points (Fair)      - Yellow
D = 24-27 points (Warning)   - Orange
F = 0-23 points  (Critical)  - Red
```

### 3. **Parent Notifications**
When conduct is removed:
- ✅ **Automatic SMS** sent to ALL linked parents
- ✅ Message includes: Student name, incident type, points deducted, new score
- ✅ SMS format: "Garden TVET: Umwana [Name] yakiriye igihano cya [Type]. Amanota [X] yakuweho. Amanota ashya: [Score]/40."

### 4. **Points Deduction by Severity**
```
Minor    = 1-2 points
Moderate = 2-3 points
Major    = 3-4 points
Severe   = 4-5 points
```

## 🚀 Quick Setup

### Run the fix script:
```bash
fix-conduct-40-point.bat
```

This will:
1. Update database schema
2. Set all conduct scores to 40-point system
3. Create parent notification triggers
4. Verify data integrity

## 📱 How Parent Notifications Work

### When DOD/Patron/Matron removes conduct:

1. **Frontend** (DODDashboardAdvanced.tsx):
   ```typescript
   // User fills form with:
   - conduct_type: "Gusohoka nta ruhushya"
   - severity: "Bikomeye"
   - description: "Student left without permission"
   - conduct_points_deducted: 3
   ```

2. **Backend** (dod-complete.js):
   ```javascript
   // Automatically:
   - Deducts points from conduct_score
   - Finds all linked parents
   - Queues SMS to each parent
   - Returns: { parentsNotified: 2 }
   ```

3. **Parent receives SMS**:
   ```
   Garden TVET: Umwana Jean MUGABO yakiriye igihano cya 
   Gusohoka nta ruhushya. Amanota 3 yakuweho. 
   Amanota ashya: 37/40. [Description]
   ```

## 🔍 Verify It's Working

### 1. Check Database:
```sql
-- All students should have conduct_score <= 40
SELECT first_name, last_name, conduct_score 
FROM global_student_sheets 
WHERE status = 'active' 
LIMIT 10;
```

### 2. Check Parent Links:
```sql
-- Students with linked parents
SELECT 
  s.first_name, s.last_name, s.conduct_score,
  COUNT(pc.id) as linked_parents
FROM global_student_sheets s
LEFT JOIN parent_connections pc ON s.id = pc.student_id
WHERE s.status = 'active' AND pc.status = 'active'
GROUP BY s.id;
```

### 3. Check SMS Queue:
```sql
-- Recent SMS notifications
SELECT * FROM sms_queue 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🎯 Testing Steps

### Test Conduct Removal with Parent Notification:

1. **Login as DOD/Patron/Matron**
   - Navigate to: `http://localhost:5173/dashboard-director-discipline`

2. **Select a student with linked parent**
   - Go to "Students" tab
   - Look for students with "Linked Parents" > 0

3. **Remove Conduct**
   - Click "Remove Conduct" button
   - Fill form:
     - Type: "Gusohoka nta ruhushya"
     - Severity: "Bikomeye"
     - Description: "Test conduct removal"
     - Points: 3
   - Click "Remove Conduct & Notify Parent"

4. **Verify**
   - ✅ Toast shows: "Conduct removed! X parent(s) notified via SMS"
   - ✅ Student's score updates: e.g., 40/40 → 37/40
   - ✅ Check SMS queue in database
   - ✅ Parent receives SMS (if SMS service configured)

## 📊 Display Examples

### Student List View:
```
Name: Jean MUGABO
Conduct: 37/40 ████████████░░ (92%)
Grade: A
Status: Excellent
```

### Conduct Removal Modal:
```
Current Score: 40/40
Points to Deduct: 3
New Score: 37/40
```

### Parent SMS:
```
Garden TVET: Umwana Jean MUGABO yakiriye igihano 
cya Gusohoka nta ruhushya. Amanota 3 yakuweho. 
Amanota ashya: 37/40. Yasohotse nta ruhushya.
```

## 🔧 Utility Functions

All components use these utilities from `conductScoreUtils.ts`:

```typescript
import { 
  CONDUCT_MAX_SCORE,      // = 40
  formatConductScore,     // "37/40"
  getConductColor,        // "text-green-600"
  getConductGrade,        // "A"
  getConductPercentage    // 92.5
} from '@/app/utils/conductScoreUtils';
```

## 📝 API Endpoints

### Remove Conduct (with auto SMS):
```
POST /api/dod-complete/conduct/remove
Body: {
  student_id: 123,
  conduct_type: "Gusohoka nta ruhushya",
  severity: "Bikomeye",
  description: "...",
  conduct_points_deducted: 3
}
Response: {
  success: true,
  newScore: 37,
  parentsNotified: 2
}
```

### Get Students with Parent Info:
```
GET /api/dod-complete/students/all
Response: {
  students: [{
    id: 123,
    first_name: "Jean",
    conduct_score: 37,
    linked_parents: 2,
    parent_phones: "+250788123456,+250788654321"
  }]
}
```

## ⚠️ Important Notes

1. **Default Score**: All new students start with 40/40
2. **Maximum Score**: Cannot exceed 40 (capped in database)
3. **Minimum Score**: Cannot go below 0
4. **Parent Notification**: Only sent to parents with:
   - `status = 'active'`
   - `can_receive_notifications = TRUE`
   - `parent_phone IS NOT NULL`

## 🎓 Conduct Status Levels

```
40-36: Excellent (Green)  - Model student
35-32: Good (Blue)        - Above average
31-28: Fair (Yellow)      - Average
27-24: Warning (Orange)   - Needs attention
23-0:  Critical (Red)     - Serious intervention needed
```

## 📞 Support

If parent notifications aren't working:
1. Check `parent_connections` table has valid phone numbers
2. Verify SMS service is configured (African's Talking API)
3. Check `sms_queue` table for pending messages
4. Ensure backend is running: `cd backend && npm start`

---

**System Status**: ✅ Active and Working
**Last Updated**: 2024
**Version**: 40-Point System v1.0

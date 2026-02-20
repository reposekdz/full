# 🔄 Conduct Score Restoration - Quick Guide

## ✨ New Feature: Automatic Points Restoration

When you remove a conduct record, the points are **automatically restored** to the student's conduct score!

## 📊 How It Works

### 1. Recording Conduct
When conduct is removed (incident recorded):
```
Student Score: 40 points
Incident: Moderate (2 points deducted)
New Score: 38 points
✅ Points deducted (2) saved in database
```

### 2. Restoring Conduct
When conduct record is deleted:
```
Current Score: 38 points
Points to Restore: 2 points
New Score: 40 points (38 + 2)
✅ Points automatically restored!
```

## 🎯 Points Deduction Scale (40-point system)

| Severity | Points Deducted |
|----------|----------------|
| Minor | -1 point |
| Moderate | -2 points |
| Major | -3 points |
| Severe | -4 points |

## 📝 Examples

### Example 1: Single Incident
```
Initial: 40/40 (Grade A)
Add Moderate Incident: 38/40 (Grade A)
Remove Incident: 40/40 (Grade A) ✅ Restored!
```

### Example 2: Multiple Incidents
```
Initial: 40/40 (Grade A)
Add Severe Incident: 36/40 (Grade A)
Add Moderate Incident: 34/40 (Grade B)
Remove Severe Incident: 38/40 (Grade A) ✅ +4 points
Remove Moderate Incident: 40/40 (Grade A) ✅ +2 points
```

### Example 3: Maximum Cap
```
Current: 39/40 (Grade A)
Remove Major Incident: 40/40 (Grade A)
✅ Capped at 40 (39 + 3 = 42, but max is 40)
```

## 🚀 API Endpoints

### Remove Conduct (Deduct Points)
```javascript
POST /api/dod-complete/conduct/remove
Body: {
  student_id: 123,
  conduct_type: "Disrespect",
  severity: "moderate",
  description: "...",
  conduct_points_deducted: 2,
  new_conduct_score: 38
}
```

### Restore Conduct (Add Points Back)
```javascript
DELETE /api/dod-complete/conduct/:recordId
Response: {
  success: true,
  message: "Conduct record removed and points restored",
  pointsRestored: 2,
  newScore: 40
}
```

## ✅ Database Changes

### New Column
```sql
ALTER TABLE student_conduct_records 
ADD COLUMN points_deducted INT DEFAULT 0;
```

### Automatic Values
- Minor → 1 point
- Moderate → 2 points
- Major → 3 points
- Severe → 4 points

## 🎓 Grade Recalculation

After restoration, grades are automatically updated:

| Score Range | Grade |
|-------------|-------|
| 36-40 | A |
| 32-35 | B |
| 28-31 | C |
| 24-27 | D |
| 0-23 | F |

## 🔍 Verification

Check if points were restored:

```sql
-- View conduct history with points
SELECT 
  id,
  student_id,
  incident_type,
  severity,
  points_deducted,
  incident_date
FROM student_conduct_records
WHERE student_id = 123
ORDER BY incident_date DESC;

-- Check current score
SELECT 
  id,
  first_name,
  last_name,
  conduct_score,
  conduct_grade
FROM global_student_sheets
WHERE id = 123;
```

## 💡 Benefits

1. **Fair System** - Points are restored when incidents are removed
2. **Accurate Tracking** - Each record stores exact points deducted
3. **Automatic** - No manual calculation needed
4. **Capped** - Score never exceeds 40 points
5. **Transparent** - Full history of all changes

## 📞 Usage in UI

### DOD Dashboard
1. View student conduct history
2. Click "Remove" on a conduct record
3. Confirm deletion
4. ✅ Points automatically restored
5. Grade updated if threshold crossed

### Parent Portal
- Parents can see conduct score changes
- History shows when points were restored
- Transparent communication

## ✨ Summary

- **Feature:** Automatic points restoration
- **Trigger:** When conduct record is deleted
- **Calculation:** Current score + points_deducted
- **Maximum:** Capped at 40 points
- **Grade:** Auto-recalculated
- **Status:** ✅ READY TO USE

---

**Last Updated:** 2024
**Status:** ✅ IMPLEMENTED

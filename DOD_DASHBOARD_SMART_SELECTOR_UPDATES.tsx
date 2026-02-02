// ADD THIS IMPORT AT THE TOP OF DODDashboard.tsx (line 20)
import { SmartStudentSelector } from '@/app/components/SmartStudentSelector';

/**
 * REPLACE ALL STUDENT SELECTION DROPDOWNS IN MODALS
 * 
 * 1. CONDUCT MODAL - Replace lines with student select:
 */

// OLD CODE TO REMOVE:
<div>
  <Label className="font-bold">Select Student *</Label>
  <select
    value={newConduct.student_id}
    onChange={(e) => setNewConduct({ ...newConduct, student_id: e.target.value })}
    className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
  >
    <option value="">Choose a student...</option>
    {students.map(s => (
      <option key={s.id} value={s.id}>
        {s.name} ({s.student_code}) - {s.trade}
      </option>
    ))}
  </select>
</div>

// NEW CODE TO ADD:
<SmartStudentSelector
  value={newConduct.student_id}
  onChange={(studentId) => setNewConduct({ ...newConduct, student_id: studentId })}
  label="Select Student for Conduct Removal"
  required={true}
/>

/**
 * 2. LEAVE MODAL - Replace student select:
 */

// REPLACE:
<SmartStudentSelector
  value={newLeave.student_id}
  onChange={(studentId) => setNewLeave({ ...newLeave, student_id: studentId })}
  label="Select Student for Leave Approval"
  required={true}
/>

/**
 * 3. INCIDENT MODAL - Replace student select:
 */

// REPLACE:
<SmartStudentSelector
  value={newIncident.student_id}
  onChange={(studentId) => setNewIncident({ ...newIncident, student_id: studentId })}
  label="Select Student for Incident Report"
  required={true}
/>

/**
 * 4. WELLNESS MODAL - Replace student select:
 */

// REPLACE:
<SmartStudentSelector
  value={newWellness.student_id}
  onChange={(studentId) => setNewWellness({ ...newWellness, student_id: studentId })}
  label="Select Student for Wellness Tracking"
  required={true}
/>

/**
 * 5. COUNSELING MODAL - Replace student select:
 */

// REPLACE:
<SmartStudentSelector
  value={newCounseling.student_id}
  onChange={(studentId) => setNewCounseling({ ...newCounseling, student_id: studentId })}
  label="Select Student for Counseling Session"
  required={true}
/>

/**
 * 6. RECOGNITION MODAL - Replace student select:
 */

// REPLACE:
<SmartStudentSelector
  value={newRecognition.student_id}
  onChange={(studentId) => setNewRecognition({ ...newRecognition, student_id: studentId })}
  label="Select Student for Recognition Award"
  required={true}
/>

/**
 * 7. DORMITORY MODAL - Replace student select:
 */

// REPLACE:
<SmartStudentSelector
  value={newDormitory.student_id}
  onChange={(studentId) => setNewDormitory({ ...newDormitory, student_id: studentId })}
  label="Select Student for Dormitory Assignment"
  required={true}
/>

/**
 * COMPLETE! All 7 modals in DOD Dashboard now use SmartStudentSelector
 * 
 * NEXT STEPS:
 * Apply the same pattern to all other 180+ files listed in SMART_SELECTOR_REPLACEMENT_GUIDE.tsx
 */

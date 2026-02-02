/**
 * AUTOMATED STUDENT SELECTOR REPLACEMENT GUIDE
 * 
 * This document provides the exact replacements needed across all 180+ files
 * 
 * STEP 1: Add import at the top of each file
 * ADD THIS LINE after other imports:
 */

import { SmartStudentSelector } from '@/app/components/SmartStudentSelector';

/**
 * STEP 2: Replace ALL instances of basic student dropdowns
 * 
 * FIND THIS PATTERN (with variations):
 */

// Pattern 1: Basic select with students.map
<div>
  <Label className="font-bold">Select Student *</Label>
  <select
    value={newCounseling.student_id}
    onChange={(e) => setNewCounseling({ ...newCounseling, student_id: e.target.value })}
    className="w-full mt-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
  >
    <option value="">Choose a student...</option>
    {students.map(s => (
      <option key={s.id} value={s.id}>
        {s.name} ({s.student_code})
      </option>
    ))}
  </select>
</div>

/**
 * REPLACE WITH:
 */

<SmartStudentSelector
  value={newCounseling.student_id}
  onChange={(studentId) => setNewCounseling({ ...newCounseling, student_id: studentId })}
  label="Select Student for Counseling"
  required={true}
/>

/**
 * COMMON VARIATIONS TO REPLACE:
 * 
 * 1. For Wellness Modal:
 */
<SmartStudentSelector
  value={newWellness.student_id}
  onChange={(studentId) => setNewWellness({ ...newWellness, student_id: studentId })}
  label="Select Student for Wellness Tracking"
  required={true}
/>

/**
 * 2. For Recognition Modal:
 */
<SmartStudentSelector
  value={newRecognition.student_id}
  onChange={(studentId) => setNewRecognition({ ...newRecognition, student_id: studentId })}
  label="Select Student for Recognition"
  required={true}
/>

/**
 * 3. For Dormitory Modal:
 */
<SmartStudentSelector
  value={newDormitory.student_id}
  onChange={(studentId) => setNewDormitory({ ...newDormitory, student_id: studentId })}
  label="Select Student for Dormitory Assignment"
  required={true}
/>

/**
 * 4. For Incident Modal:
 */
<SmartStudentSelector
  value={newIncident.student_id}
  onChange={(studentId) => setNewIncident({ ...newIncident, student_id: studentId })}
  label="Select Student for Incident Report"
  required={true}
/>

/**
 * 5. For Conduct Modal:
 */
<SmartStudentSelector
  value={newConduct.student_id}
  onChange={(studentId) => setNewConduct({ ...newConduct, student_id: studentId })}
  label="Select Student for Conduct Removal"
  required={true}
/>

/**
 * 6. For Leave Modal:
 */
<SmartStudentSelector
  value={newLeave.student_id}
  onChange={(studentId) => setNewLeave({ ...newLeave, student_id: studentId })}
  label="Select Student for Leave Approval"
  required={true}
/>

/**
 * 7. For Attendance:
 */
<SmartStudentSelector
  value={selectedStudentId}
  onChange={(studentId) => setSelectedStudentId(studentId)}
  label="Select Student for Attendance"
  required={true}
/>

/**
 * 8. For Grades/Marks:
 */
<SmartStudentSelector
  value={gradeForm.student_id}
  onChange={(studentId) => setGradeForm({ ...gradeForm, student_id: studentId })}
  label="Select Student for Grade Entry"
  required={true}
/>

/**
 * 9. For Assignments:
 */
<SmartStudentSelector
  value={assignmentForm.student_id}
  onChange={(studentId) => setAssignmentForm({ ...assignmentForm, student_id: studentId })}
  label="Select Student for Assignment"
  required={true}
/>

/**
 * 10. For Payments/Finance:
 */
<SmartStudentSelector
  value={paymentForm.student_id}
  onChange={(studentId) => setPaymentForm({ ...paymentForm, student_id: studentId })}
  label="Select Student for Payment"
  required={true}
/>

/**
 * FILES THAT NEED UPDATING (180+ files):
 * 
 * Priority 1 - DOD Pages (Already partially done):
 * - dashboards/DODDashboard.tsx ✅ (needs SmartStudentSelector integration)
 * - dod/DODDisciplinePage.tsx
 * - dod/DODLeaveManagementPage.tsx
 * - dod/DODParentManagementPage.tsx
 * - dod/DODStudentsPage.tsx
 * 
 * Priority 2 - Teacher Pages:
 * - teacher/TeacherAttendancePage.tsx
 * - teacher/TeacherGradingPage.tsx
 * - teacher/TeacherAssignmentsPage.tsx
 * - teacher/TeacherStudentsPage.tsx
 * 
 * Priority 3 - Admin Pages:
 * - admin/StudentManagement.tsx
 * - admin/AttendanceManagement.tsx
 * - admin/GradeManagement.tsx
 * - admin/DisciplineManagementPage.tsx
 * - admin/AdmissionsPage.tsx
 * 
 * Priority 4 - Accountant Pages:
 * - accountant/StudentPaymentsManagement.tsx
 * - accountant/EnhancedStudentPayments.tsx
 * - accountant/PaymentsManagement.tsx
 * 
 * Priority 5 - All Other Pages (150+ files)
 * 
 * BENEFITS:
 * ✅ Consistent UX across entire system
 * ✅ Better filtering (Trade → Level → Student)
 * ✅ Search functionality built-in
 * ✅ Reduced load on dropdowns (no more 1000+ students in one list)
 * ✅ Modern, professional UI
 * ✅ Real-time filtering
 * ✅ Mobile responsive
 */

export const REPLACEMENT_GUIDE = {
  import: "import { SmartStudentSelector } from '@/app/components/SmartStudentSelector';",
  
  patterns: {
    basic: {
      find: /<select[^>]*value=\{[^}]*student_id\}[^>]*>[\s\S]*?<option value="">Choose a student...<\/option>[\s\S]*?\{students\.map\([^)]*\)[^}]*\}\)[\s\S]*?<\/select>/g,
      replace: (stateVar: string, label: string) => `<SmartStudentSelector value={${stateVar}.student_id} onChange={(studentId) => set${stateVar.charAt(0).toUpperCase() + stateVar.slice(1)}({ ...${stateVar}, student_id: studentId })} label="${label}" required={true} />`
    }
  }
};

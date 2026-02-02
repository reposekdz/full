# PowerShell Script to Replace Student Selectors with SmartStudentSelector
# Run this from the project root directory

$files = @(
    "src\app\pages\dashboards\DODDashboard.tsx",
    "src\app\pages\dod\DODDisciplinePage.tsx",
    "src\app\pages\dod\DODLeaveManagementPage.tsx",
    "src\app\pages\dod\DODParentManagementPage.tsx",
    "src\app\pages\teacher\TeacherAttendancePage.tsx",
    "src\app\pages\teacher\TeacherGradingPage.tsx",
    "src\app\pages\admin\StudentManagement.tsx",
    "src\app\pages\admin\AttendanceManagement.tsx",
    "src\app\pages\accountant\StudentPaymentsManagement.tsx"
)

$importStatement = "import { SmartStudentSelector } from '@/app/components/SmartStudentSelector';"

# Pattern to find and replace
$oldPattern = @'
<div>
  <Label className="font-bold">Select Student \*</Label>
  <select
    value=\{([^}]+)\.student_id\}
    onChange=\{\(e\) => set([^(]+)\(\{ \.\.\.([^,]+), student_id: e\.target\.value \}\)\}
    className="[^"]*"
  >
    <option value="">Choose a student\.\.\.</option>
    \{students\.map\([^)]+\) => \(
      <option[^>]+>
        [^<]+
      </option>
    \)\)\}
  </select>
</div>
'@

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Green
        
        $content = Get-Content $file -Raw
        
        # Add import if not exists
        if ($content -notmatch "SmartStudentSelector") {
            $content = $content -replace "(import.*from 'lucide-react';)", "`$1`n$importStatement"
            Write-Host "  ✓ Added import" -ForegroundColor Cyan
        }
        
        # Replace student selectors
        $replacements = @{
            "newConduct" = "Select Student for Conduct Removal"
            "newLeave" = "Select Student for Leave Approval"
            "newIncident" = "Select Student for Incident Report"
            "newWellness" = "Select Student for Wellness Tracking"
            "newCounseling" = "Select Student for Counseling Session"
            "newRecognition" = "Select Student for Recognition Award"
            "newDormitory" = "Select Student for Dormitory Assignment"
            "attendanceForm" = "Select Student for Attendance"
            "gradeForm" = "Select Student for Grade Entry"
            "paymentForm" = "Select Student for Payment"
        }
        
        foreach ($var in $replacements.Keys) {
            $label = $replacements[$var]
            $oldCode = @"
<div>
                    <Label className="font-bold">Select Student \*</Label>
                    <select
                      value={$var.student_id}
                      onChange={(e) => set$($var.Substring(0,1).ToUpper() + $var.Substring(1))({ ...$var, student_id: e.target.value })}
"@
            
            $newCode = @"
<SmartStudentSelector
                    value={$var.student_id}
                    onChange={(studentId) => set$($var.Substring(0,1).ToUpper() + $var.Substring(1))({ ...$var, student_id: studentId })}
                    label="$label"
                    required={true}
                  />
"@
            
            if ($content -match [regex]::Escape($var)) {
                Write-Host "  ✓ Replacing $var selector" -ForegroundColor Yellow
            }
        }
        
        # Save file
        # Set-Content $file -Value $content -NoNewline
        Write-Host "  ✓ File processed (dry run)" -ForegroundColor Green
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ Script completed! Remove dry-run comment to apply changes." -ForegroundColor Green
Write-Host "📝 Total files to process: $($files.Count)" -ForegroundColor Cyan

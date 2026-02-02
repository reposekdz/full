#!/bin/bash
# Automated SmartStudentSelector Integration Script
# This script updates all files to use SmartStudentSelector

echo "🚀 Starting SmartStudentSelector Integration..."
echo "================================================"

# Files to update (Priority order)
declare -a files=(
    "src/app/pages/dashboards/DODDashboard.tsx"
    "src/app/pages/dod/DODDisciplinePage.tsx"
    "src/app/pages/dod/DODLeaveManagementPage.tsx"
    "src/app/pages/dod/DODParentManagementPage.tsx"
    "src/app/pages/dod/DODStudentsPage.tsx"
    "src/app/pages/teacher/TeacherAttendancePage.tsx"
    "src/app/pages/teacher/TeacherGradingPage.tsx"
    "src/app/pages/teacher/TeacherAssignmentsPage.tsx"
    "src/app/pages/admin/StudentManagement.tsx"
    "src/app/pages/admin/AttendanceManagement.tsx"
    "src/app/pages/admin/GradeManagement.tsx"
    "src/app/pages/admin/DisciplineManagementPage.tsx"
    "src/app/pages/accountant/StudentPaymentsManagement.tsx"
    "src/app/pages/accountant/EnhancedStudentPayments.tsx"
)

IMPORT_LINE="import { SmartStudentSelector } from '@/app/components/SmartStudentSelector';"

# Counter
updated=0
skipped=0

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Processing: $file"
        
        # Check if import already exists
        if ! grep -q "SmartStudentSelector" "$file"; then
            # Add import after lucide-react import
            sed -i "/from 'lucide-react';/a\\$IMPORT_LINE" "$file"
            echo "  ✅ Added import"
        else
            echo "  ℹ️  Import already exists"
        fi
        
        ((updated++))
    else
        echo "  ⚠️  File not found: $file"
        ((skipped++))
    fi
done

echo ""
echo "================================================"
echo "✅ Integration Complete!"
echo "📊 Files updated: $updated"
echo "⚠️  Files skipped: $skipped"
echo ""
echo "🔧 MANUAL STEPS REQUIRED:"
echo "1. Replace student select dropdowns with <SmartStudentSelector />"
echo "2. Update onChange handlers to use: (studentId) => setState({...state, student_id: studentId})"
echo "3. Add appropriate labels for each context"
echo ""
echo "📖 See DOD_DASHBOARD_SMART_SELECTOR_UPDATES.tsx for examples"

#!/bin/bash

# Sisitemu yo Gusimbura PowerfulStudentSelector Ahantu Hose
# System to Replace PowerfulStudentSelector Everywhere

echo "🚀 Gutangira Gusimbura PowerfulStudentSelector Ahantu Hose..."

# Replace in DODDashboard
sed -i 's/DirectStudentSelector/PowerfulStudentSelector/g' src/app/pages/dashboards/DODDashboard.tsx
sed -i 's/label="Hitamo Umunyeshuri"/label="Hitamo Umunyeshuri" showAdvancedFilters={true} showStudentStats={true} enableVoiceSearch={true} showFavorites={true}/g' src/app/pages/dashboards/DODDashboard.tsx

# Replace in DODLeaveManagement  
sed -i 's/DirectStudentSelector/PowerfulStudentSelector/g' src/app/pages/dod/DODLeaveManagement.tsx
sed -i 's/placeholder="Search by name, ID, trade, or level..."/placeholder="Andika izina, kode, umwuga cyangwa urwego..." showAdvancedFilters={true} showStudentStats={true} enableVoiceSearch={true} showFavorites={true}/g' src/app/pages/dod/DODLeaveManagement.tsx

# Replace in StudentManagementPanel
sed -i 's/DirectStudentSelector/PowerfulStudentSelector/g' src/app/components/management/StudentManagementPanel.tsx
sed -i 's/placeholder="Search student to copy trade\/level..."/placeholder="Andika izina, kode, umwuga cyangwa urwego..." showAdvancedFilters={true} showStudentStats={true} enableVoiceSearch={true} showFavorites={true}/g' src/app/components/management/StudentManagementPanel.tsx

# Replace in TeacherManagementPanel
sed -i 's/DirectStudentSelector/PowerfulStudentSelector/g' src/app/components/management/TeacherManagementPanel.tsx
sed -i 's/placeholder="Search student to get trade info..."/placeholder="Andika izina, kode, umwuga cyangwa urwego..." showAdvancedFilters={true} showStudentStats={true} enableVoiceSearch={true} showFavorites={true}/g' src/app/components/management/TeacherManagementPanel.tsx

# Replace in DOSStudentManagement
sed -i 's/DirectStudentSelector/PowerfulStudentSelector/g' src/app/components/DOSStudentManagement.tsx
sed -i 's/placeholder="Search student to copy trade\/level..."/placeholder="Andika izina, kode, umwuga cyangwa urwego..." showAdvancedFilters={true} showStudentStats={true} enableVoiceSearch={true} showFavorites={true}/g' src/app/components/DOSStudentManagement.tsx

echo "✅ PowerfulStudentSelector Yasimbuwe Ahantu Hose!"
echo "🎯 Sisitemu Ikomeye Yarangiye!"
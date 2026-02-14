# 🚀 Quick Integration Guide - Add Global Sheets to Any Dashboard

## ⚡ 3-Step Integration

### Step 1: Import Component
```tsx
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';
```

### Step 2: Add Tab (if using Tabs)
```tsx
<TabsList>
  {/* ... other tabs ... */}
  <TabsTrigger value="global-sheets">
    Imbonerahamwe y'Abanyeshuri
  </TabsTrigger>
</TabsList>
```

### Step 3: Add Content
```tsx
<TabsContent value="global-sheets">
  <GlobalStudentSheets onNavigate={onNavigate} />
</TabsContent>
```

---

## 📝 Complete Examples

### Example 1: Accountant Dashboard
```tsx
// File: src/app/pages/dashboards/AccountantDashboard.tsx

import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';

export default function AccountantDashboard() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Incamake</TabsTrigger>
        <TabsTrigger value="global-sheets">Imbonerahamwe Rusange</TabsTrigger>
        <TabsTrigger value="payments">Kwishyura</TabsTrigger>
      </TabsList>
      
      <TabsContent value="global-sheets">
        <GlobalStudentSheets onNavigate={onNavigate} />
      </TabsContent>
    </Tabs>
  );
}
```

### Example 2: DOS Dashboard
```tsx
// File: src/app/pages/dashboards/DOSDashboard.tsx

import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';

export default function DOSDashboard() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="global-sheets">Global Student Sheets</TabsTrigger>
        <TabsTrigger value="academics">Academics</TabsTrigger>
      </TabsList>
      
      <TabsContent value="global-sheets">
        <GlobalStudentSheets onNavigate={onNavigate} />
      </TabsContent>
    </Tabs>
  );
}
```

### Example 3: DOD Dashboard
```tsx
// File: src/app/pages/dashboards/DODDashboard.tsx

import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';

export default function DODDashboard() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="global-sheets">Student Sheets</TabsTrigger>
        <TabsTrigger value="discipline">Discipline</TabsTrigger>
      </TabsList>
      
      <TabsContent value="global-sheets">
        <GlobalStudentSheets onNavigate={onNavigate} />
      </TabsContent>
    </Tabs>
  );
}
```

### Example 4: Teacher Dashboard
```tsx
// File: src/app/pages/dashboards/TeacherDashboard.tsx

import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';

export default function TeacherDashboard() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="global-sheets">My Students</TabsTrigger>
        <TabsTrigger value="marks">Marks</TabsTrigger>
      </TabsList>
      
      <TabsContent value="global-sheets">
        <GlobalStudentSheets onNavigate={onNavigate} />
      </TabsContent>
    </Tabs>
  );
}
```

---

## 🎨 Customization Options

### Option 1: With Custom Title
```tsx
<Card>
  <CardHeader>
    <CardTitle>Imbonerahamwe y'Abanyeshuri - Global Student Sheet</CardTitle>
  </CardHeader>
  <CardContent>
    <GlobalStudentSheets onNavigate={onNavigate} />
  </CardContent>
</Card>
```

### Option 2: With Icon
```tsx
import { Users } from 'lucide-react';

<TabsTrigger value="global-sheets">
  <Users className="w-4 h-4 mr-2" />
  Global Sheets
</TabsTrigger>
```

### Option 3: Standalone Page
```tsx
// File: src/app/pages/GlobalStudentSheetsPage.tsx

import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';

export default function GlobalStudentSheetsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Global Student Sheets</h1>
        <GlobalStudentSheets onNavigate={onNavigate} />
      </div>
    </div>
  );
}
```

---

## 🔧 Backend Integration

### Ensure Route is Mounted
Check `backend/server.js`:

```javascript
// Should already be there:
if (routes.globalStudentSheets) { 
  app.use('/api/global-sheets', routes.globalStudentSheets); 
  mountedRoutes++; 
}
```

### Test API Endpoint
```bash
# Get all students
curl -X GET http://localhost:5000/api/global-sheets/students \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get statistics
curl -X GET http://localhost:5000/api/global-sheets/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Verification Steps

After adding to a dashboard:

1. **Login** as the staff role
2. **Navigate** to the dashboard
3. **Click** on the Global Sheets tab
4. **Verify** you can see students
5. **Test** search functionality
6. **Test** filter by trade/level
7. **Test** export to CSV
8. **Check** permissions (edit/delete buttons)

---

## 🎯 Role-Specific Labels

Use appropriate labels for each role:

### Accountant
```tsx
<TabsTrigger value="global-sheets">
  Amafaranga y'Abanyeshuri
</TabsTrigger>
```

### DOS
```tsx
<TabsTrigger value="global-sheets">
  Academic Records
</TabsTrigger>
```

### DOD
```tsx
<TabsTrigger value="global-sheets">
  Discipline Records
</TabsTrigger>
```

### Teacher
```tsx
<TabsTrigger value="global-sheets">
  My Students
</TabsTrigger>
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Component Not Found
```bash
# Solution: Check import path
import GlobalStudentSheets from '@/app/components/GlobalStudentSheets';
```

### Issue 2: No Data Showing
```bash
# Solution: Run sync script
cd backend
node integrate-global-sheets-all-roles.js
```

### Issue 3: Permission Denied
```bash
# Solution: Check role permissions in database
SELECT * FROM role_permissions 
WHERE role_name = 'your_role';
```

### Issue 4: API Error
```bash
# Solution: Verify backend route is mounted
# Check server.js for:
app.use('/api/global-sheets', routes.globalStudentSheets);
```

---

## 📦 Required Dependencies

Ensure these are installed:

```json
{
  "dependencies": {
    "react": "^18.x",
    "lucide-react": "^0.x",
    "@/app/components/ui/card": "latest",
    "@/app/components/ui/button": "latest",
    "@/app/components/ui/input": "latest",
    "@/app/components/ui/select": "latest",
    "@/app/components/ui/tabs": "latest"
  }
}
```

---

## 🎨 Styling Tips

### Match Dashboard Theme
```tsx
// Use gradient matching your dashboard
<TabsTrigger 
  value="global-sheets"
  className="data-[state=active]:bg-gradient-to-r 
             data-[state=active]:from-green-500 
             data-[state=active]:to-teal-500 
             data-[state=active]:text-white"
>
  Global Sheets
</TabsTrigger>
```

### Custom Card Styling
```tsx
<Card className="border-2 border-green-200 shadow-xl">
  <CardContent>
    <GlobalStudentSheets onNavigate={onNavigate} />
  </CardContent>
</Card>
```

---

## 📊 Feature Flags

Enable/disable features based on role:

```tsx
const userRole = getUserRole(); // Get from auth context

<GlobalStudentSheets 
  onNavigate={onNavigate}
  canEdit={['headmaster', 'dos', 'accountant'].includes(userRole)}
  canDelete={['headmaster', 'dos'].includes(userRole)}
  canExport={true}
/>
```

---

## 🔄 Auto-Refresh

Add auto-refresh for real-time data:

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    // Refresh data every 5 minutes
    fetchStudentData();
  }, 300000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 📱 Responsive Design

The component is already responsive, but you can customize:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <GlobalStudentSheets onNavigate={onNavigate} />
</div>
```

---

## ✨ Success!

Once integrated, your dashboard will have:
- ✅ Full student data access
- ✅ Search and filter capabilities
- ✅ Export to CSV
- ✅ Role-based permissions
- ✅ Real-time statistics
- ✅ Beautiful UI

---

**Need More Help?**
- Check [GLOBAL_SHEETS_ALL_ROLES.md](GLOBAL_SHEETS_ALL_ROLES.md)
- Review [GLOBAL_STUDENT_SHEETS_GUIDE.md](GLOBAL_STUDENT_SHEETS_GUIDE.md)
- Contact development team

---

**Quick Links:**
- Component: `src/app/components/GlobalStudentSheets.tsx`
- API: `/api/global-sheets/students`
- Backend: `backend/routes/global-student-sheets.js`
- Database: `global_student_sheets` table

# ParentManagementWidget Integration Guide

## ✅ Successfully Integrated

The `ParentManagementWidget` has been integrated into the following dashboards:

### 1. **DOD Dashboard Advanced** ✅
- **Location**: `src/app/pages/dashboards/DODDashboardAdvanced.tsx`
- **Integration**: Shows parent count badge with hover tooltip displaying compact parent widget
- **Usage**: Hover over the parent count badge in the student table to see linked parents

### 2. **DOS Dashboard Ultra Advanced** ✅
- **Location**: `src/app/pages/dashboards/DOSDashboardUltraAdvanced.tsx`
- **Integration**: Import added, ready for implementation in student actions
- **Usage**: Can be added to student detail views or action buttons

### 3. **Teacher Portal Ultra Advanced** (Material-UI)
- **Location**: `src/app/pages/dashboards/TeacherPortalUltraAdvanced.tsx`
- **Note**: Uses Material-UI, requires adapter component for shadcn/ui compatibility

### 4. **Accountant Dashboard Ultra Advanced** (Material-UI)
- **Location**: `src/app/pages/dashboards/AccountantDashboardUltraAdvanced.tsx`
- **Note**: Uses Material-UI, requires adapter component for shadcn/ui compatibility

## 📋 Widget Props

```tsx
interface ParentManagementWidgetProps {
  studentId?: number;        // Show parents for specific student
  showAllParents?: boolean;  // Show all parents in system
  compact?: boolean;         // Compact view for tooltips/popovers
}
```

## 🎯 Usage Examples

### DOD Dashboard - Student Table
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Badge variant={s.linked_parents > 0 ? 'default' : 'outline'} className="gap-1 cursor-pointer">
      <Phone className="size-3" />
      {s.linked_parents || 0}
    </Badge>
  </TooltipTrigger>
  <TooltipContent>
    <ParentManagementWidget studentId={s.id} compact={true} />
  </TooltipContent>
</Tooltip>
```

### DOS Dashboard - Full View
```tsx
<ParentManagementWidget showAllParents={true} />
```

### Teacher Dashboard - Compact View
```tsx
<ParentManagementWidget studentId={456} compact={true} />
```

### Accountant Dashboard - All Parents
```tsx
<ParentManagementWidget showAllParents={true} />
```

## 🔧 Features

### Compact Mode (`compact={true}`)
- Minimal card layout
- Shows up to 3 parents
- Quick contact button
- Link parent button
- Perfect for tooltips and popovers

### Full Mode (default)
- Complete parent list
- Individual contact buttons
- Link new parent functionality
- Refresh capability
- Relationship badges

## 🚀 API Endpoints Used

- `GET /dod-parent-management/parents` - Get all parents
- `GET /dod-parent-management/parents/:studentId/students` - Get parents for student
- `POST /dod-parent-management/contact-student-parents` - Send message to parents
- `POST /dod-parent-management/auto-link-parent` - Link parent to student

## 📱 Contact Methods

- SMS
- WhatsApp
- Subject and message fields
- Priority levels

## 🎨 Styling

- Uses shadcn/ui components
- Tailwind CSS classes
- Lucide React icons
- Responsive design
- Toast notifications via sonner

## ⚠️ Material-UI Dashboards

For Teacher and Accountant dashboards that use Material-UI, you'll need to:

1. Create an adapter component that wraps shadcn/ui in Material-UI Dialog
2. Or refactor those sections to use shadcn/ui components
3. Or create a Material-UI version of the widget

## 🔄 Next Steps

1. Test the DOD Dashboard integration
2. Add widget to DOS Dashboard student detail views
3. Create Material-UI adapter for Teacher/Accountant dashboards
4. Add parent management to other role dashboards as needed

## 📝 Notes

- Widget automatically handles loading states
- Error handling with toast notifications
- Real-time data refresh
- Supports multiple parents per student
- Auto-linking creates parent if doesn't exist

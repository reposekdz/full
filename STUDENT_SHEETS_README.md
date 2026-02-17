# Global Student Management Sheets

Excel-like table system for managing students across different school roles.

## Features

### Core Functionality
- ✅ **Search & Filter** - Real-time search by name/ID, filter by grade and class
- ✅ **Sorting** - Click column headers to sort ascending/descending
- ✅ **Inline Editing** - Edit student data directly in the table
- ✅ **Bulk Selection** - Select multiple rows for batch operations
- ✅ **Export to CSV** - Download filtered data as Excel-compatible CSV
- ✅ **Import from CSV** - Upload student data from spreadsheets
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

### Role-Specific Views

#### 1. Accountant Sheet
**Columns:** Name, Grade, Class, Age, Gender, Guardian Name, Guardian Phone, Fees, Fees Paid, Fees Balance, Status

**Features:**
- Total fees overview
- Payment tracking
- Balance calculations
- Collection rate metrics

#### 2. Director of Discipline (DOD) Sheet
**Columns:** Name, Grade, Class, Age, Gender, Attendance, Behavior, Guardian Phone, Status

**Features:**
- Behavior tracking (excellent/good/poor)
- Attendance monitoring
- Discipline metrics
- Quick contact access

#### 3. Director of Studies (DOS) Sheet
**Columns:** Name, Grade, Class, Age, Gender, Academic Performance, Subjects, Attendance, Status

**Features:**
- Academic performance tracking
- Subject enrollment
- Top performers identification
- Students needing support

#### 4. Teacher Sheet
**Columns:** Name, Grade, Class, Age, Gender, Academic Performance, Attendance, Behavior, Subjects

**Features:**
- Class management
- Performance monitoring
- Attendance tracking
- Behavior overview

## Usage

### Basic Implementation

```tsx
import { AccountantSheet } from '@/app/components/tables';
import { generateSampleStudents } from '@/app/utils/sampleData';

function MyComponent() {
  const students = generateSampleStudents(50);
  
  return (
    <AccountantSheet 
      students={students}
      onUpdate={(updatedStudents) => {
        // Handle updates
        console.log('Students updated:', updatedStudents);
      }}
    />
  );
}
```

### Using Different Roles

```tsx
import { DODSheet, DOSSheet, TeacherSheet } from '@/app/components/tables';

// Director of Discipline
<DODSheet students={students} />

// Director of Studies
<DOSSheet students={students} />

// Teacher
<TeacherSheet students={students} />
```

### Demo Page

```tsx
import { StudentSheetsDemo } from '@/app/pages/StudentSheetsDemo';

// Shows all sheets with tabs
<StudentSheetsDemo />
```

## Data Structure

```typescript
interface Student {
  id: string;                    // Unique identifier
  name: string;                  // Full name
  grade: string;                 // S1-S6
  class: string;                 // A, B, C
  age: number;                   // Student age
  gender: string;                // Male/Female
  guardianName: string;          // Parent/Guardian name
  guardianPhone: string;         // Contact number
  fees: number;                  // Total fees
  feesPaid: number;             // Amount paid
  feesBalance: number;          // Outstanding balance
  attendance: number;           // Percentage (0-100)
  behavior: string;             // excellent/good/poor
  academicPerformance: number;  // Percentage (0-100)
  subjects: string[];           // Enrolled subjects
  enrollmentDate: string;       // ISO date string
  status: 'active' | 'suspended' | 'graduated';
}
```

## Advanced Features

### Custom Filtering
```tsx
const filteredStudents = students.filter(s => 
  s.grade === 'S6' && s.academicPerformance >= 80
);
```

### Export with Custom Columns
The export function automatically includes only role-relevant columns.

### Bulk Operations
Select multiple rows and perform batch updates or deletions.

## Styling

All components use Tailwind CSS and shadcn/ui components for consistent, modern styling.

## Performance

- Optimized with React.useMemo for filtering/sorting
- Handles 1000+ students smoothly
- Virtual scrolling ready for larger datasets

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Future Enhancements

- [ ] Advanced filtering (multiple conditions)
- [ ] Column customization
- [ ] Print layouts
- [ ] PDF export
- [ ] Real-time collaboration
- [ ] Audit logs
- [ ] Data validation rules
- [ ] Custom formulas

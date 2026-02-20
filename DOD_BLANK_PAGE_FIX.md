# DOD Dashboard Blank Page - Diagnostic & Fix

## Issue
The DOD management system at `http://localhost:5173/dashboard-director-discipline` shows a blank page.

## Root Causes (Most Likely)

### 1. **Missing UI Components**
The DODDashboardAdvanced component imports many shadcn/ui components that might not exist:
- Card, CardContent, CardHeader, etc.
- Badge, Button, Input
- Dialog, Select, Table
- Progress, Tooltip, Avatar

### 2. **API Fetch Errors**
The component fetches data on mount:
```typescript
useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);
```

If the API fails, the component might crash silently.

### 3. **Authentication Context**
```typescript
const { user } = useAuth();
```
If `user` is undefined, some parts might fail.

### 4. **Motion/Framer Issues**
```typescript
import { motion, AnimatePresence } from 'motion/react';
```
Should be `framer-motion`, not `motion/react`.

## Quick Fixes

### Fix 1: Check Browser Console
Open browser DevTools (F12) and check Console tab for errors.

### Fix 2: Add Error Boundary
Wrap the component with error handling:

```typescript
// In App.tsx, line 265
if (currentPage === 'dashboard-director-discipline' && (user?.role === 'director_discipline' || user?.role === 'dod')) {
  try {
    return <DODDashboard onNavigate={handleNavigate} onLogout={logout} />;
  } catch (error) {
    console.error('DOD Dashboard Error:', error);
    return <div className="p-8 text-center">
      <h2 className="text-xl font-bold text-red-600">Error Loading Dashboard</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Reload Page
      </button>
    </div>;
  }
}
```

### Fix 3: Fix Framer Motion Import
In `DODDashboardAdvanced.tsx`, line 8:
```typescript
// Change from:
import { motion, AnimatePresence } from 'motion/react';

// To:
import { motion, AnimatePresence } from 'framer-motion';
```

### Fix 4: Add Loading State
The component might be rendering before data loads. Check if there's a loading indicator.

### Fix 5: Verify API Endpoints
Check if these endpoints exist:
- `/api/comprehensive-roles/students`
- `/api/dod-complete/students/all`
- `/api/dod/sod-students`

## Testing Steps

1. **Open Browser Console** (F12)
2. **Navigate to** `http://localhost:5173/dashboard-director-discipline`
3. **Check for errors** in Console tab
4. **Check Network tab** for failed API calls
5. **Check if user is authenticated** - look for token in localStorage

## Expected Errors

### Error 1: "Cannot read property 'role' of undefined"
**Fix**: User context not loaded. Add null check:
```typescript
if (!user) {
  return <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>;
}
```

### Error 2: "Module not found: Can't resolve 'motion/react'"
**Fix**: Change import to `framer-motion`

### Error 3: "Cannot find module '@/app/components/ui/card'"
**Fix**: Install shadcn/ui components or create them

### Error 4: "Failed to fetch"
**Fix**: Backend not running or wrong API URL

## Quick Test Component

Create a minimal test to isolate the issue:

```typescript
// Test component
const DODDashboardTest = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">DOD Dashboard Test</h1>
      <p>If you see this, the route works!</p>
    </div>
  );
};

// In App.tsx, temporarily replace:
if (currentPage === 'dashboard-director-discipline') {
  return <DODDashboardTest />;
}
```

## Solution Priority

1. ✅ **Check browser console** (30 seconds)
2. ✅ **Fix framer-motion import** (1 minute)
3. ✅ **Add error boundary** (2 minutes)
4. ✅ **Verify backend is running** (1 minute)
5. ✅ **Check authentication** (1 minute)

## Most Likely Fix

The issue is probably the **framer-motion import**. Change line 8 in `DODDashboardAdvanced.tsx`:

```typescript
import { motion, AnimatePresence } from 'framer-motion';
```

Then restart the dev server:
```bash
npm run dev
```

# App.tsx Update Instructions

## Changes Required to Complete Session 5 Integration

### 1. Add New Imports (After line 52)

Add these imports after `import DirectorStudyDashboard from '@/app/pages/dashboards/DirectorStudyDashboard';`:

```typescript
import AdvisorDashboard from '@/app/pages/dashboards/AdvisorDashboard';
import DOSDashboard from '@/app/pages/dashboards/DOSDashboard';
import ModernHeadmasterDashboard from '@/app/pages/dashboards/ModernHeadmasterDashboard';
import ModernStockManagerDashboard from '@/app/pages/dashboards/ModernStockManagerDashboard';
```

### 2. Update Line 63 (Old HeadMasterDashboard)

**Before:**
```typescript
import HeadMasterDashboard from '@/app/pages/dashboards/HeadMasterDashboard';
```

**After:**
```typescript
// OLD: import HeadMasterDashboard from '@/app/pages/dashboards/HeadMasterDashboard';
```

### 3. Update Line 78 (Old StockManagerDashboard)

**Before:**
```typescript
import StockManagerDashboard from '@/app/pages/dashboards/StockManagerDashboard';
```

**After:**
```typescript
// OLD: import StockManagerDashboard from '@/app/pages/dashboards/StockManagerDashboard';
```

### 4. Update Line 98 (ComprehensiveAdvisorPortal - no longer needed)

**Before:**
```typescript
import ComprehensiveAdvisorPortal from '@/app/pages/portals/ComprehensiveAdvisorPortal';
```

**After:**
```typescript
// OLD: import ComprehensiveAdvisorPortal from '@/app/pages/portals/ComprehensiveAdvisorPortal';
```

### 5. Update renderDashboard() function (Lines 180-197)

**Before:**
```typescript
      case 'advisor':
        return <ComprehensiveAdvisorPortal onNavigate={handleNavigate} onLogout={logout} />;
      case 'director_study':
        return <DirectorStudyDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'director_discipline':
        ...
      case 'headmaster':
        return <HeadMasterDashboard onNavigate={handleNavigate} onLogout={logout} />;
```

**After:**
```typescript
      case 'advisor':
        return <AdvisorDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'dos':
        return <DOSDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'director_study':
        return <DirectorStudyDashboard onNavigate={handleNavigate} onLogout={logout} />;
      case 'director_discipline':
        ...
      case 'headmaster':
        return <ModernHeadmasterDashboard onNavigate={handleNavigate} onLogout={logout} />;
```

### 6. Update Line 217-218 (stock_manager case)

**Before:**
```typescript
      case 'stock_manager':
        return <StockManagerDashboard onNavigate={handleNavigate} onLogout={logout} />;
```

**After:**
```typescript
      case 'stock_manager':
        return <ModernStockManagerDashboard onNavigate={handleNavigate} onLogout={logout} />;
```

### 7. Update renderPage() function (Lines 242-248)

**Before:**
```typescript
    if (currentPage === 'dashboard-advisor' && user?.role === 'advisor') return <ComprehensiveAdvisorPortal onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-director-study' && user?.role === 'director_study') return <DirectorStudyDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-director-discipline' && user?.role === 'director_discipline') return <DODDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-headmaster' && user?.role === 'headmaster') return <HeadMasterDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-teacher' && user?.role === 'teacher') return <TeacherDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-accountant' && user?.role === 'accountant') return <AccountantDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-stock' && user?.role === 'stock_manager') return <StockManagerDashboard onNavigate={handleNavigate} onLogout={logout} />;
```

**After:**
```typescript
    if (currentPage === 'dashboard-advisor' && user?.role === 'advisor') return <AdvisorDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-dos' && user?.role === 'dos') return <DOSDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-dod' && user?.role === 'dod') return <DODDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-director-study' && user?.role === 'director_study') return <DirectorStudyDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-director-discipline' && user?.role === 'director_discipline') return <DODDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-headmaster' && user?.role === 'headmaster') return <ModernHeadmasterDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-teacher' && user?.role === 'teacher') return <TeacherDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-accountant' && user?.role === 'accountant') return <AccountantDashboard onNavigate={handleNavigate} onLogout={logout} />;
    if (currentPage === 'dashboard-stock' && user?.role === 'stock_manager') return <ModernStockManagerDashboard onNavigate={handleNavigate} onLogout={logout} />;
```

## Summary of Changes

1. ✅ Import Session 5 dashboards: `AdvisorDashboard`, `DOSDashboard`
2. ✅ Import new modern dashboards: `ModernHeadmasterDashboard`, `ModernStockManagerDashboard`  
3. ✅ Replace old imports with new ones
4. ✅ Add `dashboard-dos` route for DOS role
5. ✅ Add `dashboard-dod` route for DOD role (using Session 5 DODDashboard)
6. ✅ Update all routing to use new dashboards

## Files Created in This Update

1. `src/app/pages/dashboards/ModernHeadmasterDashboard.tsx` - Modern headmaster dashboard with real APIs
2. `src/app/pages/dashboards/ModernStockManagerDashboard.tsx` - Modern stock manager dashboard with real APIs

## Backend APIs Available

All dashboards now use real backend APIs:

- **Advisor**: `/api/staff/advisor/*` (5 endpoints)
- **DOS**: `/api/staff/dos/*` (4 endpoints)  
- **DOD**: `/api/staff/dod/*` (4 endpoints)
- **Accountant**: `/api/staff/accountant/*` (4 endpoints)
- **Headmaster**: `/api/staff/headmaster/*` (2 endpoints)
- **Stock Manager**: `/api/staff/stock/*` (4 endpoints)

All 40+ backend endpoints are functional and mounted at `/api/staff`.

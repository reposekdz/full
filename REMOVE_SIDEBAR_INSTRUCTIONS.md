# Instructions to Remove Sidebar and Make Full-Width Responsive Dashboard

## Changes Needed:

1. **Remove the entire sidebar section** (lines 570-615)
2. **Remove mobile overlay** (lines 562-569)
3. **Remove mobile header** (lines 617-625)
4. **Change main wrapper** from `flex` to full-width
5. **Remove `sidebarOpen` state and related logic**

## Replace the return statement starting at line 561 with:

```tsx
return (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-lime-50">
    {/* Top Navigation */}
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-2xl">
      <div className="max-w-[2000px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          <div className="flex items-center gap-2 sm:gap-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
            <div>
              <h1 className="text-sm sm:text-lg lg:text-2xl font-black">DOD Dashboard</h1>
              <p className="text-[10px] sm:text-xs opacity-90 hidden sm:block">Director of Discipline</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button onClick={() => setShowConductModal(true)} size="sm" className="bg-red-500 hover:bg-red-600 px-2 sm:px-3 py-1 sm:py-2">
              <Ban className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button onClick={() => setShowLeaveModal(true)} size="sm" className="bg-green-500 hover:bg-green-600 px-2 sm:px-3 py-1 sm:py-2">
              <Plane className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button onClick={() => onNavigate('profile')} size="sm" variant="outline" className="border-white/30 px-2 sm:px-3 py-1 sm:py-2">
              <UserCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['overview', 'students', 'inspections', 'counseling', 'wellness', 'appeals', 'recognition', 'dormitory', 'statistics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-t-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-green-600 shadow-lg' : 'hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </nav>

    {/* Main Content */}
    <div className="max-w-[2000px] mx-auto p-2 sm:p-4 lg:p-6">
```

Then continue with the rest of the dashboard content (Success Message, Header, Main Layout, etc.)

## Remove these lines:
- Line 29: `const [sidebarOpen, setSidebarOpen] = useState(false);`
- Lines 175-186: The resize handler in useEffect
- Lines 562-625: Entire sidebar and mobile header section

The dashboard will now be full-width with a top navigation bar instead of a left sidebar.

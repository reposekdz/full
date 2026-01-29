# 🚀 Guide: Enhancing All Role Dashboards with Real APIs

## 📋 Overview

This guide shows how to enhance ALL staff role dashboards to fetch real data from the database, following the pattern used in ComprehensiveDODDashboard.

## 🎯 Roles to Enhance

1. ✅ **Director of Discipline (DOD)** - COMPLETED
2. 🔄 **Director of Studies (DOS)** - TO DO
3. 🔄 **Accountant** - TO DO
4. 🔄 **Teacher** - PARTIALLY DONE
5. 🔄 **Advisor** - TO DO
6. 🔄 **HeadMaster** - TO DO
7. 🔄 **Stock Manager** - TO DO

## 📊 Global Data Sources

### **Students Data (Global)**
All roles should fetch students from:
```typescript
// Get all students with trade and level info
const studentsRes = await apiService.getStudents();

// Filter by trade
const studentsRes = await apiService.getStudents({ trade_code: 'SOD' });

// Filter by level
const studentsRes = await apiService.getStudents({ level_number: 3 });

// Filter by both
const studentsRes = await apiService.getStudents({ 
  trade_code: 'SOD', 
  level_number: 3 
});
```

### **Trades and Levels (Global)**
```typescript
// Get all trades with nested levels
const tradesRes = await apiService.getTradesWithLevels();
// Returns: [
//   { code: 'SOD', name: 'Software Development', levels: [3,4,5] },
//   { code: 'BDC', name: 'Building Construction', levels: [3,4,5] },
//   { code: 'AUT', name: 'Automotive', levels: [3,4A,4B,5A,5B] }
// ]

// Get specific trade levels
const levelsRes = await apiService.getTradesByLevel('SOD');
```

## 🔧 Pattern to Follow

### **1. State Management**
```typescript
const [loading, setLoading] = useState(true);
const [students, setStudents] = useState<any[]>([]);
const [trades, setTrades] = useState<any[]>([]);
const [selectedTrade, setSelectedTrade] = useState('');
const [selectedLevel, setSelectedLevel] = useState('');
const [searchQuery, setSearchQuery] = useState('');
```

### **2. Data Fetching**
```typescript
useEffect(() => {
  fetchAllData();
}, []);

const fetchAllData = async () => {
  try {
    setLoading(true);
    
    const [tradesRes, studentsRes, ...otherData] = await Promise.all([
      apiService.getTradesWithLevels(),
      apiService.getStudents(),
      // Add other API calls here
    ]);

    if (tradesRes.success) setTrades(tradesRes.trades || []);
    if (studentsRes.success) setStudents(studentsRes.students || []);
    
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
};
```

### **3. Filtering**
```typescript
const filteredStudents = students.filter(s => {
  const matchesSearch = searchQuery === '' || 
    s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesTrade = !selectedTrade || s.trade_code === selectedTrade;
  const matchesLevel = !selectedLevel || s.level_number?.toString() === selectedLevel;
  return matchesSearch && matchesTrade && matchesLevel;
});
```

### **4. UI Components**
```typescript
// Search Input
<Input
  placeholder="Shakisha umunyeshuri..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

// Trade Filter
<Select value={selectedTrade} onValueChange={setSelectedTrade}>
  <SelectTrigger>
    <SelectValue placeholder="Hitamo Umwuga" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">Imyuga Yose</SelectItem>
    {trades.map(trade => (
      <SelectItem key={trade.code} value={trade.code}>
        {trade.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// Level Filter
<Select value={selectedLevel} onValueChange={setSelectedLevel}>
  <SelectTrigger>
    <SelectValue placeholder="Hitamo Urwego" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="">Inzego Zose</SelectItem>
    {selectedTrade && trades.find(t => t.code === selectedTrade)?.levels?.map((level: any) => (
      <SelectItem key={level.level_number} value={level.level_number.toString()}>
        Level {level.level_number}{level.level_suffix || ''}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

## 📝 Role-Specific Enhancements

### **2. Director of Studies (DOS)**

#### **Additional APIs Needed:**
```typescript
// In apiService.ts - Already exists!
async getDOSStudents(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/dos/students?${query}`);
}

async getDOSTeachers() {
  return this.request('/dos-advanced/teachers');
}

async getDOSClasses() {
  return this.request('/dos/classes');
}

async getDOSAnalytics(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/dos/analytics?${query}`);
}
```

#### **Features to Add:**
- ✅ Student academic performance tracking
- ✅ Teacher assignment management
- ✅ Class scheduling
- ✅ Curriculum management
- ✅ Exam scheduling
- ✅ Grade analytics
- ✅ Attendance monitoring

### **3. Accountant**

#### **Additional APIs Needed:**
```typescript
// In apiService.ts - Already exists!
async getAccountantDashboard() {
  return this.request('/accountant/dashboard');
}

async getAccountantStudentPayments(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/accountant/student-payments?${query}`);
}

async recordAccountantPayment(paymentData: any) {
  return this.request('/accountant/record-payment', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
}
```

#### **Features to Add:**
- ✅ Student payment tracking by trade/level
- ✅ Fee collection reports
- ✅ Payment history
- ✅ Outstanding balances
- ✅ Receipt generation
- ✅ Financial analytics
- ✅ Budget management

### **4. Teacher**

#### **Additional APIs Needed:**
```typescript
// In apiService.ts - Already exists!
async getTeacherClasses() {
  return this.request('/teachers/classes');
}

async getClassStudents(classId: number) {
  return this.request(`/teachers/classes/${classId}/students`);
}

async submitGradesBulk(grades: any[]) {
  return this.request('/teachers/grades/bulk', {
    method: 'POST',
    body: JSON.stringify({ grades })
  });
}

async markAttendanceBulk(attendance: any[], classId: number, subjectId: number, date: string) {
  return this.request('/teachers/attendance/bulk', {
    method: 'POST',
    body: JSON.stringify({ attendance, class_id: classId, subject_id: subjectId, attendance_date: date })
  });
}
```

#### **Features to Add:**
- ✅ View students by class (with trade/level)
- ✅ Grade entry by trade/level
- ✅ Attendance marking
- ✅ Assignment creation
- ✅ Student performance analytics
- ✅ Class schedule view

### **5. Advisor**

#### **APIs to Create:**
```typescript
// Add to apiService.ts
async getAdvisorStudents(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/advisor/students?${query}`);
}

async getAdvisorSessions(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/advisor/sessions?${query}`);
}

async createAdvisorSession(sessionData: any) {
  return this.request('/advisor/sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData)
  });
}

async getStudentCounselingHistory(studentId: number) {
  return this.request(`/advisor/students/${studentId}/history`);
}
```

#### **Features to Add:**
- ✅ Student counseling sessions
- ✅ Mental health tracking
- ✅ Career guidance
- ✅ Student progress monitoring
- ✅ Parent communication
- ✅ Referral system

### **6. HeadMaster**

#### **APIs to Create:**
```typescript
// Add to apiService.ts
async getHeadMasterAnalytics() {
  return this.request('/headmaster/analytics');
}

async getSchoolOverview() {
  return this.request('/headmaster/overview');
}

async getStaffPerformance() {
  return this.request('/headmaster/staff-performance');
}

async getSchoolReports(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/headmaster/reports?${query}`);
}
```

#### **Features to Add:**
- ✅ School-wide analytics
- ✅ Staff management
- ✅ Budget oversight
- ✅ Performance reports
- ✅ Strategic planning
- ✅ Parent communication

### **7. Stock Manager**

#### **Additional APIs Needed:**
```typescript
// In apiService.ts - Already exists!
async getStockItems(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/stock/items?${query}`);
}

async createStockItem(itemData: any) {
  return this.request('/stock/items', {
    method: 'POST',
    body: JSON.stringify(itemData)
  });
}

async getStockTransactions(params = {}) {
  const query = new URLSearchParams(params).toString();
  return this.request(`/stock/transactions?${query}`);
}
```

#### **Features to Add:**
- ✅ Inventory management
- ✅ Stock requisitions by trade
- ✅ Supplier management
- ✅ Purchase orders
- ✅ Stock alerts
- ✅ Usage analytics

## 🎨 UI Components to Reuse

### **From ComprehensiveDODDashboard:**
1. ✅ Search and filter system
2. ✅ Student list with avatars
3. ✅ Action buttons
4. ✅ Dialog modals
5. ✅ Stats cards
6. ✅ Tabs navigation
7. ✅ Loading states
8. ✅ Error handling

### **Shadcn/ui Components:**
- Card, CardContent, CardHeader, CardTitle
- Button, Input, Textarea
- Select, SelectContent, SelectItem
- Dialog, DialogContent, DialogHeader
- Tabs, TabsContent, TabsList, TabsTrigger
- Badge, Avatar, Progress
- ScrollArea

## 🔄 Implementation Steps

### **For Each Role:**

1. **Create Comprehensive Dashboard File**
   ```
   src/app/pages/dashboards/Comprehensive[Role]Dashboard.tsx
   ```

2. **Import Required Dependencies**
   ```typescript
   import { useState, useEffect } from 'react';
   import { motion } from 'motion/react';
   import apiService from '@/app/services/apiService';
   import { useAuth } from '@/app/contexts/AuthContext';
   // ... UI components
   ```

3. **Setup State Management**
   - Loading states
   - Data states
   - Filter states
   - Dialog states

4. **Implement Data Fetching**
   - fetchAllData() function
   - API calls via apiService
   - Error handling

5. **Create UI Layout**
   - Header with stats
   - Tabs for different sections
   - Filters (search, trade, level)
   - Data display components

6. **Add Action Handlers**
   - CRUD operations
   - Form submissions
   - API calls

7. **Update App.tsx**
   - Import new dashboard
   - Add to renderDashboard()
   - Update routes

8. **Test Thoroughly**
   - Test all features
   - Test with real data
   - Test error cases

## 📊 Database Schema Reference

### **Students Table:**
```sql
- id
- first_name
- last_name
- email
- phone
- trade_code (SOD, BDC, AUT)
- level_number (3, 4, 5)
- level_suffix (A, B for AUT)
- student_id
- enrollment_date
- status
```

### **Trades Table (courses):**
```sql
- id
- code (SOD, BDC, AUT)
- name
- description
- duration_years
```

### **Trades_Levels Table:**
```sql
- id
- trade_code
- level_number
- level_suffix
- description
```

## 🎯 Success Criteria

For each role dashboard:
- ✅ Fetches real data from database
- ✅ Displays students filtered by trade/level
- ✅ Has search functionality
- ✅ Has filter dropdowns
- ✅ Shows relevant statistics
- ✅ Provides role-specific actions
- ✅ Has modern, responsive UI
- ✅ Uses Kinyarwanda language
- ✅ Handles errors gracefully
- ✅ Has loading states

## 📞 Next Steps

1. **Choose a role to enhance** (recommend DOS next)
2. **Follow the pattern** from ComprehensiveDODDashboard
3. **Implement features** specific to that role
4. **Test thoroughly** with real data
5. **Document** any new APIs needed
6. **Repeat** for other roles

---

**Byakozwe na:** Amazon Q Developer  
**Pattern Source:** ComprehensiveDODDashboard  
**Status:** 🚀 Ready to Implement

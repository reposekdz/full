import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import {
  Users, FileText, RefreshCw, Search, Download as DownloadIcon, 
  Table as TableIcon, Settings, Link, MessageSquare, Phone, Mail,
  Eye, Edit, Trash2, UserPlus, Calendar, Award, DollarSign,
  AlertTriangle, CheckCircle, Clock, Filter, SortAsc, SortDesc,
  UserMinus, UserCheck, Ban, CheckSquare, XCircle, Send, FileDown,
  ArrowUpDown, Plus, X
} from 'lucide-react';
import { toast } from 'sonner';
import productionAPIService from '@/app/services/productionAPIService';
import { GLOBAL_TRADES, getLevelsForTrade } from '@/app/constants/tradesAndLevels';
import { Input } from './ui/input';
import { Button } from './ui/button';

// Dynamic imports for better code splitting
const XLSX = lazy(() => import('xlsx'));


interface GlobalStudentSheetsProps {
  userRole: string;
}

const GlobalStudentSheets: React.FC<GlobalStudentSheetsProps> = ({ userRole }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [formulaValue, setFormulaValue] = useState('');
  const [activeTrade, setActiveTrade] = useState('SOD');
  const [activeLevel, setActiveLevel] = useState<any>(null);
  const [markColumns, setMarkColumns] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '',
    address: ''
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const [showLinkParentModal, setShowLinkParentModal] = useState(false);
  const [showRemoveConductModal, setShowRemoveConductModal] = useState(false);
  const [showGrantLeaveModal, setShowGrantLeaveModal] = useState(false);
  const [showSendSMSModal, setShowSendSMSModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form states
  const [linkParentForm, setLinkParentForm] = useState({
    parent_phone: '',
    parent_name: '',
    relationship: 'guardian'
  });
  
  const [conductForm, setConductForm] = useState({
    points_removed: 1,
    incident_type: 'misconduct',
    description: '',
    severity: 'moderate'
  });
  
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'approved',
    start_date: '',
    end_date: '',
    reason: ''
  });
  
  const [smsForm, setSmsForm] = useState({
    message: '',
    priority: 'normal'
  });
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    averageConduct: 0,
    averageAttendance: 0,
    paymentStats: { paid: 0, pending: 0, overdue: 0 },
    genderDistribution: { male: 0, female: 0 },
    recentActivities: []
  });
  const [exportProgress, setExportProgress] = useState(0);
  const [bulkOperationProgress, setBulkOperationProgress] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState({ status: 'healthy', latency: 0 });
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: { start: '', end: '' },
    gradeRange: { min: 0, max: 100 },
    disciplinaryStatus: 'all',
    parentLinked: 'all',
    lastActivity: 'all'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'card' | 'list'>('grid');
  const [autoSave, setAutoSave] = useState(true);
  const [collaborativeMode, setCollaborativeMode] = useState(false);
  const [dataValidation, setDataValidation] = useState({
    duplicateCheck: true,
    formatValidation: true,
    businessRules: true
  });
  const canAddStudent = ['director_study', 'headmaster', 'admin', 'director_discipline'].includes(userRole);
  const canBulkEdit = ['director_study', 'headmaster', 'admin'].includes(userRole);
  const canViewAnalytics = ['director_study', 'headmaster', 'admin', 'director_discipline'].includes(userRole);
  const canExportData = ['director_study', 'headmaster', 'admin', 'teacher'].includes(userRole);
  const [filters, setFilters] = useState({
    conductScore: { min: 0, max: 40 },
    attendance: { min: 0, max: 100 },
    paymentStatus: 'all',
    gender: 'all'
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize trade and level
  useEffect(() => {
    const defaultTrade = GLOBAL_TRADES[0]?.code || 'SOD';
    setActiveTrade(defaultTrade);
    const levels = getLevelsForTrade(defaultTrade);
    if (levels.length > 0) setActiveLevel(levels[0]);
  }, []);

  // Real-time updates subscription
  useEffect(() => {
    if (!realTimeUpdates) return;

    const unsubscribe = productionAPIService.subscribeToUpdates('global-student-sheets', (data) => {
      console.log('Real-time update received:', data);
      
      switch (data.type) {
        case 'student_updated':
          setStudents(prev => prev.map(s => 
            s.id === data.studentId ? { ...s, ...data.updates } : s
          ));
          setLastUpdate(new Date());
          toast.info(`Student ${data.studentName} updated`);
          break;
        case 'student_added':
          if (data.student.trade_code === activeTrade && data.student.level_number === activeLevel?.level_number) {
            setStudents(prev => [...prev, data.student]);
            setLastUpdate(new Date());
            toast.success(`New student ${data.student.first_name} ${data.student.last_name} added`);
          }
          break;
        case 'student_deleted':
          setStudents(prev => prev.filter(s => s.id !== data.studentId));
          setLastUpdate(new Date());
          toast.info(`Student removed from list`);
          break;
        case 'conduct_updated':
          setStudents(prev => prev.map(s => 
            s.id === data.studentId ? { ...s, conduct_score: data.newScore } : s
          ));
          setLastUpdate(new Date());
          toast.info(`Conduct updated for ${data.studentName}`);
          break;
        case 'parent_linked':
          setStudents(prev => prev.map(s => 
            s.id === data.studentId ? { ...s, parent_linked: true } : s
          ));
          setLastUpdate(new Date());
          toast.success(`Parent linked to ${data.studentName}`);
          break;
        case 'bulk_update':
          if (data.studentIds.some(id => students.find(s => s.id === id))) {
            fetchSheetData(); // Refresh all data for bulk updates
            setLastUpdate(new Date());
            toast.info(`Bulk update completed for ${data.studentIds.length} students`);
          }
          break;
      }
    });

    return unsubscribe;
  }, [realTimeUpdates, activeTrade, activeLevel, students]);

  // Advanced analytics and monitoring
  useEffect(() => {
    if (canViewAnalytics) {
      fetchAnalytics();
      const analyticsInterval = setInterval(fetchAnalytics, 60000);
      return () => clearInterval(analyticsInterval);
    }
  }, [activeTrade, activeLevel, students]);

  // System health monitoring
  useEffect(() => {
    const healthCheck = async () => {
      const start = Date.now();
      try {
        await productionAPIService.healthCheck();
        setSystemHealth({ status: 'healthy', latency: Date.now() - start });
      } catch (error) {
        setSystemHealth({ status: 'degraded', latency: Date.now() - start });
      }
    };
    
    healthCheck();
    const healthInterval = setInterval(healthCheck, 30000);
    return () => clearInterval(healthInterval);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && selectedStudents.length > 0) {
      const saveTimeout = setTimeout(() => {
        saveSelectionState();
      }, 5000);
      return () => clearTimeout(saveTimeout);
    }
  }, [selectedStudents, autoSave]);

  const fetchAnalytics = async () => {
    try {
      const response = await productionAPIService.getAnalytics('student-overview', {
        trade: activeTrade,
        level: activeLevel?.level_number
      });
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Analytics fetch failed:', error);
    }
  };

  const saveSelectionState = async () => {
    try {
      await productionAPIService.request('/user-preferences/selection-state', {
        method: 'POST',
        body: JSON.stringify({
          selectedStudents,
          filters,
          sortConfig,
          viewMode
        })
      });
    } catch (error) {
      console.error('Failed to save selection state:', error);
    }
  };
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      fetchSheetData();
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTrade, activeLevel, realTimeUpdates]);

  const fetchSheetData = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const levelNum = activeLevel.level_number;
      const suffix = activeLevel.level_suffix || '';

      const filters = {
        trade_id: activeTrade,
        level_id: levelNum,
        ...(suffix && { level_suffix: suffix }),
        ...advancedFilters,
        include_analytics: canViewAnalytics,
        include_audit_trail: true,
        cache_duration: 300
      };

      const [studentsRes, notificationsRes] = await Promise.all([
        productionAPIService.getGlobalStudents(filters),
        productionAPIService.getNotifications()
      ]);

      if (studentsRes.success) {
        const enrichedStudents = studentsRes.data.map((student: any) => ({
          ...student,
          _metadata: {
            lastModified: student.updated_at,
            modifiedBy: student.modified_by,
            version: student.version || 1,
            conflicts: student.conflicts || []
          }
        }));
        
        setStudents(enrichedStudents);
        
        // Update analytics
        if ((studentsRes as any).analytics) {
          setAnalytics(prev => ({ ...prev, ...(studentsRes as any).analytics }));
        }
      } else {
        toast.error(studentsRes.error || 'Failed to load students');
      }

      if (notificationsRes.success) {
        setNotifications(notificationsRes.data || []);
      }

      // Performance monitoring
      const loadTime = Date.now() - startTime;
      if (loadTime > 2000) {
        toast.warning(`Slow data load detected: ${loadTime}ms`);
      }

    } catch (error: any) {
      console.error('Fetch Error:', error);
      toast.error('Failed to load spreadsheet data');
      
      // Fallback to cached data
      const cachedData = localStorage.getItem(`students_${activeTrade}_${activeLevel?.level_number}`);
      if (cachedData) {
        setStudents(JSON.parse(cachedData));
        toast.info('Loaded from cache due to network error');
      }
    } finally {
      setLoading(false);
    }
  };

  const advancedBulkOperations = async (operation: string, data: any) => {
    setBulkOperationProgress(0);
    const totalStudents = selectedStudents.length;
    
    try {
      for (let i = 0; i < selectedStudents.length; i++) {
        const studentId = selectedStudents[i];
        const progress = ((i + 1) / totalStudents) * 100;
        setBulkOperationProgress(progress);
        
        switch (operation) {
          case 'bulk_update_grades':
            await productionAPIService.updateStudent(studentId, data.gradeUpdates);
            break;
          case 'bulk_assign_teacher':
            await productionAPIService.request(`/students/${studentId}/assign-teacher`, {
              method: 'POST',
              body: JSON.stringify(data.teacherAssignment)
            });
            break;
          case 'bulk_schedule_meeting':
            await productionAPIService.request(`/students/${studentId}/schedule-meeting`, {
              method: 'POST',
              body: JSON.stringify(data.meetingDetails)
            });
            break;
        }
        
        // Small delay to prevent API overload
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      toast.success(`Bulk ${operation} completed for ${totalStudents} students`);
      fetchSheetData();
    } catch (error: any) {
      toast.error(`Bulk operation failed: ${error?.message || 'Unknown error'}`);
    } finally {
      setBulkOperationProgress(0);
    }
  };

  const exportWithProgress = async (format: 'xlsx' | 'csv' | 'pdf') => {
    setExportProgress(0);
    
    try {
      const exportData = {
        students: selectedStudents.length > 0 ? 
          students.filter(s => selectedStudents.includes(s.id)) : 
          filteredStudents,
        format,
        includeAnalytics: canViewAnalytics,
        includeAuditTrail: true,
        customFields: [
          'conduct_history',
          'attendance_details', 
          'parent_communications',
          'academic_progress'
        ]
      };
      
      // Simulate progress for user feedback
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const response = await productionAPIService.exportStudents(exportData);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      if (response.success) {
        if (response.data?.downloadUrl) {
          window.open(response.data.downloadUrl, '_blank');
        } else {
          // Client-side export fallback
          const XLSXModule = await import('xlsx');
          const worksheet = XLSXModule.utils.json_to_sheet(exportData.students);
          const workbook = XLSXModule.utils.book_new();
          XLSXModule.utils.book_append_sheet(workbook, worksheet, 'Students');
          XLSXModule.writeFile(workbook, `Students_${activeTrade}_${new Date().toISOString().split('T')[0]}.${format}`);
        }
        toast.success('Export completed successfully');
      }
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setTimeout(() => setExportProgress(0), 2000);
    }
  };
  const filteredStudents = useMemo(() => {
    let filtered = students;
    
    // Search filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      filtered = filtered.filter((s: any) => {
        const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
        const code = (s.student_code || s.student_id || '').toLowerCase();
        return fullName.includes(q) || code.includes(q);
      });
    }
    
    // Advanced filters
    filtered = filtered.filter((s: any) => {
      const conductScore = s.conduct_score || 40;
      const attendance = s.attendance_percentage || 100;
      
      if (conductScore < filters.conductScore.min || conductScore > filters.conductScore.max) return false;
      if (attendance < filters.attendance.min || attendance > filters.attendance.max) return false;
      if (filters.paymentStatus !== 'all' && s.payment_status !== filters.paymentStatus) return false;
      if (filters.gender !== 'all' && s.gender !== filters.gender) return false;
      
      return true;
    });
    
    // Sorting
    if (sortConfig) {
      filtered.sort((a: any, b: any) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (sortConfig.key === 'student_name') {
          aVal = `${a.first_name} ${a.last_name}`;
          bVal = `${b.first_name} ${b.last_name}`;
        }
        
        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    
    return filtered;
  }, [students, searchQuery, filters, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectStudent = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(prev => 
      prev.length === filteredStudents.length 
        ? [] 
        : filteredStudents.map((s: any) => s.id)
    );
  };

  const handleLinkParent = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    setSelectedStudentForAction(student);
    setLinkParentForm({ parent_phone: '', parent_name: '', relationship: 'guardian' });
    setShowLinkParentModal(true);
  };

  const submitLinkParent = async () => {
    if (!selectedStudentForAction || !linkParentForm.parent_phone) {
      toast.error('Please fill all required fields');
      return;
    }
    setActionLoading(true);
    try {
      const response = await productionAPIService.linkParent(selectedStudentForAction.id, {
        student_name: `${selectedStudentForAction.first_name} ${selectedStudentForAction.last_name}`,
        parent_phone: linkParentForm.parent_phone,
        parent_name: linkParentForm.parent_name,
        relationship: linkParentForm.relationship
      });
      if (response.success) {
        toast.success('Parent linked successfully! SMS sent.');
        fetchSheetData();
        setShowLinkParentModal(false);
      } else {
        toast.error(response.error || 'Failed to link parent');
      }
    } catch (error) {
      toast.error('Failed to link parent');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveConduct = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    setSelectedStudentForAction(student);
    setConductForm({ points_removed: 1, incident_type: 'misconduct', description: '', severity: 'moderate' });
    setShowRemoveConductModal(true);
  };

  const submitRemoveConduct = async () => {
    if (!selectedStudentForAction || !conductForm.description) {
      toast.error('Please fill all required fields');
      return;
    }
    setActionLoading(true);
    try {
      const response = await productionAPIService.removeConduct(selectedStudentForAction.id, conductForm);
      if (response.success) {
        toast.success('Conduct removed! Parents notified via SMS.');
        fetchSheetData();
        setShowRemoveConductModal(false);
      } else {
        toast.error(response.error || 'Failed to remove conduct');
      }
    } catch (error) {
      toast.error('Failed to remove conduct');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantLeave = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    setSelectedStudentForAction(student);
    setLeaveForm({ leave_type: 'approved', start_date: new Date().toISOString().split('T')[0], end_date: '', reason: '' });
    setShowGrantLeaveModal(true);
  };

  const submitGrantLeave = async () => {
    if (!selectedStudentForAction || !leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    setActionLoading(true);
    try {
      const response = await productionAPIService.grantLeave(selectedStudentForAction.id, {
        ...leaveForm,
        start_date: new Date(leaveForm.start_date).toISOString(),
        end_date: new Date(leaveForm.end_date).toISOString(),
        approved_by: 'DOD',
        status: 'approved'
      });
      if (response.success) {
        toast.success('Leave granted! Parents notified via SMS.');
        fetchSheetData();
        setShowGrantLeaveModal(false);
      } else {
        toast.error(response.error || 'Failed to grant leave');
      }
    } catch (error) {
      toast.error('Failed to grant leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (studentId: number) => {
    try {
      const response = await productionAPIService.getStudentDetails(studentId);
      
      if (response.success && response.data) {
        const student = response.data;
        const details = `
📋 STUDENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${student.first_name} ${student.last_name}
🆔 Code: ${student.student_code}
🎓 Trade: ${student.trade_code}
📊 Level: ${student.level_number}
⭐ Conduct: ${student.conduct_score || 40}/40
📅 Attendance: ${student.attendance_percentage || 100}%
💰 Payment: ${student.payment_status || 'pending'}
📧 Email: ${student.email || 'N/A'}
📱 Phone: ${student.phone || 'N/A'}
🏠 Address: ${student.address || 'N/A'}
📅 DOB: ${student.date_of_birth || 'N/A'}
👥 Gender: ${student.gender || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim();
        
        alert(details);
      } else {
        const student = students.find(s => s.id === studentId);
        if (student) {
          const details = `
📋 STUDENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${student.first_name} ${student.last_name}
🆔 Code: ${student.student_code}
🎓 Trade: ${student.trade_code}
📊 Level: ${student.level_number}
⭐ Conduct: ${student.conduct_score || 40}/40
📅 Attendance: ${student.attendance_percentage || 100}%
💰 Payment: ${student.payment_status || 'pending'}
📧 Email: ${student.email || 'N/A'}
📱 Phone: ${student.phone || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim();
          
          alert(details);
        }
      }
    } catch (error) {
      toast.error('Failed to load student details');
    }
  };

  const handleEditStudent = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    setSelectedStudentForAction(student);
    setEditForm({
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || ''
    });
    setShowEditStudentModal(true);
  };

  const submitEditStudent = async () => {
    if (!selectedStudentForAction || !editForm.first_name || !editForm.last_name) {
      toast.error('First name and last name are required');
      return;
    }
    setActionLoading(true);
    try {
      const response = await productionAPIService.updateStudent(selectedStudentForAction.id, editForm);
      if (response.success) {
        toast.success('Student updated successfully!');
        fetchSheetData();
        setShowEditStudentModal(false);
      } else {
        toast.error(response.error || 'Failed to update student');
      }
    } catch (error) {
      toast.error('Failed to update student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCallParent = async (studentId: number) => {
    try {
      const response = await productionAPIService.getParentContacts(studentId);
      
      if (response.success && response.data?.parents?.length > 0) {
        const parent = response.data.parents[0];
        if (parent.phone) {
          window.open(`tel:${parent.phone}`);
          toast.success(`Calling ${parent.phone}...`);
        } else {
          toast.error('No parent phone number found');
        }
      } else {
        toast.error('No linked parents found');
      }
    } catch (error) {
      toast.error('Failed to get parent contact');
    }
  };

  const handleEmailParent = async (studentId: number) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const response = await productionAPIService.getParentContacts(studentId);
      
      if (response.success && response.data?.parents?.length > 0) {
        const parent = response.data.parents[0];
        if (parent.email) {
          window.open(`mailto:${parent.email}?subject=Regarding ${student.first_name} ${student.last_name}`);
          toast.success(`Opening email to ${parent.email}...`);
        } else {
          toast.error('No parent email found');
        }
      } else {
        toast.error('No linked parents found');
      }
    } catch (error) {
      toast.error('Failed to get parent contact');
    }
  };

  const handleAddStudent = async () => {
    try {
      if (!newStudent.first_name || !newStudent.last_name) {
        toast.error('First name and last name are required');
        return;
      }

      const studentData = {
        ...newStudent,
        trade_code: activeTrade,
        level_number: activeLevel.level_number,
        level_suffix: activeLevel.level_suffix || '',
        student_code: `${activeTrade}${activeLevel.level_number}${Date.now().toString().slice(-4)}`,
        conduct_score: 40,
        attendance_percentage: 100,
        payment_status: 'pending'
      };

      const response = await productionAPIService.addStudent(studentData);

      if (response.success) {
        toast.success('Student added successfully!');
        setShowAddStudentModal(false);
        setNewStudent({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          gender: 'Male',
          date_of_birth: '',
          address: ''
        });
        fetchSheetData();
      } else {
        toast.error(response.error || 'Failed to add student');
      }
    } catch (error) {
      toast.error('Failed to add student');
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!canAddStudent) {
      toast.error('You do not have permission to delete students');
      return;
    }

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (!confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) return;

    try {
      const response = await productionAPIService.deleteStudent(studentId);

      if (response.success) {
        toast.success('Student deleted successfully');
        fetchSheetData();
      } else {
        toast.error(response.error || 'Failed to delete student');
      }
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const handleSendSMS = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    setSelectedStudentForAction(student);
    setSmsForm({ message: '', priority: 'normal' });
    setShowSendSMSModal(true);
  };

  const submitSendSMS = async () => {
    if (!selectedStudentForAction || !smsForm.message) {
      toast.error('Please enter a message');
      return;
    }
    setActionLoading(true);
    try {
      const response = await productionAPIService.sendSMSToParents([selectedStudentForAction.id], {
        message: smsForm.message,
        priority: smsForm.priority,
        type: 'custom'
      });
      if (response.success) {
        toast.success('SMS sent to parent(s)');
        setShowSendSMSModal(false);
      } else {
        toast.error(response.error || 'Failed to send SMS');
      }
    } catch (error) {
      toast.error('Failed to send SMS');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedStudents.length === 0) {
      toast.error('Please select students first');
      return;
    }
    
    try {
      switch (action) {
        case 'sms':
          const message = prompt('Enter message to send to all selected students\' parents:');
          if (!message) return;
          
          const messageData = {
            message,
            priority: 'normal',
            type: 'bulk_custom'
          };
          
          const smsResponse = await productionAPIService.sendSMSToParents(selectedStudents, messageData);
          
          if (smsResponse.success) {
            toast.success(`SMS sent to ${selectedStudents.length} student(s)' parents`);
          } else {
            toast.error(smsResponse.error || 'Failed to send bulk SMS');
          }
          break;
        case 'export':
          const exportResponse = await productionAPIService.exportStudents({
            student_ids: selectedStudents,
            format: 'xlsx'
          });
          
          if (exportResponse.success) {
            // Fallback to client-side export if server doesn't provide file
            const selectedData = students.filter(s => selectedStudents.includes(s.id));
            const XLSXModule = await import('xlsx');
            const worksheet = XLSXModule.utils.json_to_sheet(selectedData);
            const workbook = XLSXModule.utils.book_new();
            XLSXModule.utils.book_append_sheet(workbook, worksheet, 'Selected_Students');
            XLSXModule.writeFile(workbook, 'Selected_Students.xlsx');
            toast.success('Selected students exported');
          } else {
            toast.error(exportResponse.error || 'Failed to export students');
          }
          break;
        case 'conduct':
          const points = prompt('Enter conduct points to remove from all selected students:');
          if (!points || isNaN(Number(points))) return;
          const reason = prompt('Enter reason:');
          if (!reason) return;
          
          const conductData = {
            points_removed: Number(points),
            incident_type: 'misconduct',
            description: reason,
            severity: Number(points) >= 10 ? 'severe' : 'major'
          };
          
          const conductResponse = await productionAPIService.removeConductBulk(selectedStudents, conductData);
          
          if (conductResponse.success) {
            toast.success(`Conduct removed from ${selectedStudents.length} students. Parents notified.`);
            fetchSheetData();
          } else {
            toast.error(conductResponse.error || 'Failed to remove conduct');
          }
          break;
        case 'leave':
          const days = prompt('Enter leave days for all selected students:');
          if (!days || isNaN(Number(days))) return;
          const leaveReason = prompt('Enter leave reason:');
          if (!leaveReason) return;
          
          const leaveData = {
            leave_type: 'approved',
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + Number(days) * 24 * 60 * 60 * 1000).toISOString(),
            reason: leaveReason,
            status: 'approved'
          };
          
          const leaveResponse = await productionAPIService.grantLeaveBulk(selectedStudents, leaveData);
          
          if (leaveResponse.success) {
            toast.success(`Leave granted to ${selectedStudents.length} students. Parents notified.`);
            fetchSheetData();
          } else {
            toast.error(leaveResponse.error || 'Failed to grant leave');
          }
          break;
      }
    } catch (error) {
      toast.error('Bulk action failed');
    }
  };

  const handleCellClick = (rowIdx: number, colId: string, value: any) => {
    setSelectedCell({ row: rowIdx, col: colId });
    setFormulaValue(String(value ?? ''));
  };

  const handleCellDoubleClick = (rowIdx: number, colId: string) => {
    setEditingCell({ row: rowIdx, col: colId });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveCell = async (studentId: number, colId: string, value: string) => {
    try {
      if (colId === 'first_name' || colId === 'last_name' || colId === 'student_code') {
        const updateData = { [colId]: value };
        const res = await productionAPIService.updateStudent(studentId, updateData);
        
        if (res.success) {
          setStudents(prev => prev.map(s => s.id === studentId ? { ...s, [colId]: value } : s));
          toast.success('Updated successfully');
        } else {
          toast.error(res.error || 'Failed to update');
        }
      } else {
        // Handle marks/grades update if needed
        const updateData = { [colId]: parseFloat(value) || 0 };
        const res = await productionAPIService.updateStudent(studentId, updateData);
        
        if (res.success) {
          setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
              const updatedStudent = { ...s, [colId]: parseFloat(value) || 0 };
              const total = markColumns.reduce((acc, col) => acc + (updatedStudent[col.id] || 0), 0);
              const totalMax = markColumns.reduce((acc, col) => acc + (col.max_marks || 0), 0);
              updatedStudent.total_marks = total;
              updatedStudent.average_marks = totalMax > 0 ? (total / totalMax) * 100 : 0;
              return updatedStudent;
            }
            return s;
          }));
          toast.success('Updated successfully');
        } else {
          toast.error(res.error || 'Failed to update');
        }
      }
    } catch (error) {
      toast.error('Failed to update');
    }
    setEditingCell(null);
  };

  const handleExportExcel = async () => {
    try {
      const filters = {
        trade_id: activeTrade,
        level_id: activeLevel.level_number,
        format: 'xlsx'
      };
      
      const response = await productionAPIService.exportStudents(filters);
      
      if (response.success && response.data?.downloadUrl) {
        // If server provides download URL
        window.open(response.data.downloadUrl, '_blank');
        toast.success('Excel exported successfully');
      } else {
        // Fallback to client-side export with dynamic import
        const XLSXModule = await import('xlsx');
        const worksheet = XLSXModule.utils.json_to_sheet(students.map(s => ({
          'Student Name': `${s.first_name} ${s.last_name}`,
          'Code': s.student_code,
          'Trade': s.trade_code,
          'Level': s.level_number,
          'Conduct': s.conduct_score || 40,
          'Attendance': s.attendance_percentage || 100,
          'Payment Status': s.payment_status || 'pending',
          'Email': s.email || '',
          'Phone': s.phone || ''
        })));
        const workbook = XLSXModule.utils.book_new();
        XLSXModule.utils.book_append_sheet(workbook, worksheet, `${activeTrade}_Level_${activeLevel.level_number}`);
        XLSXModule.writeFile(workbook, `Student_Sheet_${activeTrade}_L${activeLevel.level_number}.xlsx`);
        toast.success('Excel exported successfully');
      }
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  const getCellStyles = (colId: string, value: any) => {
    if (markColumns.some(c => String(c.id) === colId)) {
      const val = parseFloat(value);
      if (val < 50) return 'text-rose-600 font-medium';
      if (val >= 80) return 'text-emerald-600 font-bold';
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3] select-none">
      {/* Enhanced Toolbar */}
      <div className="bg-white border-b border-gray-300 p-2 flex items-center justify-between gap-4 shadow-sm z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            <TableIcon className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-900 tracking-tight">Advanced Student Management</span>
          </div>

          {/* Trade & Level Filters */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            {GLOBAL_TRADES.map(trade => (
              <button
                key={trade.code}
                onClick={() => {
                  setActiveTrade(trade.code);
                  setActiveLevel(getLevelsForTrade(trade.code)[0]);
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTrade === trade.code ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {trade.code}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto max-w-[400px] scrollbar-hide">
            {getLevelsForTrade(activeTrade).map(level => (
              <button
                key={level.id}
                onClick={() => setActiveLevel(level)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all whitespace-nowrap ${activeLevel?.id === level.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}
              >
                {level.display}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-64 bg-white border-gray-300 focus:ring-blue-500 rounded-lg text-sm"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 border-gray-300 gap-2" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" /> Filters
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-9 border-gray-300 gap-2 ${realTimeUpdates ? 'bg-green-50 border-green-300 text-green-700' : ''}`}
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
            title={realTimeUpdates ? 'Real-time updates ON' : 'Real-time updates OFF'}
          >
            <RefreshCw className={`w-4 h-4 ${realTimeUpdates ? 'animate-spin' : ''}`} /> 
            {realTimeUpdates ? 'Live' : 'Manual'}
          </Button>
          
          <Button variant="outline" size="sm" className="h-9 border-gray-300 gap-2" onClick={handleExportExcel}>
            <DownloadIcon className="w-4 h-4" /> Export
          </Button>
          
          {canAddStudent && (
            <Button 
              size="sm" 
              className="h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 shadow-md"
              onClick={() => setShowAddStudentModal(true)}
            >
              <UserPlus className="w-4 h-4" /> Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Analytics Dashboard */}
      {canViewAnalytics && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-4">
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalStudents || students.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Avg Conduct</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.averageConduct?.toFixed(1) || '40.0'}/40</p>
                </div>
                <Award className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Avg Attendance</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.averageAttendance?.toFixed(1) || '100.0'}%</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Payments</p>
                  <p className="text-lg font-bold text-emerald-600">{analytics.paymentStats?.paid || 0} Paid</p>
                  <p className="text-xs text-orange-600">{analytics.paymentStats?.pending || 0} Pending</p>
                </div>
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">System Health</p>
                  <p className={`text-lg font-bold ${systemHealth.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {systemHealth.status === 'healthy' ? 'Healthy' : 'Degraded'}
                  </p>
                  <p className="text-xs text-gray-500">{systemHealth.latency}ms</p>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  systemHealth.status === 'healthy' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    systemHealth.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                  }`} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Notifications</p>
                  <p className="text-2xl font-bold text-red-600">{notifications.length}</p>
                  <p className="text-xs text-gray-500">Unread</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      )}
      {showFilters && (
        <div className="bg-gray-50 border-b border-gray-300 p-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Conduct Score:</label>
            <input
              type="range"
              min="0"
              max="40"
              value={filters.conductScore.min}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                conductScore: { ...prev.conductScore, min: parseInt(e.target.value) }
              }))}
              className="w-20"
            />
            <span className="text-xs">{filters.conductScore.min}-{filters.conductScore.max}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Payment Status:</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Gender:</label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="all">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      )}

      {/* Enhanced Bulk Actions Bar */}
      {selectedStudents.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {selectedStudents.length}
            </div>
            <span className="text-sm font-semibold text-blue-900">
              student(s) selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleBulkAction('sms')}>
              <Send className="w-4 h-4 mr-1" /> Send SMS
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleBulkAction('conduct')}>
              <Ban className="w-4 h-4 mr-1" /> Remove Conduct
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleBulkAction('leave')}>
              <CheckSquare className="w-4 h-4 mr-1" /> Grant Leave
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleBulkAction('export')}>
              <FileDown className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button size="sm" variant="outline" className="border-gray-300" onClick={() => setSelectedStudents([])}>
              <XCircle className="w-4 h-4 mr-1" /> Clear
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Spreadsheet */}
      <div className="flex-1 overflow-auto bg-gray-200 relative" ref={gridRef}>
        <table className="border-separate border-spacing-0 w-max min-w-full bg-white">
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-50 shadow-sm">
              <th className="w-10 border-b border-r border-gray-300 bg-gray-100 p-2">
                <input
                  type="checkbox"
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="px-4 py-2 text-sm font-bold text-gray-800 border-b border-r border-gray-300 text-left min-w-[150px]">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('first_name')}>
                  First Name
                  {sortConfig?.key === 'first_name' && (
                    sortConfig.direction === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </div>
              </th>
              <th className="px-4 py-2 text-sm font-bold text-gray-800 border-b border-r border-gray-300 text-left min-w-[150px]">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('last_name')}>
                  Last Name
                  {sortConfig?.key === 'last_name' && (
                    sortConfig.direction === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </div>
              </th>
              <th className="px-4 py-2 text-sm font-bold text-gray-800 border-b border-r border-gray-300 text-left min-w-[120px]">
                Student Code
              </th>
              <th className="px-4 py-2 text-sm font-bold text-gray-800 border-b border-r border-gray-300 text-center min-w-[100px]">
                Conduct Score
              </th>
              <th className="px-4 py-2 text-sm font-bold text-gray-800 border-b border-r border-gray-300 text-center min-w-[100px]">
                Attendance %
              </th>
              <th className="px-4 py-2 text-sm font-bold text-gray-800 border-b border-r border-gray-300 text-center min-w-[120px]">
                Payment Status
              </th>
              <th className="px-4 py-2 text-sm font-bold text-gray-800 border-b border-r border-gray-300 text-center min-w-[350px]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={100} className="px-6 py-20 text-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                      <p className="text-gray-500 font-medium">Loading students...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-gray-200" />
                      <p className="text-gray-400">No students found.</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : filteredStudents.map((student: any, rowIdx: number) => (
              <tr key={student.id} className="hover:bg-blue-50/30">
                <td className="border-b border-r border-gray-200 bg-gray-50 p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleSelectStudent(student.id)}
                    className="w-4 h-4"
                  />
                </td>

                <td className="px-4 py-2 border-b border-r border-gray-200 text-sm">
                  {student.first_name}
                </td>

                <td className="px-4 py-2 border-b border-r border-gray-200 text-sm">
                  {student.last_name}
                </td>

                <td className="px-4 py-2 border-b border-r border-gray-200 text-sm font-mono">
                  {student.student_code}
                </td>

                <td className="px-4 py-2 border-b border-r border-gray-200 text-sm text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    (student.conduct_score || 40) >= 35 ? 'bg-green-100 text-green-800' :
                    (student.conduct_score || 40) >= 30 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.conduct_score || 40}/40
                  </span>
                </td>

                <td className="px-4 py-2 border-b border-r border-gray-200 text-sm text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    (student.attendance_percentage || 100) >= 90 ? 'bg-green-100 text-green-800' :
                    (student.attendance_percentage || 100) >= 75 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.attendance_percentage || 100}%
                  </span>
                </td>

                <td className="px-4 py-2 border-b border-r border-gray-200 text-sm text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    student.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    student.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.payment_status || 'pending'}
                  </span>
                </td>

                <td className="px-2 py-2 border-b border-r border-gray-200">
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      onClick={() => handleLinkParent(student.id)}
                      className="p-1.5 hover:bg-blue-100 rounded-md transition-all hover:scale-110 group relative"
                      title="Link Parent"
                    >
                      <Link className="w-4 h-4 text-blue-600" />
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">Link Parent</span>
                    </button>
                    <button
                      onClick={() => handleSendSMS(student.id)}
                      className="p-1.5 hover:bg-green-100 rounded-md transition-all hover:scale-110 group relative"
                      title="Send SMS"
                    >
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">Send SMS</span>
                    </button>
                    <button
                      onClick={() => handleRemoveConduct(student.id)}
                      className="p-1.5 hover:bg-red-100 rounded-md transition-all hover:scale-110 group relative"
                      title="Remove Conduct"
                    >
                      <Ban className="w-4 h-4 text-red-600" />
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">Remove Conduct</span>
                    </button>
                    <button
                      onClick={() => handleGrantLeave(student.id)}
                      className="p-1.5 hover:bg-purple-100 rounded-md transition-all hover:scale-110 group relative"
                      title="Grant Leave"
                    >
                      <CheckSquare className="w-4 h-4 text-purple-600" />
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">Grant Leave</span>
                    </button>
                    <button
                      onClick={() => handleCallParent(student.id)}
                      className="p-1.5 hover:bg-indigo-100 rounded-md transition-all hover:scale-110 group relative"
                      title="Call Parent"
                    >
                      <Phone className="w-4 h-4 text-indigo-600" />
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">Call Parent</span>
                    </button>
                    <button
                      onClick={() => handleEmailParent(student.id)}
                      className="p-1.5 hover:bg-orange-100 rounded-md transition-all hover:scale-110 group relative"
                      title="Email Parent"
                    >
                      <Mail className="w-4 h-4 text-orange-600" />
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">Email Parent</span>
                    </button>
                    <button
                      onClick={() => handleViewDetails(student.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-md transition-all hover:scale-110 group relative"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">View Details</span>
                    </button>
                    <button
                      onClick={() => handleEditStudent(student.id)}
                      className="p-1.5 hover:bg-blue-100 rounded-md transition-all hover:scale-110 group relative"
                      title="Edit Student"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                      <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">Edit Student</span>
                    </button>
                    {canAddStudent && (
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1.5 hover:bg-red-100 rounded-md transition-all hover:scale-110 group relative"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">Delete Student</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Footer */}
      <div className="bg-[#f3f3f3] border-t border-gray-300 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>System Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{filteredStudents.length} of {students.length} students</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-600">{activeTrade}</span>
            <span>•</span>
            <span>{activeLevel?.display}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {selectedStudents.length > 0 && (
            <span className="text-blue-600 font-medium">
              {selectedStudents.length} selected
            </span>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            {realTimeUpdates && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-xs font-medium">LIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Add New Student</h2>
                </div>
                <button
                  onClick={() => setShowAddStudentModal(false)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-blue-100 mt-2">Adding to {activeTrade} - {activeLevel?.display}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                  <Input
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter first name"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                  <Input
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter last name"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="student@example.com"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <Input
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+250788123456"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                  <Input
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <Input
                  value={newStudent.address}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                  className="w-full"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Student Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-600">Trade:</span> <span className="font-bold text-blue-600">{activeTrade}</span></div>
                  <div><span className="text-gray-600">Level:</span> <span className="font-bold text-blue-600">{activeLevel?.display}</span></div>
                  <div><span className="text-gray-600">Conduct Score:</span> <span className="font-bold text-green-600">40/40</span></div>
                  <div><span className="text-gray-600">Attendance:</span> <span className="font-bold text-green-600">100%</span></div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-xl flex items-center justify-end gap-3 border-t">
              <Button
                variant="outline"
                onClick={() => setShowAddStudentModal(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStudent}
                className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Action Modals */}
      {showLinkParentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Link className="w-5 h-5" /> Link Parent
              </h2>
              <p className="text-blue-100 mt-1">{selectedStudentForAction?.first_name} {selectedStudentForAction?.last_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Phone *</label>
                <Input
                  value={linkParentForm.parent_phone}
                  onChange={(e) => setLinkParentForm(prev => ({ ...prev, parent_phone: e.target.value }))}
                  placeholder="+250788123456"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Name</label>
                <Input
                  value={linkParentForm.parent_name}
                  onChange={(e) => setLinkParentForm(prev => ({ ...prev, parent_name: e.target.value }))}
                  placeholder="Parent full name"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                <select
                  value={linkParentForm.relationship}
                  onChange={(e) => setLinkParentForm(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowLinkParentModal(false)}>Cancel</Button>
              <Button onClick={submitLinkParent} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">
                {actionLoading ? 'Linking...' : 'Link Parent'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRemoveConductModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ban className="w-5 h-5" /> Remove Conduct
              </h2>
              <p className="text-red-100 mt-1">{selectedStudentForAction?.first_name} {selectedStudentForAction?.last_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Points to Remove (1-40) *</label>
                <Input
                  type="number"
                  min="1"
                  max="40"
                  value={conductForm.points_removed}
                  onChange={(e) => setConductForm(prev => ({ ...prev, points_removed: parseInt(e.target.value) || 1 }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={conductForm.description}
                  onChange={(e) => setConductForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the incident..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRemoveConductModal(false)}>Cancel</Button>
              <Button onClick={submitRemoveConduct} disabled={actionLoading} className="bg-red-600 hover:bg-red-700">
                {actionLoading ? 'Removing...' : 'Remove Conduct'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showGrantLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckSquare className="w-5 h-5" /> Grant Leave
              </h2>
              <p className="text-purple-100 mt-1">{selectedStudentForAction?.first_name} {selectedStudentForAction?.last_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                  <Input
                    type="date"
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date *</label>
                  <Input
                    type="date"
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason *</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter leave reason..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowGrantLeaveModal(false)}>Cancel</Button>
              <Button onClick={submitGrantLeave} disabled={actionLoading} className="bg-purple-600 hover:bg-purple-700">
                {actionLoading ? 'Granting...' : 'Grant Leave'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSendSMSModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Send SMS
              </h2>
              <p className="text-green-100 mt-1">{selectedStudentForAction?.first_name} {selectedStudentForAction?.last_name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                <textarea
                  value={smsForm.message}
                  onChange={(e) => setSmsForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your message to parent(s)..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">{smsForm.message.length}/500 characters</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSendSMSModal(false)}>Cancel</Button>
              <Button onClick={submitSendSMS} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                {actionLoading ? 'Sending...' : 'Send SMS'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showEditStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit className="w-5 h-5" /> Edit Student
              </h2>
              <p className="text-blue-100 mt-1">{selectedStudentForAction?.student_code}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                  <Input
                    value={editForm.first_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                  <Input
                    value={editForm.last_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="student@example.com"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+250788123456"
                  className="w-full"
                />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-b-xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditStudentModal(false)}>Cancel</Button>
              <Button onClick={submitEditStudent} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">
                {actionLoading ? 'Updating...' : 'Update Student'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GlobalStudentSheets;
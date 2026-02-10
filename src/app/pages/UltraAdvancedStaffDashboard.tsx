import { API_BASE_URL } from '@/app/config/apiBase';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Search, Filter, Edit, Trash2, Eye, Download, Upload,
  Mail, Phone, Calendar, CheckCircle, XCircle, RefreshCw,
  FileText, MoreVertical, Bell, BarChart3, Clock, DollarSign,
  Award, FileBarChart, TrendingUp, TrendingDown, ChevronDown,
  ChevronUp, X, Check, AlertTriangle, UserPlus, UserMinus,
  Briefcase, BookOpen, GraduationCap, Users2, Building2,
  Activity, Zap, Layers, PieChart, CalendarDays, MessageSquare,
  UploadCloud, DownloadCloud, Trash,
  Eye as EyeIcon, Edit2, MoreHorizontal, Plus, Send, Clock4,
  Star, Target, Award as AwardIcon
} from 'lucide-react';

// Type definitions
interface StaffMember {
  id: number;
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role_name?: string;
  department?: string;
  specialization?: string;
  status?: string;
  employment_status?: string;
  hire_date?: string;
  contract_type?: string;
  salary?: number;
  profile_image?: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type?: string;
  priority?: string;
  is_read?: boolean;
  created_at?: string;
}

interface Filters {
  search: string;
  role: string;
  department: string;
  status: string;
  sortBy: string;
  sortOrder: string;
  contractType: string;
  minSalary?: string;
  maxSalary?: string;
  hireDateFrom?: string;
  hireDateTo?: string;
  minRating?: string;
}

interface ActivityLog {
  id: number;
  staff_id: number;
  action: string;
  description: string;
  created_at: string;
  staff_name?: string;
  role_name?: string;
}

interface Analytics {
  summary: {
    total_staff: number;
    active_staff: number;
    total_teachers: number;
    total_departments: number;
  };
  role_distribution: { role_name: string; count: number }[];
  department_distribution: { department: string; count: number }[];
}

// ==================== MAIN DASHBOARD COMPONENT ====================

const UltraAdvancedStaffDashboard: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  
  // Filters state
  const [filters, setFilters] = useState<Filters>({
    search: '',
    role: 'all',
    department: 'all',
    status: 'all',
    contractType: 'all',
    minSalary: '',
    maxSalary: '',
    hireDateFrom: '',
    hireDateTo: '',
    minRating: '',
    sortBy: 'last_name',
    sortOrder: 'ASC'
  });
  
  // Selection state
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState<boolean>(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showReportsModal, setShowReportsModal] = useState<boolean>(false);
  
  const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch staff data
  const fetchStaff = useCallback(async (includeAnalytics: boolean = true) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        search: filters.search,
        role: filters.role,
        department: filters.department,
        status: filters.status,
        contract_type: filters.contractType,
        min_salary: filters.minSalary || '',
        max_salary: filters.maxSalary || '',
        hire_date_from: filters.hireDateFrom || '',
        hire_date_to: filters.hireDateTo || '',
        min_rating: filters.minRating || '',
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
        analytics: includeAnalytics ? 'true' : 'false'
      });

      const res = await fetch(`${API_BASE_URL}/staff-advanced?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setStaff(data.staff);
        if (includeAnalytics && data.analytics) {
          setAnalytics(data.analytics);
        }
      }
    } catch (error) {
      console.error('Fetch staff error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/staff-advanced/notifications/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  };

  const fetchActivities = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/staff-advanced/activities/live?limit=60`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Fetch activities error:', error);
    }
  }, []);

  useEffect(() => {
    fetchStaff(true);
    fetchNotifications();
    fetchActivities();
  }, [fetchStaff, fetchActivities]);

  // Handle selection
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(staff.map((s: StaffMember) => s.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelect = (id: number) => {
    if (selectedStaff.includes(id)) {
      setSelectedStaff(selectedStaff.filter((s: number) => s !== id));
    } else {
      setSelectedStaff([...selectedStaff, id]);
    }
  };

  // Filtered staff
  const filteredStaff = staff.filter((s: StaffMember) => {
    const matchesSearch = filters.search === '' ||
      s.first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.last_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.email?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesSearch;
  });

  // Export data
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/staff-advanced/export/csv`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff_export_${Date.now()}.csv`;
      a.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action: string, data: Record<string, unknown> = {}) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/staff-advanced/bulk-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          staff_ids: selectedStaff,
          action,
          ...data
        })
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        fetchStaff(true);
        setSelectedStaff([]);
        setShowBulkModal(false);
      }
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Gutegura amakuru...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 via-blue-600 to-purple-700 text-white shadow-2xl">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Users className="w-10 h-10" />
                Staff Management System
              </h1>
              <p className="text-blue-100 text-lg">Manage all school staff with advanced features</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNotificationsModal(true)}
                className="relative bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <Bell className="w-5 h-5" />
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowReportsModal(true)}
                className="bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <FileBarChart className="w-5 h-5" />
                Reports
              </button>
              <button
                onClick={() => fetchStaff(true)}
                className="bg-white/20 hover:bg-white/30 px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-8 pb-6">
          <nav className="flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
              { id: 'staff', label: 'Staff Directory', icon: <Users className="w-5 h-5" /> },
              { id: 'schedule', label: 'Scheduling', icon: <CalendarDays className="w-5 h-5" /> },
              { id: 'performance', label: 'Performance', icon: <AwardIcon className="w-5 h-5" /> },
              { id: 'documents', label: 'Documents', icon: <FileText className="w-5 h-5" /> },
              { id: 'activities', label: 'Activities', icon: <Activity className="w-5 h-5" /> },
              { id: 'communication', label: 'Communication', icon: <MessageSquare className="w-5 h-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-700 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <OverviewDashboard 
            analytics={analytics} 
            staff={staff}
            onAddStaff={() => setShowAddModal(true)}
            onExport={handleExport}
          />
        )}

        {/* Staff Directory Tab */}
        {activeTab === 'staff' && (
          <StaffDirectory
            staff={filteredStaff}
            filters={filters}
            setFilters={setFilters}
            selectedStaff={selectedStaff}
            selectAll={selectAll}
            onSelectAll={handleSelectAll}
            onSelect={handleSelect}
            onView={(member: StaffMember) => {
              setSelectedStaffMember(member);
              setShowDetailModal(true);
            }}
            onEdit={(member: StaffMember) => {
              setSelectedStaffMember(member);
              // Open edit mode
            }}
            onBulkAction={() => setShowBulkModal(true)}
            onExport={handleExport}
            onAddStaff={() => setShowAddModal(true)}
          />
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <StaffScheduling
            staff={staff}
            onViewSchedule={(member: StaffMember) => {
              setSelectedStaffMember(member);
              setShowScheduleModal(true);
            }}
          />
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <StaffPerformance
            staff={staff}
            onViewPerformance={(member: StaffMember) => {
              setSelectedStaffMember(member);
              setShowPerformanceModal(true);
            }}
          />
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <StaffDocuments
            staff={staff}
            onViewDocuments={(member: StaffMember) => {
              setSelectedStaffMember(member);
              setShowDocumentsModal(true);
            }}
          />
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <StaffActivities
            activities={activities}
          />
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && (
          <StaffCommunication
            staff={staff}
            notifications={notifications}
            onSendNotification={() => setShowNotificationsModal(true)}
          />
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddStaffModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchStaff(true);
            }}
          />
        )}
        {showDetailModal && selectedStaffMember && (
          <StaffDetailModal
            staff={selectedStaffMember}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedStaffMember(null);
            }}
            onEdit={() => {
              setShowDetailModal(false);
              // Open edit modal
            }}
            onViewSchedule={() => {
              setShowScheduleModal(true);
            }}
            onViewPerformance={() => {
              setShowPerformanceModal(true);
            }}
            onViewDocuments={() => {
              setShowDocumentsModal(true);
            }}
          />
        )}
        {showBulkModal && (
          <BulkActionsModal
            selectedCount={selectedStaff.length}
            onAction={handleBulkAction}
            onClose={() => setShowBulkModal(false)}
          />
        )}
        {showScheduleModal && selectedStaffMember && (
          <ScheduleModal
            staff={selectedStaffMember}
            onClose={() => {
              setShowScheduleModal(false);
              setSelectedStaffMember(null);
            }}
          />
        )}
        {showPerformanceModal && selectedStaffMember && (
          <PerformanceModal
            staff={selectedStaffMember}
            onClose={() => {
              setShowPerformanceModal(false);
              setSelectedStaffMember(null);
            }}
          />
        )}
        {showDocumentsModal && selectedStaffMember && (
          <DocumentsModal
            staff={selectedStaffMember}
            onClose={() => {
              setShowDocumentsModal(false);
              setSelectedStaffMember(null);
            }}
          />
        )}
        {showNotificationsModal && (
          <NotificationsModal
            notifications={notifications}
            onClose={() => setShowNotificationsModal(false)}
          />
        )}
        {showReportsModal && (
          <ReportsModal
            staff={staff}
            onClose={() => setShowReportsModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== OVERVIEW DASHBOARD ====================

interface OverviewDashboardProps {
  analytics: Analytics | null;
  staff: StaffMember[];
  onAddStaff: () => void;
  onExport: () => void;
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ analytics, staff, onAddStaff, onExport }) => {
  const summary = analytics?.summary || {
    total_staff: staff.length,
    active_staff: staff.filter((s: StaffMember) => s.status === 'active').length,
    total_teachers: staff.filter((s: StaffMember) => s.role_name === 'teacher').length,
    total_departments: new Set(staff.map((s: StaffMember) => s.department)).size
  };

  interface StatCard {
      title: string;
      value: number;
      icon: React.ReactNode;
      color: string;
      change: string;
      trend: 'up' | 'down' | 'neutral';
    }

    const statCards: StatCard[] = [
    {
      title: 'Total Staff',
      value: summary.total_staff || staff.length,
      icon: <Users className="w-8 h-8" />,
      color: 'from-blue-500 to-indigo-600',
      change: '+5%',
      trend: 'up' as const
    },
    {
      title: 'Active Staff',
      value: summary.active_staff || 0,
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'from-green-500 to-emerald-600',
      change: '+2%',
      trend: 'up' as const
    },
    {
      title: 'Teachers',
      value: summary.total_teachers || 0,
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-600',
      change: '+3%',
      trend: 'up' as const
    },
    {
      title: 'Departments',
      value: summary.total_departments || 0,
      icon: <Building2 className="w-8 h-8" />,
      color: 'from-orange-500 to-red-600',
      change: '0%',
      trend: 'neutral' as const
    }
  ];

  const roleDistribution = analytics?.role_distribution || [];
  const deptDistribution = analytics?.department_distribution || [];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-br ${stat.color} text-white p-4 rounded-xl`}>
                {stat.icon}
              </div>
              <span className={`flex items-center text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stat.trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
                {stat.trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Role Distribution
          </h3>
          <div className="space-y-4">
            {roleDistribution.slice(0, 6).map((role, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{role.role_name}</span>
                    <span className="text-sm text-gray-500">{role.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${(role.count / (summary.total_staff || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-green-600" />
            Department Distribution
          </h3>
          <div className="space-y-4">
            {deptDistribution.slice(0, 6).map((dept, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{dept.department || 'N/A'}</span>
                    <span className="text-sm text-gray-500">{dept.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                      style={{ width: `${(dept.count / (summary.total_staff || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onAddStaff}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl hover:from-indigo-100 hover:to-blue-100 transition-all"
          >
            <UserPlus className="w-10 h-10 text-indigo-600" />
            <span className="font-semibold text-gray-700">Add New Staff</span>
          </button>
          <button
            onClick={onExport}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all"
          >
            <DownloadCloud className="w-10 h-10 text-green-600" />
            <span className="font-semibold text-gray-700">Export Data</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all">
            <Calendar className="w-10 h-10 text-purple-600" />
            <span className="font-semibold text-gray-700">View Schedule</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all">
            <FileText className="w-10 h-10 text-orange-600" />
            <span className="font-semibold text-gray-700">Generate Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== STAFF DIRECTORY ====================

interface StaffDirectoryProps {
  staff: StaffMember[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  selectedStaff: number[];
  selectAll: boolean;
  onSelectAll: () => void;
  onSelect: (id: number) => void;
  onView: (member: StaffMember) => void;
  onEdit: (member: StaffMember) => void;
  onBulkAction: () => void;
  onExport: () => void;
  onAddStaff: () => void;
}

const StaffDirectory: React.FC<StaffDirectoryProps> = ({
  staff,
  filters,
  setFilters,
  selectedStaff,
  selectAll,
  onSelectAll,
  onSelect,
  onView,
  onEdit,
  onBulkAction,
  onExport,
  onAddStaff
}) => {
  const departments = [...new Set(staff.filter((s: StaffMember) => s.department).map((s: StaffMember) => s.department))];
  const roles = [...new Set(staff.map((s: StaffMember) => s.role_name))];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {/* Contract Type */}
          <select
            value={filters.contractType}
            onChange={(e) => setFilters({ ...filters, contractType: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Contracts</option>
            <option value="permanent">Permanent</option>
            <option value="contract">Contract</option>
            <option value="part-time">Part-time</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <input
            type="number"
            placeholder="Min salary"
            value={filters.minSalary}
            onChange={(e) => setFilters({ ...filters, minSalary: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <input
            type="number"
            placeholder="Max salary"
            value={filters.maxSalary}
            onChange={(e) => setFilters({ ...filters, maxSalary: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <input
            type="date"
            value={filters.hireDateFrom}
            onChange={(e) => setFilters({ ...filters, hireDateFrom: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <input
            type="date"
            value={filters.hireDateTo}
            onChange={(e) => setFilters({ ...filters, hireDateTo: e.target.value })}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
          <div className="md:col-span-2 flex items-center gap-3">
            <span className="text-sm text-gray-700 whitespace-nowrap">Min rating</span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={onSelectAll}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium text-gray-700">Select All ({staff.length})</span>
            </label>
            {selectedStaff.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedStaff.length} selected
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {selectedStaff.length > 0 && (
              <button
                onClick={onBulkAction}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 flex items-center gap-2 font-semibold"
              >
                <Layers className="w-5 h-5" />
                Bulk Actions ({selectedStaff.length})
              </button>
            )}
            <button
              onClick={onExport}
              className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 flex items-center gap-2 font-semibold"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
            <button
              onClick={onAddStaff}
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold w-12"></th>
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Role</th>
                <th className="px-6 py-4 text-left font-semibold">Department</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Phone</th>
                <th className="px-6 py-4 text-left font-semibold">Status</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((member, idx) => (
                <tr key={member.id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(member.id)}
                      onChange={() => onSelect(member.id)}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-sm text-gray-500">ID: {member.employee_id || member.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={member.role_name} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{member.department || 'N/A'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {member.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {member.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={member.status || member.employment_status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onView(member)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onEdit(member)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="More Actions"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {staff.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No staff members found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== STAFF SCHEDULING ====================

interface StaffSchedulingProps {
  staff: StaffMember[];
  onViewSchedule: (member: StaffMember) => void;
}

const StaffScheduling: React.FC<StaffSchedulingProps> = ({ staff, onViewSchedule }) => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-600" />
          Staff Schedule
        </h3>

        {/* Schedule Grid */}
        <div className="grid grid-cols-8 gap-2 overflow-x-auto">
          <div className="bg-gray-100 p-3 rounded-lg font-semibold text-center">Time</div>
          {weekDays.map(day => (
            <div key={day} className="bg-indigo-100 p-3 rounded-lg font-semibold text-center text-indigo-800">
              {day}
            </div>
          ))}

          {Array.from({ length: 10 }, (_, i) => {
            const hour = 7 + i;
            return (
              <React.Fragment key={hour}>
                <div className="bg-gray-50 p-3 rounded-lg text-center text-sm text-gray-600">
                  {hour}:00
                </div>
                {weekDays.map((day) => (
                  <div
                    key={`${day}-${hour}`}
                    className="bg-white border border-gray-200 p-2 rounded-lg min-h-[80px] hover:bg-gray-50 transition-colors cursor-pointer"
                  ></div>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Staff Schedule List */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Staff Schedules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.slice(0, 6).map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => onViewSchedule(member)}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {member.first_name?.[0]}{member.last_name?.[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-sm text-gray-500">{member.role_name}</p>
              </div>
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== STAFF PERFORMANCE ====================

interface StaffPerformanceProps {
  staff: StaffMember[];
  onViewPerformance: (member: StaffMember) => void;
}

const StaffPerformance: React.FC<StaffPerformanceProps> = ({ staff, onViewPerformance }) => {
  const performanceData = [
    { label: 'Excellent', value: 45, color: 'bg-green-500' },
    { label: 'Good', value: 35, color: 'bg-blue-500' },
    { label: 'Average', value: 15, color: 'bg-yellow-500' },
    { label: 'Needs Improvement', value: 5, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AwardIcon className="w-6 h-6 text-yellow-600" />
            Performance Overview
          </h3>
          <div className="space-y-4">
            {performanceData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-40 text-sm font-medium text-gray-700">{item.label}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div className={`${item.color} h-4 rounded-full transition-all`} style={{ width: `${item.value}%` }}></div>
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">{item.value}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-purple-600" />
            Top Performers
          </h3>
          <div className="space-y-4">
            {staff.slice(0, 5).map((member, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{member.role_name}</p>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold">4.8</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Reviews */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Reviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.slice(0, 6).map((member) => (
            <div
              key={member.id}
              className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 transition-colors cursor-pointer"
              onClick={() => onViewPerformance(member)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {member.first_name?.[0]}{member.last_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{member.role_name}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= 4 ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">Last: Jan 2024</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== STAFF DOCUMENTS ====================

interface StaffDocumentsProps {
  staff: StaffMember[];
  onViewDocuments: (member: StaffMember) => void;
}

const StaffDocuments: React.FC<StaffDocumentsProps> = ({ staff, onViewDocuments }) => {
  const documentCategories = [
    { id: 'contract', label: 'Contracts', icon: <FileText className="w-5 h-5" />, count: 12 },
    { id: 'certificate', label: 'Certificates', icon: <AwardIcon className="w-5 h-5" />, count: 28 },
    { id: 'id_document', label: 'ID Documents', icon: <FileText className="w-5 h-5" />, count: 15 },
    { id: 'resume', label: 'Resumes', icon: <FileText className="w-5 h-5" />, count: 8 },
    { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-5 h-5" />, count: 22 },
    { id: 'other', label: 'Other', icon: <FileText className="w-5 h-5" />, count: 5 }
  ];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          Document Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {documentCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                {cat.icon}
              </div>
              <span className="font-medium text-gray-700 text-sm">{cat.label}</span>
              <span className="text-xs text-gray-500">{cat.count} files</span>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Documents */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Staff Document Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.slice(0, 9).map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => onViewDocuments(member)}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {member.first_name?.[0]}{member.last_name?.[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-sm text-gray-500">{member.role_name}</p>
              </div>
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== STAFF ACTIVITIES ====================

interface StaffActivitiesProps {
  activities: ActivityLog[];
}

const actionColor: Record<string, string> = {
  login: 'bg-green-500',
  schedule: 'bg-blue-500',
  document: 'bg-purple-500',
  performance: 'bg-yellow-500',
  leave: 'bg-orange-500'
};

const StaffActivities: React.FC<StaffActivitiesProps> = ({ activities }) => {

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          Real-Time Activity Log
        </h3>
        
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="relative flex gap-4 pl-12">
                <div className={`absolute left-4 w-5 h-5 ${(actionColor[activity.action] || 'bg-gray-400')} rounded-full flex items-center justify-center`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="flex-1 p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {activity.staff_name ? `${activity.staff_name} • ` : ''}{activity.action}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.created_at}</span>
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-gray-500 text-center py-6">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STAFF COMMUNICATION ====================

interface StaffCommunicationProps {
  staff: StaffMember[];
  notifications: Notification[];
  onSendNotification: () => void;
}

const StaffCommunication: React.FC<StaffCommunicationProps> = ({ staff, notifications, onSendNotification }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Message */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Quick Message
          </h3>
          <div className="space-y-4">
            <textarea
              placeholder="Type your message..."
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none"
              rows={4}
            ></textarea>
            <div className="flex gap-3">
              <select className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500">
                <option value="all">All Staff</option>
                <option value="teachers">Teachers Only</option>
                <option value="admin">Admin Staff</option>
              </select>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 flex items-center gap-2 font-semibold">
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6 text-yellow-600" />
            Recent Notifications
          </h3>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className={`p-4 rounded-xl ${notif.is_read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{notif.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  </div>
                  <span className="text-xs text-gray-500">{notif.created_at}</span>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-gray-500 text-center py-8">No notifications</p>
            )}
          </div>
          <button
            onClick={onSendNotification}
            className="w-full mt-4 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 font-medium"
          >
            View All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== HELPER COMPONENTS ====================

const RoleBadge: React.FC<{ role?: string }> = ({ role }) => {
  const roleColors: Record<string, string> = {
    school_owner: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    admin: 'bg-blue-100 text-blue-800 border-blue-300',
    headmaster: 'bg-purple-100 text-purple-800 border-purple-300',
    director_study: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    director_discipline: 'bg-red-100 text-red-800 border-red-300',
    accountant: 'bg-green-100 text-green-800 border-green-300',
    stock_manager: 'bg-orange-100 text-orange-800 border-orange-300',
    teacher: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    advisor: 'bg-pink-100 text-pink-800 border-pink-300',
    patron: 'bg-teal-100 text-teal-800 border-teal-300',
    matron: 'bg-purple-100 text-purple-800 border-purple-300',
    support_staff: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const roleLabels: Record<string, string> = {
    school_owner: 'School Owner',
    admin: 'Administrator',
    headmaster: 'Headmaster',
    director_study: 'Director of Studies',
    director_discipline: 'Discipline Director',
    accountant: 'Accountant',
    stock_manager: 'Stock Manager',
    teacher: 'Teacher',
    advisor: 'Advisor',
    patron: 'Patron',
    matron: 'Matron',
    support_staff: 'Support Staff'
  };

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border-2 ${roleColors[role || ''] || 'bg-gray-100 text-gray-800'}`}>
      {roleLabels[role || ''] || role}
    </span>
  );
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
        <CheckCircle className="w-4 h-4" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
      <XCircle className="w-4 h-4" />
      Inactive
    </span>
  );
};

// ==================== MODALS ====================

const AddStaffModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_name: '',
    department: '',
    specialization: '',
    hire_date: new Date().toISOString().split('T')[0],
    contract_type: 'permanent',
    working_hours: 40,
    salary: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/staff-advanced`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert('Staff member added successfully!');
        onSuccess();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Add New Staff Member</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
              <select
                required
                value={formData.role_name}
                onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">Select Role</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Administrator</option>
                <option value="headmaster">Headmaster</option>
                <option value="accountant">Accountant</option>
                <option value="stock_manager">Stock Manager</option>
                <option value="director_study">Director of Studies</option>
                <option value="director_discipline">Discipline Director</option>
                <option value="advisor">Advisor</option>
                <option value="patron">Patron</option>
                <option value="matron">Matron</option>
                <option value="support_staff">Support Staff</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contract Type</label>
              <select
                value={formData.contract_type}
                onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="part-time">Part-time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hire Date</label>
              <input
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Salary (RWF)</label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface StaffDetailModalProps {
  staff: StaffMember;
  onClose: () => void;
  onEdit: () => void;
  onViewSchedule: () => void;
  onViewPerformance: () => void;
  onViewDocuments: () => void;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({ staff, onClose, onEdit, onViewSchedule, onViewPerformance, onViewDocuments }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {staff.first_name?.[0]}{staff.last_name?.[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{staff.first_name} {staff.last_name}</h2>
                <p className="text-blue-100">{staff.role_name}</p>
                <p className="text-sm text-blue-200">ID: {staff.employee_id || staff.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{staff.email || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-semibold">{staff.phone || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-semibold">{staff.department || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Status</p>
              <StatusBadge status={staff.status || staff.employment_status} />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onEdit} className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 font-semibold">
              <Edit2 className="w-5 h-5" />
              Edit
            </button>
            <button onClick={onViewSchedule} className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 font-semibold">
              <Calendar className="w-5 h-5" />
              Schedule
            </button>
            <button onClick={onViewPerformance} className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2 font-semibold">
              <AwardIcon className="w-5 h-5" />
              Performance
            </button>
            <button onClick={onViewDocuments} className="flex-1 bg-orange-600 text-white px-4 py-3 rounded-xl hover:bg-orange-700 flex items-center justify-center gap-2 font-semibold">
              <FileText className="w-5 h-5" />
              Documents
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface BulkActionsModalProps {
  selectedCount: number;
  onAction: (action: string, data?: Record<string, unknown>) => void;
  onClose: () => void;
}

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({ selectedCount, onAction, onClose }) => {
  const [actionType, setActionType] = useState('update_status');
  const [newValue, setNewValue] = useState('');

  const handleAction = () => {
    if (actionType === 'update_status') {
      onAction('update_status', { status: newValue });
    } else if (actionType === 'update_department') {
      onAction('update_department', { department: newValue });
    } else if (actionType === 'update_role') {
      onAction('update_role', { role_name: newValue });
    } else if (actionType === 'deactivate') {
      onAction('update_status', { status: 'inactive' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
      >
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Bulk Actions ({selectedCount} selected)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              >
                <option value="update_status">Update Status</option>
                <option value="update_department">Update Department</option>
                <option value="update_role">Update Role</option>
                <option value="deactivate">Deactivate</option>
              </select>
            </div>

            {actionType !== 'deactivate' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Value</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter new value..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleAction} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">
              Apply
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface ScheduleModalProps {
  staff: StaffMember;
  onClose: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ staff, onClose }) => {
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 10 }, (_, i) => 7 + i);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{staff.first_name} {staff.last_name}</h2>
              <p className="text-blue-100">Schedule Management</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-8 gap-2 overflow-x-auto">
            <div className="bg-gray-100 p-3 rounded-lg font-semibold text-center">Time</div>
            {weekDays.map(day => (
              <div key={day} className="bg-indigo-100 p-3 rounded-lg font-semibold text-center text-indigo-800">
                {day}
              </div>
            ))}

            {hours.map(hour => (
              <React.Fragment key={hour}>
                <div className="bg-gray-50 p-3 rounded-lg text-center text-sm text-gray-600">
                  {hour}:00
                </div>
                {weekDays.map((day) => (
                  <div
                    key={`${day}-${hour}`}
                    className="bg-white border border-gray-200 p-2 rounded-lg min-h-[60px] hover:bg-gray-50 transition-colors cursor-pointer"
                  ></div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface PerformanceModalProps {
  staff: StaffMember;
  onClose: () => void;
}

const PerformanceModal: React.FC<PerformanceModalProps> = ({ staff, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{staff.first_name} {staff.last_name}</h2>
              <p className="text-purple-100">Performance Review</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 rounded-xl text-center">
              <p className="text-4xl font-bold">4.8</p>
              <p className="text-yellow-100">Overall Rating</p>
            </div>
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 text-white p-6 rounded-xl text-center">
              <p className="text-4xl font-bold">5</p>
              <p className="text-green-100">Total Reviews</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white p-6 rounded-xl text-center">
              <p className="text-4xl font-bold">2</p>
              <p className="text-blue-100">Years</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Recent Reviews</h3>
            {[
              { period: 'Q4 2023', rating: 4.8, reviewer: 'Headmaster', date: 'Jan 2024' },
              { period: 'Q3 2023', rating: 4.6, reviewer: 'Headmaster', date: 'Oct 2023' },
              { period: 'Q2 2023', rating: 4.7, reviewer: 'Headmaster', date: 'Jul 2023' },
            ].map((review, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{review.period}</p>
                    <p className="text-sm text-gray-500">Reviewed by {review.reviewer}</p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold">{review.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface DocumentsModalProps {
  staff: StaffMember;
  onClose: () => void;
}

const DocumentsModal: React.FC<DocumentsModalProps> = ({ staff, onClose }) => {
  const documents = [
    { name: 'Employment Contract', type: 'contract', date: '2024-01-15', size: '2.4 MB' },
    { name: 'Degree Certificate', type: 'certificate', date: '2024-01-10', size: '1.8 MB' },
    { name: 'ID Copy', type: 'id_document', date: '2024-01-05', size: '0.5 MB' },
    { name: 'Resume', type: 'resume', date: '2024-01-01', size: '0.3 MB' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{staff.first_name} {staff.last_name}</h2>
              <p className="text-orange-100">Documents</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900">Uploaded Documents</h3>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 flex items-center gap-2">
              <UploadCloud className="w-5 h-5" />
              Upload
            </button>
          </div>

          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type} • {doc.date} • {doc.size}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface NotificationsModalProps {
  notifications: Notification[];
  onClose: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ notifications, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div key={notif.id} className={`p-4 rounded-xl ${notif.is_read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{notif.created_at}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No notifications</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

interface ReportsModalProps {
  staff: StaffMember[];
  onClose: () => void;
}

const ReportsModal: React.FC<ReportsModalProps> = ({ staff, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Staff Reports</h2>
              <p className="text-green-100">Generate comprehensive reports</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all text-left">
              <FileBarChart className="w-10 h-10 text-blue-600 mb-3" />
              <p className="font-semibold text-gray-900">Comprehensive Report</p>
              <p className="text-sm text-gray-500">Full staff analysis with all metrics</p>
            </button>
            <button className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all text-left">
              <BarChart3 className="w-10 h-10 text-green-600 mb-3" />
              <p className="font-semibold text-gray-900">Attendance Report</p>
              <p className="text-sm text-gray-500">Staff attendance statistics</p>
            </button>
            <button className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all text-left">
              <AwardIcon className="w-10 h-10 text-purple-600 mb-3" />
              <p className="font-semibold text-gray-900">Performance Report</p>
              <p className="text-sm text-gray-500">Performance review summaries</p>
            </button>
            <button className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl hover:from-orange-100 hover:to-red-100 transition-all text-left">
              <Clock4 className="w-10 h-10 text-orange-600 mb-3" />
              <p className="font-semibold text-gray-900">Leave Report</p>
              <p className="text-sm text-gray-500">Leave balances and history</p>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UltraAdvancedStaffDashboard;

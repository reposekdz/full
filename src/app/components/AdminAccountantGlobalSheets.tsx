import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, FileText, RefreshCw, Search, Download, Table,
  ChevronDown, Filter, Eye, Edit, Trash2, Plus, X,
  DollarSign, BookOpen, Phone, Mail, MapPin, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../services/apiService';

interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  trade?: string;
  level?: string;
  academic_year?: string;
  enrollment_date?: string;
  status?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relationship?: string;
  total_fees?: number;
  total_paid?: number;
  balance?: number;
  average_marks?: number;
}

interface Filters {
  trades: string[];
  levels: string[];
  academic_years: string[];
}

const AdminAccountantGlobalSheets: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({ trades: [], levels: [], academic_years: [] });
  const [selectedFilters, setSelectedFilters] = useState({
    trade: '',
    level: '',
    status: '',
    academic_year: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch filters on mount
  useEffect(() => {
    fetchFilters();
  }, []);

  // Fetch students when filters or pagination changes
  useEffect(() => {
    fetchStudents();
  }, [selectedFilters, pagination.page]);

  const fetchFilters = async () => {
    try {
      const response = await apiService.request('/global-admin-accountant-sheets/filters');
      if (response.success) {
        setFilters(response.data);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFilters.trade) params.append('trade', selectedFilters.trade);
      if (selectedFilters.level) params.append('level', selectedFilters.level);
      if (selectedFilters.status) params.append('status', selectedFilters.status);
      if (selectedFilters.academic_year) params.append('academic_year', selectedFilters.academic_year);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await apiService.request(`/global-admin-accountant-sheets/students/full?${params}`);
      
      if (response.success) {
        setStudents(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (selectedFilters.trade) params.append('trade', selectedFilters.trade);
      if (selectedFilters.level) params.append('level', selectedFilters.level);
      if (selectedFilters.status) params.append('status', selectedFilters.status);
      if (selectedFilters.academic_year) params.append('academic_year', selectedFilters.academic_year);

      const response = await apiService.request(`/global-admin-accountant-sheets/students/export/excel?${params}`);
      
      if (response.success && response.data) {
        // Use XLSX to create the Excel file
        const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(response.data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
        
        // Generate filename with date
        const date = new Date().toISOString().split('T')[0];
        const filename = `students_export_${date}.xlsx`;
        
        // Download file
        XLSX.writeFile(workbook, filename);
        toast.success(`Exported ${response.count} students to Excel`);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export to Excel');
    } finally {
      setExporting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter(s => 
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q) ||
      s.student_id?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.includes(q)
    );
  }, [students, searchQuery]);

  const handleViewStudent = async (student: Student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const clearFilters = () => {
    setSelectedFilters({ trade: '', level: '', status: '', academic_year: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Table className="w-6 h-6" />
            Global Student Sheets
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all students with full access - Admin & Accountant View
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <Table className="w-4 h-4" />
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </button>
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, email, phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trade</label>
            <select
              value={selectedFilters.trade}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, trade: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Trades</option>
              {filters.trades.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select
              value={selectedFilters.level}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              {filters.levels.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedFilters.status}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select
              value={selectedFilters.academic_year}
              onChange={(e) => setSelectedFilters(prev => ({ ...prev, academic_year: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {filters.academic_years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing {filteredStudents.length} of {pagination.total} students
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => fetchStudents()}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trade/Level</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fees</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avg Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading students...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">
                        {student.student_id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.gender} • {student.date_of_birth ? new Date(student.date_of_birth).getFullYear() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Mail className="w-3 h-3" />
                          {student.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                          <Phone className="w-3 h-3" />
                          {student.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {student.trade}
                        </span>
                        <span className="ml-1 text-gray-600">{student.level}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        Rwf {student.total_fees?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        Rwf {student.total_paid?.toLocaleString() || 0}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${(student.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Rwf {(student.balance || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          (student.average_marks || 0) >= 70 ? 'bg-green-100 text-green-800' :
                          (student.average_marks || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.average_marks || 0}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          student.status === 'active' ? 'bg-green-100 text-green-800' :
                          student.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewStudent(student)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Student Details Modal */}
      {showDetails && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h2>
                  <p className="text-gray-600">ID: {selectedStudent.student_id}</p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Email:</span> {selectedStudent.email || 'N/A'}</p>
                    <p><span className="text-gray-500">Phone:</span> {selectedStudent.phone || 'N/A'}</p>
                    <p><span className="text-gray-500">DOB:</span> {selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="text-gray-500">Gender:</span> {selectedStudent.gender || 'N/A'}</p>
                    <p><span className="text-gray-500">Address:</span> {selectedStudent.address || 'N/A'}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Location</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Province:</span> {selectedStudent.province || 'N/A'}</p>
                    <p><span className="text-gray-500">District:</span> {selectedStudent.district || 'N/A'}</p>
                    <p><span className="text-gray-500">Sector:</span> {selectedStudent.sector || 'N/A'}</p>
                    <p><span className="text-gray-500">Cell:</span> {selectedStudent.cell || 'N/A'}</p>
                    <p><span className="text-gray-500">Village:</span> {selectedStudent.village || 'N/A'}</p>
                  </div>
                </div>

                {/* Academic */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Academic Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Trade:</span> {selectedStudent.trade || 'N/A'}</p>
                    <p><span className="text-gray-500">Level:</span> {selectedStudent.level || 'N/A'}</p>
                    <p><span className="text-gray-500">Academic Year:</span> {selectedStudent.academic_year || 'N/A'}</p>
                    <p><span className="text-gray-500">Enrollment:</span> {selectedStudent.enrollment_date ? new Date(selectedStudent.enrollment_date).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="text-gray-500">Status:</span> {selectedStudent.status || 'N/A'}</p>
                  </div>
                </div>

                {/* Financial */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Financial Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Total Fees:</span> Rwf {selectedStudent.total_fees?.toLocaleString() || 0}</p>
                    <p><span className="text-gray-500">Total Paid:</span> <span className="text-green-600">Rwf {selectedStudent.total_paid?.toLocaleString() || 0}</span></p>
                    <p><span className="text-gray-500">Balance:</span> <span className={(selectedStudent.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}>Rwf {(selectedStudent.balance || 0).toLocaleString()}</span></p>
                    <p><span className="text-gray-500">Average Marks:</span> {selectedStudent.average_marks || 0}%</p>
                  </div>
                </div>

                {/* Guardian */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Guardian Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium">{selectedStudent.guardian_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{selectedStudent.guardian_phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Relationship</p>
                      <p className="font-medium">{selectedStudent.guardian_relationship || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccountantGlobalSheets;

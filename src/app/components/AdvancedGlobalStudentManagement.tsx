import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, Filter, Download, Upload, 
  Edit, Trash2, Eye, BookOpen, Calendar, Phone,
  Mail, MapPin, Award, TrendingUp, BarChart3,
  RefreshCw, Settings, Grid, List, ChevronDown
} from 'lucide-react';

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  student_id: string;
  email: string;
  phone: string;
  gender: 'M' | 'F';
  trade_code: string;
  trade_name: string;
  level: string;
  level_suffix?: string;
  full_level: string;
  status: string;
  created_at: string;
}

interface Trade {
  code: string;
  name: string;
  description: string;
  duration_years: number;
}

interface Level {
  id: string;
  name: string;
  code: string;
  suffix?: string;
}

const AdvancedGlobalStudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Statistics
  const [statistics, setStatistics] = useState({
    total_students: 0,
    male_students: 0,
    female_students: 0,
    active_students: 0,
    total_trades: 0,
    total_levels: 0
  });

  // Fetch data
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        trade: selectedTrade,
        level: selectedLevel,
        gender: selectedGender
      });
      
      const response = await fetch(`/api/global-sheets/students?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/global-sheets/trades', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrades(data.trades || []);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/global-sheets/levels', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLevels(data.levels || []);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/global-sheets/statistics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics || {});
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchTrades();
    fetchLevels();
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, selectedTrade, selectedLevel, selectedGender]);

  // Add new student
  const handleAddStudent = async (studentData: any) => {
    try {
      const response = await fetch('/api/global-sheets/students/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(studentData)
      });
      
      if (response.ok) {
        fetchStudents();
        fetchStatistics();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Abanyeshuri Bose
            </h1>
            <p className="text-gray-600">Gucunga abanyeshuri bose mu ishuri</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Ongeraho Umunyeshuri
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold shadow-lg"
            >
              <Filter className="w-5 h-5" />
              Shungura
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
      >
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-black text-gray-900">{statistics.total_students}</p>
              <p className="text-sm text-gray-600">Abanyeshuri Bose</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">M</div>
            <div>
              <p className="text-2xl font-black text-gray-900">{statistics.male_students}</p>
              <p className="text-sm text-gray-600">Abahungu</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-pink-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">F</div>
            <div>
              <p className="text-2xl font-black text-gray-900">{statistics.female_students}</p>
              <p className="text-sm text-gray-600">Abakobwa</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-yellow-200">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-black text-gray-900">{statistics.total_trades}</p>
              <p className="text-sm text-gray-600">Amahugurwa</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-black text-gray-900">{statistics.total_levels}</p>
              <p className="text-sm text-gray-600">Amashuri</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-indigo-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="text-2xl font-black text-gray-900">{statistics.active_students}</p>
              <p className="text-sm text-gray-600">Bakora</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Shakisha amazina, kode, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'grid' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
        
        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t-2 border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={selectedTrade}
                  onChange={(e) => setSelectedTrade(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Amahugurwa Yose</option>
                  {trades.map(trade => (
                    <option key={trade.code} value={trade.code}>{trade.name}</option>
                  ))}
                </select>
                
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Amashuri Yose</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
                
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">Igitsina Cyose</option>
                  <option value="M">Abahungu</option>
                  <option value="F">Abakobwa</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Students Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg text-gray-600">Birategurika...</span>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" :
            "space-y-4"
          }
        >
          {students.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={viewMode === 'grid' ? 
                "bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-all" :
                "bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-all flex items-center gap-4"
              }
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      student.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                    }`}>
                      {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'active' ? 'Akora' : 'Ntakora'}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{student.student_id}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <BookOpen className="w-4 h-4" />
                      {student.trade_name} - {student.full_level}
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Phone className="w-4 h-4" />
                        {student.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {student.email}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all">
                      <Eye className="w-4 h-4" />
                      Reba
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all">
                      <Edit className="w-4 h-4" />
                      Hindura
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    student.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                  }`}>
                    {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{student.student_id} • {student.trade_name} - {student.full_level}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'active' ? 'Akora' : 'Ntakora'}
                    </span>
                    
                    <button className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add Student Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddStudentModal
            trades={trades}
            levels={levels}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddStudent}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Add Student Modal Component
const AddStudentModal: React.FC<{
  trades: Trade[];
  levels: Level[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ trades, levels, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    student_id: '',
    email: '',
    phone: '',
    gender: 'M',
    trade_code: '',
    level: '',
    level_suffix: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ongeraho Umunyeshuri Mushya</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Izina ry'Ubanza"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Izina ry'Ukurikira"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Kode y'Umunyeshuri"
              value={formData.student_id}
              onChange={(e) => setFormData({...formData, student_id: e.target.value})}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder="Telefone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="M">Umuhungu</option>
              <option value="F">Umukobwa</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.trade_code}
              onChange={(e) => setFormData({...formData, trade_code: e.target.value})}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Hitamo Icyiciro</option>
              {trades.map(trade => (
                <option key={trade.code} value={trade.code}>{trade.name}</option>
              ))}
            </select>
            <select
              value={formData.level}
              onChange={(e) => {
                const selectedLevel = levels.find(l => l.id === e.target.value);
                setFormData({
                  ...formData, 
                  level: selectedLevel?.code || '',
                  level_suffix: selectedLevel?.suffix || ''
                });
              }}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              required
            >
              <option value="">Hitamo Urwego</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
            >
              Hagarika
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all"
            >
              Ongeraho
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedGlobalStudentManagement;
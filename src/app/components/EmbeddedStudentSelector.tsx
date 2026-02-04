import React, { useState, useEffect } from 'react';
import { Search, User, GraduationCap, BookOpen, Users, CheckCircle, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmbeddedStudentSelectorProps {
  value: string;
  onChange: (studentId: string, studentData?: any) => void;
  label?: string;
  required?: boolean;
  showFilters?: boolean;
  compact?: boolean;
}

export const EmbeddedStudentSelector: React.FC<EmbeddedStudentSelectorProps> = ({
  value,
  onChange,
  label = 'Select Student',
  required = false,
  showFilters = true,
  compact = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, tradeFilter, levelFilter, students]);

  const fetchData = async () => {
    try {
      setLoading(true);      const token = localStorage.getItem('token');

      // Global Student Sheets is the single source of truth; derive filter lists from it.
      const studentsRes = await fetch('http://localhost:5000/api/global-sheets/all-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const studentsData = await studentsRes.json();

      const list = studentsData.students || [];
      setStudents(list);

      const tradeMap = new Map<string, any>();
      const levelMap = new Map<string, any>();

      list.forEach((s: any) => {
        if (s.trade_code) {
          tradeMap.set(s.trade_code, {
            trade_code: s.trade_code,
            trade_name: s.trade_name || s.trade_code
          });
        }

        if (s.level_number !== undefined && s.level_number !== null) {
          const suffix = (s.level_suffix || '').toString();
          const display = `${s.level_number}${suffix}`;
          levelMap.set(display, {
            level_number: Number(s.level_number),
            level_suffix: suffix,
            level_display: display
          });
        }
      });

      setTrades(Array.from(tradeMap.values()).sort((a, b) => a.trade_code.localeCompare(b.trade_code)));
      setLevels(Array.from(levelMap.values()).sort((a, b) => a.level_display.localeCompare(b.level_display)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Apply trade filter
    if (tradeFilter) {
      filtered = filtered.filter(s => s.trade_code === tradeFilter);
    }

    // Apply level filter
    if (levelFilter) {
      const levelNumber = parseInt(levelFilter, 10);
      const levelSuffix = levelFilter.replace(/\d+/g, '');
      filtered = filtered.filter(s =>
        Number(s.level_number) === levelNumber &&
        ((s.level_suffix || '').toString() === levelSuffix)
      );
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.first_name?.toLowerCase().includes(query) ||
        student.last_name?.toLowerCase().includes(query) ||
        student.student_id?.toLowerCase().includes(query) ||
        student.username?.toLowerCase().includes(query) ||
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered.slice(0, 15));
    setShowDropdown(searchQuery.trim().length > 0 && filtered.length > 0);
  };

  const handleStudentSelect = (student: any) => {
    onChange(student.id.toString(), student);
    setSearchQuery(`${student.first_name} ${student.last_name}`);
    setShowDropdown(false);
  };

  const clearFilters = () => {
    setTradeFilter('');
    setLevelFilter('');
    setSearchQuery('');
  };

  const selectedStudent = students.find(s => s.id?.toString() === value?.toString());
  const hasFilters = tradeFilter || levelFilter;

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Filters Row */}
      {showFilters && (
        <div className={`grid gap-2 ${compact ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
          <select
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Trades</option>
            {trades.map(trade => (
              <option key={trade.trade_code} value={trade.trade_code}>
                {trade.trade_code} - {trade.trade_name}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level.level_display} value={level.level_display}>
                Level {level.level_display}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowDropdown(filteredStudents.length > 0)}
          placeholder={`Search students${hasFilters ? ' (filtered)' : ''}...`}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required={required}
        />

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}

        {hasFilters && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Filter className="w-4 h-4 text-blue-500" />
          </div>
        )}
      </div>

      {/* Filter Summary */}
      {hasFilters && (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Filter className="w-3 h-3" />
          <span>
            Filtered by: 
            {tradeFilter && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-700 rounded">{tradeFilter}</span>}
            {levelFilter && <span className="ml-1 px-2 py-1 bg-green-100 text-green-700 rounded">Level {levelFilter}</span>}
          </span>
        </div>
      )}

      {/* Dropdown Results */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {filteredStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => handleStudentSelect(student)}
                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {student.student_id}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {student.trade_code}
                      </span>
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" />
                        Level {student.level_number}
                      </span>
                    </div>
                  </div>
                  {value === student.id.toString() && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </motion.div>
            ))}
            
            {filteredStudents.length === 0 && searchQuery && (
              <div className="p-4 text-center text-gray-500">
                No students found matching your criteria
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Student Display */}
      {selectedStudent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
            </div>
            <div className="flex-1">
              <p className="font-bold text-green-900">
                {selectedStudent.first_name} {selectedStudent.last_name}
              </p>
              <div className="flex items-center gap-4 text-sm text-green-700">
                <span>{selectedStudent.student_id}</span>
                <span>{selectedStudent.trade_code}</span>
                <span>Level {selectedStudent.level_number}</span>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="text-xs text-gray-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {searchQuery ? `${filteredStudents.length} results` : `${students.length} total students`}
        </span>
        {hasFilters && (
          <span className="text-blue-600">
            {students.filter(s => 
              (!tradeFilter || s.trade_code === tradeFilter) &&
              (!levelFilter || s.level_number.toString() === levelFilter)
            ).length} match filters
          </span>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Users, Filter, Search, GraduationCap, TrendingUp, User, CheckCircle, Sparkles, X, Loader2, AlertCircle, RefreshCw, ChevronDown, Star, Award } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import { motion, AnimatePresence } from 'motion/react';
import TradeLevelSelector from './TradeLevelSelector';
import { useTradeLevel } from '../hooks/useTradeLevel';

interface SmartStudentSelectorProps {
  value: string;
  onChange: (studentId: string, studentData?: any) => void;
  label?: string;
  required?: boolean;
}

export const SmartStudentSelector: React.FC<SmartStudentSelectorProps> = ({ value, onChange, label = 'Select Student', required = true }) => {
  const { trade: selectedTrade, level: selectedLevel, setTrade: setSelectedTrade, setLevel: setSelectedLevel } = useTradeLevel();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedTrade && selectedLevel) {
      fetchStudents(selectedTrade, selectedLevel);
    }
  }, [selectedTrade, selectedLevel]);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const fetchStudents = async (tradeCode: string, level: string) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      // Use Global Student Sheets API as single source of truth
      const res = await fetch(`http://localhost:5000/api/global-sheets/students?trade_code=${tradeCode}&level_number=${level}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch students');
      
      const data = await res.json();
      setStudents(data.students || []);
      setError('');
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students from Global Student Sheets');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchQuery) {
      setFilteredStudents(students);
      return;
    }
    const filtered = students.filter(s => 
      s.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleStudentSelect = (student: any) => {
    onChange(student.id.toString(), student);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredStudents.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleStudentSelect(filteredStudents[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const selectedStudent = students.find(s => s.id?.toString() === value?.toString());
  const progress = (selectedTrade ? 40 : 0) + (selectedLevel ? 30 : 0) + (value ? 30 : 0);

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <Label className="font-bold text-gray-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          {label} {required && <span className="text-yellow-600">*</span>}
        </Label>
        {loading && <Loader2 className="w-4 h-4 text-green-600 animate-spin" />}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Trade & Level Selector */}
      <TradeLevelSelector
        selectedTrade={selectedTrade}
        selectedLevel={selectedLevel}
        onTradeChange={(trade) => {
          setSelectedTrade(trade);
          onChange('');
        }}
        onLevelChange={(level) => {
          setSelectedLevel(level);
          onChange('');
        }}
        showStats
        showKinyarwanda
        variant="default"
        required={required}
      />

      {/* Step 3: Select Student */}
      <AnimatePresence>
        {selectedTrade && selectedLevel && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.95, height: 0 }}
            className="space-y-3"
          >
            {/* Search Input */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative"
            >
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 z-10">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                placeholder="🔍 Step 3: Search student by name or code..."
                className="w-full pl-12 pr-10 py-4 border-2 border-green-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 outline-none bg-gradient-to-r from-green-50 to-lime-50 font-semibold text-gray-800 transition-all hover:shadow-lg hover:border-green-400"
              />
              {searchQuery && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>

            {/* Student Dropdown */}
            {showDropdown && filteredStudents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-h-64 overflow-y-auto bg-white border-2 border-green-200 rounded-xl shadow-2xl"
              >
                {filteredStudents.map((student, idx) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    whileHover={{ backgroundColor: 'rgb(240, 253, 244)' }}
                    onClick={() => handleStudentSelect(student)}
                    className={`p-4 cursor-pointer border-b border-gray-100 flex items-center gap-3 ${
                      highlightedIndex === idx ? 'bg-green-100' : ''
                    } ${value === student.id.toString() ? 'bg-yellow-50' : ''}`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{student.first_name} {student.last_name}</p>
                      <p className="text-xs text-gray-600 font-semibold">{student.student_id} • Level {student.level_number}</p>
                    </div>
                    {value === student.id.toString() && (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                {filteredStudents.length} students available
              </span>
              {searchQuery && (
                <span className="text-yellow-600 font-bold">
                  Filtered from {students.length}
                </span>
              )}
            </div>
            
            {/* Selected Student Preview */}
            {selectedStudent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gradient-to-r from-green-100 via-yellow-100 to-amber-100 border-2 border-green-300 rounded-xl shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                      {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
                    </div>
                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900 text-lg">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                    <p className="text-sm text-gray-600 font-semibold flex items-center gap-2">
                      <Award className="w-3 h-3" />
                      {selectedStudent.student_id} • Level {selectedStudent.level_number}
                    </p>
                  </div>
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedTrade && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.01 }}
          className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl shadow-md"
        >
          <p className="text-sm font-bold text-yellow-800 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            👆 Please select a trade first to see available students
          </p>
        </motion.div>
      )}
    </div>
  );
};

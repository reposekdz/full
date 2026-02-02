import React, { useState, useEffect } from 'react';
import { Search, User, GraduationCap, BookOpen, Users, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DirectStudentSelectorProps {
  value: string;
  onChange: (studentId: string, studentData?: any) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  showTradeLevel?: boolean;
}

export const DirectStudentSelector: React.FC<DirectStudentSelectorProps> = ({
  value,
  onChange,
  label = 'Select Student',
  required = false,
  placeholder = 'Type student name, ID, or trade/level...',
  showTradeLevel = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch all students on mount
  useEffect(() => {
    fetchAllStudents();
  }, []);

  // Filter students based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents([]);
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(student => 
      student.first_name?.toLowerCase().includes(query) ||
      student.last_name?.toLowerCase().includes(query) ||
      student.student_id?.toLowerCase().includes(query) ||
      student.username?.toLowerCase().includes(query) ||
      student.trade_code?.toLowerCase().includes(query) ||
      student.trade_name?.toLowerCase().includes(query) ||
      `level ${student.level_number}`.includes(query) ||
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(query)
    );

    setFilteredStudents(filtered.slice(0, 10)); // Limit to 10 results
    setShowDropdown(filtered.length > 0);
  }, [searchQuery, students]);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/global-student-sheets/all-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch students');
      
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student: any) => {
    onChange(student.id.toString(), student);
    setSearchQuery(`${student.first_name} ${student.last_name} (${student.student_id})`);
    setShowDropdown(false);
  };

  const selectedStudent = students.find(s => s.id?.toString() === value?.toString());

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowDropdown(filteredStudents.length > 0)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required={required}
        />

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

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
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
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
                      {showTradeLevel && (
                        <>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {student.trade_code}
                          </span>
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            Level {student.level_number}
                          </span>
                        </>
                      )}
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
                No students found matching "{searchQuery}"
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
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
            </div>
            <div className="flex-1">
              <p className="font-bold text-green-900">
                {selectedStudent.first_name} {selectedStudent.last_name}
              </p>
              <div className="flex items-center gap-4 text-sm text-green-700">
                <span>{selectedStudent.student_id}</span>
                {showTradeLevel && (
                  <>
                    <span>{selectedStudent.trade_code}</span>
                    <span>Level {selectedStudent.level_number}</span>
                  </>
                )}
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      {searchQuery && (
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Users className="w-3 h-3" />
          {filteredStudents.length} of {students.length} students match your search
        </div>
      )}
    </div>
  );
};
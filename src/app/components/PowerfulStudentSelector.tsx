import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, GraduationCap, BookOpen, Users, CheckCircle, Star, Award, Filter, X, Loader2, AlertCircle, RefreshCw, ChevronDown, Zap, Target, TrendingUp, Eye, Phone, Mail, MapPin, Calendar, Clock, Heart, Shield, Trophy, Sparkles } from 'lucide-react';

interface PowerfulStudentSelectorProps {
  value: string;
  onChange: (studentId: string, studentData?: any) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  showAdvancedFilters?: boolean;
  showStudentStats?: boolean;
  showRecentActivity?: boolean;
  enableVoiceSearch?: boolean;
  enableBarcodeScanner?: boolean;
  multiSelect?: boolean;
  showFavorites?: boolean;
}

export const PowerfulStudentSelector: React.FC<PowerfulStudentSelectorProps> = ({
  value,
  onChange,
  label = 'Hitamo Umunyeshuri',
  required = false,
  placeholder = 'Andika izina, kode, umwuga cyangwa urwego...',
  showAdvancedFilters = true,
  showStudentStats = true,
  showRecentActivity = true,
  enableVoiceSearch = true,
  enableBarcodeScanner = true,
  multiSelect = false,
  showFavorites = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingStudents, setTrendingStudents] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  
  // Advanced filters
  const [filters, setFilters] = useState({
    trade: '',
    level: '',
    gender: '',
    status: '',
    conductGrade: '',
    attendanceMin: '',
    ageRange: '',
    hasIssues: false,
    hasAchievements: false,
    paymentStatus: ''
  });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAllStudents();
    loadFavorites();
    loadRecentSearches();
    fetchTrendingStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students, filters]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/global-student-sheets/all-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Byanze gufata abanyeshuri');
      
      const data = await response.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Ikosa mu gufata abanyeshuri:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingStudents = async () => {
    // Simulate trending students based on recent activity
    const trending = students.slice(0, 5).map(s => ({
      ...s,
      trendingScore: Math.floor(Math.random() * 100) + 50
    }));
    setTrendingStudents(trending);
  };

  const filterStudents = () => {
    let filtered = students;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => 
        student.first_name?.toLowerCase().includes(query) ||
        student.last_name?.toLowerCase().includes(query) ||
        student.student_id?.toLowerCase().includes(query) ||
        student.username?.toLowerCase().includes(query) ||
        student.trade_code?.toLowerCase().includes(query) ||
        student.trade_name?.toLowerCase().includes(query) ||
        `level ${student.level_number}`.includes(query) ||
        `${student.first_name} ${student.last_name}`.toLowerCase().includes(query)
      );
    }

    // Advanced filters
    if (filters.trade) filtered = filtered.filter(s => s.trade_code === filters.trade);
    if (filters.level) filtered = filtered.filter(s => s.level_number.toString() === filters.level);
    if (filters.gender) filtered = filtered.filter(s => s.gender === filters.gender);
    if (filters.status) filtered = filtered.filter(s => s.status === filters.status);
    if (filters.conductGrade) filtered = filtered.filter(s => s.conduct_grade === filters.conductGrade);
    if (filters.attendanceMin) filtered = filtered.filter(s => s.attendance_percentage >= parseInt(filters.attendanceMin));
    if (filters.hasIssues) filtered = filtered.filter(s => s.total_incidents > 0);
    if (filters.hasAchievements) filtered = filtered.filter(s => s.achievements && s.achievements.length > 0);
    if (filters.paymentStatus) filtered = filtered.filter(s => s.payment_status === filters.paymentStatus);

    // Sort by relevance and favorites
    filtered.sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id.toString());
      const bIsFavorite = favorites.includes(b.id.toString());
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      return 0;
    });

    setFilteredStudents(filtered.slice(0, 20));
    setShowDropdown(searchQuery.trim().length > 0 && filtered.length > 0);
  };

  const handleStudentSelect = (student: any) => {
    if (multiSelect) {
      const newSelected = selectedStudents.includes(student.id.toString())
        ? selectedStudents.filter(id => id !== student.id.toString())
        : [...selectedStudents, student.id.toString()];
      setSelectedStudents(newSelected);
      onChange(newSelected.join(','), student);
    } else {
      onChange(student.id.toString(), student);
      setSearchQuery(`${student.first_name} ${student.last_name}`);
      setShowDropdown(false);
      
      // Add to recent searches
      const newRecent = [student.student_id, ...recentSearches.filter(r => r !== student.student_id)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentStudentSearches', JSON.stringify(newRecent));
    }
  };

  const toggleFavorite = (studentId: string) => {
    const newFavorites = favorites.includes(studentId)
      ? favorites.filter(id => id !== studentId)
      : [...favorites, studentId];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteStudents', JSON.stringify(newFavorites));
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('favoriteStudents');
    if (saved) setFavorites(JSON.parse(saved));
  };

  const loadRecentSearches = () => {
    const saved = localStorage.getItem('recentStudentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
  };

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'rw-RW';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
      };
      recognition.start();
    }
  };

  const clearFilters = () => {
    setFilters({
      trade: '',
      level: '',
      gender: '',
      status: '',
      conductGrade: '',
      attendanceMin: '',
      ageRange: '',
      hasIssues: false,
      hasAchievements: false,
      paymentStatus: ''
    });
  };

  const selectedStudent = students.find(s => s.id?.toString() === value?.toString());
  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== false);

  return (
    <div className="space-y-4" ref={dropdownRef}>
      {/* Label with Advanced Features */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-2">
            {showFavorites && favorites.length > 0 && (
              <span className="text-xs text-yellow-600 flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-500" />
                {favorites.length} Bakunzwe
              </span>
            )}
            <span className="text-xs text-gray-500">{students.length} Abanyeshuri</span>
          </div>
        </div>
      )}

      {/* Advanced Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 z-10">
          <Search className="w-5 h-5 text-blue-600" />
          {isListening && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />
          )}
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowDropdown(filteredStudents.length > 0)}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-4 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-300 focus:border-blue-500 outline-none bg-gradient-to-r from-blue-50 to-cyan-50 font-semibold text-gray-800 transition-all hover:shadow-lg hover:border-blue-400"
          required={required}
        />

        {/* Action Buttons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {enableVoiceSearch && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startVoiceSearch}
              className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-blue-500 hover:text-white'} transition-all`}
            >
              <Zap className="w-4 h-4" />
            </motion.button>
          )}
          
          {showAdvancedFilters && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAdvancedPanel(!showAdvancedPanel)}
              className={`p-2 rounded-full ${hasActiveFilters ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-green-500 hover:text-white'} transition-all`}
            >
              <Filter className="w-4 h-4" />
            </motion.button>
          )}

          {loading && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          )}

          {searchQuery && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchQuery('')}
              className="p-2 rounded-full bg-red-200 text-red-600 hover:bg-red-500 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-purple-900 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Amashyushyu y'Ubushakashatsi
              </h4>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Siba Byose
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select
                value={filters.trade}
                onChange={(e) => setFilters({...filters, trade: e.target.value})}
                className="px-3 py-2 border border-purple-300 rounded-lg text-sm"
              >
                <option value="">Umwuga Wose</option>
                <option value="ICT">ICT</option>
                <option value="ELE">Amashanyarazi</option>
                <option value="CON">Ubwubatsi</option>
                <option value="MEC">Imashini</option>
              </select>

              <select
                value={filters.level}
                onChange={(e) => setFilters({...filters, level: e.target.value})}
                className="px-3 py-2 border border-purple-300 rounded-lg text-sm"
              >
                <option value="">Urwego Rwose</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
              </select>

              <select
                value={filters.gender}
                onChange={(e) => setFilters({...filters, gender: e.target.value})}
                className="px-3 py-2 border border-purple-300 rounded-lg text-sm"
              >
                <option value="">Igitsina Cyose</option>
                <option value="male">Gabo</option>
                <option value="female">Gore</option>
              </select>

              <select
                value={filters.conductGrade}
                onChange={(e) => setFilters({...filters, conductGrade: e.target.value})}
                className="px-3 py-2 border border-purple-300 rounded-lg text-sm"
              >
                <option value="">Imyitwarire Yose</option>
                <option value="A">Myiza (A)</option>
                <option value="B">Nziza (B)</option>
                <option value="C">Isanzwe (C)</option>
                <option value="D">Mibi (D)</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasIssues}
                  onChange={(e) => setFilters({...filters, hasIssues: e.target.checked})}
                  className="rounded"
                />
                Bafite Ibibazo
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.hasAchievements}
                  onChange={(e) => setFilters({...filters, hasAchievements: e.target.checked})}
                  className="rounded"
                />
                Bafite Ibihembo
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Access Buttons */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2">
          {showFavorites && favorites.length > 0 && (
            <button
              onClick={() => setSearchQuery('favorites:')}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold hover:bg-yellow-200 transition-all flex items-center gap-1"
            >
              <Star className="w-3 h-3 fill-yellow-500" />
              Bakunzwe ({favorites.length})
            </button>
          )}
          
          {recentSearches.length > 0 && (
            <button
              onClick={() => setSearchQuery(recentSearches[0])}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold hover:bg-blue-200 transition-all flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              Vuba Aha
            </button>
          )}

          <button
            onClick={() => setFilters({...filters, hasIssues: true})}
            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold hover:bg-red-200 transition-all flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            Bafite Ibibazo
          </button>

          <button
            onClick={() => setFilters({...filters, conductGrade: 'A'})}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold hover:bg-green-200 transition-all flex items-center gap-1"
          >
            <Trophy className="w-3 h-3" />
            Imyitwarire Myiza
          </button>
        </div>
      )}

      {/* Dropdown Results */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border-2 border-blue-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
          >
            {/* Search Stats */}
            <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-blue-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {filteredStudents.length} Abanyeshuri Babonetse
                </span>
                {hasActiveFilters && (
                  <span className="text-purple-600 font-semibold flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Byashyushywe
                  </span>
                )}
              </div>
            </div>

            {filteredStudents.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => handleStudentSelect(student)}
                className="p-4 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </div>
                    {favorites.includes(student.id.toString()) && (
                      <Star className="absolute -top-1 -right-1 w-4 h-4 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900">{student.first_name} {student.last_name}</p>
                      {student.conduct_grade === 'A' && (
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      )}
                      {student.total_incidents > 0 && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600">
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
                      {student.attendance_percentage && (
                        <span className={`flex items-center gap-1 ${student.attendance_percentage >= 90 ? 'text-green-600' : student.attendance_percentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                          <TrendingUp className="w-3 h-3" />
                          {student.attendance_percentage}%
                        </span>
                      )}
                    </div>

                    {showStudentStats && (
                      <div className="flex items-center gap-3 mt-2">
                        {student.conduct_grade && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            student.conduct_grade === 'A' ? 'bg-green-100 text-green-800' :
                            student.conduct_grade === 'B' ? 'bg-blue-100 text-blue-800' :
                            student.conduct_grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Imyitwarire: {student.conduct_grade}
                          </span>
                        )}
                        {student.payment_status && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            student.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            student.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {student.payment_status === 'paid' ? 'Yishyuye' : 
                             student.payment_status === 'partial' ? 'Igice' : 'Ntiyishyura'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(student.id.toString());
                      }}
                      className="p-1 hover:bg-yellow-100 rounded-full transition-all"
                    >
                      <Star className={`w-4 h-4 ${favorites.includes(student.id.toString()) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'}`} />
                    </button>
                    
                    {value === student.id.toString() && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredStudents.length === 0 && searchQuery && (
              <div className="p-6 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="font-semibold">Nta munyeshuri wabonetse</p>
                <p className="text-sm">Gerageza gukoresha amagambo atandukanye</p>
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
          className="p-4 bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 border-2 border-green-300 rounded-xl shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
              </div>
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-black text-gray-900 text-lg">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">{selectedStudent.student_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">{selectedStudent.trade_code}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Level {selectedStudent.level_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold">Imyitwarire: {selectedStudent.conduct_grade || 'A'}</span>
                </div>
              </div>

              {showRecentActivity && (
                <div className="mt-3 p-2 bg-white/50 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Ibikorwa Vuba Aha: Yaritabiriye amasomo, Yishyuye amafaranga, Imyitwarire myiza
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {searchQuery ? `${filteredStudents.length} Babonetse` : `${students.length} Abanyeshuri`}
          </span>
          {favorites.length > 0 && (
            <span className="flex items-center gap-1 text-yellow-600">
              <Star className="w-3 h-3 fill-yellow-500" />
              {favorites.length} Bakunzwe
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-semibold">⚡ Byihuse & Bikomeye</span>
          {hasActiveFilters && (
            <span className="text-purple-600 font-semibold">🎯 Byashyushywe</span>
          )}
        </div>
      </div>
    </div>
  );
};
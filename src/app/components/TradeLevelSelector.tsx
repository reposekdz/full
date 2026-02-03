import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, BookOpen, GraduationCap } from 'lucide-react';

interface Trade {
  trade_code: string;
  trade_name: string;
  trade_name_rw: string;
}

interface Level {
  level_number: number;
  level_suffix: string | null;
  level_display: string;
}

interface Course {
  id: number;
  trade_code: string;
  course_name: string;
  course_name_rw: string;
  level_number: number;
  level_suffix: string | null;
  level_display: string;
}

interface TradeLevelSelectorProps {
  selectedTrade: string;
  selectedLevel: string;
  onTradeChange: (trade: string) => void;
  onLevelChange: (level: string) => void;
  selectedCourse?: string;
  onCourseChange?: (courseId: string) => void;
  required?: boolean;
  disabled?: boolean;
  showLabels?: boolean;
  showCourses?: boolean;
  showStats?: boolean;
  showKinyarwanda?: boolean;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
  onDataLoaded?: (data: { trades: Trade[], levels: Level[], courses?: Course[] }) => void;
}

const TradeLevelSelector: React.FC<TradeLevelSelectorProps> = ({
  selectedTrade,
  selectedLevel,
  onTradeChange,
  onLevelChange,
  selectedCourse = '',
  onCourseChange,
  required = false,
  disabled = false,
  showLabels = true,
  showCourses = false,
  showStats = false,
  showKinyarwanda = false,
  variant = 'default',
  className = '',
  onDataLoaded
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch all trades on mount
  useEffect(() => {
    fetchTrades();
  }, []);

  // Fetch levels when trade changes
  useEffect(() => {
    if (selectedTrade) {
      fetchLevels(selectedTrade);
    } else {
      setLevels([]);
      setCourses([]);
      onLevelChange('');
      if (onCourseChange) onCourseChange('');
    }
  }, [selectedTrade]);

  // Fetch courses when level changes
  useEffect(() => {
    if (showCourses && selectedTrade && selectedLevel) {
      fetchCourses(selectedTrade, selectedLevel);
    } else {
      setCourses([]);
      if (onCourseChange) onCourseChange('');
    }
  }, [selectedTrade, selectedLevel, showCourses]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/trades-levels/trades', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setTrades(response.data.trades);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        if (onDataLoaded) onDataLoaded({ trades: response.data.trades, levels: [], courses: [] });
      }
    } catch (error: any) {
      console.error('Error fetching trades:', error);
      setError('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async (tradeCode: string) => {
    try {
      setLoadingLevels(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/trades-levels/trades/${tradeCode}/levels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setLevels(response.data.levels);
        if (onDataLoaded) onDataLoaded({ trades, levels: response.data.levels, courses: [] });
      }
    } catch (error: any) {
      console.error('Error fetching levels:', error);
      setError('Failed to load levels');
      setLevels([]);
    } finally {
      setLoadingLevels(false);
    }
  };

  const fetchCourses = async (tradeCode: string, level: string) => {
    try {
      setLoadingCourses(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/trades-levels/trades/${tradeCode}/levels/${level}/courses`);
      if (response.data.success) {
        setCourses(response.data.courses);
        if (onDataLoaded) onDataLoaded({ trades, levels, courses: response.data.courses });
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleTradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onTradeChange(value);
    onLevelChange('');
    if (onCourseChange) onCourseChange('');
  };

  const handleRefresh = () => {
    fetchTrades();
    if (selectedTrade) fetchLevels(selectedTrade);
    if (showCourses && selectedTrade && selectedLevel) fetchCourses(selectedTrade, selectedLevel);
  };

  const getSelectedTradeName = () => {
    const trade = trades.find(t => t.trade_code === selectedTrade);
    return trade ? (showKinyarwanda ? trade.trade_name_rw : trade.trade_name) : '';
  };

  const getSelectedCourseName = () => {
    const course = courses.find(c => c.id.toString() === selectedCourse);
    return course ? (showKinyarwanda ? course.course_name_rw : course.course_name) : '';
  };

  const containerClass = variant === 'compact' ? 'flex gap-2' : variant === 'inline' ? 'flex gap-3 items-end' : 'flex gap-4';
  const inputClass = variant === 'compact' ? 'h-9 text-sm' : 'h-10';

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Trade Selector */}
      <div className="flex-1">
        {showLabels && (
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Trade {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            value={selectedTrade}
            onChange={handleTradeChange}
            disabled={disabled || loading}
            required={required}
            className={`w-full px-3 py-2 ${inputClass} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${selectedTrade ? 'border-green-500' : ''}`}
          >
            <option value="">{loading ? 'Loading...' : 'Select Trade'}</option>
            {trades.map((trade) => (
              <option key={trade.trade_code} value={trade.trade_code}>
                {trade.trade_code} - {showKinyarwanda ? trade.trade_name_rw : trade.trade_name}
              </option>
            ))}
          </select>
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          )}
          {selectedTrade && !loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Level Selector */}
      <div className="flex-1">
        {showLabels && (
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Level {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            disabled={disabled || loading || loadingLevels || !selectedTrade}
            required={required}
            className={`w-full px-3 py-2 ${inputClass} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${selectedLevel ? 'border-green-500' : ''}`}
          >
            <option value="">{loadingLevels ? 'Loading...' : !selectedTrade ? 'Select Trade First' : 'Select Level'}</option>
            {levels.map((level) => (
              <option key={level.level_display} value={level.level_display}>
                Level {level.level_display}
              </option>
            ))}
          </select>
          {loadingLevels && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          )}
          {selectedLevel && !loadingLevels && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
          )}
        </div>
      </div>

      {/* Course Selector (Optional) */}
      {showCourses && onCourseChange && (
        <div className="flex-1">
          {showLabels && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course {required && <span className="text-red-500">*</span>}
            </label>
          )}
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={(e) => onCourseChange(e.target.value)}
              disabled={disabled || loading || loadingCourses || !selectedLevel}
              required={required}
              className={`w-full px-3 py-2 ${inputClass} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${selectedCourse ? 'border-green-500' : ''}`}
            >
              <option value="">{loadingCourses ? 'Loading...' : !selectedLevel ? 'Select Level First' : 'Select Course'}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {showKinyarwanda ? course.course_name_rw : course.course_name}
                </option>
              ))}
            </select>
            {loadingCourses && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            )}
            {selectedCourse && !loadingCourses && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      {variant !== 'compact' && (
        <div className={showLabels ? 'mt-6' : ''}>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || loadingLevels || loadingCourses}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${(loading || loadingLevels || loadingCourses) ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Display */}
      {showStats && selectedTrade && selectedLevel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-full left-0 right-0 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold">{getSelectedTradeName()}</span>
              <span className="mx-2">•</span>
              <span>Level {selectedLevel}</span>
              {showCourses && selectedCourse && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-blue-600">{getSelectedCourseName()}</span>
                </>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {levels.length} levels available
              {showCourses && courses.length > 0 && ` • ${courses.length} courses`}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TradeLevelSelector;

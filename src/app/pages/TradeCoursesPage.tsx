import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  GraduationCap, 
  ChevronDown, 
  ChevronRight, 
  Award,
  CheckCircle,
  Search,
  Filter
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

interface Course {
  name: string;
  code?: string;
  description?: string;
  credits: number;
  is_required: boolean;
}

interface Level {
  level_number: number;
  level_name: string;
  courses: Course[];
}

interface Trade {
  code: string;
  name: string;
  description: string;
  duration_months: number;
  levels: Level[];
  total_levels: number;
  total_courses: number;
}

export default function TradeCoursesPage() {
  const [structure, setStructure] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrades, setExpandedTrades] = useState<Set<string>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');

  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = async () => {
    try {
      const res = await axios.get(`${API_URL}/trade-courses-api/structure`);
      if (res.data.success) {
        setStructure(res.data.structure);
      }
    } catch (err) {
      console.error('Failed to fetch course structure:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrade = (tradeCode: string) => {
    const newExpanded = new Set(expandedTrades);
    if (newExpanded.has(tradeCode)) {
      newExpanded.delete(tradeCode);
    } else {
      newExpanded.add(tradeCode);
    }
    setExpandedTrades(newExpanded);
  };

  const toggleLevel = (levelKey: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelKey)) {
      newExpanded.delete(levelKey);
    } else {
      newExpanded.add(levelKey);
    }
    setExpandedLevels(newExpanded);
  };

  const filteredStructure = structure.filter(trade => {
    if (selectedTrade !== 'all' && trade.code !== selectedTrade) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return trade.name.toLowerCase().includes(query) ||
             trade.levels.some(level => 
               level.courses.some(course => 
                 course.name.toLowerCase().includes(query)
               )
             );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-600">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Trade Courses & Curriculum
              </h1>
              <p className="text-gray-600 text-lg">
                Explore all courses offered across different trades and levels
              </p>
            </div>
            <GraduationCap className="w-16 h-16 text-blue-600" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Trades</p>
                  <p className="text-4xl font-black mt-1">{structure.length}</p>
                </div>
                <Award className="w-12 h-12 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Courses</p>
                  <p className="text-4xl font-black mt-1">
                    {structure.reduce((sum, t) => sum + t.total_courses, 0)}
                  </p>
                </div>
                <BookOpen className="w-12 h-12 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Levels</p>
                  <p className="text-4xl font-black mt-1">
                    {structure.reduce((sum, t) => sum + t.total_levels, 0)}
                  </p>
                </div>
                <GraduationCap className="w-12 h-12 text-purple-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Trade Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedTrade}
                onChange={(e) => setSelectedTrade(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Trades</option>
                {structure.map(trade => (
                  <option key={trade.code} value={trade.code}>{trade.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Trades List */}
      <div className="max-w-7xl mx-auto space-y-6">
        {filteredStructure.map((trade) => (
          <div key={trade.code} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Trade Header */}
            <div
              onClick={() => toggleTrade(trade.code)}
              className="cursor-pointer bg-gradient-to-r from-gray-50 to-white p-6 hover:from-gray-100 hover:to-gray-50 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {expandedTrades.has(trade.code) ? (
                    <ChevronDown className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{trade.name}</h2>
                    <p className="text-gray-600 mt-1">{trade.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold text-sm">
                    {trade.code}
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-sm">
                    {trade.total_levels} Levels
                  </span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold text-sm">
                    {trade.total_courses} Courses
                  </span>
                  <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold text-sm">
                    {trade.duration_months} Months
                  </span>
                </div>
              </div>
            </div>

            {/* Levels */}
            {expandedTrades.has(trade.code) && (
              <div className="p-6 bg-gray-50 space-y-4">
                {trade.levels.map((level) => {
                  const levelKey = `${trade.code}-${level.level_number}`;
                  return (
                    <div key={levelKey} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                      {/* Level Header */}
                      <div
                        onClick={() => toggleLevel(levelKey)}
                        className="cursor-pointer p-5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {expandedLevels.has(levelKey) ? (
                              <ChevronDown className="w-5 h-5 text-green-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                              <h3 className="text-xl font-black text-gray-900">{level.level_name}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {level.courses.length} courses available
                              </p>
                            </div>
                          </div>
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">
                            {level.courses.length} Courses
                          </span>
                        </div>
                      </div>

                      {/* Courses */}
                      {expandedLevels.has(levelKey) && (
                        <div className="p-5 bg-gray-50 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {level.courses.map((course, idx) => (
                              <div
                                key={idx}
                                className="bg-white rounded-lg p-4 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <BookOpen className="w-5 h-5 text-blue-600" />
                                      <h4 className="font-bold text-gray-900">{course.name}</h4>
                                    </div>
                                    {course.description && (
                                      <p className="text-sm text-gray-600 mt-2">{course.description}</p>
                                    )}
                                    <div className="flex items-center space-x-3 mt-3">
                                      {course.is_required && (
                                        <span className="flex items-center space-x-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                          <CheckCircle className="w-3 h-3" />
                                          <span>Required</span>
                                        </span>
                                      )}
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                        {course.credits} Credit{course.credits !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredStructure.length === 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      )}
    </div>
  );
}

import { apiService } from './apiService';

// ============================================
// COMPREHENSIVE TRADES & COURSES API SERVICE
// Advanced API Integration for Trades Management
// ============================================

const API_BASE = '/api/trades';

// Types
export interface Trade {
  id: string;
  code: string;
  name: string;
  name_rw?: string;
  description: string;
  description_rw?: string;
  image_url?: string;
  instructor_count?: number;
  course_count?: number;
  student_count?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TradeCourse {
  id: number;
  code: string;
  trade_code: string;
  trade_name: string;
  name: string;
  description: string;
  level: string;
  duration: string;
  modules: string;
  status: string;
  created_at: string;
}

export interface TradeInstructor {
  id: number;
  trade_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  status: string;
  photo_url?: string;
}

export interface TradeLevel {
  id: number;
  trade_code: string;
  level: string;
  duration: string;
  description: string;
  modules: string[];
  capacity: number;
  current_students: number;
}

export interface TradeWorkshop {
  id: number;
  trade_code: string;
  name: string;
  description: string;
  instructor: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  location: string;
}

export interface TradeStatistics {
  total_trades: number;
  total_courses: number;
  total_instructors: number;
  total_students: number;
  active_trades: number;
  courses_by_level: { level: string; count: number }[];
  students_by_trade: { trade: string; count: number }[];
}

// ============================================
// TRADES API FUNCTIONS
// ============================================

// Get all trades with optional search
export const getAllTrades = async (search?: string): Promise<Trade[]> => {
  try {
    const endpoint = search ? `${API_BASE}?search=${encodeURIComponent(search)}` : API_BASE;
    const response = await apiService.request(endpoint);
    return response.trades || [];
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
};

// Get single trade by code
export const getTradeByCode = async (code: string): Promise<Trade | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/${code}`);
    return response.trade || null;
  } catch (error) {
    console.error('Error fetching trade:', error);
    return null;
  }
};

// Create new trade
export const createTrade = async (tradeData: Partial<Trade>): Promise<Trade | null> => {
  try {
    const response = await apiService.request(API_BASE, {
      method: 'POST',
      body: JSON.stringify(tradeData)
    });
    return response.trade || null;
  } catch (error) {
    console.error('Error creating trade:', error);
    return null;
  }
};

// Update trade
export const updateTrade = async (code: string, tradeData: Partial<Trade>): Promise<Trade | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/${code}`, {
      method: 'PUT',
      body: JSON.stringify(tradeData)
    });
    return response.trade || null;
  } catch (error) {
    console.error('Error updating trade:', error);
    return null;
  }
};

// Delete trade
export const deleteTrade = async (code: string): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/${code}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting trade:', error);
    return false;
  }
};

// Search trades
export const searchTrades = async (query: string) => {
  try {
    const response = await apiService.request(`${API_BASE}/search/query?q=${encodeURIComponent(query)}`);
    return response.results || { trades: [], courses: [], classes: [] };
  } catch (error) {
    console.error('Error searching trades:', error);
    return { trades: [], courses: [], classes: [] };
  }
};

// ============================================
// COURSES API FUNCTIONS
// ============================================

// Get all courses
export const getAllCourses = async (tradeCode?: string): Promise<TradeCourse[]> => {
  try {
    const endpoint = tradeCode ? `${API_BASE}/courses?trade_code=${encodeURIComponent(tradeCode)}` : `${API_BASE}/courses`;
    const response = await apiService.request(endpoint);
    return response.courses || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

// Get course by ID
export const getCourseById = async (id: number): Promise<TradeCourse | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/courses/${id}`);
    return response.course || null;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
};

// Create course
export const createCourse = async (courseData: Partial<TradeCourse>): Promise<TradeCourse | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/courses`, {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
    return response.course || null;
  } catch (error) {
    console.error('Error creating course:', error);
    return null;
  }
};

// Update course
export const updateCourse = async (id: number, courseData: Partial<TradeCourse>): Promise<TradeCourse | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
    return response.course || null;
  } catch (error) {
    console.error('Error updating course:', error);
    return null;
  }
};

// Delete course
export const deleteCourse = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/courses/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    return false;
  }
};

// ============================================
// INSTRUCTORS API FUNCTIONS
// ============================================

// Get instructors by trade
export const getInstructorsByTrade = async (tradeCode: string): Promise<TradeInstructor[]> => {
  try {
    const response = await apiService.request(`${API_BASE}/instructors?trade_code=${encodeURIComponent(tradeCode)}`);
    return response.instructors || [];
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }
};

// Get all instructors
export const getAllInstructors = async (): Promise<TradeInstructor[]> => {
  try {
    const response = await apiService.request(`${API_BASE}/instructors/all`);
    return response.instructors || [];
  } catch (error) {
    console.error('Error fetching all instructors:', error);
    return [];
  }
};

// Create instructor
export const createInstructor = async (instructorData: Partial<TradeInstructor>): Promise<TradeInstructor | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/instructors`, {
      method: 'POST',
      body: JSON.stringify(instructorData)
    });
    return response.instructor || null;
  } catch (error) {
    console.error('Error creating instructor:', error);
    return null;
  }
};

// Update instructor
export const updateInstructor = async (id: number, instructorData: Partial<TradeInstructor>): Promise<TradeInstructor | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/instructors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(instructorData)
    });
    return response.instructor || null;
  } catch (error) {
    console.error('Error updating instructor:', error);
    return null;
  }
};

// Delete instructor
export const deleteInstructor = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/instructors/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting instructor:', error);
    return false;
  }
};

// ============================================
// LEVELS API FUNCTIONS
// ============================================

// Get levels by trade
export const getLevelsByTrade = async (tradeCode: string): Promise<TradeLevel[]> => {
  try {
    const response = await apiService.request(`${API_BASE}/levels?trade_code=${encodeURIComponent(tradeCode)}`);
    return response.levels || [];
  } catch (error) {
    console.error('Error fetching levels:', error);
    return [];
  }
};

// Create level
export const createLevel = async (levelData: Partial<TradeLevel>): Promise<TradeLevel | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/levels`, {
      method: 'POST',
      body: JSON.stringify(levelData)
    });
    return response.level || null;
  } catch (error) {
    console.error('Error creating level:', error);
    return null;
  }
};

// ============================================
// WORKSHOPS API FUNCTIONS
// ============================================

// Get workshops by trade
export const getWorkshopsByTrade = async (tradeCode: string): Promise<TradeWorkshop[]> => {
  try {
    const response = await apiService.request(`${API_BASE}/workshops?trade_code=${encodeURIComponent(tradeCode)}`);
    return response.workshops || [];
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return [];
  }
};

// Create workshop
export const createWorkshop = async (workshopData: Partial<TradeWorkshop>): Promise<TradeWorkshop | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/workshops`, {
      method: 'POST',
      body: JSON.stringify(workshopData)
    });
    return response.workshop || null;
  } catch (error) {
    console.error('Error creating workshop:', error);
    return null;
  }
};

// ============================================
// STATISTICS API FUNCTIONS
// ============================================

// Get trade statistics
export const getTradeStatistics = async (): Promise<TradeStatistics> => {
  try {
    const response = await apiService.request(`${API_BASE}/statistics`);
    return response.statistics || {
      total_trades: 0,
      total_courses: 0,
      total_instructors: 0,
      total_students: 0,
      active_trades: 0,
      courses_by_level: [],
      students_by_trade: []
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      total_trades: 0,
      total_courses: 0,
      total_instructors: 0,
      total_students: 0,
      active_trades: 0,
      courses_by_level: [],
      students_by_trade: []
    };
  }
};

// Get dashboard data
export const getTradesDashboardData = async () => {
  try {
    const [trades, statistics] = await Promise.all([
      getAllTrades(),
      getTradeStatistics()
    ]);

    return {
      trades,
      statistics,
      recent_trades: trades.slice(0, 5),
      popular_trades: trades.slice(0, 6)
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      trades: [],
      statistics: null,
      recent_trades: [],
      popular_trades: []
    };
  }
};

// ============================================
// ADVANCED FEATURES
// ============================================

// Enroll student in trade
export const enrollStudentInTrade = async (tradeCode: string, studentId: number): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ trade_code: tradeCode, student_id: studentId })
    });
    return true;
  } catch (error) {
    console.error('Error enrolling student:', error);
    return false;
  }
};

// Get student trades
export const getStudentTrades = async (studentId: number): Promise<Trade[]> => {
  try {
    const response = await apiService.request(`${API_BASE}/student/${studentId}/trades`);
    return response.trades || [];
  } catch (error) {
    console.error('Error fetching student trades:', error);
    return [];
  }
};

// Get trade students
export const getTradeStudents = async (tradeCode: string): Promise<any[]> => {
  try {
    const response = await apiService.request(`${API_BASE}/${tradeCode}/students`);
    return response.students || [];
  } catch (error) {
    console.error('Error fetching trade students:', error);
    return [];
  }
};

// Export trades report
export const exportTradesReport = async (format: 'csv' | 'pdf' = 'csv'): Promise<string | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/export?format=${format}`);
    return response.url || null;
  } catch (error) {
    console.error('Error exporting report:', error);
    return null;
  }
};

// ============================================
// COMBINED API OBJECT
// ============================================

export const tradesApi = {
  // Trades
  getAllTrades,
  getTradeByCode,
  createTrade,
  updateTrade,
  deleteTrade,
  searchTrades,

  // Courses
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,

  // Instructors
  getInstructorsByTrade,
  getAllInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,

  // Levels
  getLevelsByTrade,
  createLevel,

  // Workshops
  getWorkshopsByTrade,
  createWorkshop,

  // Statistics
  getTradeStatistics,
  getTradesDashboardData,

  // Advanced
  enrollStudentInTrade,
  getStudentTrades,
  getTradeStudents,
  exportTradesReport
};

export default tradesApi;

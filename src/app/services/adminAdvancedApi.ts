import { apiService } from './apiService';

// ============================================
// COMPREHENSIVE ADMIN API SERVICE
// Advanced API Integration for Admin Management
// ============================================

const API_BASE = '/api';

// Types
export interface Quiz {
  id: number;
  title: string;
  description: string;
  trade_code?: string;
  class_id?: number;
  subject?: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  questions: number;
  status: 'draft' | 'published' | 'closed';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Homework {
  id: number;
  title: string;
  description: string;
  trade_code?: string;
  class_id?: number;
  subject: string;
  due_date: string;
  total_marks: number;
  attachments?: string;
  status: 'draft' | 'published' | 'closed';
  created_by: number;
  created_at: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  trade_code?: string;
  class_id?: number;
  subject: string;
  due_date: string;
  total_marks: number;
  instructions?: string;
  status: 'draft' | 'published' | 'closed';
  created_by: number;
  created_at: string;
}

export interface StudyGroup {
  id: number;
  name: string;
  description: string;
  trade_code?: string;
  subject?: string;
  max_students: number;
  current_students: number;
  created_by: number;
  status: 'active' | 'inactive' | 'completed';
  created_at: string;
}

export interface GamificationPoint {
  id: number;
  student_id: number;
  student_name: string;
  points: number;
  type: 'assignment' | 'quiz' | 'attendance' | 'behavior' | 'other';
  description: string;
  awarded_by: number;
  awarded_at: string;
}

export interface Leaderboard {
  rank: number;
  student_id: number;
  student_name: string;
  total_points: number;
  badges: number;
  streak_days: number;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  summary?: string;
  category: string;
  tags?: string[];
  image_url?: string;
  author_id: number;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  created_at: string;
  published_at?: string;
}

export interface LiveSession {
  id: number;
  title: string;
  description: string;
  host_id: number;
  host_name: string;
  subject: string;
  trade_code?: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  current_participants: number;
  max_participants: number;
}

export interface SerialCode {
  id: number;
  code: string;
  code_type: 'student' | 'parent' | 'staff';
  status: 'available' | 'used' | 'expired' | 'revoked';
  created_by: number;
  used_by?: number;
  created_at: string;
  expires_at?: string;
  used_at?: string;
}

// ============================================
// QUIZ API FUNCTIONS
// ============================================

export const getAllQuizzes = async (params?: { search?: string; status?: string; trade_code?: string }): Promise<Quiz[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.trade_code) queryParams.append('trade_code', params.trade_code);
    
    const endpoint = `/quizzes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.quizzes || [];
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return [];
  }
};

export const getQuizById = async (id: number): Promise<Quiz | null> => {
  try {
    const response = await apiService.request(`/quizzes/${id}`);
    return response.quiz || null;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return null;
  }
};

export const createQuiz = async (quizData: Partial<Quiz>): Promise<Quiz | null> => {
  try {
    const response = await apiService.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
    return response.quiz || null;
  } catch (error) {
    console.error('Error creating quiz:', error);
    return null;
  }
};

export const updateQuiz = async (id: number, quizData: Partial<Quiz>): Promise<Quiz | null> => {
  try {
    const response = await apiService.request(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData)
    });
    return response.quiz || null;
  } catch (error) {
    console.error('Error updating quiz:', error);
    return null;
  }
};

export const deleteQuiz = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`/quizzes/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return false;
  }
};

export const publishQuiz = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`/quizzes/${id}/publish`, { method: 'POST' });
    return true;
  } catch (error) {
    console.error('Error publishing quiz:', error);
    return false;
  }
};

// ============================================
// HOMEWORK API FUNCTIONS
// ============================================

export const getAllHomework = async (params?: { search?: string; status?: string; trade_code?: string }): Promise<Homework[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.trade_code) queryParams.append('trade_code', params.trade_code);
    
    const endpoint = `/homework${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.homework || [];
  } catch (error) {
    console.error('Error fetching homework:', error);
    return [];
  }
};

export const createHomework = async (homeworkData: Partial<Homework>): Promise<Homework | null> => {
  try {
    const response = await apiService.request('/homework', {
      method: 'POST',
      body: JSON.stringify(homeworkData)
    });
    return response.homework || null;
  } catch (error) {
    console.error('Error creating homework:', error);
    return null;
  }
};

export const updateHomework = async (id: number, homeworkData: Partial<Homework>): Promise<Homework | null> => {
  try {
    const response = await apiService.request(`/homework/${id}`, {
      method: 'PUT',
      body: JSON.stringify(homeworkData)
    });
    return response.homework || null;
  } catch (error) {
    console.error('Error updating homework:', error);
    return null;
  }
};

export const deleteHomework = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`/homework/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting homework:', error);
    return false;
  }
};

// ============================================
// ASSIGNMENTS API FUNCTIONS
// ============================================

export const getAllAssignments = async (params?: { search?: string; status?: string }): Promise<Assignment[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = `/assignments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.assignments || [];
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
};

export const createAssignment = async (assignmentData: Partial<Assignment>): Promise<Assignment | null> => {
  try {
    const response = await apiService.request('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
    return response.assignment || null;
  } catch (error) {
    console.error('Error creating assignment:', error);
    return null;
  }
};

// ============================================
// STUDY GROUPS API FUNCTIONS
// ============================================

export const getAllStudyGroups = async (params?: { search?: string; status?: string }): Promise<StudyGroup[]> => {
  try {
    const endpoint = params?.search || params?.status 
      ? `/study-groups?search=${params.search || ''}&status=${params.status || ''}`
      : '/study-groups';
    const response = await apiService.request(endpoint);
    return response.groups || [];
  } catch (error) {
    console.error('Error fetching study groups:', error);
    return [];
  }
};

export const createStudyGroup = async (groupData: Partial<StudyGroup>): Promise<StudyGroup | null> => {
  try {
    const response = await apiService.request('/study-groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
    return response.group || null;
  } catch (error) {
    console.error('Error creating study group:', error);
    return null;
  }
};

// ============================================
// GAMIFICATION API FUNCTIONS
// ============================================

export const getLeaderboard = async (params?: { limit?: number; period?: 'daily' | 'weekly' | 'monthly' | 'all' }): Promise<Leaderboard[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.period) queryParams.append('period', params.period);
    
    const endpoint = `/gamification/leaderboard${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.leaderboard || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

export const awardPoints = async (studentId: number, points: number, type: string, description: string): Promise<boolean> => {
  try {
    await apiService.request('/gamification/award', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, points, type, description })
    });
    return true;
  } catch (error) {
    console.error('Error awarding points:', error);
    return false;
  }
};

export const getStudentPoints = async (studentId: number): Promise<GamificationPoint[]> => {
  try {
    const response = await apiService.request(`/gamification/student/${studentId}/points`);
    return response.points || [];
  } catch (error) {
    console.error('Error fetching student points:', error);
    return [];
  }
};

// ============================================
// ARTICLES API FUNCTIONS
// ============================================

export const getAllArticles = async (params?: { search?: string; status?: string; category?: string }): Promise<Article[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.category) queryParams.append('category', params.category);
    
    const endpoint = `/articles${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.articles || [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
};

export const getArticleById = async (id: number): Promise<Article | null> => {
  try {
    const response = await apiService.request(`/articles/${id}`);
    return response.article || null;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
};

export const createArticle = async (articleData: Partial<Article>): Promise<Article | null> => {
  try {
    const response = await apiService.request('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData)
    });
    return response.article || null;
  } catch (error) {
    console.error('Error creating article:', error);
    return null;
  }
};

export const updateArticle = async (id: number, articleData: Partial<Article>): Promise<Article | null> => {
  try {
    const response = await apiService.request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData)
    });
    return response.article || null;
  } catch (error) {
    console.error('Error updating article:', error);
    return null;
  }
};

export const deleteArticle = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`/articles/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting article:', error);
    return false;
  }
};

export const publishArticle = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`/articles/${id}/publish`, { method: 'POST' });
    return true;
  } catch (error) {
    console.error('Error publishing article:', error);
    return false;
  }
};

// ============================================
// LIVE SESSIONS API FUNCTIONS
// ============================================

export const getAllLiveSessions = async (params?: { status?: string }): Promise<LiveSession[]> => {
  try {
    const endpoint = params?.status ? `/live-sessions?status=${params.status}` : '/live-sessions';
    const response = await apiService.request(endpoint);
    return response.sessions || [];
  } catch (error) {
    console.error('Error fetching live sessions:', error);
    return [];
  }
};

export const createLiveSession = async (sessionData: Partial<LiveSession>): Promise<LiveSession | null> => {
  try {
    const response = await apiService.request('/live-sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    });
    return response.session || null;
  } catch (error) {
    console.error('Error creating live session:', error);
    return null;
  }
};

export const startLiveSession = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`/live-sessions/${id}/start`, { method: 'POST' });
    return true;
  } catch (error) {
    console.error('Error starting live session:', error);
    return false;
  }
};

export const endLiveSession = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`/live-sessions/${id}/end`, { method: 'POST' });
    return true;
  } catch (error) {
    console.error('Error ending live session:', error);
    return false;
  }
};

// ============================================
// SERIAL CODES API FUNCTIONS
// ============================================

export const getAllSerialCodes = async (params?: { code_type?: string; status?: string }): Promise<SerialCode[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.code_type) queryParams.append('code_type', params.code_type);
    if (params?.status) queryParams.append('status', params.status);
    
    const endpoint = `/serial-codes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.codes || [];
  } catch (error) {
    console.error('Error fetching serial codes:', error);
    return [];
  }
};

export const generateSerialCodes = async (codeType: string, count: number, prefix?: string): Promise<SerialCode[]> => {
  try {
    const response = await apiService.request('/serial-codes/generate', {
      method: 'POST',
      body: JSON.stringify({ code_type: codeType, count, prefix })
    });
    return response.codes || [];
  } catch (error) {
    console.error('Error generating serial codes:', error);
    return [];
  }
};

export const revokeSerialCode = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`/serial-codes/${id}/revoke`, { method: 'POST' });
    return true;
  } catch (error) {
    console.error('Error revoking serial code:', error);
    return false;
  }
};

// ============================================
// COMBINED API OBJECT
// ============================================

export const adminApi = {
  // Quizzes
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  publishQuiz,

  // Homework
  getAllHomework,
  createHomework,
  updateHomework,
  deleteHomework,

  // Assignments
  getAllAssignments,
  createAssignment,

  // Study Groups
  getAllStudyGroups,
  createStudyGroup,

  // Gamification
  getLeaderboard,
  awardPoints,
  getStudentPoints,

  // Articles
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,

  // Live Sessions
  getAllLiveSessions,
  createLiveSession,
  startLiveSession,
  endLiveSession,

  // Serial Codes
  getAllSerialCodes,
  generateSerialCodes,
  revokeSerialCode
};

export default adminApi;

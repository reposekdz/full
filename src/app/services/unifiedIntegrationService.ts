import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Unified Integration Service
class UnifiedIntegrationService {
  // Dashboard Integration
  async getUnifiedDashboard() {
    const response = await axios.get(`${API_BASE}/unified-integration/dashboard/unified`);
    return response.data;
  }

  // Global Search Integration
  async globalSearch(query: string, type?: string, limit?: number) {
    const response = await axios.get(`${API_BASE}/unified-integration/search/global`, {
      params: { q: query, type, limit }
    });
    return response.data;
  }

  // Analytics Integration
  async getComprehensiveAnalytics(period: number = 30) {
    const response = await axios.get(`${API_BASE}/unified-integration/analytics/comprehensive`, {
      params: { period }
    });
    return response.data;
  }

  // Notifications Integration
  async getUnifiedNotifications(userId: number, role?: string, unreadOnly?: boolean) {
    const response = await axios.get(`${API_BASE}/unified-integration/notifications/unified`, {
      params: { user_id: userId, role, unread_only: unreadOnly }
    });
    return response.data;
  }

  // Content Integration
  async getUnifiedContent() {
    const response = await axios.get(`${API_BASE}/unified-integration/content/unified`);
    return response.data;
  }

  // Activity Tracking
  async trackActivity(userId: number, action: string, module: string, details: any) {
    const response = await axios.post(`${API_BASE}/unified-integration/activity/track`, {
      user_id: userId,
      action,
      module,
      details
    });
    return response.data;
  }

  // Quick Actions
  async executeQuickAction(action: string, data: any) {
    const response = await axios.post(`${API_BASE}/unified-integration/quick-actions/execute`, {
      action,
      data
    });
    return response.data;
  }

  // Reports Generation
  async generateReport(type: string, startDate: string, endDate: string) {
    const response = await axios.get(`${API_BASE}/unified-integration/reports/generate`, {
      params: { type, start_date: startDate, end_date: endDate }
    });
    return response.data;
  }

  // System Health
  async getSystemHealth() {
    const response = await axios.get(`${API_BASE}/unified-integration/system/health`);
    return response.data;
  }

  // News Integration
  async getNews(limit: number = 10) {
    const response = await axios.get(`${API_BASE}/news`, { params: { limit } });
    return response.data;
  }

  async getNewsById(id: string) {
    const response = await axios.get(`${API_BASE}/news/${id}`);
    return response.data;
  }

  // Trades Integration
  async getTrades() {
    const response = await axios.get(`${API_BASE}/trades`);
    return response.data;
  }

  async getTradeById(id: string) {
    const response = await axios.get(`${API_BASE}/trades/${id}`);
    return response.data;
  }

  // Sports Integration
  async getSports() {
    const response = await axios.get(`${API_BASE}/sports`);
    return response.data;
  }

  async getSportById(id: string) {
    const response = await axios.get(`${API_BASE}/sports/${id}`);
    return response.data;
  }

  // Staff Integration
  async getStaff(filters?: any) {
    const response = await axios.get(`${API_BASE}/comprehensive-staff`, { params: filters });
    return response.data;
  }

  async getStaffById(id: string) {
    const response = await axios.get(`${API_BASE}/comprehensive-staff/${id}`);
    return response.data;
  }

  // Leadership Integration
  async getLeadership() {
    const response = await axios.get(`${API_BASE}/leadership`);
    return response.data;
  }

  async getLeaderById(id: string) {
    const response = await axios.get(`${API_BASE}/leadership/${id}`);
    return response.data;
  }

  // Developers Integration
  async getDevelopers() {
    const response = await axios.get(`${API_BASE}/developers`);
    return response.data;
  }

  async getDeveloperById(id: string) {
    const response = await axios.get(`${API_BASE}/developers/${id}`);
    return response.data;
  }

  // Services Integration
  async getServices() {
    const response = await axios.get(`${API_BASE}/services`);
    return response.data;
  }

  // Gallery Integration
  async getGallery(limit?: number) {
    const response = await axios.get(`${API_BASE}/gallery`, { params: { limit } });
    return response.data;
  }

  // Support Integration
  async createSupportTicket(data: any) {
    const response = await axios.post(`${API_BASE}/support`, data);
    return response.data;
  }

  async getSupportTickets(userId?: number) {
    const response = await axios.get(`${API_BASE}/support`, { params: { user_id: userId } });
    return response.data;
  }

  // Admissions Integration
  async submitAdmission(data: any) {
    const response = await axios.post(`${API_BASE}/admissions`, data);
    return response.data;
  }

  async getAdmissions(filters?: any) {
    const response = await axios.get(`${API_BASE}/admissions`, { params: filters });
    return response.data;
  }

  // Students Integration
  async getStudents(filters?: any) {
    const response = await axios.get(`${API_BASE}/students`, { params: filters });
    return response.data;
  }

  async getStudentById(id: string) {
    const response = await axios.get(`${API_BASE}/students/${id}`);
    return response.data;
  }

  // Attendance Integration
  async getAttendance(filters?: any) {
    const response = await axios.get(`${API_BASE}/attendance`, { params: filters });
    return response.data;
  }

  async markAttendance(data: any) {
    const response = await axios.post(`${API_BASE}/attendance`, data);
    return response.data;
  }

  // Grades Integration
  async getGrades(filters?: any) {
    const response = await axios.get(`${API_BASE}/grades`, { params: filters });
    return response.data;
  }

  async submitGrade(data: any) {
    const response = await axios.post(`${API_BASE}/grades`, data);
    return response.data;
  }

  // Finance Integration
  async getPayments(filters?: any) {
    const response = await axios.get(`${API_BASE}/finance/payments`, { params: filters });
    return response.data;
  }

  async createPayment(data: any) {
    const response = await axios.post(`${API_BASE}/finance/payments`, data);
    return response.data;
  }

  // Library Integration
  async getLibraryBooks(filters?: any) {
    const response = await axios.get(`${API_BASE}/library/books`, { params: filters });
    return response.data;
  }

  async borrowBook(data: any) {
    const response = await axios.post(`${API_BASE}/library/borrow`, data);
    return response.data;
  }

  // Hostel Integration
  async getHostelRooms(filters?: any) {
    const response = await axios.get(`${API_BASE}/hostel/rooms`, { params: filters });
    return response.data;
  }

  async assignRoom(data: any) {
    const response = await axios.post(`${API_BASE}/hostel/assign`, data);
    return response.data;
  }

  // Transport Integration
  async getTransportRoutes() {
    const response = await axios.get(`${API_BASE}/transport/routes`);
    return response.data;
  }

  async assignTransport(data: any) {
    const response = await axios.post(`${API_BASE}/transport/assign`, data);
    return response.data;
  }

  // Exams Integration
  async getExams(filters?: any) {
    const response = await axios.get(`${API_BASE}/exams`, { params: filters });
    return response.data;
  }

  async scheduleExam(data: any) {
    const response = await axios.post(`${API_BASE}/exams`, data);
    return response.data;
  }

  // Assignments Integration
  async getAssignments(filters?: any) {
    const response = await axios.get(`${API_BASE}/assignments`, { params: filters });
    return response.data;
  }

  async createAssignment(data: any) {
    const response = await axios.post(`${API_BASE}/assignments`, data);
    return response.data;
  }

  // Timetable Integration
  async getTimetable(filters?: any) {
    const response = await axios.get(`${API_BASE}/timetable`, { params: filters });
    return response.data;
  }

  // Messages Integration
  async getMessages(userId: number) {
    const response = await axios.get(`${API_BASE}/messages`, { params: { user_id: userId } });
    return response.data;
  }

  async sendMessage(data: any) {
    const response = await axios.post(`${API_BASE}/messages`, data);
    return response.data;
  }

  // Parent Portal Integration
  async getParentDashboard(parentId: number) {
    const response = await axios.get(`${API_BASE}/parent-dashboard/${parentId}`);
    return response.data;
  }

  async getChildProgress(studentId: number) {
    const response = await axios.get(`${API_BASE}/parent-dashboard/child/${studentId}`);
    return response.data;
  }
}

export default new UnifiedIntegrationService();

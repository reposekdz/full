/**
 * ========================================================
 * COMPREHENSIVE ROLE-BASED API SERVICE
 * ========================================================
 * Provides API methods for all 8 roles:
 * - Admin
 * - Accountant
 * - Teacher
 * - Advisor
 * - DOS (Director of Studies)
 * - DOD (Director of Discipline)
 * - Headmaster
 * - Stock Manager
 */

import { API_BASE_URL } from '@/app/config/apiBase';

const API_BASE = API_BASE_URL;

class ComprehensiveRolesApi {
  private getAuthHeaders(isFormData = false) {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  private async request(endpoint: string, options: any = {}) {
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(isFormData),
        ...options.headers,
      },
    });
    return response.json();
  }

  // ============================================================
  // COMMON ENDPOINTS
  // ============================================================

  async getCommonDashboard() {
    return this.request('/comprehensive-roles/common/dashboard');
  }

  // ============================================================
  // LEVEL 4 SOD STUDENTS - For All Staff Roles
  // ============================================================

  // Fetch Level 4 SOD students (default for all staff dashboards) - limit to 29 students
  async getLevel4SODStudents(params: any = {}) {
    const queryParams = new URLSearchParams({
      level: '4',
      trade: 'SOD',
      limit: '29',  // Fetch exactly 29 students
      ...params
    });
    return this.request(`/comprehensive-roles/students?${queryParams}`);
  }

  // Fetch exactly 29 Level 4 SOD students with full details
  async getLevel4SODStudentsFull() {
    const queryParams = new URLSearchParams({
      level: '4',
      trade: 'SOD',
      limit: '29'
    });
    return this.request(`/comprehensive-roles/students?${queryParams}`);
  }

  // Fetch students by trade and level (flexible)
  async getStudentsByTradeAndLevel(trade: string, level: string, params: any = {}) {
    const queryParams = new URLSearchParams({
      trade,
      level,
      limit: params.limit || '50',
      ...params
    });
    return this.request(`/comprehensive-roles/students?${queryParams}`);
  }

  // Get available trades from database
  async getTrades() {
    return this.request('/trades-levels/trades');
  }

  // Get levels for a specific trade
  async getTradeLevels(tradeCode: string) {
    return this.request(`/trades-levels/trades/${tradeCode}/levels`);
  }

  // ============================================================
  // ADMIN ENDPOINTS
  // ============================================================

  async getAdminDashboard() {
    return this.request('/comprehensive-roles/admin/dashboard');
  }

  async getAdminUsers(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-roles/admin/users?${query}`);
  }

  async createAdminUser(userData: any) {
    return this.request('/comprehensive-roles/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateAdminUser(id: number, userData: any) {
    return this.request(`/comprehensive-roles/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAdminUser(id: number) {
    return this.request(`/comprehensive-roles/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================
  // ACCOUNTANT ENDPOINTS
  // ============================================================

  async getAccountantDashboard(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-roles/accountant/dashboard?${query}`);
  }

  async recordPayment(paymentData: any) {
    return this.request('/comprehensive-roles/accountant/payments/record', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getTransactions(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-roles/accountant/transactions?${query}`);
  }

  async createTransaction(transactionData: any) {
    return this.request('/comprehensive-roles/accountant/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async sendPaymentReminder(data: any) {
    return this.request('/comprehensive-roles/accountant/payments/reminder', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================================
  // TEACHER ENDPOINTS
  // ============================================================

  async getTeacherDashboard() {
    return this.request('/comprehensive-roles/teacher/dashboard');
  }

  async getTeacherClasses() {
    return this.request('/comprehensive-roles/teacher/classes');
  }

  async getTeacherClassStudents(classId: number) {
    return this.request(`/comprehensive-roles/teacher/classes/${classId}/students`);
  }

  async markAttendance(attendanceData: any) {
    return this.request('/comprehensive-roles/teacher/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async recordMarks(marksData: any) {
    return this.request('/comprehensive-roles/teacher/marks', {
      method: 'POST',
      body: JSON.stringify(marksData),
    });
  }

  // Teacher Portal Ultra - Advanced Features
  async getTeacherPortalUltraDashboard() {
    return this.request('/teacher-portal-ultra/dashboard');
  }

  async getTeacherPortalUltraProfile() {
    return this.request('/teacher-portal-ultra/profile');
  }

  // Notes Management
  async getTeacherNotes(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teacher-content/notes/my-notes?${query}`);
  }

  async uploadTeacherNote(noteData: any) {
    return this.request('/teacher-content/notes/upload', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async deleteTeacherNote(noteId: number) {
    return this.request(`/teacher-content/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  // Works/Assignments Management
  async getTeacherWorks(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teacher-content/works/my-works?${query}`);
  }

  async uploadTeacherWork(workData: any) {
    return this.request('/teacher-content/works/upload', {
      method: 'POST',
      body: JSON.stringify(workData),
    });
  }

  async gradeWorkSubmission(workId: number, submissionId: number, gradeData: any) {
    return this.request(`/teacher-content/works/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  // Holiday Packages
  async getHolidayPackages(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teacher-content/holiday?${query}`);
  }

  async uploadHolidayPackage(packageData: any) {
    return this.request('/teacher-content/holiday/upload', {
      method: 'POST',
      body: JSON.stringify(packageData),
    });
  }

  // Quizzes - Advanced
  async getTeacherQuizzes(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teacher-portal-ultra/quizzes?${query}`);
  }

  async createTeacherQuiz(quizData: any) {
    return this.request('/teacher-portal-ultra/quiz/create', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async getQuizSubmissions(quizId: number) {
    return this.request(`/teacher-portal-ultra/quizzes/${quizId}/submissions`);
  }

  async gradeQuizSubmission(quizId: number, submissionId: number, gradeData: any) {
    return this.request(`/teacher-portal-ultra/quizzes/${quizId}/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  async getPendingGradingQuizzes() {
    return this.request('/teacher-portal-ultra/quizzes/pending-grading');
  }

  // Assignments - Advanced
  async getTeacherAssignments(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teacher-portal-ultra/assignments?${query}`);
  }

  async createTeacherAssignment(assignmentData: any) {
    return this.request('/teacher-portal-ultra/assignments/create', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async getAssignmentSubmissions(assignmentId: number) {
    return this.request(`/teacher-portal-ultra/assignments/${assignmentId}/submissions`);
  }

  async gradeAssignmentSubmission(assignmentId: number, submissionId: number, gradeData: any) {
    return this.request(`/teacher-portal-ultra/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  async bulkGradeAssignments(assignmentId: number, grades: any[]) {
    return this.request('/teacher-portal-ultra/assignments/bulk-grade', {
      method: 'POST',
      body: JSON.stringify({ assignment_id: assignmentId, grades }),
    });
  }

  async assignBulkWork(workData: any) {
    return this.request('/teacher-portal-ultra/work/assign-bulk', {
      method: 'POST',
      body: JSON.stringify(workData),
    });
  }

  // Work Distribution Analytics
  async getWorkDistributionAnalytics() {
    return this.request('/teacher-portal-ultra/work-distribution/analytics');
  }

  // Student Marks Management
  async addSubjectColumn(columnData: any) {
    return this.request('/teacher-student-marks/add-subject-column', {
      method: 'POST',
      body: JSON.stringify(columnData),
    });
  }

  async getSubjectColumns(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teacher-student-marks/subject-columns?${query}`);
  }

  async recordStudentMarks(marksData: any) {
    return this.request('/teacher-student-marks/record-marks', {
      method: 'POST',
      body: JSON.stringify(marksData),
    });
  }

  async bulkRecordMarks(marksData: any) {
    return this.request('/teacher-student-marks/bulk-record-marks', {
      method: 'POST',
      body: JSON.stringify(marksData),
    });
  }

  async getClassMarksOverview(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teacher-student-marks/class-marks-overview?${query}`);
  }

  // Analytics & Reports
  async getTeacherAnalytics(period: string = 'week') {
    return this.request(`/teacher-comprehensive/analytics?period=${period}`);
  }

  async getStudentPerformanceAnalytics(studentId: number) {
    return this.request(`/teacher-comprehensive/students/${studentId}/performance`);
  }

  async getClassPerformanceReport(classId: number) {
    return this.request(`/teacher-comprehensive/classes/${classId}/performance`);
  }

  async getAttendanceAnalytics(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teacher-comprehensive/attendance/analytics?${query}`);
  }

  async getDashboardOverview() {
    return this.request('/teacher-comprehensive/dashboard/overview');
  }

  // Parent Linking - Teacher can view parent links for their students
  async getParentLinksForStudents(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/parent-linking/links?${query}`);
  }

  async getStudentParents(studentId: number) {
    return this.request(`/parent-linking/student/${studentId}/parents`);
  }

  // Messaging
  async getTeacherMessages(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teacher-comprehensive/messages?${query}`);
  }

  async sendTeacherMessage(messageData: any) {
    return this.request('/teacher-comprehensive/messages/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageRead(messageId: number) {
    return this.request(`/teacher-comprehensive/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  async deleteTeacherMessage(messageId: number) {
    return this.request(`/teacher-comprehensive/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async getUnreadMessageCount() {
    return this.request('/teacher-comprehensive/messages/unread/count');
  }

  // Teacher Statistics
  async getTeacherContentStatistics() {
    return this.request('/teacher-content/statistics');
  }

  // ============================================================
  // ADVISOR ENDPOINTS
  // ============================================================

  async getAdvisorDashboard() {
    return this.request('/comprehensive-roles/advisor/dashboard');
  }

  async getAdvisorStudents(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-roles/advisor/students?${query}`);
  }

  async createAdvisorCase(caseData: any) {
    return this.request('/comprehensive-roles/advisor/cases', {
      method: 'POST',
      body: JSON.stringify(caseData),
    });
  }

  async scheduleAdvisorMeeting(meetingData: any) {
    return this.request('/comprehensive-roles/advisor/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  }

  async getAdvisorStudentCases(studentId: string) {
    return this.request(`/comprehensive-roles/advisor/cases/${studentId}`);
  }

  // ============================================================
  // DOS ENDPOINTS
  // ============================================================

  async getDOSDashboard() {
    return this.request('/comprehensive-roles/dos/dashboard');
  }

  async getDOSStudents(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-roles/dos/students?${query}`);
  }

  async createEnrollment(enrollmentData: any) {
    return this.request('/comprehensive-roles/dos/enrollments', {
      method: 'POST',
      body: JSON.stringify(enrollmentData),
    });
  }

  async getDOSTradesLevels() {
    return this.request('/comprehensive-roles/dos/trades-levels');
  }

  // ============================================================
  // DOD ENDPOINTS
  // ============================================================

  async getDODDashboard() {
    return this.request('/comprehensive-roles/dod/dashboard');
  }

  async recordIncident(incidentData: any) {
    return this.request('/comprehensive-roles/dod/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  }

  async grantLeave(leaveData: any) {
    return this.request('/comprehensive-roles/dod/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  }

  async scheduleCounseling(counselingData: any) {
    return this.request('/comprehensive-roles/dod/counseling', {
      method: 'POST',
      body: JSON.stringify(counselingData),
    });
  }

  async getDODStudents(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-roles/dod/students?${query}`);
  }

  // ============================================================
  // HEADMASTER ENDPOINTS
  // ============================================================

  async getHeadmasterDashboard() {
    return this.request('/comprehensive-roles/headmaster/dashboard');
  }

  async getHeadmasterAnalytics(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-roles/headmaster/analytics?${query}`);
  }

  async getHeadmasterReports(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-roles/headmaster/reports?${query}`);
  }

  // ============================================================
  // STOCK MANAGER ENDPOINTS
  // ============================================================

  async getStockDashboard() {
    return this.request('/comprehensive-roles/stock/dashboard');
  }

  async getStockItems(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-roles/stock/items?${query}`);
  }

  async createStockItem(itemData: any) {
    return this.request('/comprehensive-roles/stock/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateStockItem(id: number, itemData: any) {
    return this.request(`/comprehensive-roles/stock/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async recordStockTransaction(transactionData: any) {
    return this.request('/comprehensive-roles/stock/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getStockTransactions(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-roles/stock/transactions?${query}`);
  }

  async getStockCategories() {
    return this.request('/comprehensive-roles/stock/categories');
  }
}

export const comprehensiveRolesApi = new ComprehensiveRolesApi();
export default comprehensiveRolesApi;

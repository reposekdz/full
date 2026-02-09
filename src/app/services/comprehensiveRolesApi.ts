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

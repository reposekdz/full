import { API_BASE_URL } from '@/app/config/apiBase';

const API_BASE = API_BASE_URL;

class DOSService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async request(endpoint: string, options: any = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    });
    return response.json();
  }

  async getAnalyticsOverview() {
    return this.request('/dos/analytics/performance');
  }

  async getTrades() {
    return this.request('/dos/trades');
  }

  async getStudents(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dos/students?${query}`);
  }

  async getStudentDetails(studentId: number) {
    return this.request(`/dos/students/${studentId}`);
  }

  async createStudent(studentData: any) {
    return this.request('/dos/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async updateStudent(studentId: number, studentData: any) {
    return this.request(`/dos/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  async deleteStudent(studentId: number) {
    return this.request(`/dos/students/${studentId}`, {
      method: 'DELETE'
    });
  }

  async assignTeacher(teacherId: number, classId: number) {
    return this.request('/dos/assign-teacher', {
      method: 'POST',
      body: JSON.stringify({ teacher_id: teacherId, class_id: classId })
    });
  }

  async createTimetable(timetableData: any) {
    return this.request('/dos/timetable', {
      method: 'POST',
      body: JSON.stringify(timetableData)
    });
  }

  async getDashboardStats() {
    return this.request('/dos/dashboard-stats');
  }
}

export default new DOSService();

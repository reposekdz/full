const API_BASE = 'http://localhost:5000/api';

class ApiService {
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

  // User Management
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users?${query}`);
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id: number, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(id: number) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  async getRoles() {
    return this.request('/users/roles/list');
  }

  // Academic Management
  async getCourses() {
    return this.request('/academics/courses');
  }

  async createCourse(courseData: any) {
    return this.request('/academics/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }

  async updateCourse(id: number, courseData: any) {
    return this.request(`/academics/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData)
    });
  }

  // DOS Management - Students
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users?role=student&${query}`);
  }

  async createStudent(studentData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ ...studentData, role: 'student' })
    });
  }

  async updateStudent(id: number, studentData: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  async deleteStudent(id: number) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // DOS Management - Teachers
  async getTeachers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users?role=teacher&${query}`);
  }

  async assignTeacherToClass(teacherId: number, classId: number) {
    return this.request(`/academics/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify({ teacher_id: teacherId })
    });
  }

  // DOS Management - Classes & Enrollments
  async getEnrollments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/academics/enrollments?${query}`);
  }

  async enrollStudent(enrollmentData: any) {
    return this.request('/academics/enrollments', {
      method: 'POST',
      body: JSON.stringify(enrollmentData)
    });
  }

  async unenrollStudent(enrollmentId: number) {
    return this.request(`/academics/enrollments/${enrollmentId}`, {
      method: 'DELETE'
    });
  }

  // DOS Management - Timetables
  async getTimetables(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/academics/timetables?${query}`);
  }

  async createTimetable(timetableData: any) {
    return this.request('/academics/timetables', {
      method: 'POST',
      body: JSON.stringify(timetableData)
    });
  }

  async updateTimetable(id: number, timetableData: any) {
    return this.request(`/academics/timetables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(timetableData)
    });
  }

  // DOS Management - Performance Analytics
  async getPerformanceAnalytics(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/academics/analytics/performance?${query}`);
  }

  async getTradePerformance(trade: string, level?: string) {
    const params = new URLSearchParams({ trade });
    if (level) params.append('level', level);
    return this.request(`/academics/analytics/trade-performance?${params}`);
  }

  async getClassPerformance(classId: number) {
    return this.request(`/academics/analytics/class-performance/${classId}`);
  }

  // DOS Management - Academic Years
  async getAcademicYears() {
    return this.request('/academics/academic-years');
  }

  async createAcademicYear(yearData: any) {
    return this.request('/academics/academic-years', {
      method: 'POST',
      body: JSON.stringify(yearData)
    });
  }

  // DOS Management - Subjects
  async getSubjects(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/academics/subjects?${query}`);
  }

  async createSubject(subjectData: any) {
    return this.request('/academics/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData)
    });
  }

  async getCourseByCode(code: string) {
    return this.request(`/academics/courses/code/${code}`);
  }

  async getPublicCourses() {
    const response = await fetch(`${API_BASE}/academics/public/courses`);
    return response.json();
  }

  async getCourseStatistics(id: number) {
    return this.request(`/academics/courses/${id}/statistics`);
  }

  async getClasses() {
    return this.request('/academics/classes');
  }

  async createClass(classData: any) {
    return this.request('/academics/classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });
  }

  async getGrades(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/academics/grades?${query}`);
  }

  async createGrade(gradeData: any) {
    return this.request('/academics/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  }

  async getAttendance(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/academics/attendance?${query}`);
  }

  async markAttendance(attendanceData: any) {
    return this.request('/academics/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  }

  // Financial Management
  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/finance/payments?${query}`);
  }

  async createPayment(paymentData: any) {
    return this.request('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getStudentFeeSummary(studentId: number) {
    return this.request(`/finance/students/${studentId}/fee-summary`);
  }

  // Stock Management
  async getStockItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stock/items?${query}`);
  }

  async createStockItem(itemData: any) {
    return this.request('/stock/items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  async getStockMovements(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stock/movements?${query}`);
  }

  async createStockMovement(movementData: any) {
    return this.request('/stock/movements', {
      method: 'POST',
      body: JSON.stringify(movementData)
    });
  }

  // Dashboard Statistics
  async getDashboardStats(role: string, userId?: number) {
    try {
      const promises = [];
      
      switch (role) {
        case 'admin':
        case 'super_admin':
          promises.push(
            this.request('/users?limit=1'),
            this.request('/academics/courses'),
            this.request('/finance/payments?limit=1'),
            this.request('/stock/items?limit=1')
          );
          break;
        case 'student':
          if (userId) {
            promises.push(
              this.request(`/academics/grades?student_id=${userId}`),
              this.request(`/academics/attendance?student_id=${userId}`),
              this.request(`/finance/students/${userId}/fee-summary`)
            );
          }
          break;
        case 'teacher':
          if (userId) {
            promises.push(
              this.request(`/academics/grades?teacher_id=${userId}`),
              this.request(`/academics/attendance?teacher_id=${userId}`)
            );
          }
          break;
        case 'accountant':
          promises.push(
            this.request('/finance/payments?limit=1'),
            this.request('/finance/reports/summary')
          );
          break;
        case 'stock_manager':
          promises.push(
            this.request('/stock/items?limit=1'),
            this.request('/stock/movements?limit=1')
          );
          break;
      }

      const results = await Promise.all(promises);
      return this.formatDashboardStats(role, results);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {};
    }
  }

  private formatDashboardStats(role: string, results: any[]) {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return {
          totalUsers: results[0]?.pagination?.total || results[0]?.users?.length || 0,
          totalCourses: results[1]?.courses?.length || 0,
          totalPayments: results[2]?.pagination?.total || 0,
          totalStockItems: results[3]?.pagination?.total || 0
        };
      case 'director_study':
        return {
          totalStudents: results[0]?.pagination?.total || results[0]?.users?.length || 0,
          totalTeachers: results[1]?.pagination?.total || results[1]?.users?.length || 0,
          totalClasses: results[2]?.classes?.length || 0,
          averagePerformance: this.calculateAveragePerformance(results[3]?.grades || [])
        };
      case 'student':
        return {
          totalGrades: results[0]?.grades?.length || 0,
          averageGrade: this.calculateAverageGrade(results[0]?.grades || []),
          attendanceRate: this.calculateAttendanceRate(results[1]?.attendance || []),
          feeBalance: results[2]?.summary?.total_balance || 0
        };
      case 'teacher':
        return {
          totalStudents: new Set(results[0]?.grades?.map((g: any) => g.student_id) || []).size,
          totalGrades: results[0]?.grades?.length || 0,
          attendanceMarked: results[1]?.attendance?.length || 0
        };
      case 'accountant':
        return {
          totalPayments: results[0]?.pagination?.total || 0,
          totalAmount: results[1]?.report?.total_collections?.total_amount || 0
        };
      case 'stock_manager':
        return {
          totalItems: results[0]?.pagination?.total || 0,
          totalMovements: results[1]?.pagination?.total || 0
        };
      default:
        return {};
    }
  }

  private calculateAverageGrade(grades: any[]) {
    if (!grades.length) return 0;
    const total = grades.reduce((sum, grade) => sum + (parseFloat(grade.obtained_marks) / parseFloat(grade.max_marks)) * 100, 0);
    return Math.round(total / grades.length);
  }

  private calculateAttendanceRate(attendance: any[]) {
    if (!attendance.length) return 0;
    const present = attendance.filter(a => a.status === 'present').length;
    return Math.round((present / attendance.length) * 100);
  }

  private calculateAveragePerformance(grades: any[]) {
    if (!grades.length) return 0;
    const total = grades.reduce((sum, grade) => sum + (parseFloat(grade.obtained_marks) / parseFloat(grade.max_marks)) * 100, 0);
    return Math.round(total / grades.length);
  }
}

export const apiService = new ApiService();
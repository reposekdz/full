import { API_BASE_URL } from '@/app/config/apiBase';

const API_BASE = API_BASE_URL;

class ApiService {
  private getAuthHeaders(isFormData: boolean = false) {
    const token = localStorage.getItem('token');
    const headers: any = {
      'Authorization': `Bearer ${token}`
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  async request(endpoint: string, options: any = {}) {
    const isFormData = options.body instanceof FormData;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(isFormData),
        ...options.headers
      }
    });
    return response.json();
  }

  // User Profile Management
  async updateProfile(profileData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getProfile() {
    return this.request('/users/profile');
  }

  async changePassword(passwordData: { current_password: string; new_password: string }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  /** Force change email and password (e.g. after login with static credentials). Backend stores new credentials and clears must_change_password. */
  async forceChangeCredentials(data: { current_password: string; new_email: string; new_password: string }) {
    return this.request('/auth/force-change-credentials', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
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

  async getNotifications() {
    return this.request('/notifications');
  }

  // Rwanda locations (provinces → districts → sectors → cells → villages). Try API first; fallback to static data in components.
  async getLocationsProvinces(): Promise<{ success: boolean; provinces?: { id: number; name_en: string; name_rw?: string; code?: string }[] }> {
    try {
      const data = await this.request('/locations/provinces');
      if (data?.provinces && Array.isArray(data.provinces)) return { success: true, provinces: data.provinces };
    } catch (_) { }
    return { success: false };
  }
  async getLocationsDistricts(provinceId: number): Promise<{ success: boolean; districts?: { id: number; name_en: string; name_rw?: string }[] }> {
    try {
      const data = await this.request(`/locations/districts/${provinceId}`);
      if (data?.districts && Array.isArray(data.districts)) return { success: true, districts: data.districts };
    } catch (_) { }
    return { success: false };
  }
  async getLocationsSectors(districtId: number): Promise<{ success: boolean; sectors?: { id: number; name_en: string; name_rw?: string }[] }> {
    try {
      const data = await this.request(`/locations/sectors/${districtId}`);
      if (data?.sectors && Array.isArray(data.sectors)) return { success: true, sectors: data.sectors };
    } catch (_) { }
    return { success: false };
  }
  async getLocationsCells(sectorId: number): Promise<{ success: boolean; cells?: { id: number; name_en: string; name_rw?: string }[] }> {
    try {
      const data = await this.request(`/locations/cells/${sectorId}`);
      if (data?.cells && Array.isArray(data.cells)) return { success: true, cells: data.cells };
    } catch (_) { }
    return { success: false };
  }
  async getLocationsVillages(cellId: number): Promise<{ success: boolean; villages?: { id: number; name_en: string; name_rw?: string }[] }> {
    try {
      const data = await this.request(`/locations/villages/${cellId}`);
      if (data?.villages && Array.isArray(data.villages)) return { success: true, villages: data.villages };
    } catch (_) { }
    return { success: false };
  }

  /** Role-based dashboard overview - real data from /api/comprehensive/dashboard/overview */
  async getDashboardOverview() {
    return this.request('/comprehensive/dashboard/overview');
  }

  async getDashboardStats() {
    return this.request('/comprehensive/dashboard/stats');
  }

  async getDashboardRecentActivities() {
    return this.request('/comprehensive/dashboard/recent-activities');
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

  // Parent Management - Dashboard & Children
  async getMyChildren() {
    return this.request('/parent-dashboard/my-children');
  }

  async getChildDashboard(studentId: number) {
    return this.request(`/parent-dashboard/child/${studentId}/dashboard`);
  }

  async getChildAcademics(studentId: number) {
    return this.request(`/parent-dashboard/child/${studentId}/academics`);
  }

  async getParentChildAttendance(studentId: number) {
    return this.request(`/parent-dashboard/child/${studentId}/attendance`);
  }

  async getParentChildDiscipline(studentId: number) {
    return this.request(`/parent-dashboard/child/${studentId}/discipline`);
  }

  async getParentChildFees(studentId: number) {
    return this.request(`/parent-dashboard/child/${studentId}/fees`);
  }

  async getChildCompetitions(studentId: number) {
    return this.request(`/parent-dashboard/child/${studentId}/competitions`);
  }

  async getChildAssignments(studentId: number) {
    return this.request(`/parent-dashboard/child/${studentId}/assignments`);
  }

  async getParentDashboardNotifications() {
    return this.request('/parent-dashboard/notifications');
  }

  async requestLinkingCodeHelp(requestData: { student_name: string; message: string; preferred_contact?: string }) {
    return this.request('/parent-linking/request-code-help', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async getMyHelpRequests() {
    return this.request('/parent-linking/my-help-requests');
  }

  async generateSerialCodes(codeData: { trade_code: string; level_number: number; level_suffix?: string; quantity: number; academic_year?: string; expires_at?: string; notes?: string }) {
    return this.request('/serial-codes/generate', {
      method: 'POST',
      body: JSON.stringify(codeData)
    });
  }

  async getSerialCodes(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/serial-codes/list?${query}`);
  }

  async revokeSerialCode(id: number) {
    return this.request(`/serial-codes/revoke/${id}`, { method: 'PUT' });
  }

  async deleteSerialCode(id: number) {
    return this.request(`/serial-codes/delete/${id}`, { method: 'DELETE' });
  }

  async validateSerialCode(serial_code: string) {
    return this.request('/serial-codes/validate', {
      method: 'POST',
      body: JSON.stringify({ serial_code })
    });
  }

  async getTeacherClassesMarks() {
    return this.request('/marks-management/teacher/classes');
  }

  async getAssessmentCategories() {
    return this.request('/marks-management/assessment-categories');
  }

  async getClassMarks(classId: number, subjectId: number, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/marks-management/class/${classId}/subject/${subjectId}/marks?${query}`);
  }

  async addMarks(marksData: any) {
    return this.request('/marks-management/marks/add', {
      method: 'POST',
      body: JSON.stringify(marksData)
    });
  }

  async updateMark(markId: number, markData: { obtained_marks: number; remarks?: string }) {
    return this.request(`/marks-management/marks/${markId}`, {
      method: 'PUT',
      body: JSON.stringify(markData)
    });
  }

  async deleteMark(markId: number) {
    return this.request(`/marks-management/marks/${markId}`, { method: 'DELETE' });
  }

  async getStudentReport(studentId: number, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/marks-management/reports/student/${studentId}?${query}`);
  }

  async getParentHelpRequests() {
    return this.request('/parent-linking/help-requests');
  }

  async respondToParentHelpRequest(requestId: number, responseData: { student_code?: string; response_message: string }) {
    return this.request(`/parent-linking/help-requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData)
    });
  }

  // Advisor Dashboard
  async createStudentCase(caseData: any) {
    return this.request('/staff/advisor/cases/create', {
      method: 'POST',
      body: JSON.stringify(caseData)
    });
  }

  async scheduleMeeting(meetingData: any) {
    return this.request('/staff/advisor/meetings/schedule', {
      method: 'POST',
      body: JSON.stringify(meetingData)
    });
  }

  // Accountant Dashboard
  async getAccountantOverview() {
    return this.request('/staff/accountant/overview');
  }

  async getAccountantStudents() {
    return this.request('/staff/accountant/students');
  }

  async recordAccountantStaffPayment(paymentData: any) {
    return this.request('/staff/accountant/payments/record', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  /** Record payment - uses staff accountant or comprehensive finance API */
  async recordPayment(paymentData: any) {
    return this.recordAccountantStaffPayment(paymentData);
  }

  async getFeeReminderSettings() {
    return this.request('/fee-reminders/auto-reminder-settings');
  }

  async saveFeeReminderSettings(data: { enabled?: boolean; frequency?: string; minBalance?: number; time?: string; remind_after_days?: number }) {
    return this.request('/fee-reminders/auto-reminder-settings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getFinancialSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/staff/accountant/reports/summary?${query}`);
  }


  // DOS Dashboard
  async getDOSOverview() {
    return this.getDOSStats();
  }

  async getSubjectPerformance() {
    return this.request('/staff/dos/performance/subjects');
  }

  async getDOSTeachers() {
    return this.request('/staff/dos/teachers');
  }

  async assignTeacher(assignmentData: any) {
    return this.request('/staff/dos/assignments/assign-teacher', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  }


  // Stock Manager Dashboard
  async getStockOverview() {
    return this.getStockStats();
  }

  async getInventoryItems(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/staff/stock/items?${query}`);
  }

  async addStaffInventoryItem(itemData: any) {
    return this.request('/staff/stock/items/add', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  async recordStockTransaction(transactionData: any) {
    return this.request('/staff/stock/transactions/record', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  // Comprehensive Statistics APIs
  async getDOSStats() {
    return this.request('/comprehensive-stats/dos');
  }

  async getAdvisorStats() {
    return this.request('/comprehensive-stats/advisor');
  }

  async getAdvisorOverview() {
    return this.getAdvisorStats();
  }

  async getAdvisorStudents() {
    return this.request('/comprehensive-stats/advisor/students');
  }

  async getAdvisorMeetings() {
    return this.request('/comprehensive-stats/advisor/meetings');
  }

  async getHeadmasterStats() {
    return this.request('/comprehensive-stats/headmaster');
  }

  async getHeadmasterOverview() {
    return this.getHeadmasterStats();
  }

  async getComprehensiveReport(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/comprehensive-stats/reports?${query}`);
  }

  async getStockStats() {
    return this.request('/comprehensive-stats/stock');
  }

  // Comprehensive Management APIs
  async getManagementTeacherList(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/management/teachers?${query}`);
  }

  async getManagementTeacherDetails(id: number) {
    return this.request(`/management/teachers/${id}`);
  }

  async managementCreateTeacher(teacherData: any) {
    return this.request('/management/teachers/create', {
      method: 'POST',
      body: JSON.stringify(teacherData)
    });
  }

  async managementUpdateTeacher(id: number, teacherData: any) {
    return this.request(`/management/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData)
    });
  }

  async managementDeleteTeacher(id: number) {
    return this.request(`/management/teachers/${id}`, {
      method: 'DELETE'
    });
  }

  async assignTeacherToSubject(assignmentData: any) {
    return this.request('/management/teachers/assign', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  }

  async removeTeacherAssignment(assignmentId: number) {
    return this.request(`/management/teachers/assignments/${assignmentId}`, {
      method: 'DELETE'
    });
  }

  async getTeacherAnalytics(teacherId: number) {
    return this.request(`/management/teachers/${teacherId}/analytics`);
  }

  async getManagementStudents(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/management/students?${query}`);
  }

  async getStudentDetails(id: number) {
    return this.request(`/management/students/${id}`);
  }

  async createManagementStudent(studentData: any) {
    return this.request('/management/students/create', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async updateManagementStudent(id: number, studentData: any) {
    return this.request(`/management/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  async transferStudent(id: number, transferData: any) {
    return this.request(`/management/students/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify(transferData)
    });
  }

  async bulkStudentAction(actionData: any) {
    return this.request('/management/students/bulk-action', {
      method: 'POST',
      body: JSON.stringify(actionData)
    });
  }

  async getParents(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/management/parents?${query}`);
  }

  async getParentDetails(id: number) {
    return this.request(`/management/parents/${id}`);
  }

  async linkParentToStudent(linkData: any) {
    return this.request('/management/parents/link-student', {
      method: 'POST',
      body: JSON.stringify(linkData)
    });
  }

  async getManagementClasses(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/management/classes?${query}`);
  }

  async getManagementSubjects(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/management/subjects?${query}`);
  }

  async getManagementAcademicYears() {
    return this.request('/management/academic-years');
  }

  async registerParent(parentData: any) {
    const response = await fetch(`${API_BASE}/auth/register/parent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parentData)
    });
    const data = await response.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async registerStudent(studentData: any) {
    const response = await fetch(`${API_BASE}/auth/register/student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    });
    const data = await response.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async getAvailableTrades() {
    const response = await fetch(`${API_BASE}/auth/registration/trades`);
    return response.json();
  }

  async checkEmailAvailability(email: string) {
    const response = await fetch(`${API_BASE}/auth/check-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    return response.json();
  }

  async searchStudents(query: string, trade?: string, level?: string) {
    const response = await fetch(`${API_BASE}/parent-registration/search-students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, trade, level })
    });
    return response.json();
  }

  async getParentChildren() {
    return this.request('/parents/children');
  }

  async linkChild(studentCode: string, relationship: string) {
    return this.request('/parents/link-child', {
      method: 'POST',
      body: JSON.stringify({ student_code: studentCode, relationship })
    });
  }

  async getChildGrades(childId: number) {
    return this.request(`/parents/children/${childId}/grades`);
  }

  // Teacher Management
  async getTeacherClassesList() {
    return this.request('/teachers/classes');
  }

  async getTeacherClassStudents(classId: number) {
    return this.request(`/teachers/classes/${classId}/students`);
  }

  async submitGradesBulk(grades: any[]) {
    return this.request('/teachers/grades/bulk', {
      method: 'POST',
      body: JSON.stringify({ grades })
    });
  }

  async markTeacherAttendanceBulk(attendance: any[], classId: number, subjectId: number, date: string) {
    return this.request('/teachers/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify({ attendance, class_id: classId, subject_id: subjectId, attendance_date: date })
    });
  }

  async getTeacherStatistics() {
    return this.request('/teachers/statistics');
  }

  async getTeacherUpcomingLessons() {
    return this.request('/teachers/upcoming-lessons');
  }

  async getTeacherRecentGrades(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teachers/recent-grades?${query}`);
  }

  async getTeacherAttendanceSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/teachers/attendance-summary?${query}`);
  }

  async getAssignmentsByTeacher(teacherId: number) {
    // Advanced Assignments is the fully-featured, file-capable assignments system
    return this.request(`/advanced-assignments/assignments/teacher/${teacherId}`);
  }

  async getTeacherAssignmentSubmissions(assignmentId: number) {
    return this.request(`/advanced-assignments/assignments/${assignmentId}/submissions`);
  }

  async getAssignmentAnalytics(assignmentId: number) {
    return this.request(`/advanced-assignments/analytics/assignment/${assignmentId}`);
  }

  async submitGrade(gradeData: any) {
    return this.request('/advanced-assignments/grades', {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  }

  async createTeacherAssignment(assignmentData: FormData) {
    return this.request('/assignments/assignments', {
      method: 'POST',
      body: assignmentData
    });
  }

  // Admin Management
  async getAdminAnalytics() {
    return this.request('/admin/analytics');
  }

  async getSecurityLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/security/logs?${query}`);
  }

  // Student Management
  async getBasicStudentDashboard() {
    return this.request('/students/dashboard');
  }

  async getBasicStudentGrades(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/students/grades?${query}`);
  }

  async getBasicStudentAttendance(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/students/attendance?${query}`);
  }

  async getBasicStudentTimetable() {
    return this.request('/students/timetable');
  }

  async getStudentPerformance() {
    return this.request('/students/performance');
  }

  async getBasicStudentAssignments(studentId: number) {
    return this.request(`/advanced-assignments/assignments/student/${studentId}`);
  }

  async submitBasicAssignment(submissionData: FormData) {
    return this.request('/advanced-assignments/submissions', {
      method: 'POST',
      body: submissionData
    });
  }

  // DOS Management - Full Operations
  async getDOSStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dos-management/students?${query}`);
  }

  async getDOSAdvancedTeachers() {
    return this.request('/dos-advanced/teachers');
  }

  async getDOSExams(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dos/exams?${query}`);
  }

  async getDOSCurriculum(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dos/curriculum?${query}`);
  }

  async getDOSClasses() {
    return this.request('/dos/classes');
  }

  async getDOSCourses() {
    return this.request('/dos/courses');
  }

  async getDOSTeacherAssignments() {
    return this.request('/dos-management/teacher-assignments');
  }

  async dosAssignTeacherToClass(teacherId: number, classId: number, subjectId?: number) {
    return this.request('/dos-management/assign-teacher', {
      method: 'POST',
      body: JSON.stringify({ teacher_id: teacherId, class_id: classId, subject_id: subjectId })
    });
  }

  async createTimetableEntry(timetableData: any) {
    return this.request('/dos/timetable', {
      method: 'POST',
      body: JSON.stringify(timetableData)
    });
  }

  async getDOSAnalytics(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dos/analytics?${query}`);
  }

  async getDOSTrades() {
    return this.request('/dos-advanced/trades');
  }

  async getAllTrades() {
    return this.request('/content/trades');
  }

  async getAllLevels() {
    return this.request('/levels/levels');
  }

  async getTradesByLevel(tradeCode: string) {
    return this.request(`/levels/trades/${tradeCode}/levels`);
  }

  async getTradesWithLevels() {
    const r = await this.request('/levels/trades-with-levels').catch(() => ({}));
    if (r?.trades?.length) return r;
    return this.request('/dos-management/trades-levels');
  }

  async getDOSDashboardStats() {
    return this.request('/dos-management/dashboard-stats');
  }

  // DOD Management (Director of Discipline)
  async getDODStats() {
    return this.request('/dod-comprehensive/dashboard/stats');
  }

  async getDODRecentActivities() {
    return this.request('/dod-comprehensive/activities/recent');
  }

  async getDODNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dod-comprehensive/notifications?${query}`);
  }

  async markDODNotificationRead(id: number) {
    return this.request(`/dod-comprehensive/notifications/${id}/read`, { method: 'POST' });
  }

  async getDODSystemHealth() {
    return this.request('/dod-comprehensive/system/health');
  }

  async getDODComprehensiveDisciplineCases(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dod-comprehensive/discipline/cases?${query}`);
  }

  async deleteDODComprehensiveDisciplineCase(id: number) {
    return this.request(`/dod-comprehensive/discipline/cases/${id}`, { method: 'DELETE' });
  }

  async notifyParentMarkLossComprehensive(studentId: number, marksLost: number, reason: string) {
    return this.request('/dod-comprehensive/notify-parent-mark-loss', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, marks_lost: marksLost, reason })
    });
  }

  async createDODComprehensiveDisciplineCase(caseData: any) {
    return this.request('/dod-comprehensive/discipline/cases', {
      method: 'POST',
      body: JSON.stringify(caseData)
    });
  }

  async updateDODComprehensiveDisciplineCase(id: number, caseData: any) {
    return this.request(`/dod-comprehensive/discipline/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(caseData)
    });
  }

  async getDODBehaviorPoints(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dod-comprehensive/behavior/points?${query}`);
  }

  async awardDODBehaviorPoints(pointData: any) {
    return this.request('/dod-comprehensive/behavior/points', {
      method: 'POST',
      body: JSON.stringify(pointData)
    });
  }

  async getDODExamMonitoring(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dod-comprehensive/exams/monitoring?${query}`);
  }

  async getDODPunishments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/dod-comprehensive/punishments?${query}`);
  }

  async getDODParentNotifications() {
    return this.request('/dod-comprehensive/parent-notifications');
  }

  async getDODAnalytics() {
    return this.request('/dod-comprehensive/analytics/dashboard');
  }

  // Accountant Management
  async getAccountantDashboard() {
    return this.request('/accountant/dashboard');
  }

  async getAccountantPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/accountant/payments?${query}`);
  }

  async createAccountantPayment(paymentData: any) {
    return this.request('/accountant/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getAccountantExpenses(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/accountant/expenses?${query}`);
  }

  async createAccountantExpense(expenseData: any) {
    return this.request('/accountant/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  }

  async getAccountantInvoices(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/accountant/invoices?${query}`);
  }

  async getAccountantBudgets() {
    return this.request('/accountant/budgets');
  }

  async getAccountantSalaries() {
    return this.request('/accountant/salaries');
  }

  async getAccountantReports(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/accountant/reports?${query}`);
  }

  async getAccountantAnalytics() {
    return this.request('/accountant/analytics');
  }

  async getAccountantStudentPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/accountant/student-payments?${query}`);
  }

  /** Send SMS reminders to parents of students with unpaid/partial fees. Uses real SMS API (e.g. Africa's Talking) from backend. */
  async sendAccountantSmsRemindUnpaid(options?: { message_template?: string; student_ids?: number[] }) {
    return this.request('/accountant/sms-remind-unpaid', {
      method: 'POST',
      body: JSON.stringify(options || {})
    });
  }

  /** Accountant: get remind-parent settings (e.g. days overdue before reminder, time of day). Stored in DB. */
  async getAccountantRemindSettings() {
    return this.request('/accountant/remind-settings');
  }

  /** Accountant: update remind-parent time/settings. */
  async updateAccountantRemindSettings(settings: { remind_days_overdue?: number; remind_time?: string; remind_enabled?: boolean }) {
    return this.request('/accountant/remind-settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async recordAccountantPayment(paymentData: any) {
    return this.request('/accountant/record-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async updateAccountantFees(feeData: any) {
    return this.request('/accountant/update-fees', {
      method: 'POST',
      body: JSON.stringify(feeData)
    });
  }

  // Patron / Discipline Management
  async getDisciplineStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/discipline/students?${query}`);
  }

  async getDisciplineAnalytics() {
    return this.request('/discipline/analytics');
  }

  async submitIncident(incidentData: any) {
    return this.request('/discipline/conduct/remove', {
      method: 'POST',
      body: JSON.stringify(incidentData)
    });
  }

  async submitLeave(leaveData: any) {
    return this.request('/discipline/leave/add', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  }

  async getLeaveHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/discipline/leave/history?${query}`);
  }

  async updateLeaveStatus(id: number, statusData: any) {
    return this.request(`/discipline/leaves/${id}`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  async getDisciplineRecords(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/discipline/records?${query}`);
  }

  async getDisciplineLeaves(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/discipline/leaves?${query}`);
  }

  async removeConductRecord(conductData: any) {
    return this.request('/discipline/conduct/remove', {
      method: 'POST',
      body: JSON.stringify(conductData)
    });
  }

  async addStudentLeave(leaveData: any) {
    return this.request('/discipline/leave/add', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  }

  async updateDisciplineRecordStatus(id: number, status: string) {
    return this.request(`/discipline/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async deleteDisciplineRecord(id: number) {
    return this.request(`/discipline/records/${id}`, { method: 'DELETE' });
  }

  async getParentNotifications(parentId: number) {
    return this.request(`/discipline/parent/notifications/${parentId}`);
  }

  async markParentNotificationRead(id: number) {
    return this.request(`/discipline/parent/notifications/${id}/read`, { method: 'PUT' });
  }

  async bulkUpdateDisciplineRecords(recordIds: number[], status: string) {
    return this.request('/discipline/records/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ record_ids: recordIds, status })
    });
  }

  async getDisciplineTrades() {
    return this.request('/discipline/trades');
  }

  async getDisciplineClasses() {
    return this.request('/discipline/classes');
  }


  async sendParentMessage(parentId: number, messageData: any) {
    return this.request('/dod-actions/message-parent', {
      method: 'POST',
      body: JSON.stringify({ parent_id: parentId, ...messageData })
    });
  }

  async sendBulkParentMessage(messageData: any) {
    return this.request('/dod-actions/bulk-message', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  async getAllParentsList(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users?role=parent&${query}`);
  }

  async getParentDetailsWithChildrenList(parentId: number) {
    return this.request(`/users/${parentId}/children-details`);
  }

  async getDisciplineLeaveRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/discipline/leaves?${query}`);
  }

  async createDisciplineLeaveRequest(leaveData: any) {
    return this.request('/discipline/leave/add', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  }

  async sendGeneralMessage(messageData: any) {
    return this.request('/messaging/send', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  // HeadMaster Management
  async getHeadMasterDashboard() {
    return this.request('/headmaster/dashboard');
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

  async updateStockItem(id: number, itemData: any) {
    return this.request(`/stock/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  }

  async deleteStockItem(id: number) {
    return this.request(`/stock/items/${id}`, { method: 'DELETE' });
  }

  async getStockTransactions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stock/transactions?${query}`);
  }

  async createStockTransaction(transactionData: any) {
    return this.request('/stock/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
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

  async getStockCategories() {
    return this.request('/stock/categories');
  }

  async getStockProcurementOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stock/procurement?${query}`);
  }

  async createStockProcurementOrder(orderData: any) {
    return this.request('/stock/procurement', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getStockRequisitions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stock/requisitions?${query}`);
  }

  async createStockRequisition(requisitionData: any) {
    return this.request('/stock/requisitions', {
      method: 'POST',
      body: JSON.stringify(requisitionData)
    });
  }

  async updateStockRequisition(id: number, requisitionData: any) {
    return this.request(`/stock/requisitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requisitionData)
    });
  }

  async getStockSuppliers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/stock/suppliers?${query}`);
  }

  async createStockSupplier(supplierData: any) {
    return this.request('/stock/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData)
    });
  }


  async getStockNotifications() {
    return this.request('/stock/notifications');
  }

  // Accountant - Stock Expenses
  async getAccountantStockExpenses() {
    return this.request('/accountant/stock-expenses');
  }

  // Accountant - Global Students Financial
  async getAccountantStudentsFinancial(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/accountant/students-financial?${query}`);
  }

  async createCustomStudentFee(studentId: number, feeData: any) {
    return this.request(`/accountant/students/${studentId}/custom-fee`, {
      method: 'POST',
      body: JSON.stringify(feeData)
    });
  }

  async createBulkStudentFees(feeData: any) {
    return this.request('/accountant/students/bulk-fees', {
      method: 'POST',
      body: JSON.stringify(feeData)
    });
  }

  // Payment Proofs
  async submitPaymentProof(formData: FormData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/payment-proofs/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  }

  async getMyPaymentProofs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/payment-proofs/my-submissions?${query}`);
  }

  async getAllPaymentProofs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/payment-proofs/all?${query}`);
  }

  async getPaymentProofDetails(id: number) {
    return this.request(`/payment-proofs/${id}`);
  }

  async verifyPaymentProof(id: number, verificationData: any) {
    return this.request(`/payment-proofs/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify(verificationData)
    });
  }

  async getPaymentProofStats() {
    return this.request('/payment-proofs/stats/summary');
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
  async getFinancePayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/finance/payments?${query}`);
  }

  async createFinancePayment(paymentData: any) {
    return this.request('/finance/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getStudentFeeSummary(studentId: number) {
    return this.request(`/finance/students/${studentId}/fee-summary`);
  }


  // Contact Management
  async submitContactForm(formData: FormData) {
    const response = await fetch(`${API_BASE}/contact/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    return response.json();
  }

  async requestCallback(callbackData: any) {
    return this.request('/contact/callback', {
      method: 'POST',
      body: JSON.stringify(callbackData)
    });
  }

  async getContactSubmissions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/contact/submissions?${query}`);
  }

  async updateContactSubmissionStatus(id: number, status: string, response: string) {
    return this.request(`/contact/submissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, response })
    });
  }

  async sendChatMessage(sessionId: string, sender: string, message: string) {
    return this.request('/contact/chat/message', {
      method: 'POST',
      body: JSON.stringify({ sessionId, sender, message })
    });
  }

  async getChatMessages(sessionId: string) {
    return this.request(`/contact/chat/${sessionId}/messages`);
  }

  // Support Management
  async createSupportTicket(ticketData: any) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  async getSupportTickets(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/support/tickets?${query}`);
  }

  async getSupportTicketDetails(id: number) {
    return this.request(`/support/tickets/${id}`);
  }

  async addTicketResponse(ticketId: number, message: string, isStaff = false) {
    return this.request(`/support/tickets/${ticketId}/responses`, {
      method: 'POST',
      body: JSON.stringify({ message, isStaff })
    });
  }

  async updateTicketStatus(ticketId: number, status: string) {
    return this.request(`/support/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async getKnowledgeBase(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/support/knowledge-base?${query}`);
  }

  async getKnowledgeArticle(id: number) {
    return this.request(`/support/knowledge-base/${id}`);
  }

  async rateArticle(articleId: number, rating: number, feedback?: string) {
    return this.request(`/support/knowledge-base/${articleId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback })
    });
  }

  async getSupportStatistics() {
    return this.request('/support/statistics');
  }

  // Parent Phone-Based Authentication
  async parentPhoneLogin(phone: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login/parent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, password })
    });
    const data = await response.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  async parentPhoneRegister(parentData: {
    phone: string;
    password: string;
    first_name: string;
    last_name: string;
    email?: string;
    address?: string;
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
  }) {
    const response = await fetch(`${API_BASE}/auth/register/parent-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parentData)
    });
    const data = await response.json();
    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  }

  // Library Management
  async getLibraryBooks(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/library-system/books?${query}`);
  }

  async getLibraryStats() {
    return this.request('/library-system/analytics');
  }

  async getLibraryBorrowings(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/library-system/borrowings?${query}`);
  }

  async createLibraryBook(bookData: any) {
    return this.request('/library-system/books', {
      method: 'POST',
      body: JSON.stringify(bookData)
    });
  }

  async updateLibraryBook(id: number, bookData: any) {
    return this.request(`/library-system/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData)
    });
  }

  async deleteLibraryBook(id: number) {
    return this.request(`/library-system/books/${id}`, { method: 'DELETE' });
  }

  async borrowLibraryBook(borrowData: { user_id: number; book_id: number; due_date: string; notes?: string }) {
    return this.request('/library-system/borrowings', {
      method: 'POST',
      body: JSON.stringify(borrowData)
    });
  }

  async returnLibraryBook(borrowingId: number, returnData: any) {
    return this.request(`/library-system/borrowings/${borrowingId}/return`, {
      method: 'PUT',
      body: JSON.stringify(returnData)
    });
  }

  // Hostel Management
  async getHostelRooms(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/hostel-system/rooms?${query}`);
  }

  async getMyHostelApplications() {
    return this.request('/hostel-system/allocations'); // Convention: admins see all, students see theirs
  }

  async getHostelAllocations(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/hostel-system/allocations?${query}`);
  }

  async allocateHostelRoom(studentId: number, roomId: number, allocationData: any) {
    return this.request('/hostel-system/allocations', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, room_id: roomId, ...allocationData })
    });
  }

  async checkoutHostelRoom(allocationId: number) {
    return this.request(`/hostel-system/allocations/${allocationId}/checkout`, {
      method: 'PUT'
    });
  }

  async applyForHostel(roomId: number, reason: string) {
    return this.request('/hostel-system/allocations', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId, notes: reason, status: 'pending' })
    });
  }

  // Financial Management
  async getFinancialStats() {
    return this.request('/financial-system/stats');
  }

  async getBudgets(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/financial-system/budgets?${query}`);
  }

  async createBudget(budgetData: any) {
    return this.request('/financial-system/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData)
    });
  }

  async getExpenses(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/financial-system/expenses?${query}`);
  }

  async createExpense(expenseData: any) {
    return this.request('/financial-system/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  }

  async approveExpense(expenseId: number) {
    return this.request(`/financial-system/expenses/${expenseId}/approve`, {
      method: 'PUT'
    });
  }

  async getIncome(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/financial-system/income?${query}`);
  }

  async createIncome(incomeData: any) {
    return this.request('/financial-system/income', {
      method: 'POST',
      body: JSON.stringify(incomeData)
    });
  }

  async getInvoices(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/invoices?${query}`);
  }

  async createInvoice(invoiceData: any) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  // Medical Management
  async getMedicalRecords(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/medical-system/records?${query}`);
  }

  async createMedicalRecord(recordData: any) {
    return this.request('/medical-system/records', {
      method: 'POST',
      body: JSON.stringify(recordData)
    });
  }

  async updateMedicalRecord(id: number, recordData: any) {
    return this.request(`/medical-system/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData)
    });
  }

  async getMedicalAnalytics(params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/medical-system/analytics?${query}`);
  }

  async getStudentMedicalSummary(studentId: number) {
    return this.request(`/medical-system/student/${studentId}/summary`);
  }

  // Exam Management
  async getExams(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/exams?${query}`);
  }

  async getExamDetails(id: number) {
    return this.request(`/exams/${id}`);
  }

  async createExam(examData: any) {
    return this.request('/exams', {
      method: 'POST',
      body: JSON.stringify(examData)
    });
  }

  async submitExamResult(examId: number, resultData: any) {
    return this.request(`/exams/${examId}/results`, {
      method: 'POST',
      body: JSON.stringify(resultData)
    });
  }

  async getExamResults(examId: number) {
    return this.request(`/exams/${examId}/results`);
  }

  // Announcements & Broadcast
  async broadcastAnnouncement(broadcastData: any) {
    return this.request('/announcements/broadcast', {
      method: 'POST',
      body: JSON.stringify(broadcastData)
    });
  }

  // Dynamic Column Management (Accountant)
  async getTrades() {
    try {
      // Try multiple endpoints to get trades data
      const endpoints = [
        '/content/trades/all',
        '/comprehensive-trades/all',
        '/trades/all',
        '/management/trades'
      ];

      for (const endpoint of endpoints) {
        try {
          const result = await this.request(endpoint);
          if (result && (result.trades || result.data)) {
            return result.trades || result.data || result;
          }
        } catch (err) {
          continue; // Try next endpoint
        }
      }

      // Fallback: return default trades if no endpoint works
      return [
        { id: 1, name: 'ICT', code: 'ICT', description: 'Information and Communication Technology' },
        { id: 2, name: 'Electrical Installation', code: 'ELE', description: 'Electrical Installation and Maintenance' },
        { id: 3, name: 'Plumbing', code: 'PLU', description: 'Plumbing and Water Systems' },
        { id: 4, name: 'Welding', code: 'WEL', description: 'Welding and Metal Work' },
        { id: 5, name: 'Carpentry', code: 'CAR', description: 'Carpentry and Woodwork' }
      ];
    } catch (error) {
      console.error('Error fetching trades:', error);
      return [];
    }
  }

  async getLevels() {
    try {
      // Try multiple endpoints to get levels data
      const endpoints = [
        '/levels/levels',
        '/management/levels',
        '/academics/levels'
      ];

      for (const endpoint of endpoints) {
        try {
          const result = await this.request(endpoint);
          if (result && (result.levels || result.data)) {
            return result.levels || result.data || result;
          }
        } catch (err) {
          continue; // Try next endpoint
        }
      }

      // Fallback: return default levels if no endpoint works
      return [
        { id: 1, level_number: 1, name: 'Level 1', description: 'First Year' },
        { id: 2, level_number: 2, name: 'Level 2', description: 'Second Year' },
        { id: 3, level_number: 3, name: 'Level 3', description: 'Third Year' }
      ];
    } catch (error) {
      console.error('Error fetching levels:', error);
      return [];
    }
  }

  async getLevelSheetColumns(tradeId: number, levelId: number) {
    return this.request(`/management/columns/${tradeId}/${levelId}`);
  }

  async createLevelSheetColumn(columnData: any) {
    return this.request('/management/columns', {
      method: 'POST',
      body: JSON.stringify(columnData)
    });
  }

  async updateLevelSheetColumn(columnId: number, columnData: any) {
    return this.request(`/management/columns/${columnId}`, {
      method: 'PUT',
      body: JSON.stringify(columnData)
    });
  }

  async deleteLevelSheetColumn(columnId: number) {
    return this.request(`/management/columns/${columnId}`, { method: 'DELETE' });
  }

  async getStudentsByTradeLevel(tradeId: number, levelId: number) {
    return this.request(`/management/students/${tradeId}/${levelId}`);
  }

  async updateStudentColumnValue(studentId: number, columnId: number, value: string) {
    return this.request(`/management/students/${studentId}/columns/${columnId}`, {
      method: 'PUT',
      body: JSON.stringify({ column_value: value })
    });
  }

  // Student Management (DOS/Headmaster)
  async addStudent(studentData: any) {
    return this.request('/management/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async updateStudentInfo(studentId: number, studentData: any) {
    return this.request(`/management/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  async getStudentFullDetails(studentId: number) {
    return this.request(`/management/students/${studentId}/details`);
  }

  // Parent Connection System
  async searchStudentsForConnection(query: string, tradeId?: number, levelId?: number) {
    const params: any = { query };
    if (tradeId) params.trade_id = tradeId;
    if (levelId) params.level_id = levelId;
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/management/students/search?${queryString}`);
  }

  async requestParentConnection(studentId: number, relationship: string) {
    return this.request('/management/parent/connect', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, relationship })
    });
  }

  async getParentConnectionRequests() {
    return this.request('/management/parent/connections');
  }

  async approveParentConnection(connectionId: number, status: 'approved' | 'rejected') {
    return this.request(`/management/parent/connections/${connectionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // DOD - Parent Management
  async getDODParents(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/management/dod/parents?${query}`);
  }

  async getDODParentDetails(parentId: number) {
    return this.request(`/management/dod/parents/${parentId}`);
  }

  async sendDODParentMessage(parentId: number, messageData: { subject: string; message: string; priority?: string; send_sms?: boolean }) {
    return this.request(`/management/dod/parents/${parentId}/message`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  async sendDODBulkParentMessage(messageData: { parent_ids: number[]; subject: string; message: string; priority?: string; send_sms?: boolean }) {
    return this.request('/management/dod/parents/bulk-message', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  // DOD - Leave Management
  async getDODLeaveRequests(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/management/dod/leave-requests?${query}`);
  }

  async createDODLeaveRequest(leaveData: { student_id: number; leave_type: string; reason: string; start_date: string; end_date: string }) {
    return this.request('/management/dod/leave-requests', {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  }

  async updateDODLeaveStatus(leaveId: number, statusData: { status: string; notes?: string }) {
    return this.request(`/management/dod/leave-requests/${leaveId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  // DOD - Enhanced Discipline Management
  async getDODDisciplineRecords(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/management/dod/discipline-records?${query}`);
  }

  async createDODDisciplineRecord(disciplineData: { student_id: number; incident_type: string; incident_date?: string; description: string; severity?: string; action_taken?: string; notify_parent?: boolean }) {
    return this.request('/management/dod/discipline-records', {
      method: 'POST',
      body: JSON.stringify(disciplineData)
    });
  }

  async updateDODDisciplineRecord(recordId: number, updateData: { incident_type?: string; description?: string; severity?: string; action_taken?: string; status?: string }) {
    return this.request(`/management/dod/discipline-records/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  async deleteDODDisciplineRecord(recordId: number, permanent: boolean = false) {
    return this.request(`/management/dod/discipline-records/${recordId}?permanent=${permanent}`, {
      method: 'DELETE'
    });
  }

  async getDODDisciplineStatistics(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/management/dod/discipline-statistics?${query}`);
  }

  // Legacy DOD methods (for backward compatibility)
  async getDODDisciplineCases() {
    return this.getDODDisciplineRecords();
  }

  async updateDODDisciplineCase(id: number, data: any) {
    return this.updateDODDisciplineRecord(id, data);
  }

  async deleteDODDisciplineCase(id: number) {
    return this.deleteDODDisciplineRecord(id, false);
  }

  async notifyParentMarkLoss(studentId: number, marks: number, description: string) {
    return this.createDODDisciplineRecord({
      student_id: studentId,
      incident_type: 'Marks Deduction',
      description: `${description} - Marks Lost: ${marks}`,
      severity: 'medium',
      notify_parent: true
    });
  }

  // Universal Profile Management (All Roles - accountant, stock_manager, DOS, DOD, headmaster, advisor, admin, teacher)
  async getMyProfile() {
    const res = await this.request('/management/profile/me').catch(() => null);
    if (res?.success && res?.user) return res;
    const fallback = await this.request('/users/profile').catch(() => null);
    if (fallback?.success && fallback?.user) return fallback;
    if (fallback && typeof fallback === 'object' && (fallback as any).id) return { success: true, user: fallback };
    return res || { success: false };
  }

  async updateMyProfile(profileData: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    profile_image?: string;
  }) {
    const res = await this.request('/management/profile/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }).catch(() => null);
    if (res?.success) return res;
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async changeMyPassword(passwordData: { current_password: string; new_password: string }) {
    const res = await this.request('/management/profile/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    }).catch(() => null);
    if (res?.success) return res;
    const userAuthRes = await this.request('/user-auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
    }).catch(() => null);
    if (userAuthRes?.success) return userAuthRes;
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ current_password: passwordData.current_password, new_password: passwordData.new_password })
    });
  }

  // ==================== UNIVERSAL STAFF MANAGEMENT ====================

  // Dynamic Column Management
  async getCustomColumns(entityType: string) {
    return this.request(`/universal-management/columns/${entityType}`);
  }

  async createCustomColumn(columnData: {
    entity_type: string;
    column_name: string;
    column_label: string;
    column_type: string;
    data_type: string;
    is_required?: boolean;
    is_searchable?: boolean;
    is_sortable?: boolean;
    is_filterable?: boolean;
    default_value?: string;
    validation_rules?: any;
    options?: any;
    display_order?: number;
    description?: string;
    group_name?: string;
  }) {
    return this.request('/universal-management/columns', {
      method: 'POST',
      body: JSON.stringify(columnData)
    });
  }

  async updateCustomColumn(id: number, columnData: any) {
    return this.request(`/universal-management/columns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(columnData)
    });
  }

  async deleteCustomColumn(id: number, permanent: boolean = false) {
    return this.request(`/universal-management/columns/${id}?permanent=${permanent}`, {
      method: 'DELETE'
    });
  }

  // Universal Entity Management
  async getEntities(entityType: string, params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/universal-management/entities/${entityType}?${query}`);
  }

  async getEntity(entityType: string, id: number) {
    return this.request(`/universal-management/entities/${entityType}/${id}`);
  }

  async updateEntityCustomFields(entityType: string, id: number, customFields: any) {
    return this.request(`/universal-management/entities/${entityType}/${id}/custom-fields`, {
      method: 'PUT',
      body: JSON.stringify({ custom_fields: customFields })
    });
  }

  async bulkUpdateCustomFields(entityType: string, data: any) {
    return this.request(`/universal-management/entities/${entityType}/bulk-update-fields`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async exportEntities(entityType: string, format: string = 'csv') {
    return this.request(`/universal-management/entities/${entityType}/export?format=${format}`);
  }

  // ==================== ADMIN DASHBOARD ADVANCED ====================

  async getAdminDashboardOverview(timeframe: string = '30d') {
    return this.request(`/admin-dashboard-advanced/overview?timeframe=${timeframe}`);
  }

  async getEnrollmentTrends(period: string = 'monthly', months: number = 12) {
    return this.request(`/admin-dashboard-advanced/analytics/enrollment-trends?period=${period}&months=${months}`);
  }

  async getFinancialAnalytics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/admin-dashboard-advanced/analytics/financial?${params}`);
  }

  async getAcademicPerformanceAnalytics(academicYear?: string, term?: string) {
    const params = new URLSearchParams();
    if (academicYear) params.append('academicYear', academicYear);
    if (term) params.append('term', term);
    return this.request(`/admin-dashboard-advanced/analytics/academic-performance?${params}`);
  }

  async getAttendanceAnalytics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return this.request(`/admin-dashboard-advanced/analytics/attendance?${params}`);
  }

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/admin-dashboard-advanced/users?${query}`);
  }

  async createAdminUser(userData: any) {
    return this.request('/admin-dashboard-advanced/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async bulkActivateUsers(userIds: number[]) {
    return this.request('/admin-dashboard-advanced/users/bulk-activate', {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds })
    });
  }

  async bulkDeactivateUsers(userIds: number[]) {
    return this.request('/admin-dashboard-advanced/users/bulk-deactivate', {
      method: 'POST',
      body: JSON.stringify({ user_ids: userIds })
    });
  }

  async getSystemSettings(category?: string) {
    const params = category ? `?category=${category}` : '';
    return this.request(`/admin-dashboard-advanced/settings${params}`);
  }

  async updateSystemSetting(key: string, value: any) {
    return this.request(`/admin-dashboard-advanced/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ setting_value: value })
    });
  }

  async getActivityLogs(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/admin-dashboard-advanced/activity-logs?${query}`);
  }

  // ==================== ACCOUNTANT COMPREHENSIVE ====================

  async getFeeStructures(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/accountant-comprehensive/fee-structures?${query}`);
  }

  async createFeeStructure(feeData: any) {
    return this.request('/accountant-comprehensive/fee-structures', {
      method: 'POST',
      body: JSON.stringify(feeData)
    });
  }

  async updateFeeStructure(id: number, feeData: any) {
    return this.request(`/accountant-comprehensive/fee-structures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feeData)
    });
  }

  async getComprehensiveAccountantPayments(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/accountant-comprehensive/payments?${query}`);
  }

  async recordComprehensiveAccountantPayment(paymentData: any) {
    return this.request('/accountant-comprehensive/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getStudentBalance(studentId: string) {
    return this.request(`/accountant-comprehensive/students/${studentId}/balance`);
  }

  async getReceipt(receiptNumber: string) {
    return this.request(`/accountant-comprehensive/receipts/${receiptNumber}`);
  }

  async getReceiptByPayment(paymentId: number) {
    return this.request(`/accountant-comprehensive/receipts/payment/${paymentId}`);
  }

  async getOutstandingBalances(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/accountant-comprehensive/reports/outstanding-balances?${query}`);
  }

  async getDailyRevenue(date: string) {
    return this.request(`/accountant-comprehensive/reports/daily-revenue?date=${date}`);
  }

  async getMonthlyRevenue(month: string) {
    return this.request(`/accountant-comprehensive/reports/monthly-revenue?month=${month}`);
  }

  async getCollectionEfficiency(academicYear: string) {
    return this.request(`/accountant-comprehensive/reports/collection-efficiency?academicYear=${academicYear}`);
  }

  async getComprehensiveAccountantBudgets(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/accountant-comprehensive/budgets?${query}`);
  }

  async createAccountantBudget(budgetData: any) {
    return this.request('/accountant-comprehensive/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData)
    });
  }

  async updateBudget(id: number, budgetData: any) {
    return this.request(`/accountant-comprehensive/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData)
    });
  }

  async recordExpense(expenseData: any) {
    return this.request('/accountant-comprehensive/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  }

  async getExpenseReports(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/accountant-comprehensive/expenses/reports?${query}`);
  }

  // ==================== STOCK MANAGEMENT ADVANCED ====================

  async getInventory(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/stock-advanced/inventory?${query}`);
  }

  async getInventoryItem(id: number) {
    return this.request(`/stock-advanced/inventory/${id}`);
  }

  async addStockInventoryItem(itemData: any) {
    return this.request('/stock-advanced/inventory', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  async updateInventoryItem(id: number, itemData: any) {
    return this.request(`/stock-advanced/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  }

  async getSuppliers(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/stock-advanced/suppliers?${query}`);
  }

  async createSupplier(supplierData: any) {
    return this.request('/stock-advanced/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData)
    });
  }

  async getSupplierPerformance(id: number) {
    return this.request(`/stock-advanced/suppliers/${id}/performance`);
  }

  async recordPurchase(purchaseData: any) {
    return this.request('/stock-advanced/transactions/purchase', {
      method: 'POST',
      body: JSON.stringify(purchaseData)
    });
  }

  async recordStockAdjustment(adjustmentData: any) {
    return this.request('/stock-advanced/transactions/adjustment', {
      method: 'POST',
      body: JSON.stringify(adjustmentData)
    });
  }

  async recordDistribution(distributionData: any) {
    return this.request('/stock-advanced/distributions', {
      method: 'POST',
      body: JSON.stringify(distributionData)
    });
  }

  async recordReturn(id: number, returnData: any) {
    return this.request(`/stock-advanced/distributions/${id}/return`, {
      method: 'PUT',
      body: JSON.stringify(returnData)
    });
  }

  async getInventoryValuation(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/stock-advanced/reports/valuation?${query}`);
  }

  async getStockMovement(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/stock-advanced/reports/movement?${query}`);
  }

  async getLowStockAlerts() {
    return this.request('/stock-advanced/reports/low-stock-alerts');
  }

  async getExpiringItems(days: number = 30) {
    return this.request(`/stock-advanced/reports/expiring-items?days=${days}`);
  }

  async getStockAuditReport(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/stock-advanced/reports/audit?${query}`);
  }

  // ==================== TEACHER PORTAL ADVANCED ====================

  async getTeacherDashboard() {
    return this.request('/teacher-portal-advanced/dashboard');
  }

  async getTeacherPortalClasses(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/teacher-portal-advanced/classes?${query}`);
  }

  async getTeacherPortalClassStudents(classId: number) {
    return this.request(`/teacher-portal-advanced/classes/${classId}/students`);
  }

  async markTeacherPortalAttendance(attendanceData: any) {
    return this.request('/teacher-portal-advanced/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  }

  async bulkMarkAttendance(attendanceData: any) {
    return this.request('/teacher-portal-advanced/attendance/bulk', {
      method: 'POST',
      body: JSON.stringify(attendanceData)
    });
  }

  async getAttendanceReport(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/teacher-portal-advanced/attendance/report?${query}`);
  }

  async recordGrades(gradesData: any) {
    return this.request('/teacher-portal-advanced/grades', {
      method: 'POST',
      body: JSON.stringify(gradesData)
    });
  }

  async updateGrade(id: number, gradeData: any) {
    return this.request(`/teacher-portal-advanced/grades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gradeData)
    });
  }

  async getTeacherPortalClassPerformance(classId: number, params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/teacher-portal-advanced/classes/${classId}/performance?${query}`);
  }

  async createTeacherPortalAssignment(assignmentData: any) {
    return this.request('/teacher-portal-advanced/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData)
    });
  }

  async getTeacherPortalAssignmentSubmissions(assignmentId: number) {
    // Keep consistent return shape with TeacherGradingPage (expects a raw array)
    return this.request(`/advanced-assignments/assignments/${assignmentId}/submissions`);
  }

  async gradeSubmission(submissionId: number, gradeData: any) {
    return this.request(`/teacher-portal-advanced/assignments/submissions/${submissionId}/grade`, {
      method: 'PUT',
      body: JSON.stringify(gradeData)
    });
  }

  async getStudentPerformanceReport(studentId: string, params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/teacher-portal-advanced/analytics/student/${studentId}/performance?${query}`);
  }

  async getClassAnalytics(classId: number) {
    return this.request(`/teacher-portal-advanced/analytics/class/${classId}/statistics`);
  }

  async getTeacherConduct(classId?: number) {
    const query = classId != null ? `?classId=${classId}` : '';
    return this.request(`/teacher-portal-advanced/conduct${query}`);
  }

  async submitTeacherConduct(data: { student_id: number | string; class_id: number; description: string; severity?: string }) {
    return this.request('/teacher-portal-advanced/conduct', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteTeacherConduct(conductId: number) {
    return this.request(`/teacher-portal-advanced/conduct/${conductId}`, { method: 'DELETE' });
  }

  // ==================== STUDENT PORTAL COMPREHENSIVE ====================

  async getStudentPortalDashboard() {
    return this.request('/student-portal-comprehensive/dashboard');
  }

  async getStudentMarks(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/student-portal-comprehensive/academic/marks?${query}`);
  }

  async getStudentPortalAttendance(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/student-portal-comprehensive/academic/attendance?${query}`);
  }

  async getStudentPortalTimetable() {
    return this.request('/student-portal-comprehensive/academic/timetable');
  }

  async getStudentPortalAssignments(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/student-portal-comprehensive/assignments?${query}`);
  }

  async submitStudentPortalAssignment(assignmentId: number, submissionData: any) {
    return this.request(`/student-portal-comprehensive/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData)
    });
  }

  async getAssignmentFeedback(assignmentId: number) {
    return this.request(`/student-portal-comprehensive/assignments/${assignmentId}/feedback`);
  }

  async getStudentConduct() {
    return this.request('/student-portal-comprehensive/conduct/records');
  }

  async getStudentAchievements() {
    return this.request('/student-portal-comprehensive/achievements');
  }

  async getStudentFeeStatement(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/student-portal-comprehensive/fees/statement?${query}`);
  }

  async getStudentReceipts() {
    return this.request('/student-portal-comprehensive/fees/receipts');
  }

  async getStudentProfile() {
    return this.request('/student-portal-comprehensive/profile');
  }

  async updateStudentProfile(profileData: any) {
    return this.request('/student-portal-comprehensive/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getStudentMessages(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/student-portal-comprehensive/messages?${query}`);
  }

  async sendStudentMessage(messageData: any) {
    return this.request('/student-portal-comprehensive/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  // ==================== PARENT PORTAL COMPREHENSIVE ====================

  async getParentDashboard() {
    return this.request('/parent-portal-comprehensive/dashboard');
  }

  async getChildAcademicPerformance(studentId: string, params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/parent-portal-comprehensive/students/${studentId}/academics?${query}`);
  }

  async getParentPortalChildAttendance(studentId: string, params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/parent-portal-comprehensive/students/${studentId}/attendance?${query}`);
  }

  async getParentPortalChildDiscipline(studentId: string) {
    return this.request(`/parent-portal-comprehensive/students/${studentId}/discipline`);
  }

  async getChildActivities(studentId: string, params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/parent-portal-comprehensive/students/${studentId}/activities?${query}`);
  }

  async getParentPortalChildFees(studentId: string) {
    return this.request(`/parent-portal-comprehensive/students/${studentId}/fees`);
  }

  async initiateParentPayment(paymentData: any) {
    return this.request('/parent-portal-comprehensive/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  /** Parent: submit link request (phone, student name, level, trade). Stored in DB; staff must approve. */
  async submitParentLinkRequest(data: { parent_phone: string; student_name: string; level: string; trade: string; relationship?: string; student_code?: string }) {
    return this.request('/parent-portal-comprehensive/link-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /** Parent: get my pending link requests status. */
  async getMyParentLinkRequests() {
    return this.request('/parent-portal-comprehensive/link-requests/my');
  }

  /** Staff: list pending parent link requests for approval. */
  async getPendingParentLinkRequests() {
    return this.request('/parent-portal-comprehensive/link-requests/pending');
  }

  /** Staff: approve a parent link request (grants access). */
  async approveParentLinkRequest(requestId: number) {
    return this.request(`/parent-portal-comprehensive/link-requests/${requestId}/approve`, { method: 'PUT' });
  }

  /** Staff: reject a parent link request. */
  async rejectParentLinkRequest(requestId: number) {
    return this.request(`/parent-portal-comprehensive/link-requests/${requestId}/reject`, { method: 'PUT' });
  }

  /** Parent: payment history for a linked student (real API). */
  async getParentPaymentHistory(studentId: string) {
    return this.request(`/parent-portal-comprehensive/payments/history/${studentId}`);
  }

  /** Parent: get receipt by receipt number (real API). */
  async getParentReceipt(receiptNumber: string) {
    return this.request(`/parent-portal-comprehensive/payments/receipt/${receiptNumber}`);
  }

  async sendParentCommunication(commData: any) {
    return this.request('/parent-portal-comprehensive/communications', {
      method: 'POST',
      body: JSON.stringify(commData)
    });
  }

  async getParentCommunications(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/parent-portal-comprehensive/communications?${query}`);
  }

  async getParentPortalNotifications(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/parent-portal-comprehensive/notifications?${query}`);
  }

  async markNotificationAsRead(id: number) {
    return this.request(`/parent-portal-comprehensive/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  // ==================== GLOBAL STUDENT SHEETS ====================

  async getGlobalStudentSheets(tradeCode: string, levelNumber: number, levelSuffix: string = '') {
    return this.request(`/global-sheets/sheets/${tradeCode}/${levelNumber}?level_suffix=${levelSuffix}`);
  }

  async getGlobalStudent(studentId: string) {
    return this.request(`/global-sheets/students/${studentId}`);
  }

  async createGlobalStudent(studentData: any) {
    return this.request('/global-sheets/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async updateGlobalStudent(studentId: string, studentData: any) {
    return this.request(`/global-sheets/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  async getGlobalStudents(params = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/global-sheets/students?${query}`);
  }

  /** Teacher: classes (fallback comprehensive-roles if /teachers/classes fails) */
  async getTeacherClasses() {
    const r = await this.request('/teachers/classes').catch(() => null);
    if (r?.success && r?.classes) return r;
    return this.request('/comprehensive-roles/teacher/classes');
  }

  /** Teacher: students in a class */
  async getClassStudents(classId: number) {
    const r = await this.request(`/teachers/classes/${classId}/students`).catch(() => null);
    if (r?.success && Array.isArray(r?.students)) return r;
    return this.request(`/comprehensive-roles/teacher/classes/${classId}/students`);
  }

  /** Courses for a trade/level (timetable & report cards) */
  async getCoursesByTradeLevel(tradeCode: string, levelNumber?: number, levelSuffix?: string) {
    const params = new URLSearchParams({ trade_code: tradeCode });
    if (levelNumber != null) params.set('level_number', String(levelNumber));
    if (levelSuffix) params.set('level_suffix', levelSuffix);
    return this.request(`/academics/courses/by-trade-level?${params}`);
  }

  /** Save/update a single mark on global sheet (teacher) */
  async saveGlobalSheetMark(sheetId: number, assessmentKey: string, obtainedMarks: number, maxMarks: number, options?: { subject_id?: number; term?: string; academic_year?: string }) {
    return this.request('/global-sheets/sheets/' + sheetId + '/marks', {
      method: 'POST',
      body: JSON.stringify({ assessment_key: assessmentKey, obtained_marks: obtainedMarks, max_marks: maxMarks, ...options })
    });
  }

  /** Bulk save marks for a level (teacher) */
  async saveGlobalSheetMarksBulk(tradeCode: string, levelNumber: number, levelSuffix: string, marks: { student_id: number; subject_id: number; obtained_marks: number; max_marks: number }[], options?: { term?: string; academic_year?: string }) {
    return this.request('/global-sheets/marks/bulk', {
      method: 'POST',
      body: JSON.stringify({ trade_code: tradeCode, level_number: levelNumber, level_suffix: levelSuffix, marks, ...options })
    });
  }

  // Parent Contact & Reminders
  async contactParent(studentId: number, messageData: { message: string; subject?: string; send_sms?: boolean }) {
    return this.request(`/accountant/students/${studentId}/contact-parent`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  async bulkRemindParents(studentIds: number[]) {
    return this.request('/accountant/bulk-remind-parents', {
      method: 'POST',
      body: JSON.stringify({ student_ids: studentIds })
    });
  }

  /** Africa's Talking: send event-based SMS to parent(s) linked with student */
  async notifyParentSms(studentId: number, eventType: 'leave_granted' | 'conduct_removed' | 'sick_alert' | 'sick_sent_home' | 'discipline_alert' | 'fee_overdue' | 'general_announcement', variables: Record<string, string | number> = {}) {
    return this.request('/sms/notify-parent', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, event_type: eventType, ...variables })
    });
  }

  // ============================================================
  // PARENT LINKING SYSTEM
  // ============================================================

  // Core Link Management
  async getParentLinks(params?: {
    status?: string;
    parent_id?: number;
    student_id?: number;
    relationship_type?: string;
    min_confidence?: number;
    max_confidence?: number;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
  }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/parent-linking/links?${query}`);
  }

  async getParentLink(id: number) {
    return this.request(`/parent-linking/links/${id}`);
  }

  async createParentLink(data: {
    parent_id: number;
    student_id: number;
    relationship_type?: string;
    match_confidence?: number;
    notes?: string;
  }) {
    return this.request('/parent-linking/links', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateParentLink(id: number, data: {
    status?: string;
    relationship_type?: string;
    notes?: string;
  }) {
    return this.request(`/parent-linking/links/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteParentLink(id: number, reason?: string) {
    return this.request(`/parent-linking/links/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason })
    });
  }

  async getParentStudents(parentId: number) {
    return this.request(`/parent-linking/parent/${parentId}/students`);
  }

  async getStudentParents(studentId: number) {
    return this.request(`/parent-linking/student/${studentId}/parents`);
  }

  // Approval & Verification
  async getPendingLinks(params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/parent-linking/pending?${query}`);
  }

  async approveLink(id: number, notes?: string) {
    return this.request(`/parent-linking/approve/${id}`, {
      method: 'POST',
      body: JSON.stringify({ notes })
    });
  }

  async rejectLink(id: number, reason?: string) {
    return this.request(`/parent-linking/reject/${id}`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async bulkApproveLinks(linkIds: number[]) {
    return this.request('/parent-linking/bulk-approve', {
      method: 'POST',
      body: JSON.stringify({ link_ids: linkIds })
    });
  }

  async bulkRejectLinks(linkIds: number[], reason?: string) {
    return this.request('/parent-linking/bulk-reject', {
      method: 'POST',
      body: JSON.stringify({ link_ids: linkIds, reason })
    });
  }

  // Advanced Search & Analytics
  async searchParentLinks(filters: {
    parent_name?: string;
    student_name?: string;
    parent_phone?: string;
    student_number?: string;
    trade_code?: string;
    level?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }) {
    return this.request('/parent-linking/search', {
      method: 'POST',
      body: JSON.stringify(filters)
    });
  }

  async getParentLinkingAnalytics() {
    return this.request('/parent-linking/analytics');
  }

  async getParentLinkingDashboardStats() {
    return this.request('/parent-linking/stats/dashboard');
  }

  async getParentLinkActivity(id: number) {
    return this.request(`/parent-linking/activity/${id}`);
  }

  // Admin Management
  async getParentLinkingAdminOverview() {
    return this.request('/parent-linking/admin/overview');
  }

  async getParentLinkingConflicts() {
    return this.request('/parent-linking/admin/conflicts');
  }

  async forceCreateLink(data: {
    parent_id: number;
    student_id: number;
    relationship_type: string;
    reason: string;
  }) {
    return this.request('/parent-linking/admin/force-link', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getParentLinkingAuditLog(params?: { page?: number; limit?: number; action?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/parent-linking/admin/audit-log?${query}`);
  }
}

export const apiService = new ApiService();
export default apiService;


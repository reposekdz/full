const API_BASE_URL = 'http://localhost:5000/api';

export interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender: 'Male' | 'Female';
  is_active: boolean;
  trade_code: string;
  trade_name: string;
  level_number: number;
  level_suffix?: string;
  trade_level_name: string;
  class_name: string;
  class_id: number;
  average_grade?: number;
  attendance_percentage?: number;
  conduct_score?: number;
  rank_in_class?: number;
  total_conduct_points?: number;
  parent_first_name?: string;
  parent_last_name?: string;
  parent_phone?: string;
  parent_email?: string;
}

export interface ConductRecord {
  id: number;
  student_id: number;
  trade_class_id: number;
  incident_type: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: string;
  incident_date: string;
  reported_by: number;
  action_taken?: string;
  points_awarded: number;
  points_deducted: number;
  status: 'pending' | 'investigating' | 'resolved' | 'escalated' | 'closed';
  student_name?: string;
  student_code?: string;
  reported_by_name?: string;
  class_name?: string;
  trade_code?: string;
  level_number?: number;
  level_suffix?: string;
}

export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  trade_class_id: number;
  subject_id: number;
  assignment_type: 'main' | 'assistant' | 'subject_specialist';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  teacher_name: string;
  teacher_email: string;
  class_name: string;
  trade_code: string;
  level_number: number;
  level_suffix?: string;
  trade_level_name: string;
  subject_name: string;
  subject_code: string;
}

export interface TimetableSession {
  id: number;
  trade_class_id: number;
  subject_id: number;
  teacher_id: number;
  day_of_week: string;
  period_number: number;
  start_time: string;
  end_time: string;
  room?: string;
  session_type: 'theory' | 'practical' | 'workshop' | 'laboratory';
  equipment_needed?: string;
  class_name: string;
  trade_code: string;
  level_number: number;
  level_suffix?: string;
  trade_level_name: string;
  subject_name: string;
  subject_code: string;
  teacher_name: string;
  teacher_email: string;
}

export interface TradeLevel {
  id: number;
  trade_code: string;
  trade_name: string;
  level_number: number;
  level_suffix?: string;
  full_name: string;
  description: string;
  capacity: number;
  is_active: boolean;
  class_count: number;
  total_students: number;
}

export interface ClassInfo {
  id: number;
  class_name: string;
  trade_level_id: number;
  academic_year_id: number;
  main_teacher_id?: number;
  assistant_teacher_id?: number;
  classroom?: string;
  capacity: number;
  current_enrollment: number;
  performance_average: number;
  attendance_average: number;
  conduct_average: number;
  trade_code: string;
  trade_name: string;
  level_number: number;
  level_suffix?: string;
  trade_level_name: string;
  main_teacher?: string;
  assistant_teacher?: string;
  average_grade?: number;
  average_attendance?: number;
  average_conduct_score?: number;
}

export interface AnalyticsOverview {
  overall_statistics: {
    total_students: number;
    active_students: number;
    total_classes: number;
    total_teachers: number;
    overall_average_grade: number;
    overall_attendance: number;
    overall_conduct_score: number;
  };
  trade_performance: Array<{
    trade_code: string;
    trade_name: string;
    student_count: number;
    avg_grade: number;
    avg_attendance: number;
    avg_conduct_score: number;
    class_count: number;
  }>;
}

export interface CreateStudentRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender: 'Male' | 'Female';
  trade_code: string;
  level_number: number;
  level_suffix?: string;
  address?: string;
  emergency_contact?: string;
  medical_info?: string;
  parent_info?: {
    first_name: string;
    last_name: string;
    phone: string;
    email?: string;
  };
}

export interface CreateConductRequest {
  student_id: number;
  trade_class_id?: number;
  incident_type: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: string;
  incident_date: string;
  reported_by: number;
  witness_ids?: number[];
  action_taken?: string;
  points_awarded?: number;
  points_deducted?: number;
  parent_notification?: boolean;
}

class DOSService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/dos${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Student Management
  async getStudents(params: {
    page?: number;
    limit?: number;
    trade?: string;
    level?: number;
    class_id?: number;
    status?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
  } = {}): Promise<{
    success: boolean;
    data: {
      students: Student[];
      pagination: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`/students?${queryParams.toString()}`);
  }

  async createStudent(studentData: CreateStudentRequest): Promise<{
    success: boolean;
    message: string;
    data: {
      student_id: number;
      student_code: string;
    };
  }> {
    return this.makeRequest('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id: number, updates: Partial<Student>): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStudent(id: number): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudentDetails(id: number): Promise<{
    success: boolean;
    data: Student & {
      recent_conducts: ConductRecord[];
      recent_grades: any[];
      attendance_summary: any;
    };
  }> {
    return this.makeRequest(`/students/${id}`);
  }

  // Conduct Management
  async getConductRecords(params: {
    page?: number;
    limit?: number;
    student_id?: number;
    class_id?: number;
    type?: 'positive' | 'negative' | 'neutral';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'pending' | 'investigating' | 'resolved' | 'escalated' | 'closed';
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
  } = {}): Promise<{
    success: boolean;
    data: {
      conducts: ConductRecord[];
      pagination: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
      };
    };
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`/conduct?${queryParams.toString()}`);
  }

  async createConductRecord(conductData: CreateConductRequest): Promise<{
    success: boolean;
    message: string;
    data: { conduct_id: number };
  }> {
    return this.makeRequest('/conduct', {
      method: 'POST',
      body: JSON.stringify(conductData),
    });
  }

  async updateConductRecord(id: number, updates: Partial<ConductRecord>): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest(`/conduct/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteConductRecord(id: number): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest(`/conduct/${id}`, {
      method: 'DELETE',
    });
  }

  // Teacher Assignments
  async getTeacherAssignments(params: {
    teacher_id?: number;
    class_id?: number;
    subject_id?: number;
    is_active?: boolean;
  } = {}): Promise<{
    success: boolean;
    data: TeacherAssignment[];
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`/teacher-assignments?${queryParams.toString()}`);
  }

  async assignTeacher(assignmentData: {
    teacher_id: number;
    trade_class_id: number;
    subject_id: number;
    assignment_type?: 'main' | 'assistant' | 'subject_specialist';
    start_date?: string;
    end_date?: string;
    assigned_by: number;
    notes?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { assignment_id: number };
  }> {
    return this.makeRequest('/teacher-assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  // Timetable Management
  async getTimetable(params: {
    class_id?: number;
    teacher_id?: number;
    day?: string;
    academic_year_id?: number;
  } = {}): Promise<{
    success: boolean;
    data: {
      sessions: TimetableSession[];
      grouped_by_day: Record<string, TimetableSession[]>;
    };
  }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`/timetable?${queryParams.toString()}`);
  }

  async createTimetableSession(sessionData: {
    trade_class_id: number;
    subject_id: number;
    teacher_id: number;
    day_of_week: string;
    period_number: number;
    start_time: string;
    end_time: string;
    room?: string;
    session_type?: 'theory' | 'practical' | 'workshop' | 'laboratory';
    equipment_needed?: string;
    academic_year_id?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: { session_id: number };
  }> {
    return this.makeRequest('/timetable', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // Analytics
  async getAnalyticsOverview(academic_year_id?: number): Promise<{
    success: boolean;
    data: AnalyticsOverview;
  }> {
    const queryParams = academic_year_id 
      ? `?academic_year_id=${academic_year_id}` 
      : '';
    
    return this.makeRequest(`/analytics/overview${queryParams}`);
  }

  // Trade and Class Management
  async getTrades(): Promise<{
    success: boolean;
    data: TradeLevel[];
  }> {
    return this.makeRequest('/trades');
  }

  async getClassesForTrade(tradeLevelId: number, academicYearId?: number): Promise<{
    success: boolean;
    data: ClassInfo[];
  }> {
    const queryParams = academicYearId 
      ? `?academic_year_id=${academicYearId}` 
      : '';
    
    return this.makeRequest(`/trades/${tradeLevelId}/classes${queryParams}`);
  }
}

export default new DOSService();
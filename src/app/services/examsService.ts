import { API_BASE_URL } from '@/app/config/apiBase';

const API_BASE = API_BASE_URL;

export interface Exam {
  id: number;
  code: string;
  title: string;
  title_rw: string;
  course_id?: number;
  subject_id?: number;
  trade: 'SOD' | 'BDC' | 'AUT' | 'General';
  level: string;
  exam_type: 'midterm' | 'final' | 'quiz' | 'practical';
  exam_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  room: string;
  instructor_id?: number;
  total_marks: number;
  passing_marks: number;
  description?: string;
  topics?: string[];
  materials?: string[];
  rules?: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'grading';
  students_enrolled?: number;
  instructor_first_name?: string;
  instructor_last_name?: string;
  subject_name?: string;
}

export interface ExamResult {
  id: number;
  exam_id: number;
  student_id: number;
  obtained_marks: number;
  grade_letter: string;
  percentage: number;
  rank?: number;
  remarks?: string;
  result_date: string;
}

class ExamsService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAllExams(filters?: {
    trade?: string;
    level?: string;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<Exam[]> {
    const params = new URLSearchParams(filters as any).toString();
    const response = await fetch(`${API_BASE}/exams?${params}`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.exams;
  }

  async getExamById(id: number): Promise<Exam> {
    const response = await fetch(`${API_BASE}/exams/${id}`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.exam;
  }

  async createExam(examData: Partial<Exam>): Promise<number> {
    const response = await fetch(`${API_BASE}/exams`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(examData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.examId;
  }

  async updateExam(id: number, examData: Partial<Exam>): Promise<void> {
    const response = await fetch(`${API_BASE}/exams/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(examData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
  }

  async deleteExam(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/exams/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
  }

  async registerForExam(examId: number, studentId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/exams/${examId}/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ student_id: studentId })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
  }

  async submitExamResult(examId: number, resultData: {
    student_id: number;
    obtained_marks: number;
    remarks?: string;
  }): Promise<void> {
    const response = await fetch(`${API_BASE}/exams/${examId}/results`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(resultData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
  }

  async getExamResults(examId: number): Promise<ExamResult[]> {
    const response = await fetch(`${API_BASE}/exams/${examId}/results`, {
      headers: this.getAuthHeaders()
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.results;
  }
}

export default new ExamsService();

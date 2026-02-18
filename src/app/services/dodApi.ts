// DOD (Director of Discipline) API Service
// All API calls for DOD Dashboard

import { API_BASE_URL } from '../config/apiBase';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// ============================================
// INCIDENTS
// ============================================

export const getIncidents = async (params: {
  student_id?: string;
  incident_type?: string;
  severity?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/dod/incidents?${queryString}`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

export const createIncident = async (incidentData: {
  student_id: number;
  incident_type: string;
  severity: string;
  description: string;
  location?: string;
  witnesses?: string;
  actions_taken?: string;
  incident_date?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/incidents`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(incidentData)
  });
  return response.json();
};

export const updateIncident = async (incidentId: string, incidentData: any) => {
  const response = await fetch(`${API_BASE_URL}/dod/incidents/${incidentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(incidentData)
  });
  return response.json();
};

export const deleteIncident = async (incidentId: string) => {
  const response = await fetch(`${API_BASE_URL}/dod/incidents/${incidentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
};

// ============================================
// LEAVES
// ============================================

export const getLeaves = async (params: {
  student_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/dod/leaves?${queryString}`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

export const createLeave = async (leaveData: {
  student_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/leaves`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(leaveData)
  });
  return response.json();
};

export const approveLeave = async (leaveId: string) => {
  const response = await fetch(`${API_BASE_URL}/dod/leaves/${leaveId}/approve`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return response.json();
};

export const rejectLeave = async (leaveId: string, reason: string) => {
  const response = await fetch(`${API_BASE_URL}/dod/leaves/${leaveId}/reject`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  });
  return response.json();
};

// ============================================
// CONDUCT RECORDS
// ============================================

export const getConductRecords = async (params: {
  student_id?: string;
  class_name?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/dod/conduct?${queryString}`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

export const createConductRecord = async (recordData: {
  student_id: number;
  incident_type: string;
  severity: string;
  description: string;
  incident_date?: string;
  location?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/conduct`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(recordData)
  });
  return response.json();
};

// ============================================
// SOD STUDENTS (Students of Discipline)
// ============================================

export const getSODStudents = async (params: {
  status?: string;
  level?: string;
  trade?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/dod/sod-students?${queryString}`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

export const addSODStudent = async (studentData: {
  student_id: number;
  notes?: string;
  status?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/sod-students`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData)
  });
  return response.json();
};

export const updateSODStudent = async (studentId: string, studentData: {
  status?: string;
  notes?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/sod-students/${studentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(studentData)
  });
  return response.json();
};

export const removeSODStudent = async (studentId: string) => {
  const response = await fetch(`${API_BASE_URL}/dod/sod-students/${studentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
};

// ============================================
// REMOVE CONDUCT RECORDS
// ============================================

export const removeConductRecord = async (recordId: string, removalData: {
  removal_reason: string;
  removal_type: 'leave' | 'sick' | 'lesson_cancelled' | 'exonerated' | 'appealed' | 'time_expired' | 'administrative';
  notes?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/conduct/${recordId}/remove`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify(removalData)
  });
  return response.json();
};

export const getConductRemovals = async (params: {
  student_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/dod/conduct-removals?${queryString}`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

// ============================================
// PARENT-STUDENT LINKING
// ============================================

export const linkParentToStudent = async (data: {
  student_id: number;
  parent_id: number;
  relationship?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/link-parent`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
};

export const unlinkParentFromStudent = async (data: {
  student_id: number;
  parent_id: number;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/link-parent`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
};

export const getStudentParents = async (studentId: string) => {
  const response = await fetch(`${API_BASE_URL}/dod/student-parents/${studentId}`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

// ============================================
// SMS NOTIFICATIONS
// ============================================

export const sendSMS = async (data: {
  parent_id?: number;
  student_id?: number;
  message: string;
  priority?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/sms/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
};

export const sendBulkSMS = async (data: {
  parent_ids?: number[];
  student_ids?: number[];
  message: string;
  priority?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/sms/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
};

export const getSMSHistory = async (params: {
  parent_id?: string;
  student_id?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/dod/sms/history?${queryString}`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

// ============================================
// STATISTICS & COUNSELING
// ============================================

export const getDODStats = async () => {
  const response = await fetch(`${API_BASE_URL}/dod/stats`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

export const getCounseling = async (params: {
  student_id?: string;
  status?: string;
} = {}) => {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/dod/counseling?${queryString}`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

export const scheduleCounseling = async (data: {
  student_id: number;
  session_date: string;
  session_type: string;
  notes?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/counseling`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
};

// ============================================
// STUDENT SHEETS
// ============================================

export const getStudentSheetsColumns = async () => {
  const response = await fetch(`${API_BASE_URL}/dod/student-sheets/columns`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

export const addStudentSheetsColumn = async (columnData: {
  column_name: string;
  column_type: string;
  is_required?: boolean;
}) => {
  const response = await fetch(`${API_BASE_URL}/dod/student-sheets/columns`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(columnData)
  });
  return response.json();
};

export const getStudentSheetsData = async (params: {
  class_name?: string;
  trade_code?: string;
  level?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const queryString = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/dod/student-sheets?${queryString}`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

// ============================================
// TIMETABLE
// ============================================

export const getDODTimetable = async () => {
  const response = await fetch(`${API_BASE_URL}/dod/timetable`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

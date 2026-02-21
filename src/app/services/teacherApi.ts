/**
 * Teacher Comprehensive API Service
 * All real API endpoints for Teacher Dashboard
 */
import { API_BASE_URL } from '../config/apiBase';

function getAuthHeaders(): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : { 'Content-Type': 'application/json' };
}

const API_BASE = API_BASE_URL;

// Dashboard APIs
export async function fetchDashboardStats() {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/dashboard`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchTeacherAnalytics(period: string = 'week') {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/analytics?period=${period}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Students APIs
export async function fetchStudents(params?: { class_id?: number; search?: string; trade_code?: string; level?: string; limit?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.class_id) queryParams.append('class_id', params.class_id.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.trade_code) queryParams.append('trade_code', params.trade_code);
  // Backend expects level_number but frontend uses level for simplicity
  if (params?.level) queryParams.append('level_number', params.level);
  // Limit to 29 students if specified
  if (params?.limit) queryParams.append('limit', params.limit);

  const response = await fetch(`${API_BASE}/teacher-comprehensive/students?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Fetch students by trade and level (e.g., SOD Level 4)
export async function fetchStudentsByTradeAndLevel(tradeCode: string, level: string) {
  return fetchStudents({ trade_code: tradeCode, level: level });
}

// Fetch SOD Level 4 students specifically - limit to 29 students
export async function fetchSODLevel4Students() {
  return fetchStudents({ trade_code: 'SOD', level: '4' });
}

// Fetch exactly 29 Level 4 SOD students
export async function fetchLevel4SOD29Students() {
  return fetchStudents({ trade_code: 'SOD', level: '4' });
}

// ============================================================
// TRADES AND LEVELS APIs - Fetch from Database
// ============================================================

// Get all trades from database (BDC, SOD, AUT)
export async function fetchTradesFromDatabase() {
  const response = await fetch(`${API_BASE}/trades-levels/trades`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get levels for a specific trade
export async function fetchLevelsFromDatabase(tradeCode: string) {
  const response = await fetch(`${API_BASE}/trades-levels/trades/${tradeCode}/levels`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// ============================================================
// SMS APIs - Africa\\'s Talking Integration
// ============================================================

// Send SMS to a single parent
export async function sendParentSMS(phoneNumber: string, message: string) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/sms/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ phoneNumber, message })
  });
  return response.json();
}

// Send SMS to multiple parents
export async function sendBulkParentSMS(phoneNumbers: string[], message: string) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/sms/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ phoneNumbers, message })
  });
  return response.json();
}

// Send SMS to parent of a specific student
export async function sendStudentParentSMS(studentId: number, message: string) {
  const response = await fetch(`${API_BASE}/dod/sms/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ student_id: studentId, message })
  });
  return response.json();
}

// Send SMS to multiple students' parents
export async function sendBulkStudentSMS(studentIds: number[], message: string) {
  const response = await fetch(`${API_BASE}/dod/sms/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ student_ids: studentIds, message })
  });
  return response.json();
}

// Get SMS history
export async function getSMSHistory(params?: { limit?: number; offset?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const response = await fetch(`${API_BASE}/dod/sms/history?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get SMS balance
export async function getSMSBalance() {
  const response = await fetch(`${API_BASE}/sms/balance`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Send fee reminder SMS
export async function sendFeeReminderSMS(studentId: number, amount: number, dueDate: string) {
  const response = await fetch(`${API_BASE}/accountant/sms-remind-unpaid`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      message_template: `Reminder: Fee payment of ${amount} is due on ${dueDate}`,
      student_ids: [studentId]
    })
  });
  return response.json();
}

// ============================================================
// PARENT LINKING APIs - Advanced Staff Features
// ============================================================

// Get all parent links with filters
export async function getAllParentLinks(params?: { status?: string; search?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(`${API_BASE}/parent-linking/links?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get pending parent link requests
export async function getPendingParentLinkRequests() {
  const response = await fetch(`${API_BASE}/parent-linking/pending`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Approve parent link request with comprehensive options
export async function approveParentLinkRequest(
  linkId: number,
  options?: {
    notes?: string;
    sendNotification?: boolean;
    notifyBy?: 'sms' | 'email' | 'both';
    accessLevel?: 'full' | 'limited' | 'read-only';
    validUntil?: string;
    autoConnectStudents?: boolean;
    grantPaymentAccess?: boolean;
    grantAttendanceView?: boolean;
    grantGradeView?: boolean;
  }
) {
  const params = {
    notes: options?.notes,
    send_notification: options?.sendNotification !== false,
    notify_by: options?.notifyBy || 'sms',
    access_level: options?.accessLevel || 'full',
    valid_until: options?.validUntil,
    auto_connect_students: options?.autoConnectStudents !== false,
    grant_payment_access: options?.grantPaymentAccess !== false,
    grant_attendance_view: options?.grantAttendanceView !== false,
    grant_grade_view: options?.grantGradeView !== false
  };

  const response = await fetch(`${API_BASE}/parent-linking/approve/${linkId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params)
  });
  return response.json();
}

// Reject parent link request with detailed reason
export async function rejectParentLinkRequest(
  linkId: number,
  options?: {
    reason: string;
    reasonCategory?: 'invalid_info' | 'duplicate' | 'unverified' | 'parent_request' | 'student_request' | 'policy_violation' | 'other';
    notifyParent?: boolean;
    allowReapply?: boolean;
    reapplyAfterDays?: number;
    internalNotes?: string;
  }
) {
  const params = {
    reason: options?.reason || 'Request rejected by administrator',
    reason_category: options?.reasonCategory || 'other',
    notify_parent: options?.notifyParent !== false,
    allow_reapply: options?.allowReapply !== false,
    reapply_after_days: options?.reapplyAfterDays || 30,
    internal_notes: options?.internalNotes
  };

  const response = await fetch(`${API_BASE}/parent-linking/reject/${linkId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params)
  });
  return response.json();
}

// Bulk approve multiple parent link requests
export async function bulkApproveLinkRequests(
  linkIds: number[],
  options?: {
    sendNotifications?: boolean;
    notifyBy?: 'sms' | 'email' | 'both';
    notes?: string;
  }
) {
  const params = {
    request_ids: linkIds,
    send_notifications: options?.sendNotifications !== false,
    notify_by: options?.notifyBy || 'sms',
    notes: options?.notes
  };

  const response = await fetch(`${API_BASE}/parent-linking/bulk-approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params)
  });
  return response.json();
}

// Bulk reject multiple parent link requests
export async function bulkRejectLinkRequests(
  linkIds: number[],
  options?: {
    reason: string;
    reasonCategory?: string;
    notifyParents?: boolean;
  }
) {
  const params = {
    request_ids: linkIds,
    reason: options?.reason || 'Bulk rejection by administrator',
    reason_category: options?.reasonCategory || 'other',
    notify_parents: options?.notifyParents !== false
  };

  const response = await fetch(`${API_BASE}/parent-linking/bulk-reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params)
  });
  return response.json();
}

// Get parent linking conflicts with detailed filtering
export async function getParentLinkingConflicts(params?: {
  conflictType?: 'multiple_parents' | 'expired_links' | 'pending_requests' | 'unverified';
  status?: 'active' | 'resolved' | 'pending';
  tradeCode?: string;
  levelNumber?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  searchTerm?: string;
}) {
  const queryParams = new URLSearchParams();

  if (params) {
    if (params.conflictType) queryParams.append('conflict_type', params.conflictType);
    if (params.status) queryParams.append('status', params.status);
    if (params.tradeCode) queryParams.append('trade_code', params.tradeCode);
    if (params.levelNumber) queryParams.append('level_number', params.levelNumber.toString());
    if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params.dateTo) queryParams.append('date_to', params.dateTo);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.searchTerm) queryParams.append('search', params.searchTerm);
  }

  const query = queryParams.toString();
  const response = await fetch(`${API_BASE}/parent-linking/admin/conflicts${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get detailed conflict analysis
export async function getDetailedConflictAnalysis(conflictId: number) {
  const response = await fetch(`${API_BASE}/parent-linking/admin/conflicts/${conflictId}/details`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Resolve a conflict
export async function resolveConflict(
  conflictId: number,
  resolution: {
    action: 'keep_primary' | 'keep_secondary' | 'merge' | 'remove_both' | 'manual';
    primaryParentId?: number;
    secondaryParentId?: number;
    notes?: string;
  }
) {
  const response = await fetch(`${API_BASE}/parent-linking/admin/conflicts/${conflictId}/resolve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(resolution)
  });
  return response.json();
}

// Get linking analytics
export async function getLinkingAnalytics(params?: {
  dateFrom?: string;
  dateTo?: string;
  tradeCode?: string;
  groupBy?: 'day' | 'week' | 'month' | 'trade' | 'level';
}) {
  const queryParams = new URLSearchParams();

  if (params) {
    if (params.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params.dateTo) queryParams.append('date_to', params.dateTo);
    if (params.tradeCode) queryParams.append('trade_code', params.tradeCode);
    if (params.groupBy) queryParams.append('group_by', params.groupBy);
  }

  const query = queryParams.toString();
  const response = await fetch(`${API_BASE}/parent-linking/analytics${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Create new parent link (manual)
export async function createParentLink(data: { parent_id: number; student_id: number; relationship: string }) {
  const response = await fetch(`${API_BASE}/parent-linking/links`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
}

// Revoke parent link
export async function revokeParentLink(linkId: number, reason?: string) {
  const response = await fetch(`${API_BASE}/parent-linking/links/${linkId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason })
  });
  return response.json();
}

// Get parents for a student
export async function getStudentParents(studentId: number) {
  const response = await fetch(`${API_BASE}/parent-linking/student/${studentId}/parents`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get children for a parent
export async function getParentStudents(parentId: number) {
  const response = await fetch(`${API_BASE}/parent-linking/parent/${parentId}/students`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get parent linking analytics
export async function getParentLinkingAnalytics() {
  const response = await fetch(`${API_BASE}/parent-linking/analytics`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get parent linking dashboard stats
export async function getParentLinkingStats() {
  const response = await fetch(`${API_BASE}/parent-linking/stats/dashboard`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Bulk approve parent links
export async function bulkApproveParentLinks(linkIds: number[]) {
  const response = await fetch(`${API_BASE}/parent-linking/bulk-approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ link_ids: linkIds })
  });
  return response.json();
}

// Bulk reject parent links
export async function bulkRejectParentLinks(linkIds: number[], reason: string) {
  const response = await fetch(`${API_BASE}/parent-linking/bulk-reject`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ link_ids: linkIds, reason })
  });
  return response.json();
}

// Search parent links
export async function searchParentLinks(filters: {
  parent_name?: string;
  student_name?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}) {
  const response = await fetch(`${API_BASE}/parent-linking/search`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(filters)
  });
  return response.json();
}

// ============================================================
// QUIZ MANAGEMENT APIs - Advanced Quiz Features
// ============================================================

// Get all quizzes (teacher portal ultra)
export async function getTeacherQuizzes(params?: { status?: string; class_id?: number; subject?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.class_id) queryParams.append('class_id', params.class_id.toString());
  if (params?.subject) queryParams.append('subject', params.subject);

  const response = await fetch(`${API_BASE}/teacher-portal-ultra/quizzes?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Create quiz (teacher portal ultra)
export async function createTeacherQuiz(quizData: {
  title: string;
  description?: string;
  subject_id?: number;
  class_id: number;
  trade_code?: string;
  level_number?: number;
  level_suffix?: string;
  difficulty_level?: string;
  time_limit?: number;
  total_marks?: number;
  passing_marks?: number;
  instructions?: string;
  start_time?: string;
  end_time?: string;
  randomize_questions?: boolean;
  show_results_immediately?: boolean;
  allow_review?: boolean;
  max_attempts?: number;
  questions?: any[];
}) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/quiz/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(quizData)
  });
  return response.json();
}

// Get quiz by ID
export async function getQuizById(quizId: number) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/quizzes/${quizId}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Update quiz (teacher portal ultra)
export async function updateTeacherQuiz(quizId: number, quizData: any) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/quizzes/${quizId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(quizData)
  });
  return response.json();
}

// Delete quiz (teacher portal ultra)
export async function deleteTeacherQuiz(quizId: number) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get quiz submissions
export async function getQuizSubmissions(quizId: number) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/quizzes/${quizId}/submissions`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Grade quiz submission
export async function gradeQuizSubmission(quizId: number, submissionId: number, gradeData: {
  marks_obtained: number;
  feedback?: string;
  status?: string;
}) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/quizzes/${quizId}/submissions/${submissionId}/grade`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(gradeData)
  });
  return response.json();
}

// Bulk grade quiz submissions
export async function bulkGradeQuizSubmissions(quizId: number, grades: any[]) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/quizzes/${quizId}/bulk-grade`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ grades })
  });
  return response.json();
}

// Get pending grading quizzes
export async function getPendingGradingQuizzes() {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/quizzes/pending-grading`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Publish quiz results
export async function publishQuizResults(quizId: number) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/quizzes/${quizId}/publish`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return response.json();
}

// ============================================================
// HOMEWORK/ASSIGNMENT APIs - Advanced Assignment Features
// ============================================================

// Get all assignments (teacher portal ultra)
export async function getTeacherAssignments(params?: { status?: string; class_id?: number; assignment_type?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.class_id) queryParams.append('class_id', params.class_id.toString());
  if (params?.assignment_type) queryParams.append('assignment_type', params.assignment_type);

  const response = await fetch(`${API_BASE}/teacher-portal-ultra/assignments?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Create assignment (teacher portal ultra)
export async function createTeacherAssignment(assignmentData: {
  title: string;
  description?: string;
  subject?: string;
  class_id: number;
  trade_code?: string;
  due_date?: string;
  total_marks?: number;
  instructions?: string;
  attachments?: any;
  assignment_type?: string;
}) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/assignments/create`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(assignmentData)
  });
  return response.json();
}

// Update assignment (teacher portal ultra)
export async function updateTeacherAssignment(assignmentId: number, assignmentData: any) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/assignments/${assignmentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(assignmentData)
  });
  return response.json();
}

// Delete assignment (teacher portal ultra)
export async function deleteTeacherAssignment(assignmentId: number) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/assignments/${assignmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get assignment submissions
export async function getAssignmentSubmissions(assignmentId: number) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/assignments/${assignmentId}/submissions`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Grade assignment submission
export async function gradeAssignmentSubmission(assignmentId: number, submissionId: number, gradeData: {
  marks_obtained: number;
  feedback?: string;
  status?: string;
}) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(gradeData)
  });
  return response.json();
}

// Bulk grade assignments
export async function bulkGradeAssignments(assignmentId: number, grades: any[]) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/assignments/bulk-grade`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ assignment_id: assignmentId, grades })
  });
  return response.json();
}

// Get work distribution analytics
export async function getWorkDistributionAnalytics() {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/work-distribution/analytics`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Assign work to multiple classes
export async function assignBulkWork(workData: {
  title: string;
  description?: string;
  subject?: string;
  class_ids: number[];
  trade_code?: string;
  due_date?: string;
  total_marks?: number;
  instructions?: string;
  assignment_type?: string;
}) {
  const response = await fetch(`${API_BASE}/teacher-portal-ultra/work/assign-bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(workData)
  });
  return response.json();
}

// ============================================================
// HOLIDAY PACKAGE APIs
// ============================================================

// Get all holiday packages
export async function getHolidayPackages(params?: { status?: string; trade_code?: string; level_number?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.trade_code) queryParams.append('trade_code', params.trade_code);
  if (params?.level_number) queryParams.append('level_number', params.level_number.toString());

  const response = await fetch(`${API_BASE}/teacher-content/holiday?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Upload holiday package
export async function uploadHolidayPackage(packageData: any) {
  const response = await fetch(`${API_BASE}/teacher-content/holiday/upload`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(packageData)
  });
  return response.json();
}

// Delete holiday package
export async function deleteHolidayPackage(packageId: number) {
  const response = await fetch(`${API_BASE}/teacher-content/holiday/${packageId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// ============================================================
// MESSAGING APIs - Real-time Messaging
// ============================================================

// Get all messages
export async function getMessages(params?: { folder?: string; limit?: number; offset?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.folder) queryParams.append('folder', params.folder);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const response = await fetch(`${API_BASE}/teacher-comprehensive/messages?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Send message
export async function sendMessage(data: { recipient_id: number; subject: string; message: string; priority?: string }) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/messages/send`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
}

// Mark message as read
export async function markMessageRead(messageId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/messages/${messageId}/read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Delete message
export async function deleteMessage(messageId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/messages/${messageId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get unread message count
export async function getUnreadMessageCount() {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/messages/unread/count`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// ============================================================
// ANALYTICS & REPORTS APIs
// ============================================================

// Get teacher analytics
export async function getTeacherAnalytics(period: string = 'week') {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/analytics?period=${period}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get student performance analytics
export async function getStudentPerformanceAnalytics(studentId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/students/${studentId}/performance`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get class performance report
export async function getClassPerformanceReport(classId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/classes/${classId}/performance`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get attendance analytics
export async function getAttendanceAnalytics(params?: { start_date?: string; end_date?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);

  const response = await fetch(`${API_BASE}/teacher-comprehensive/attendance/analytics?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Get dashboard overview
export async function getDashboardOverview() {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/dashboard/overview`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchStudentDetails(studentId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/students/${studentId}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function updateStudent(studentId: number, data: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/students/${studentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function addStudentConduct(studentId: number, conductData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/students/${studentId}/conduct`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(conductData)
  });
  return response.json();
}

export async function fetchStudentGrades(studentId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/students/${studentId}/grades`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchStudentAttendance(studentId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/students/${studentId}/attendance`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchStudentProgress(studentId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/students/${studentId}/progress`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Classes APIs
export async function fetchAssignedClasses() {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/classes`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchClassDetails(classId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/classes/${classId}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchClassStudents(classId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/classes/${classId}/students`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchClassSchedule(classId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/classes/${classId}/schedule`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchClassAnalytics(classId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/classes/${classId}/analytics`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Courses APIs
export async function fetchTeacherCourses() {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/courses`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchCourseDetails(courseId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/courses/${courseId}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchCourseCurriculum(courseId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/courses/${courseId}/curriculum`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Quizzes APIs
export async function fetchQuizzes(params?: { class_id?: number; status?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.class_id) queryParams.append('class_id', params.class_id.toString());
  if (params?.status) queryParams.append('status', params.status);

  const response = await fetch(`${API_BASE}/teacher-comprehensive/quizzes?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchQuizDetails(quizId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/quizzes/${quizId}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createQuiz(quizData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/quizzes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(quizData)
  });
  return response.json();
}

export async function updateQuiz(quizId: number, quizData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/quizzes/${quizId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(quizData)
  });
  return response.json();
}

export async function deleteQuiz(quizId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function publishQuiz(quizId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/quizzes/${quizId}/publish`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchQuizResults(quizId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/quizzes/${quizId}/results`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchQuizQuestions(quizId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/quizzes/${quizId}/questions`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function addQuizQuestion(quizId: number, questionData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/quizzes/${quizId}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(questionData)
  });
  return response.json();
}

export async function updateQuizQuestion(questionId: number, questionData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/questions/${questionId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(questionData)
  });
  return response.json();
}

export async function deleteQuizQuestion(questionId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/questions/${questionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Assignments APIs
export async function fetchAssignments(params?: { class_id?: number; status?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.class_id) queryParams.append('class_id', params.class_id.toString());
  if (params?.status) queryParams.append('status', params.status);

  const response = await fetch(`${API_BASE}/teacher-comprehensive/assignments?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchAssignmentDetails(assignmentId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/assignments/${assignmentId}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createAssignment(assignmentData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/assignments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(assignmentData)
  });
  return response.json();
}

export async function updateAssignment(assignmentId: number, assignmentData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/assignments/${assignmentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(assignmentData)
  });
  return response.json();
}

export async function deleteAssignment(assignmentId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/assignments/${assignmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchAssignmentSubmissions(assignmentId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/assignments/${assignmentId}/submissions`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function gradeSubmission(submissionId: number, gradeData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/submissions/${submissionId}/grade`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(gradeData)
  });
  return response.json();
}

// Conduct APIs
export async function fetchConductRecords(params?: { class_id?: number; severity?: string; status?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.class_id) queryParams.append('class_id', params.class_id.toString());
  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.status) queryParams.append('status', params.status);

  const response = await fetch(`${API_BASE}/teacher-comprehensive/conduct?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function addConductRecord(conductData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/conduct`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(conductData)
  });
  return response.json();
}

export async function updateConductRecord(recordId: number, conductData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/conduct/${recordId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(conductData)
  });
  return response.json();
}

export async function deleteConductRecord(recordId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/conduct/${recordId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Attendance APIs
export async function fetchAttendance(params?: { class_id?: number; date?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.class_id) queryParams.append('class_id', params.class_id.toString());
  if (params?.date) queryParams.append('date', params.date);

  const response = await fetch(`${API_BASE}/teacher-comprehensive/attendance?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function markAttendance(attendanceData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/attendance`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(attendanceData)
  });
  return response.json();
}

export async function bulkMarkAttendance(attendanceList: any[]) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/attendance/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(attendanceList)
  });
  return response.json();
}

export async function updateAttendance(recordId: number, attendanceData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/attendance/${recordId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(attendanceData)
  });
  return response.json();
}

export async function fetchAttendanceSummary(classId: number, period: string = 'week') {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/attendance/summary?class_id=${classId}&period=${period}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Gradebook APIs
export async function fetchGrades(params?: { class_id?: number; subject?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.class_id) queryParams.append('class_id', params.class_id.toString());
  if (params?.subject) queryParams.append('subject', params.subject);

  const response = await fetch(`${API_BASE}/teacher-comprehensive/grades?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function addGrade(gradeData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/grades`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(gradeData)
  });
  return response.json();
}

export async function updateGrade(gradeId: number, gradeData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/grades/${gradeId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(gradeData)
  });
  return response.json();
}

export async function deleteGrade(gradeId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/grades/${gradeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchGradeAnalytics(classId: number, subject: string) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/grades/analytics?class_id=${classId}&subject=${subject}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function exportGrades(classId: number, format: string = 'excel') {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/grades/export?class_id=${classId}&format=${format}`, {
    headers: getAuthHeaders()
  });
  return response.blob();
}

// Lesson Plans APIs
export async function fetchLessonPlans(params?: { class_id?: number; week?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.class_id) queryParams.append('class_id', params.class_id.toString());
  if (params?.week) queryParams.append('week', params.week);

  const response = await fetch(`${API_BASE}/teacher-comprehensive/lesson-plans?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createLessonPlan(lessonPlanData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/lesson-plans`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(lessonPlanData)
  });
  return response.json();
}

export async function updateLessonPlan(planId: number, lessonPlanData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/lesson-plans/${planId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(lessonPlanData)
  });
  return response.json();
}

export async function deleteLessonPlan(planId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/lesson-plans/${planId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Messages & Communication APIs
export async function fetchTeacherMessages(params?: { folder?: string; type?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.folder) queryParams.append('folder', params.folder);
  if (params?.type) queryParams.append('type', params.type);

  const response = await fetch(`${API_BASE}/teacher-comprehensive/messages?${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function sendTeacherMessage(messageData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(messageData)
  });
  return response.json();
}

export async function sendBulkMessages(recipientIds: number[], messageData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/messages/bulk`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ recipients: recipientIds, ...messageData })
  });
  return response.json();
}

// Reports APIs
export async function generateReport(reportType: string, params: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/reports/${reportType}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params)
  });
  return response.json();
}

export async function fetchReportTemplates() {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/reports/templates`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function downloadReport(reportId: number, format: string = 'pdf') {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/reports/${reportId}/download?format=${format}`, {
    headers: getAuthHeaders()
  });
  return response.blob();
}

export async function fetchAcademicReport(studentId: number, term: string) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/reports/academic?student_id=${studentId}&term=${term}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchAttendanceReport(classId: number, dateRange: string) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/reports/attendance?class_id=${classId}&range=${dateRange}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchConductReport(classId: number, term: string) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/reports/conduct?class_id=${classId}&term=${term}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Calendar & Schedule APIs
export async function fetchTeacherSchedule(weekStart?: string) {
  const queryParams = weekStart ? `?week_start=${weekStart}` : '';
  const response = await fetch(`${API_BASE}/teacher-comprehensive/schedule${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function fetchUpcomingEvents(days: number = 7) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/events?days=${days}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Notifications APIs
export async function fetchTeacherNotifications() {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/notifications`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function markNotificationRead(notificationId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function markAllNotificationsRead() {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/notifications/read-all`, {
    method: 'PUT',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Announcements APIs
export async function fetchAnnouncements() {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/announcements`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function createAnnouncement(announcementData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/announcements`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(announcementData)
  });
  return response.json();
}

export async function updateAnnouncement(announcementId: number, announcementData: any) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/announcements/${announcementId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(announcementData)
  });
  return response.json();
}

export async function deleteAnnouncement(announcementId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/announcements/${announcementId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

// Resources APIs
export async function fetchResources(category?: string) {
  const queryParams = category ? `?category=${category}` : '';
  const response = await fetch(`${API_BASE}/teacher-comprehensive/resources${queryParams}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function uploadResource(resourceData: FormData) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/teacher-comprehensive/resources`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: resourceData
  });
  return response.json();
}

export async function deleteResource(resourceId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/resources/${resourceId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response.json();
}

export async function downloadResource(resourceId: number) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/resources/${resourceId}/download`, {
    headers: getAuthHeaders()
  });
  return response.blob();
}

// Export functions
export async function exportStudents(classId: number, format: string = 'excel') {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/export/students?class_id=${classId}&format=${format}`, {
    headers: getAuthHeaders()
  });
  return response.blob();
}

export async function exportAttendance(classId: number, dateRange: string, format: string = 'excel') {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/export/attendance?class_id=${classId}&range=${dateRange}&format=${format}`, {
    headers: getAuthHeaders()
  });
  return response.blob();
}

export async function exportGradesBySubject(classId: number, subject: string, format: string = 'excel') {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/export/grades?class_id=${classId}&subject=${subject}&format=${format}`, {
    headers: getAuthHeaders()
  });
  return response.blob();
}

// Student Search
export async function searchStudents(query: string) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/search/students?q=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

// Class Search
export async function searchClasses(query: string) {
  const response = await fetch(`${API_BASE}/teacher-comprehensive/search/classes?q=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders()
  });
  return response.json();
}

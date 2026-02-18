import { apiService } from './apiService';

// ============================================
// COMPREHENSIVE PARENT LINKING API SERVICE
// Advanced API Integration for Parent Linking & Messaging
// ============================================

const API_BASE = '/api/parent-linking';

// Types
export interface ParentLink {
  id: number;
  parent_id: number;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  student_id: number;
  student_name: string;
  student_reg_number: string;
  relationship: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  linked_by: number;
  linked_at: string;
  approved_at?: string;
}

export interface ParentLinkRequest {
  id: number;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  student_id: number;
  student_name: string;
  student_reg_number: string;
  relationship: string;
  status: 'pending' | 'approved' | 'rejected';
  request_date: string;
  processed_by?: number;
  processed_at?: string;
  rejection_reason?: string;
}

export interface ParentMessage {
  id: number;
  parent_id: number;
  parent_name: string;
  parent_phone: string;
  title: string;
  message: string;
  type: 'reminder' | 'notification' | 'alert' | 'info' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  sent_by: number;
  sent_by_name: string;
  sent_at: string;
  read_at?: string;
}

export interface ParentNotification {
  id: number;
  parent_id: number;
  title: string;
  message: string;
  type: 'payment' | 'attendance' | 'academic' | 'discipline' | 'general';
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface ParentAccount {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: number;
  national_id?: string;
  address?: string;
  occupation?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface ParentDashboardStats {
  total_parents: number;
  pending_requests: number;
  approved_links: number;
  total_messages_sent: number;
  unread_notifications: number;
  active_parents: number;
}

export interface LinkingAnalytics {
  total_links: number;
  by_status: { status: string; count: number }[];
  by_relationship: { relationship: string; count: number }[];
  monthly_trends: { month: string; links: number }[];
  top_trades: { trade: string; links: number }[];
}

export interface AuditLog {
  id: number;
  action: string;
  performed_by: number;
  performed_by_name: string;
  parent_id?: number;
  student_id?: number;
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface LinkingConflict {
  id: number;
  student_id: number;
  student_name: string;
  existing_parent_id: number;
  existing_parent_name: string;
  new_parent_id: number;
  new_parent_name: string;
  conflict_type: 'duplicate_student' | 'max_links_exceeded' | 'invalid_relationship';
  status: 'pending' | 'resolved' | 'ignored';
  created_at: string;
}

// ============================================
// PARENT LINKING API FUNCTIONS
// ============================================

// Get all parent links
export const getAllParentLinks = async (params?: { status?: string; search?: string }): Promise<ParentLink[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    
    const endpoint = `/links${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.links || response || [];
  } catch (error) {
    console.error('Error fetching parent links:', error);
    return [];
  }
};

// Get parent link by ID
export const getParentLinkById = async (id: number): Promise<ParentLink | null> => {
  try {
    const response = await apiService.request(`/links/${id}`);
    return response.link || null;
  } catch (error) {
    console.error('Error fetching parent link:', error);
    return null;
  }
};

// Create parent link request
export const createParentLinkRequest = async (data: {
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  student_id: number;
  relationship: string;
}): Promise<ParentLinkRequest | null> => {
  try {
    const response = await apiService.request('/request-linking', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.request || response;
  } catch (error) {
    console.error('Error creating parent link request:', error);
    return null;
  }
};

// Approve parent link
export const approveParentLink = async (requestId: number, approvedBy: number): Promise<boolean> => {
  try {
    await apiService.request(`/approve/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ approved_by: approvedBy })
    });
    return true;
  } catch (error) {
    console.error('Error approving parent link:', error);
    return false;
  }
};

// Reject parent link
export const rejectParentLink = async (requestId: number, reason: string, rejectedBy: number): Promise<boolean> => {
  try {
    await apiService.request(`/reject/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ reason, rejected_by: rejectedBy })
    });
    return true;
  } catch (error) {
    console.error('Error rejecting parent link:', error);
    return false;
  }
};

// Revoke parent link
export const revokeParentLink = async (linkId: number): Promise<boolean> => {
  try {
    await apiService.request(`/revoke/${linkId}`, {
      method: 'POST'
    });
    return true;
  } catch (error) {
    console.error('Error revoking parent link:', error);
    return false;
  }
};

// Grant access to parent
export const grantParentAccess = async (linkId: number): Promise<boolean> => {
  try {
    await apiService.request(`/grant-access`, {
      method: 'POST',
      body: JSON.stringify({ link_id: linkId })
    });
    return true;
  } catch (error) {
    console.error('Error granting parent access:', error);
    return false;
  }
};

// ============================================
// PARENT MESSAGING API FUNCTIONS
// ============================================

// Get all messages
export const getAllMessages = async (params?: { parent_id?: number; type?: string }): Promise<ParentMessage[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.parent_id) queryParams.append('parent_id', params.parent_id.toString());
    if (params?.type) queryParams.append('type', params.type);
    
    const endpoint = `/messages${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.messages || [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Send message to parent
export const sendMessage = async (data: {
  parent_id: number;
  title: string;
  message: string;
  type: 'reminder' | 'notification' | 'alert' | 'info' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}): Promise<ParentMessage | null> => {
  try {
    const response = await apiService.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.message || null;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Send bulk messages
export const sendBulkMessages = async (data: {
  parent_ids: number[];
  title: string;
  message: string;
  type: 'reminder' | 'notification' | 'alert' | 'info' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}): Promise<{ sent: number; failed: number }> => {
  try {
    const response = await apiService.request('/messages/bulk', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return { sent: response.sent || 0, failed: response.failed || 0 };
  } catch (error) {
    console.error('Error sending bulk messages:', error);
    return { sent: 0, failed: data.parent_ids.length };
  }
};

// Send reminder to parent
export const sendReminder = async (parentId: number, reminderType: string, message: string): Promise<boolean> => {
  try {
    await apiService.request('/reminders', {
      method: 'POST',
      body: JSON.stringify({
        parent_id: parentId,
        reminder_type: reminderType,
        message: message
      })
    });
    return true;
  } catch (error) {
    console.error('Error sending reminder:', error);
    return false;
  }
};

// Send payment reminder
export const sendPaymentReminder = async (parentId: number, studentName: string, amountDue: number): Promise<boolean> => {
  return sendReminder(parentId, 'payment', `Payment reminder for ${studentName}. Amount due: ${amountDue}`);
};

// Send attendance reminder
export const sendAttendanceReminder = async (parentId: number, studentName: string, absentDays: number): Promise<boolean> => {
  return sendReminder(parentId, 'attendance', `Attendance alert for ${studentName}. Absent ${absentDays} days this month.`);
};

// Send homework reminder
export const sendHomeworkReminder = async (parentId: number, studentName: string, dueDate: string): Promise<boolean> => {
  return sendReminder(parentId, 'homework', `Homework reminder for ${studentName}. Due: ${dueDate}`);
};

// ============================================
// PARENT NOTIFICATIONS API FUNCTIONS
// ============================================

// Get all notifications
export const getAllNotifications = async (parentId?: number): Promise<ParentNotification[]> => {
  try {
    const endpoint = parentId ? `/notifications/${parentId}` : '/notifications';
    const response = await apiService.request(endpoint);
    return response.notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number): Promise<boolean> => {
  try {
    await apiService.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (parentId: number): Promise<boolean> => {
  try {
    await apiService.request(`/notifications/${parentId}/read-all`, {
      method: 'PUT'
    });
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// ============================================
// PARENT ACCOUNT API FUNCTIONS
// ============================================

// Get all parent accounts
export const getAllParentAccounts = async (params?: { search?: string; is_active?: boolean }): Promise<ParentAccount[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    
    const endpoint = `/accounts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.accounts || [];
  } catch (error) {
    console.error('Error fetching parent accounts:', error);
    return [];
  }
};

// Get parent account by ID
export const getParentAccountById = async (id: number): Promise<ParentAccount | null> => {
  try {
    const response = await apiService.request(`/accounts/${id}`);
    return response.account || null;
  } catch (error) {
    console.error('Error fetching parent account:', error);
    return null;
  }
};

// Update parent account
export const updateParentAccount = async (id: number, data: Partial<ParentAccount>): Promise<ParentAccount | null> => {
  try {
    const response = await apiService.request(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.account || null;
  } catch (error) {
    console.error('Error updating parent account:', error);
    return null;
  }
};

// Activate parent account
export const activateParentAccount = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`/accounts/${id}/activate`, {
      method: 'POST'
    });
    return true;
  } catch (error) {
    console.error('Error activating parent account:', error);
    return false;
  }
};

// Deactivate parent account
export const deactivateParentAccount = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`/accounts/${id}/deactivate`, {
      method: 'POST'
    });
    return true;
  } catch (error) {
    console.error('Error deactivating parent account:', error);
    return false;
  }
};

// ============================================
// DASHBOARD & ANALYTICS API FUNCTIONS
// ============================================

// Get dashboard statistics
export const getDashboardStats = async (): Promise<ParentDashboardStats> => {
  try {
    const response = await apiService.request('/dashboard-stats');
    return response.stats || {
      total_parents: 0,
      pending_requests: 0,
      approved_links: 0,
      total_messages_sent: 0,
      unread_notifications: 0,
      active_parents: 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      total_parents: 0,
      pending_requests: 0,
      approved_links: 0,
      total_messages_sent: 0,
      unread_notifications: 0,
      active_parents: 0
    };
  }
};

// Get linking analytics
export const getLinkingAnalytics = async (): Promise<LinkingAnalytics> => {
  try {
    const response = await apiService.request('/analytics');
    return response.analytics || {
      total_links: 0,
      by_status: [],
      by_relationship: [],
      monthly_trends: [],
      top_trades: []
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      total_links: 0,
      by_status: [],
      by_relationship: [],
      monthly_trends: [],
      top_trades: []
    };
  }
};

// ============================================
// AUDIT & CONFLICTS API FUNCTIONS
// ============================================

// Get audit log
export const getAuditLog = async (params?: { page?: number; limit?: number }): Promise<AuditLog[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const endpoint = `/audit-log${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.logs || [];
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return [];
  }
};

// Get linking conflicts
export const getLinkingConflicts = async (): Promise<LinkingConflict[]> => {
  try {
    const response = await apiService.request('/conflicts');
    return response.conflicts || [];
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    return [];
  }
};

// Resolve conflict
export const resolveConflict = async (conflictId: number, resolution: 'keep_existing' | 'keep_new' | 'ignore'): Promise<boolean> => {
  try {
    await apiService.request(`/conflicts/${conflictId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution })
    });
    return true;
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return false;
  }
};

// ============================================
// STUDENT-PARENT MAPPING
// ============================================

// Get students for a parent
export const getParentStudents = async (parentId: number): Promise<any[]> => {
  try {
    const response = await apiService.request(`/parent/${parentId}/students`);
    return response.students || [];
  } catch (error) {
    console.error('Error fetching parent students:', error);
    return [];
  }
};

// Get parents for a student
export const getStudentParents = async (studentId: number): Promise<ParentLink[]> => {
  try {
    const response = await apiService.request(`/student/${studentId}/parents`);
    return response.parents || [];
  } catch (error) {
    console.error('Error fetching student parents:', error);
    return [];
  }
};

// ============================================
// COMBINED API OBJECT
// ============================================

export const parentLinkingApi = {
  // Parent Links
  getAllParentLinks,
  getParentLinkById,
  createParentLinkRequest,
  approveParentLink,
  rejectParentLink,
  revokeParentLink,
  grantParentAccess,

  // Messaging
  getAllMessages,
  sendMessage,
  sendBulkMessages,
  sendReminder,
  sendPaymentReminder,
  sendAttendanceReminder,
  sendHomeworkReminder,

  // Notifications
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,

  // Accounts
  getAllParentAccounts,
  getParentAccountById,
  updateParentAccount,
  activateParentAccount,
  deactivateParentAccount,

  // Dashboard & Analytics
  getDashboardStats,
  getLinkingAnalytics,

  // Audit & Conflicts
  getAuditLog,
  getLinkingConflicts,
  resolveConflict,

  // Student-Parent Mapping
  getParentStudents,
  getStudentParents
};

export default parentLinkingApi;

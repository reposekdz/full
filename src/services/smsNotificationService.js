// SMS Notification Service - Frontend API Integration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class SMSNotificationService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token || localStorage.getItem('token')}`
    };
  }

  // Parent Registration & Linking SMS - Enhanced
  async sendWelcomeSMS(parentId) {
    try {
      const response = await fetch(`${API_BASE_URL}/parent-child-linking/welcome-sms`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ parentId })
      });
      const result = await response.json();
      if (result.success) {
        this.showSMSNotification('Welcome SMS sent to parent', 'success');
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendLinkApprovalSMS(parentId, studentId, applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/parent-child-linking/link-approval-sms`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ parentId, studentId, applicationId })
      });
      const result = await response.json();
      if (result.success) {
        this.showSMSNotification('Link approval SMS sent to parent', 'success');
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendParentRegistrationSMS(parentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/parent-registration`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(parentData)
      });
      const result = await response.json();
      if (result.success) {
        this.showSMSNotification('Registration confirmation SMS sent', 'success');
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Student Activity SMS - Auto-notify all linked parents
  async sendConductRemovalSMS(studentId, conductData) {
    try {
      const response = await fetch(`${API_BASE_URL}/dod-complete/conduct/remove`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          student_id: studentId, 
          conduct_type: conductData.type,
          severity: conductData.severity,
          description: conductData.description,
          conduct_points_deducted: conductData.pointsDeducted,
          new_conduct_score: conductData.newScore,
          removed_by_name: conductData.removedBy,
          notify_all_parents: true
        })
      });
      const result = await response.json();
      if (result.success) {
        this.showSMSNotification(`Conduct SMS sent to ${result.parentsNotified || 0} parent(s)`, 'success');
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendLeaveApprovalSMS(studentId, leaveData) {
    try {
      const response = await fetch(`${API_BASE_URL}/dod-complete/leave/grant`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          student_id: studentId,
          leave_type: leaveData.type,
          reason: leaveData.reason,
          start_time: leaveData.startTime,
          end_time: leaveData.endTime,
          approved_by_name: leaveData.approvedBy,
          notify_all_parents: true
        })
      });
      const result = await response.json();
      if (result.success) {
        this.showSMSNotification(`Leave SMS sent to ${result.parentsNotified || 0} parent(s)`, 'success');
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendAttendanceAlertSMS(studentId, attendanceData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/attendance-alert`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          studentId, 
          ...attendanceData,
          notify_all_parents: true
        })
      });
      const result = await response.json();
      if (result.success) {
        this.showSMSNotification(`Attendance SMS sent to ${result.parentsNotified || 0} parent(s)`, 'success');
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendGradeUpdateSMS(studentId, gradeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/grade-update`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          studentId, 
          ...gradeData,
          notify_all_parents: true
        })
      });
      const result = await response.json();
      if (result.success) {
        this.showSMSNotification(`Grade SMS sent to ${result.parentsNotified || 0} parent(s)`, 'success');
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendFeeReminderSMS(studentId, feeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/fee-reminder`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          studentId, 
          ...feeData,
          notify_all_parents: true
        })
      });
      const result = await response.json();
      if (result.success) {
        this.showSMSNotification(`Fee SMS sent to ${result.parentsNotified || 0} parent(s)`, 'success');
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Bulk messaging
  async sendBulkSMS(studentIds, message, title) {
    try {
      const response = await fetch(`${API_BASE_URL}/dod-complete/message-parents`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          student_ids: studentIds,
          subject: title,
          message: message,
          send_via: 'sms'
        })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Event-based SMS sending
  async sendEventSMS(eventData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/event-notification`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendEmergencySMS(emergencyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/emergency-alert`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(emergencyData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendCustomSMS(recipients, message, title, priority = 'normal') {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/custom-send`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ recipients, message, title, priority })
      });
      return await response.json();
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // SMS Statistics
  async getSMSStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/stats`, {
        headers: this.getHeaders()
      });
      const data = await response.json();
      return { success: true, stats: data };
    } catch (error) {
      return { success: false, error: error.message, stats: {
        total_notifications: 0,
        sent: 0,
        failed: 0,
        unique_parents: 0
      }};
    }
  }

  async getSMSHistory(options = { limit: 20 }) {
    try {
      const response = await fetch(`${API_BASE_URL}/sms/history?limit=${options.limit}`, {
        headers: this.getHeaders()
      });
      const data = await response.json();
      return { success: true, history: data };
    } catch (error) {
      return { success: false, error: error.message, history: [] };
    }
  }

  // Utility methods
  showSMSNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `sms-toast sms-toast-${type}`;
    toast.innerHTML = `
      <div class="sms-toast-content">
        <span class="sms-toast-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="sms-toast-message">${message}</span>
      </div>
    `;
    
    // Add styles
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  async handleSMSResponse(response, successMessage) {
    if (response.success) {
      this.showSMSNotification(
        `${successMessage} - ${response.parentsNotified || response.count || 1} parent(s) notified`,
        'success'
      );
      return true;
    } else {
      this.showSMSNotification(`SMS Failed: ${response.message || response.error}`, 'error');
      return false;
    }
  }
}

// Create global instance
window.smsService = new SMSNotificationService();

export default SMSNotificationService;
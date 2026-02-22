// SMS Integration Utility - Production-ready SMS system for school events
import SMSNotificationService from '../services/smsNotificationService';

class SMSIntegration {
  constructor() {
    this.smsService = new SMSNotificationService();
    this.API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  // Event-based SMS sending methods with real API integration
  async sendEventNotification(eventType, eventData, recipients = 'all') {
    const templates = {
      'school_event': {
        title: 'School Event Notification',
        message: `Mwiriwe! Hari ibirori by'ishuri bizaba ku wa {date} saa {time}. Ingingo: {description}. Murakoze.`
      },
      'exam_schedule': {
        title: 'Exam Schedule',
        message: `Mwiriwe! Ibizamini bizatangira ku wa {date} saa {time}. Umwana wanyu {studentName} azakora {subject}. Murakoze.`
      },
      'holiday_notice': {
        title: 'Holiday Notice',
        message: `Mwiriwe! Ishuri rizafunga ku wa {startDate} kugeza ku wa {endDate} kubera {reason}. Murakoze.`
      },
      'meeting_notice': {
        title: 'Parent Meeting',
        message: `Mwiriwe! Hari inama y'ababyeyi izaba ku wa {date} saa {time} ku {location}. Murakoze.`
      },
      'fee_deadline': {
        title: 'Fee Payment Deadline',
        message: `Mwiriwe! Mwibuke ko amafaranga y'ishuri agomba kwishyurwa mbere ya {deadline}. Asigaye: {amount} RWF. Murakoze.`
      },
      'emergency': {
        title: 'Emergency Alert',
        message: `BYIHUTIRWA! {message}. Mwongere muhamagare ishuri kuri +250788123456. Murakoze.`
      },
      'achievement': {
        title: 'Student Achievement',
        message: `Mwiriwe! Umwana wanyu {studentName} yageze ku ntego nziza mu {subject}: {achievement}. Murakoze.`
      },
      'disciplinary': {
        title: 'Disciplinary Notice',
        message: `Mwiriwe! Umwana wanyu {studentName} yakiriye igihano kubera {reason}. Amanota: {newScore}/40. Murakoze.`
      },
      'attendance': {
        title: 'Attendance Alert',
        message: `Mwiriwe! Umwana wanyu {studentName} ntiyaje ku ishuri uyu munsi ({date}). Impamvu: {reason}. Murakoze.`
      },
      'transport': {
        title: 'Transport Notice',
        message: `Mwiriwe! Ubwikorezi bw'ubusabane buzahinduka ku wa {date}. Amakuru: {details}. Murakoze.`
      }
    };

    const template = templates[eventType];
    if (!template) {
      console.error(`Unknown event type: ${eventType}`);
      return { success: false, error: 'Unknown event type' };
    }

    // Replace placeholders with actual data
    let message = template.message;
    Object.keys(eventData).forEach(key => {
      message = message.replace(`{${key}}`, eventData[key]);
    });

    try {
      const result = await fetch(`${this.API_BASE_URL}/sms/event-notification`, {
        method: 'POST',
        headers: this.smsService.getHeaders(),
        body: JSON.stringify({
          eventType,
          title: template.title,
          message,
          recipients,
          priority: eventType === 'emergency' ? 'urgent' : 'normal',
          ...eventData
        })
      });

      const response = await result.json();

      if (response.success) {
        this.smsService.showSMSNotification(
          `${template.title} sent to ${response.parentsNotified || 'all'} parents`,
          'success'
        );
      } else {
        this.smsService.showSMSNotification(
          `Failed to send ${template.title}: ${response.error}`,
          'error'
        );
      }

      return response;
    } catch (error) {
      console.error('SMS Integration Error:', error);
      this.smsService.showSMSNotification(
        `SMS Integration Error: ${error.message}`,
        'error'
      );
      return { success: false, error: error.message };
    }
  }

  // Quick methods for common events
  async notifySchoolEvent(eventName, date, time, description) {
    return this.sendEventNotification('school_event', {
      eventName,
      date,
      time,
      description
    });
  }

  async notifyExamSchedule(studentName, subject, date, time) {
    return this.sendEventNotification('exam_schedule', {
      studentName,
      subject,
      date,
      time
    });
  }

  async notifyHoliday(startDate, endDate, reason) {
    return this.sendEventNotification('holiday_notice', {
      startDate,
      endDate,
      reason
    });
  }

  async notifyParentMeeting(date, time, location, agenda) {
    return this.sendEventNotification('meeting_notice', {
      date,
      time,
      location,
      agenda
    });
  }

  async notifyFeeDeadline(deadline, amount) {
    return this.sendEventNotification('fee_deadline', {
      deadline,
      amount
    });
  }

  async sendEmergencyAlert(message) {
    return this.sendEventNotification('emergency', {
      message
    });
  }

  async notifyAchievement(studentName, subject, achievement) {
    return this.sendEventNotification('achievement', {
      studentName,
      subject,
      achievement
    });
  }

  async notifyDisciplinary(studentName, reason, newScore) {
    return this.sendEventNotification('disciplinary', {
      studentName,
      reason,
      newScore
    });
  }

  async notifyAttendance(studentName, date, reason) {
    return this.sendEventNotification('attendance', {
      studentName,
      date,
      reason
    });
  }

  async notifyTransport(date, details) {
    return this.sendEventNotification('transport', {
      date,
      details
    });
  }

  // Bulk messaging with custom content - Production ready
  async sendCustomBulkSMS(recipients, title, message, priority = 'normal') {
    try {
      const response = await fetch(`${this.API_BASE_URL}/sms/custom-send`, {
        method: 'POST',
        headers: this.smsService.getHeaders(),
        body: JSON.stringify({ recipients, message, title, priority })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.smsService.showSMSNotification(
          `Custom SMS sent to ${result.parentsNotified || recipients.length} recipients`,
          'success'
        );
      } else {
        this.smsService.showSMSNotification(
          `Failed to send SMS: ${result.error}`,
          'error'
        );
      }

      return result;
    } catch (error) {
      console.error('Custom SMS Error:', error);
      this.smsService.showSMSNotification(
        `SMS Error: ${error.message}`,
        'error'
      );
      return { success: false, error: error.message };
    }
  }

  // Integration with existing systems - Enhanced for all linked parents
  async integrateWithConductSystem(studentId, conductData) {
    const result = await this.smsService.sendConductRemovalSMS(studentId, conductData);
    // Also trigger notification hooks for all linked parents
    if (window.parentNotificationHooks) {
      await window.parentNotificationHooks.triggerConductRemoval(studentId, {
        studentName: `${conductData.firstName || ''} ${conductData.lastName || ''}`,
        reason: conductData.description,
        newScore: conductData.newScore
      });
    }
    return result;
  }

  async integrateWithLeaveSystem(studentId, leaveData) {
    const result = await this.smsService.sendLeaveApprovalSMS(studentId, leaveData);
    // Also trigger notification hooks for all linked parents
    if (window.parentNotificationHooks) {
      await window.parentNotificationHooks.triggerLeaveApproval(studentId, {
        studentName: `${leaveData.firstName || ''} ${leaveData.lastName || ''}`,
        startTime: leaveData.startTime,
        endTime: leaveData.endTime
      });
    }
    return result;
  }

  async integrateWithGradeSystem(studentId, gradeData) {
    const result = await this.smsService.sendGradeUpdateSMS(studentId, gradeData);
    // Also trigger notification hooks for all linked parents
    if (window.parentNotificationHooks) {
      await window.parentNotificationHooks.triggerGradeUpdate(studentId, {
        studentName: `${gradeData.firstName || ''} ${gradeData.lastName || ''}`,
        subject: gradeData.subject,
        score: gradeData.score
      });
    }
    return result;
  }

  async integrateWithFeeSystem(studentId, feeData) {
    const result = await this.smsService.sendFeeReminderSMS(studentId, feeData);
    // Also trigger notification hooks for all linked parents
    if (window.parentNotificationHooks) {
      await window.parentNotificationHooks.triggerFeeReminder(studentId, {
        studentName: `${feeData.firstName || ''} ${feeData.lastName || ''}`,
        amount: feeData.amount,
        dueDate: feeData.dueDate
      });
    }
    return result;
  }

  async integrateWithAttendanceSystem(studentId, attendanceData) {
    const result = await this.smsService.sendAttendanceAlertSMS(studentId, attendanceData);
    // Also trigger notification hooks for all linked parents
    if (window.parentNotificationHooks) {
      await window.parentNotificationHooks.triggerAttendanceAlert(studentId, {
        studentName: `${attendanceData.firstName || ''} ${attendanceData.lastName || ''}`,
        reason: attendanceData.reason,
        date: attendanceData.date
      });
    }
    return result;
  }
}

// Create global instance for easy access
const smsIntegration = new SMSIntegration();

// Export both class and instance
export { SMSIntegration };
export default smsIntegration;

// Usage Examples:
/*
// 1. School Event Notification
await smsIntegration.notifySchoolEvent(
  'Sports Day',
  '2024-03-15',
  '09:00',
  'Annual sports competition for all students'
);

// 2. Emergency Alert
await smsIntegration.sendEmergencyAlert(
  'School closed due to weather conditions. All students should stay home.'
);

// 3. Parent Meeting
await smsIntegration.notifyParentMeeting(
  '2024-03-20',
  '14:00',
  'School Hall',
  'Discuss academic progress and upcoming events'
);

// 4. Custom Bulk SMS
await smsIntegration.sendCustomBulkSMS(
  ['parent1@example.com', 'parent2@example.com'],
  'Important Notice',
  'Custom message content here',
  'high'
);

// 5. Integration with existing systems
await smsIntegration.integrateWithConductSystem(515, {
  type: 'Disrespect',
  severity: 'moderate',
  description: 'Talking during class',
  pointsDeducted: 2,
  newScore: 38,
  removedBy: 'DOD'
});
*/
// Automatic Parent Notification System
import smsIntegration from './smsIntegration';

class ParentNotificationHooks {
  constructor() {
    this.API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  // Hook into parent registration
  async onParentRegistration(parentData) {
    try {
      // Send welcome SMS immediately after registration
      await fetch(`${this.API_BASE_URL}/sms/parent-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          parentId: parentData.id,
          parentName: parentData.name,
          phone: parentData.phone,
          message: `Mwiriwe ${parentData.name}! Mwakiriwe muri Garden TVET School. Mwiyandikishije neza. Murakoze!`
        })
      });
    } catch (error) {
      console.error('Parent registration SMS failed:', error);
    }
  }

  // Hook into parent-child linking
  async onParentChildLinked(linkData) {
    try {
      // Send linking confirmation SMS
      await fetch(`${this.API_BASE_URL}/sms/link-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          parentId: linkData.parentId,
          studentId: linkData.studentId,
          studentName: linkData.studentName,
          message: `Mwiriwe! Mwahujwe neza n'umwana wanyu ${linkData.studentName}. Muzabona amakuru ye yose. Murakoze!`
        })
      });
    } catch (error) {
      console.error('Parent linking SMS failed:', error);
    }
  }

  // Hook into all student events
  async onStudentEvent(eventType, studentId, eventData) {
    try {
      // Get all linked parents for this student
      const parentsResponse = await fetch(`${this.API_BASE_URL}/students/${studentId}/linked-parents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!parentsResponse.ok) return;
      
      const linkedParents = await parentsResponse.json();
      
      // Send SMS to all linked parents
      for (const parent of linkedParents) {
        await this.sendEventSMSToParent(parent, eventType, eventData);
      }
    } catch (error) {
      console.error('Student event SMS failed:', error);
    }
  }

  async sendEventSMSToParent(parent, eventType, eventData) {
    const messages = {
      conduct_removed: `Mwiriwe ${parent.name}! Umwana wanyu ${eventData.studentName} yakiriye igihano kubera ${eventData.reason}. Amanota: ${eventData.newScore}/40. Murakoze.`,
      leave_approved: `Mwiriwe ${parent.name}! Umwana wanyu ${eventData.studentName} yemerewe gusohoka kuva ${eventData.startTime} kugeza ${eventData.endTime}. Murakoze.`,
      grade_updated: `Mwiriwe ${parent.name}! Umwana wanyu ${eventData.studentName} yageze ku manota ${eventData.score}% mu ${eventData.subject}. Murakoze.`,
      attendance_alert: `Mwiriwe ${parent.name}! Umwana wanyu ${eventData.studentName} ntiyaje ku ishuri uyu munsi. Impamvu: ${eventData.reason}. Murakoze.`,
      fee_reminder: `Mwiriwe ${parent.name}! Mwibuke ko amafaranga y'ishuri ${eventData.amount} RWF agomba kwishyurwa mbere ya ${eventData.dueDate}. Murakoze.`,
      exam_result: `Mwiriwe ${parent.name}! Umwana wanyu ${eventData.studentName} yageze ku manota ${eventData.score}% mu bizamini bya ${eventData.subject}. Murakoze.`,
      school_event: `Mwiriwe ${parent.name}! Hari ibirori by'ishuri bizaba ku wa ${eventData.date}. Umwana wanyu ${eventData.studentName} agomba kwitabira. Murakoze.`
    };

    const message = messages[eventType] || `Mwiriwe ${parent.name}! Hari amakuru mashya ajyanye n'umwana wanyu ${eventData.studentName}. Murakoze.`;

    try {
      await fetch(`${this.API_BASE_URL}/sms/send-to-parent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          parentId: parent.id,
          phone: parent.phone,
          message: message,
          eventType: eventType,
          studentId: eventData.studentId
        })
      });
    } catch (error) {
      console.error(`Failed to send ${eventType} SMS to parent ${parent.id}:`, error);
    }
  }

  // Auto-trigger methods for integration
  async triggerConductRemoval(studentId, conductData) {
    await this.onStudentEvent('conduct_removed', studentId, {
      studentId,
      studentName: conductData.studentName,
      reason: conductData.reason,
      newScore: conductData.newScore
    });
  }

  async triggerLeaveApproval(studentId, leaveData) {
    await this.onStudentEvent('leave_approved', studentId, {
      studentId,
      studentName: leaveData.studentName,
      startTime: leaveData.startTime,
      endTime: leaveData.endTime
    });
  }

  async triggerGradeUpdate(studentId, gradeData) {
    await this.onStudentEvent('grade_updated', studentId, {
      studentId,
      studentName: gradeData.studentName,
      subject: gradeData.subject,
      score: gradeData.score
    });
  }

  async triggerAttendanceAlert(studentId, attendanceData) {
    await this.onStudentEvent('attendance_alert', studentId, {
      studentId,
      studentName: attendanceData.studentName,
      reason: attendanceData.reason,
      date: attendanceData.date
    });
  }

  async triggerFeeReminder(studentId, feeData) {
    await this.onStudentEvent('fee_reminder', studentId, {
      studentId,
      studentName: feeData.studentName,
      amount: feeData.amount,
      dueDate: feeData.dueDate
    });
  }

  async triggerSchoolEvent(eventData) {
    // Send to all students and their parents
    try {
      const studentsResponse = await fetch(`${this.API_BASE_URL}/students/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (studentsResponse.ok) {
        const students = await studentsResponse.json();
        
        for (const student of students) {
          await this.onStudentEvent('school_event', student.id, {
            studentId: student.id,
            studentName: `${student.first_name} ${student.last_name}`,
            date: eventData.date,
            eventName: eventData.eventName
          });
        }
      }
    } catch (error) {
      console.error('School event SMS failed:', error);
    }
  }
}

// Create global instance
const parentNotificationHooks = new ParentNotificationHooks();

// Export for use in other components
export default parentNotificationHooks;

// Auto-integration with existing systems
window.parentNotificationHooks = parentNotificationHooks;
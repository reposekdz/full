import { smsService } from '@/app/services/advancedSMSService';
import apiService from '@/app/services/apiService';

interface SMSIntegrationConfig {
  auto_send: boolean;
  real_time_tracking: boolean;
  delivery_confirmation: boolean;
  read_receipts: boolean;
  retry_failed: boolean;
  cost_optimization: boolean;
}

class SMSIntegrationHooks {
  private config: SMSIntegrationConfig = {
    auto_send: true,
    real_time_tracking: true,
    delivery_confirmation: true,
    read_receipts: true,
    retry_failed: true,
    cost_optimization: true
  };

  // Parent registration SMS with advanced features
  async onParentRegistration(parentData: any): Promise<void> {
    try {
      const message = await this.generateWelcomeMessage(parentData);
      
      await smsService.sendMessage({
        recipients: parentData.phone,
        message: message.content,
        message_type: 'automated',
        priority: 'high',
        category: 'registration',
        tags: ['welcome', 'parent', 'registration'],
        template_variables: {
          parent_name: parentData.name,
          school_name: 'Garden TVET School',
          portal_url: process.env.REACT_APP_PORTAL_URL
        },
        delivery_tracking: true,
        read_receipts: true
      });

      // Log registration event
      await this.logSMSEvent('parent_registration', parentData.id, message.id);
    } catch (error) {
      console.error('Parent registration SMS failed:', error);
    }
  }

  // Child linking SMS with real-time updates
  async onChildLinked(linkingData: any): Promise<void> {
    try {
      const message = await this.generateLinkingMessage(linkingData);
      
      await smsService.sendMessage({
        recipients: linkingData.parent_phone,
        message: message.content,
        message_type: 'automated',
        priority: 'high',
        category: 'linking',
        tags: ['child_linked', 'parent', 'confirmation'],
        template_variables: {
          parent_name: linkingData.parent_name,
          child_name: linkingData.child_name,
          student_code: linkingData.student_code,
          trade: linkingData.trade,
          level: linkingData.level
        },
        delivery_tracking: true
      });

      // Send to all linked parents if multiple
      if (linkingData.additional_parents) {
        await this.sendToMultipleParents(linkingData.additional_parents, message);
      }
    } catch (error) {
      console.error('Child linking SMS failed:', error);
    }
  }

  // Conduct removal SMS with detailed information
  async onConductRemoved(conductData: any): Promise<void> {
    try {
      const message = await this.generateConductMessage(conductData);
      const parents = await this.getLinkedParents(conductData.student_id);
      
      for (const parent of parents) {
        await smsService.sendMessage({
          recipients: parent.phone,
          message: message.content,
          message_type: 'automated',
          priority: 'urgent',
          category: 'discipline',
          tags: ['conduct', 'discipline', 'parent_alert'],
          template_variables: {
            parent_name: parent.name,
            child_name: conductData.student_name,
            conduct_score: conductData.new_score,
            reason: conductData.reason,
            removed_by: conductData.removed_by,
            date: new Date().toLocaleDateString()
          },
          delivery_tracking: true,
          read_receipts: true
        });
      }

      // Update conduct analytics
      await this.updateConductAnalytics(conductData);
    } catch (error) {
      console.error('Conduct removal SMS failed:', error);
    }
  }

  // Leave approval SMS with comprehensive details
  async onLeaveApproved(leaveData: any): Promise<void> {
    try {
      const message = await this.generateLeaveMessage(leaveData);
      const parents = await this.getLinkedParents(leaveData.student_id);
      
      for (const parent of parents) {
        await smsService.sendMessage({
          recipients: parent.phone,
          message: message.content,
          message_type: 'automated',
          priority: 'high',
          category: 'leave',
          tags: ['leave_approved', 'parent_notification'],
          template_variables: {
            parent_name: parent.name,
            child_name: leaveData.student_name,
            leave_type: leaveData.leave_type,
            start_date: leaveData.start_date,
            end_date: leaveData.end_date,
            approved_by: leaveData.approved_by,
            reason: leaveData.reason
          },
          delivery_tracking: true
        });
      }
    } catch (error) {
      console.error('Leave approval SMS failed:', error);
    }
  }

  // Payment confirmation SMS with receipt details
  async onPaymentReceived(paymentData: any): Promise<void> {
    try {
      const message = await this.generatePaymentMessage(paymentData);
      const parents = await this.getLinkedParents(paymentData.student_id);
      
      for (const parent of parents) {
        await smsService.sendMessage({
          recipients: parent.phone,
          message: message.content,
          message_type: 'automated',
          priority: 'normal',
          category: 'payment',
          tags: ['payment_received', 'receipt', 'finance'],
          template_variables: {
            parent_name: parent.name,
            child_name: paymentData.student_name,
            amount: paymentData.amount,
            payment_method: paymentData.payment_method,
            reference: paymentData.reference,
            balance: paymentData.remaining_balance,
            receipt_url: paymentData.receipt_url
          },
          delivery_tracking: true
        });
      }

      // Generate and send digital receipt
      await this.sendDigitalReceipt(paymentData);
    } catch (error) {
      console.error('Payment confirmation SMS failed:', error);
    }
  }

  // Grade update SMS with performance analysis
  async onGradeUpdated(gradeData: any): Promise<void> {
    try {
      const message = await this.generateGradeMessage(gradeData);
      const parents = await this.getLinkedParents(gradeData.student_id);
      
      for (const parent of parents) {
        await smsService.sendMessage({
          recipients: parent.phone,
          message: message.content,
          message_type: 'automated',
          priority: 'normal',
          category: 'academic',
          tags: ['grade_update', 'academic_performance'],
          template_variables: {
            parent_name: parent.name,
            child_name: gradeData.student_name,
            subject: gradeData.subject,
            marks: gradeData.marks,
            grade: gradeData.grade,
            term: gradeData.term,
            teacher: gradeData.teacher_name,
            class_average: gradeData.class_average
          },
          delivery_tracking: true
        });
      }
    } catch (error) {
      console.error('Grade update SMS failed:', error);
    }
  }

  // Attendance alert SMS with pattern analysis
  async onAttendanceAlert(attendanceData: any): Promise<void> {
    try {
      const message = await this.generateAttendanceMessage(attendanceData);
      const parents = await this.getLinkedParents(attendanceData.student_id);
      
      for (const parent of parents) {
        await smsService.sendMessage({
          recipients: parent.phone,
          message: message.content,
          message_type: 'automated',
          priority: attendanceData.alert_level === 'critical' ? 'urgent' : 'high',
          category: 'attendance',
          tags: ['attendance_alert', 'absence', 'monitoring'],
          template_variables: {
            parent_name: parent.name,
            child_name: attendanceData.student_name,
            absence_type: attendanceData.absence_type,
            date: attendanceData.date,
            consecutive_days: attendanceData.consecutive_days,
            attendance_percentage: attendanceData.attendance_percentage,
            alert_level: attendanceData.alert_level
          },
          delivery_tracking: true
        });
      }
    } catch (error) {
      console.error('Attendance alert SMS failed:', error);
    }
  }

  // Exam reminder SMS with preparation tips
  async onExamReminder(examData: any): Promise<void> {
    try {
      const message = await this.generateExamReminderMessage(examData);
      const parents = await this.getLinkedParents(examData.student_id);
      
      for (const parent of parents) {
        await smsService.sendMessage({
          recipients: parent.phone,
          message: message.content,
          message_type: 'automated',
          priority: 'normal',
          category: 'exam',
          tags: ['exam_reminder', 'academic', 'preparation'],
          template_variables: {
            parent_name: parent.name,
            child_name: examData.student_name,
            exam_subject: examData.subject,
            exam_date: examData.exam_date,
            exam_time: examData.exam_time,
            venue: examData.venue,
            preparation_tips: examData.preparation_tips
          },
          scheduled_at: examData.reminder_time,
          delivery_tracking: true
        });
      }
    } catch (error) {
      console.error('Exam reminder SMS failed:', error);
    }
  }

  // Emergency alert SMS with immediate delivery
  async onEmergencyAlert(emergencyData: any): Promise<void> {
    try {
      const message = await this.generateEmergencyMessage(emergencyData);
      const parents = await this.getAllParents(); // Send to all parents for emergencies
      
      const bulkMessages = parents.map(parent => ({
        recipients: parent.phone,
        message: message.content,
        message_type: 'broadcast',
        priority: 'urgent',
        category: 'emergency',
        tags: ['emergency', 'alert', 'immediate'],
        template_variables: {
          parent_name: parent.name,
          emergency_type: emergencyData.type,
          description: emergencyData.description,
          action_required: emergencyData.action_required,
          contact_number: emergencyData.emergency_contact,
          timestamp: new Date().toLocaleString()
        },
        delivery_tracking: true,
        bypass_queue: true // Immediate delivery for emergencies
      }));

      await smsService.sendBulkMessages(bulkMessages, {
        priority_queue: true,
        immediate_delivery: true
      });
    } catch (error) {
      console.error('Emergency alert SMS failed:', error);
    }
  }

  // Custom message sending with advanced features
  async sendCustomMessage(messageData: any): Promise<void> {
    try {
      await smsService.sendMessage({
        ...messageData,
        delivery_tracking: this.config.delivery_confirmation,
        read_receipts: this.config.read_receipts,
        auto_retry: this.config.retry_failed,
        cost_optimization: this.config.cost_optimization
      });
    } catch (error) {
      console.error('Custom message sending failed:', error);
    }
  }

  // Bulk message sending with intelligent batching
  async sendBulkMessages(recipients: any[], messageTemplate: string, variables: any = {}): Promise<void> {
    try {
      const messages = recipients.map(recipient => ({
        recipients: recipient.phone,
        message: this.replaceVariables(messageTemplate, { ...variables, ...recipient }),
        message_type: 'bulk',
        priority: 'normal',
        category: variables.category || 'general',
        tags: variables.tags || [],
        delivery_tracking: true
      }));

      await smsService.sendBulkMessages(messages, {
        batch_size: 50,
        delay_between_batches: 2000,
        cost_optimization: true,
        load_balancing: true
      });
    } catch (error) {
      console.error('Bulk message sending failed:', error);
    }
  }

  // Generate welcome message with personalization
  private async generateWelcomeMessage(parentData: any): Promise<any> {
    try {
      const response = await apiService.request('/sms/templates/generate/welcome', {
        method: 'POST',
        body: JSON.stringify({
          parent_data: parentData,
          personalization: true,
          language: parentData.preferred_language || 'en'
        })
      });

      return response.success ? response.message : this.getDefaultWelcomeMessage(parentData);
    } catch (error) {
      return this.getDefaultWelcomeMessage(parentData);
    }
  }

  // Generate conduct message with severity analysis
  private async generateConductMessage(conductData: any): Promise<any> {
    try {
      const response = await apiService.request('/sms/templates/generate/conduct', {
        method: 'POST',
        body: JSON.stringify({
          conduct_data: conductData,
          severity_analysis: true,
          recommendations: true
        })
      });

      return response.success ? response.message : this.getDefaultConductMessage(conductData);
    } catch (error) {
      return this.getDefaultConductMessage(conductData);
    }
  }

  // Get linked parents with caching
  private async getLinkedParents(studentId: number): Promise<any[]> {
    try {
      const response = await apiService.request(`/parent/linked-parents/${studentId}`);
      return response.success ? response.parents : [];
    } catch (error) {
      console.error('Failed to get linked parents:', error);
      return [];
    }
  }

  // Send to multiple parents with optimization
  private async sendToMultipleParents(parents: any[], message: any): Promise<void> {
    const messages = parents.map(parent => ({
      ...message,
      recipients: parent.phone,
      template_variables: { ...message.template_variables, parent_name: parent.name }
    }));

    await smsService.sendBulkMessages(messages);
  }

  // Replace template variables
  private replaceVariables(template: string, variables: any): string {
    let message = template;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(regex, variables[key]);
    });
    return message;
  }

  // Log SMS events for analytics
  private async logSMSEvent(eventType: string, entityId: number, messageId: number): Promise<void> {
    try {
      await apiService.request('/sms/events/log', {
        method: 'POST',
        body: JSON.stringify({
          event_type: eventType,
          entity_id: entityId,
          message_id: messageId,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('SMS event logging failed:', error);
    }
  }

  // Update conduct analytics
  private async updateConductAnalytics(conductData: any): Promise<void> {
    try {
      await apiService.request('/analytics/conduct/update', {
        method: 'POST',
        body: JSON.stringify(conductData)
      });
    } catch (error) {
      console.error('Conduct analytics update failed:', error);
    }
  }

  // Send digital receipt
  private async sendDigitalReceipt(paymentData: any): Promise<void> {
    try {
      await apiService.request('/payments/receipt/send', {
        method: 'POST',
        body: JSON.stringify({
          payment_id: paymentData.id,
          delivery_method: 'sms',
          include_qr_code: true
        })
      });
    } catch (error) {
      console.error('Digital receipt sending failed:', error);
    }
  }

  // Get all parents for emergency broadcasts
  private async getAllParents(): Promise<any[]> {
    try {
      const response = await apiService.request('/parent/all-active');
      return response.success ? response.parents : [];
    } catch (error) {
      console.error('Failed to get all parents:', error);
      return [];
    }
  }

  // Default message templates
  private getDefaultWelcomeMessage(parentData: any): any {
    return {
      content: `Mwiriwe ${parentData.name}! Murakaza neza kuri Garden TVET School. Mwiyandikishije neza. Murakoze!`,
      id: Date.now()
    };
  }

  private getDefaultConductMessage(conductData: any): any {
    return {
      content: `Mwiriwe! Umwana wanyu ${conductData.student_name} yakiriye igihano. Amanota: ${conductData.new_score}/40. Impamvu: ${conductData.reason}. Murakoze.`,
      id: Date.now()
    };
  }

  // Generate other message types...
  private async generateLinkingMessage(linkingData: any): Promise<any> {
    return {
      content: `Mwiriwe ${linkingData.parent_name}! Mwahujije neza n'umwana wanyu ${linkingData.child_name} (${linkingData.student_code}). Murakoze!`,
      id: Date.now()
    };
  }

  private async generateLeaveMessage(leaveData: any): Promise<any> {
    return {
      content: `Mwiriwe! Icyiciro cy'umwana wanyu ${leaveData.student_name} cyemewe kuva ${leaveData.start_date} kugeza ${leaveData.end_date}. Murakoze!`,
      id: Date.now()
    };
  }

  private async generatePaymentMessage(paymentData: any): Promise<any> {
    return {
      content: `Mwiriwe! Kwishyura ${paymentData.amount} RWF kw'umwana wanyu ${paymentData.student_name} byakiriwe. Ref: ${paymentData.reference}. Murakoze!`,
      id: Date.now()
    };
  }

  private async generateGradeMessage(gradeData: any): Promise<any> {
    return {
      content: `Mwiriwe! Umwana wanyu ${gradeData.student_name} yahawe amanota ${gradeData.marks} muri ${gradeData.subject}. Igice: ${gradeData.grade}. Murakoze!`,
      id: Date.now()
    };
  }

  private async generateAttendanceMessage(attendanceData: any): Promise<any> {
    return {
      content: `Mwiriwe! Umwana wanyu ${attendanceData.student_name} ntiyaje ishuri ${attendanceData.date}. Kwitabira: ${attendanceData.attendance_percentage}%. Murakoze!`,
      id: Date.now()
    };
  }

  private async generateExamReminderMessage(examData: any): Promise<any> {
    return {
      content: `Mwiriwe! Umwana wanyu ${examData.student_name} afite ikizamini cya ${examData.subject} ku ${examData.exam_date} saa ${examData.exam_time}. Murakoze!`,
      id: Date.now()
    };
  }

  private async generateEmergencyMessage(emergencyData: any): Promise<any> {
    return {
      content: `BYIHUTIRWA! ${emergencyData.description}. Hamagara: ${emergencyData.emergency_contact}. Garden TVET School.`,
      id: Date.now()
    };
  }
}

// Export singleton instance
export const smsIntegrationHooks = new SMSIntegrationHooks();
export default smsIntegrationHooks;
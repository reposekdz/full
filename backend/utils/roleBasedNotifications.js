const pool = require('../config/database');
const { sendAutoNotification } = require('./autoNotifications');

// Advanced Role-Based Notification Engine
class NotificationEngine {
  constructor() {
    this.listeners = new Map();
    this.queue = [];
    this.processing = false;
  }

  // Role-specific notification rules
  getRoleNotifications(role, eventType, data) {
    const rules = {
      admin: this.getAdminNotifications,
      headmaster: this.getHeadmasterNotifications,
      dos: this.getDOSNotifications,
      dod: this.getDODNotifications,
      patron: this.getPatronNotifications,
      teacher: this.getTeacherNotifications,
      student: this.getStudentNotifications,
      parent: this.getParentNotifications,
      accountant: this.getAccountantNotifications,
      stock_manager: this.getStockManagerNotifications
    };

    return rules[role] ? rules[role](eventType, data) : [];
  }

  // Admin: All system events
  getAdminNotifications(eventType, data) {
    const notifications = [];
    const events = {
      USER_LOGIN: { title: 'Umukoresha Yinjiye', icon: '🔐', priority: 'low' },
      USER_CREATED: { title: 'Umukoresha Mushya', icon: '👤', priority: 'normal' },
      SYSTEM_ERROR: { title: 'Ikosa rya Sistema', icon: '⚠️', priority: 'urgent' },
      BACKUP_COMPLETED: { title: 'Backup Yarangiye', icon: '💾', priority: 'normal' },
      SECURITY_ALERT: { title: 'Umutekano Wakangutse', icon: '🚨', priority: 'urgent' },
      DATABASE_UPDATED: { title: 'Database Yavuguruwe', icon: '🗄️', priority: 'low' },
      PAYMENT_RECEIVED: { title: 'Kwishyura Kwakiriye', icon: '💰', priority: 'high' },
      REPORT_GENERATED: { title: 'Raporo Yarakozwe', icon: '📊', priority: 'normal' },
      SYSTEM_MAINTENANCE: { title: 'Gusana Sistema', icon: '🔧', priority: 'high' },
      API_LIMIT_REACHED: { title: 'API Limit Yagejeje', icon: '⚡', priority: 'urgent' }
    };

    if (events[eventType]) {
      notifications.push({
        ...events[eventType],
        message: data.message,
        data: data,
        timestamp: new Date(),
        category: 'system'
      });
    }
    return notifications;
  }

  // Headmaster: School-wide performance & operations
  getHeadmasterNotifications(eventType, data) {
    const notifications = [];
    const events = {
      SCHOOL_PERFORMANCE: { title: 'Imikorere y\'Ishuri', icon: '📈', priority: 'high' },
      DEPARTMENT_REPORT: { title: 'Raporo y\'Ishami', icon: '📋', priority: 'normal' },
      TEACHER_PERFORMANCE: { title: 'Imikorere y\'Umwarimu', icon: '👨‍🏫', priority: 'normal' },
      BUDGET_ALERT: { title: 'Ingengo y\'Imari', icon: '💵', priority: 'urgent' },
      ENROLLMENT_UPDATE: { title: 'Kwandikisha Abanyeshuri', icon: '🎓', priority: 'high' },
      STAFF_ATTENDANCE: { title: 'Kwitabira kw\'Abakozi', icon: '📅', priority: 'normal' },
      EXAM_RESULTS: { title: 'Ibisubizo by\'Ikizamini', icon: '📝', priority: 'high' },
      PARENT_COMPLAINT: { title: 'Ikibazo cy\'Umubyeyi', icon: '📢', priority: 'urgent' },
      FACILITY_ISSUE: { title: 'Ikibazo cy\'Ibikoresho', icon: '🏢', priority: 'high' },
      ACHIEVEMENT_MILESTONE: { title: 'Intsinzi Nkuru', icon: '🏆', priority: 'high' }
    };

    if (events[eventType]) {
      notifications.push({
        ...events[eventType],
        message: data.message,
        data: data,
        timestamp: new Date(),
        category: 'management'
      });
    }
    return notifications;
  }

  // DOS: Academic performance & teaching
  getDOSNotifications(eventType, data) {
    const notifications = [];
    const events = {
      CLASS_PERFORMANCE: { title: 'Imikorere y\'Ishuri', icon: '📊', priority: 'high' },
      TEACHER_ABSENCE: { title: 'Umwarimu Ntiyitabye', icon: '❌', priority: 'urgent' },
      EXAM_SCHEDULED: { title: 'Ikizamini Cyateguwe', icon: '📅', priority: 'high' },
      GRADE_SUBMITTED: { title: 'Amanota Yashyizweho', icon: '✅', priority: 'normal' },
      CURRICULUM_UPDATE: { title: 'Gahunda Yavuguruwe', icon: '📚', priority: 'normal' },
      STUDENT_FAILING: { title: 'Umunyeshuri Arangwa', icon: '⚠️', priority: 'urgent' },
      ASSIGNMENT_OVERDUE: { title: 'Igikorwa Cyarenze', icon: '⏰', priority: 'high' },
      TEACHING_MATERIAL: { title: 'Ibikoresho by\'Kwigisha', icon: '📖', priority: 'normal' },
      CLASS_AVERAGE_LOW: { title: 'Impera Ntoya', icon: '📉', priority: 'urgent' },
      EXCELLENCE_AWARD: { title: 'Igihembo cy\'Ubwiza', icon: '🌟', priority: 'high' }
    };

    if (events[eventType]) {
      notifications.push({
        ...events[eventType],
        message: data.message,
        data: data,
        timestamp: new Date(),
        category: 'academic'
      });
    }
    return notifications;
  }

  // DOD: Discipline & conduct
  getDODNotifications(eventType, data) {
    const notifications = [];
    const events = {
      CONDUCT_VIOLATION: { title: 'Imyitwarire Mibi', icon: '🚫', priority: 'urgent' },
      STUDENT_FIGHT: { title: 'Kurwana kw\'Abanyeshuri', icon: '⚔️', priority: 'urgent' },
      LATE_ARRIVAL: { title: 'Gutinda', icon: '⏰', priority: 'normal' },
      ABSENCE_PATTERN: { title: 'Kutaza Kenshi', icon: '📊', priority: 'high' },
      LEAVE_REQUEST: { title: 'Gusaba Uruhushya', icon: '📝', priority: 'normal' },
      SUSPENSION_NEEDED: { title: 'Guhagarika Bikenewe', icon: '🛑', priority: 'urgent' },
      GOOD_BEHAVIOR: { title: 'Imyitwarire Myiza', icon: '⭐', priority: 'normal' },
      PARENT_MEETING: { title: 'Inama n\'Ababyeyi', icon: '👨‍👩‍👦', priority: 'high' },
      BULLYING_REPORT: { title: 'Raporo yo Gutera', icon: '😢', priority: 'urgent' },
      CONDUCT_IMPROVEMENT: { title: 'Imyitwarire Yateye Imbere', icon: '📈', priority: 'normal' }
    };

    if (events[eventType]) {
      notifications.push({
        ...events[eventType],
        message: data.message,
        data: data,
        timestamp: new Date(),
        category: 'discipline'
      });
    }
    return notifications;
  }

  // Patron: Student welfare & support
  getPatronNotifications(eventType, data) {
    const notifications = [];
    const events = {
      STUDENT_HEALTH: { title: 'Ubuzima bw\'Umunyeshuri', icon: '🏥', priority: 'urgent' },
      EMOTIONAL_SUPPORT: { title: 'Gufasha mu Mutima', icon: '💚', priority: 'high' },
      ACCOMMODATION_ISSUE: { title: 'Ikibazo cy\'Aho Gutura', icon: '🏠', priority: 'high' },
      MEAL_COMPLAINT: { title: 'Ikibazo cy\'Ibiryo', icon: '🍽️', priority: 'normal' },
      STUDENT_WELFARE: { title: 'Imibereho y\'Umunyeshuri', icon: '🤝', priority: 'normal' },
      EMERGENCY_CONTACT: { title: 'Guhamagara by\'Ihutirwa', icon: '🚨', priority: 'urgent' },
      COUNSELING_NEEDED: { title: 'Inama Zikenewe', icon: '💬', priority: 'high' },
      FINANCIAL_HARDSHIP: { title: 'Ikibazo cy\'Amafaranga', icon: '💸', priority: 'high' },
      SOCIAL_INTEGRATION: { title: 'Kwinjira mu Miryango', icon: '👥', priority: 'normal' },
      ACHIEVEMENT_RECOGNITION: { title: 'Kumenyekanisha Intsinzi', icon: '🎖️', priority: 'normal' }
    };

    if (events[eventType]) {
      notifications.push({
        ...events[eventType],
        message: data.message,
        data: data,
        timestamp: new Date(),
        category: 'welfare'
      });
    }
    return notifications;
  }

  // Teacher: Class & student updates
  getTeacherNotifications(eventType, data) {
    const notifications = [];
    const events = {
      ASSIGNMENT_SUBMITTED: { title: 'Igikorwa Cyashyizweho', icon: '📤', priority: 'normal' },
      STUDENT_ABSENT: { title: 'Umunyeshuri Ntiyitabye', icon: '❌', priority: 'normal' },
      GRADE_DEADLINE: { title: 'Itariki y\'Amanota', icon: '⏰', priority: 'high' },
      PARENT_MESSAGE: { title: 'Ubutumwa bw\'Umubyeyi', icon: '💬', priority: 'normal' },
      CLASS_SCHEDULE: { title: 'Gahunda y\'Ishuri', icon: '📅', priority: 'normal' },
      MATERIAL_REQUEST: { title: 'Gusaba Ibikoresho', icon: '📚', priority: 'normal' },
      STUDENT_PROGRESS: { title: 'Iterambere ry\'Umunyeshuri', icon: '📈', priority: 'normal' },
      MEETING_SCHEDULED: { title: 'Inama Yateguwe', icon: '🗓️', priority: 'high' },
      EXAM_REMINDER: { title: 'Kwibutsa Ikizamini', icon: '📝', priority: 'high' },
      PROFESSIONAL_DEV: { title: 'Amahugurwa', icon: '🎓', priority: 'normal' }
    };

    if (events[eventType]) {
      notifications.push({
        ...events[eventType],
        message: data.message,
        data: data,
        timestamp: new Date(),
        category: 'teaching'
      });
    }
    return notifications;
  }

  // Student: Personal academic updates
  getStudentNotifications(eventType, data) {
    const notifications = [];
    const events = {
      GRADE_POSTED: { title: 'Amanota Yashyizweho', icon: '📊', priority: 'high' },
      ASSIGNMENT_DUE: { title: 'Igikorwa Kigomba Gukorwa', icon: '⏰', priority: 'high' },
      EXAM_SCHEDULED: { title: 'Ikizamini Cyateguwe', icon: '📅', priority: 'high' },
      ATTENDANCE_WARNING: { title: 'Iburira ryo Kutaza', icon: '⚠️', priority: 'urgent' },
      ACHIEVEMENT_EARNED: { title: 'Intsinzi Waronse', icon: '🏆', priority: 'normal' },
      LIBRARY_DUE: { title: 'Igitabo Kigomba Gusubizwa', icon: '📚', priority: 'normal' },
      FEE_REMINDER: { title: 'Kwibutsa Amafaranga', icon: '💰', priority: 'high' },
      SCHEDULE_CHANGE: { title: 'Gahunda Yahinduwe', icon: '🔄', priority: 'normal' },
      TEACHER_FEEDBACK: { title: 'Ibitekerezo by\'Umwarimu', icon: '💬', priority: 'normal' },
      EVENT_INVITATION: { title: 'Ubutumire bw\'Ibirori', icon: '🎉', priority: 'normal' }
    };

    if (events[eventType]) {
      notifications.push({
        ...events[eventType],
        message: data.message,
        data: data,
        timestamp: new Date(),
        category: 'student'
      });
    }
    return notifications;
  }

  // Parent: Child's progress & school updates
  getParentNotifications(eventType, data) {
    const notifications = [];
    const events = {
      CHILD_GRADE: { title: 'Amanota y\'Umwana', icon: '📊', priority: 'high' },
      CHILD_ABSENT: { title: 'Umwana Ntiyitabye', icon: '❌', priority: 'urgent' },
      CONDUCT_ISSUE: { title: 'Ikibazo cy\'Imyitwarire', icon: '⚠️', priority: 'urgent' },
      FEE_DUE: { title: 'Amafaranga Akenewe', icon: '💰', priority: 'high' },
      PARENT_MEETING: { title: 'Inama y\'Ababyeyi', icon: '👨‍👩‍👦', priority: 'high' },
      REPORT_CARD: { title: 'Raporo y\'Amanota', icon: '📋', priority: 'high' },
      ACHIEVEMENT: { title: 'Intsinzi y\'Umwana', icon: '🏆', priority: 'normal' },
      HEALTH_ALERT: { title: 'Ubuzima bw\'Umwana', icon: '🏥', priority: 'urgent' },
      SCHOOL_EVENT: { title: 'Ibirori by\'Ishuri', icon: '🎊', priority: 'normal' },
      TEACHER_REQUEST: { title: 'Icyifuzo cy\'Umwarimu', icon: '📧', priority: 'normal' }
    };

    if (events[eventType]) {
      notifications.push({
        ...events[eventType],
        message: data.message,
        data: data,
        timestamp: new Date(),
        category: 'parent'
      });
    }
    return notifications;
  }

  // Accountant: Financial transactions
  getAccountantNotifications(eventType, data) {
    const notifications = [];
    const events = {
      PAYMENT_RECEIVED: { title: 'Kwishyura Kwakiriye', icon: '💰', priority: 'normal' },
      PAYMENT_OVERDUE: { title: 'Kwishyura Kwarenze', icon: '⏰', priority: 'high' },
      EXPENSE_APPROVED: { title: 'Amafaranga Yemejwe', icon: '✅', priority: 'normal' },
      BUDGET_EXCEEDED: { title: 'Ingengo Yarenze', icon: '🚨', priority: 'urgent' },
      INVOICE_GENERATED: { title: 'Fagitire Yarakozwe', icon: '📄', priority: 'normal' },
      REFUND_REQUEST: { title: 'Gusaba Gusubizwa', icon: '↩️', priority: 'high' },
      FINANCIAL_REPORT: { title: 'Raporo y\'Amafaranga', icon: '📊', priority: 'normal' },
      AUDIT_SCHEDULED: { title: 'Igenzura Ryateguwe', icon: '🔍', priority: 'high' },
      SALARY_PROCESSED: { title: 'Umushahara Watanzwe', icon: '💵', priority: 'normal' },
      TAX_DEADLINE: { title: 'Itariki y\'Umusoro', icon: '📅', priority: 'urgent' }
    };

    if (events[eventType]) {
      notifications.push({
        ...events[eventType],
        message: data.message,
        data: data,
        timestamp: new Date(),
        category: 'finance'
      });
    }
    return notifications;
  }

  // Stock Manager: Inventory & supplies
  getStockManagerNotifications(eventType, data) {
    const notifications = [];
    const events = {
      STOCK_LOW: { title: 'Ibikoresho Bicyeho', icon: '📦', priority: 'urgent' },
      STOCK_CRITICAL: { title: 'Ibikoresho Bikomeye', icon: '🚨', priority: 'urgent' },
      ORDER_DELIVERED: { title: 'Ibisabwa Byashitse', icon: '🚚', priority: 'normal' },
      REQUISITION_PENDING: { title: 'Icyifuzo Gitegerezwa', icon: '📋', priority: 'high' },
      SUPPLIER_DELAY: { title: 'Uwatanze Yatinze', icon: '⏰', priority: 'high' },
      INVENTORY_AUDIT: { title: 'Igenzura ry\'Ibikoresho', icon: '🔍', priority: 'normal' },
      EXPIRY_WARNING: { title: 'Iburira ryo Kurangira', icon: '⚠️', priority: 'high' },
      STOCK_RECEIVED: { title: 'Ibikoresho Byakiriye', icon: '✅', priority: 'normal' },
      DAMAGE_REPORT: { title: 'Raporo y\'Ibyangiritse', icon: '💔', priority: 'high' },
      REORDER_POINT: { title: 'Igihe cyo Gutumiza', icon: '🔄', priority: 'urgent' }
    };

    if (events[eventType]) {
      notifications.push({
        ...events[eventType],
        message: data.message,
        data: data,
        timestamp: new Date(),
        category: 'inventory'
      });
    }
    return notifications;
  }

  // Process notification with AI-powered routing
  async processNotification(eventType, data, affectedRoles = []) {
    try {
      const notifications = [];
      
      // Get all active users by role
      const [users] = await pool.execute(`
        SELECT id, role, name, email, notification_preferences 
        FROM users 
        WHERE is_active = true AND role IN (${affectedRoles.map(() => '?').join(',')})
      `, affectedRoles);

      for (const user of users) {
        const roleNotifications = this.getRoleNotifications(user.role, eventType, data);
        
        for (const notif of roleNotifications) {
          // Check user preferences
          const prefs = user.notification_preferences ? JSON.parse(user.notification_preferences) : {};
          if (prefs[notif.category] === false) continue;

          // Save to database
          await pool.execute(`
            INSERT INTO notifications 
            (user_id, type, title, message, icon, priority, category, data, is_read)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, false)
          `, [user.id, eventType, notif.title, notif.message, notif.icon, notif.priority, notif.category, JSON.stringify(notif.data)]);

          // Also save to messages for inbox
          await pool.execute(`
            INSERT INTO messages 
            (sender_id, sender_name, sender_role, recipient_id, subject, message, priority, status, is_read)
            VALUES (1, 'Sistema', 'system', ?, ?, ?, ?, 'sent', false)
          `, [user.id, notif.title, notif.message, notif.priority]);

          notifications.push({ userId: user.id, notification: notif });
        }
      }

      return { success: true, count: notifications.length, notifications };
    } catch (error) {
      console.error('Notification processing error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
const notificationEngine = new NotificationEngine();

module.exports = {
  notificationEngine,
  processRoleBasedNotification: (eventType, data, roles) => notificationEngine.processNotification(eventType, data, roles)
};

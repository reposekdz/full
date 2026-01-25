const { processRoleBasedNotification } = require('./roleBasedNotifications');

// Database Change Tracker - Automatically notifies on any change
class DatabaseChangeTracker {
  constructor() {
    this.changeLog = [];
    this.watchers = new Map();
  }

  // Track all database changes
  async trackChange(table, operation, data, userId) {
    const change = {
      table,
      operation,
      data,
      userId,
      timestamp: new Date()
    };

    this.changeLog.push(change);
    await this.processChange(change);
  }

  // Process change and trigger notifications
  async processChange(change) {
    const { table, operation, data } = change;

    // Map table changes to notification events
    const eventMap = {
      // User management
      users: {
        INSERT: { event: 'USER_CREATED', roles: ['admin', 'headmaster'] },
        UPDATE: { event: 'USER_UPDATED', roles: ['admin', 'headmaster'] },
        DELETE: { event: 'USER_DELETED', roles: ['admin'] }
      },
      
      // Academic
      grades: {
        INSERT: { event: 'GRADE_POSTED', roles: ['dos', 'teacher', 'student', 'parent'] },
        UPDATE: { event: 'GRADE_UPDATED', roles: ['dos', 'teacher', 'student', 'parent'] }
      },
      
      assignments: {
        INSERT: { event: 'ASSIGNMENT_DUE', roles: ['dos', 'teacher', 'student'] },
        UPDATE: { event: 'ASSIGNMENT_UPDATED', roles: ['teacher', 'student'] }
      },
      
      exams: {
        INSERT: { event: 'EXAM_SCHEDULED', roles: ['dos', 'teacher', 'student', 'parent'] },
        UPDATE: { event: 'EXAM_UPDATED', roles: ['dos', 'teacher', 'student'] }
      },
      
      // Discipline
      conduct_records: {
        INSERT: { event: 'CONDUCT_VIOLATION', roles: ['dod', 'patron', 'parent', 'headmaster'] },
        UPDATE: { event: 'CONDUCT_UPDATED', roles: ['dod', 'patron'] }
      },
      
      leave_requests: {
        INSERT: { event: 'LEAVE_REQUEST', roles: ['dod', 'patron', 'parent'] },
        UPDATE: { event: 'LEAVE_APPROVED', roles: ['dod', 'patron', 'student', 'parent'] }
      },
      
      // Attendance
      attendance: {
        INSERT: { event: 'ATTENDANCE_MARKED', roles: ['dos', 'teacher', 'parent'] },
        UPDATE: { event: 'ATTENDANCE_UPDATED', roles: ['dos', 'teacher'] }
      },
      
      // Financial
      payments: {
        INSERT: { event: 'PAYMENT_RECEIVED', roles: ['accountant', 'admin', 'parent'] },
        UPDATE: { event: 'PAYMENT_UPDATED', roles: ['accountant', 'admin'] }
      },
      
      invoices: {
        INSERT: { event: 'INVOICE_GENERATED', roles: ['accountant', 'parent'] },
        UPDATE: { event: 'INVOICE_UPDATED', roles: ['accountant'] }
      },
      
      // Stock
      inventory: {
        INSERT: { event: 'STOCK_RECEIVED', roles: ['stock_manager', 'admin'] },
        UPDATE: { event: 'STOCK_UPDATED', roles: ['stock_manager'] }
      },
      
      requisitions: {
        INSERT: { event: 'REQUISITION_PENDING', roles: ['stock_manager', 'admin'] },
        UPDATE: { event: 'REQUISITION_APPROVED', roles: ['stock_manager', 'teacher'] }
      },
      
      // Messages
      messages: {
        INSERT: { event: 'MESSAGE_RECEIVED', roles: [] } // Handled separately
      },
      
      // Events
      school_events: {
        INSERT: { event: 'EVENT_INVITATION', roles: ['admin', 'headmaster', 'teacher', 'student', 'parent'] },
        UPDATE: { event: 'EVENT_UPDATED', roles: ['admin', 'headmaster'] }
      },
      
      // Reports
      reports: {
        INSERT: { event: 'REPORT_GENERATED', roles: ['admin', 'headmaster', 'dos', 'accountant'] }
      }
    };

    const mapping = eventMap[table]?.[operation];
    if (mapping) {
      await processRoleBasedNotification(mapping.event, data, mapping.roles);
    }

    // Special handling for critical events
    await this.handleCriticalEvents(table, operation, data);
  }

  // Handle critical events that need immediate attention
  async handleCriticalEvents(table, operation, data) {
    // Low stock alert
    if (table === 'inventory' && operation === 'UPDATE') {
      if (data.quantity < data.min_threshold) {
        await processRoleBasedNotification('STOCK_LOW', {
          message: `${data.item_name} bicyeho (${data.quantity}/${data.min_threshold})`,
          item: data.item_name,
          quantity: data.quantity,
          threshold: data.min_threshold
        }, ['stock_manager', 'admin']);
      }
      
      if (data.quantity < data.min_threshold * 0.3) {
        await processRoleBasedNotification('STOCK_CRITICAL', {
          message: `${data.item_name} bikomeye cyane! (${data.quantity}/${data.min_threshold})`,
          item: data.item_name,
          quantity: data.quantity,
          threshold: data.min_threshold
        }, ['stock_manager', 'admin', 'headmaster']);
      }
    }

    // Student failing alert
    if (table === 'grades' && operation === 'INSERT') {
      if (data.grade < 50) {
        await processRoleBasedNotification('STUDENT_FAILING', {
          message: `${data.student_name} arangwa muri ${data.subject} (${data.grade}%)`,
          student: data.student_name,
          subject: data.subject,
          grade: data.grade
        }, ['dos', 'teacher', 'parent']);
      }
    }

    // Attendance pattern alert
    if (table === 'attendance' && operation === 'INSERT') {
      if (data.status === 'absent') {
        // Check for pattern (3+ absences in a week)
        await processRoleBasedNotification('CHILD_ABSENT', {
          message: `${data.student_name} ntiyitabye ku wa ${data.date}`,
          student: data.student_name,
          date: data.date
        }, ['dos', 'dod', 'parent']);
      }
    }

    // Payment overdue alert
    if (table === 'invoices' && operation === 'UPDATE') {
      const dueDate = new Date(data.due_date);
      const now = new Date();
      if (now > dueDate && data.status === 'pending') {
        await processRoleBasedNotification('PAYMENT_OVERDUE', {
          message: `Kwishyura kwarenze itariki (${data.amount} RWF)`,
          amount: data.amount,
          dueDate: data.due_date,
          student: data.student_name
        }, ['accountant', 'parent']);
      }
    }

    // Conduct violation alert
    if (table === 'conduct_records' && operation === 'INSERT') {
      if (data.severity === 'critical' || data.severity === 'high') {
        await processRoleBasedNotification('CONDUCT_VIOLATION', {
          message: `${data.student_name}: ${data.description}`,
          student: data.student_name,
          severity: data.severity,
          description: data.description
        }, ['dod', 'patron', 'headmaster', 'parent']);
      }
    }

    // Budget exceeded alert
    if (table === 'expenses' && operation === 'INSERT') {
      // Check if department budget exceeded
      if (data.total_spent > data.budget_limit) {
        await processRoleBasedNotification('BUDGET_EXCEEDED', {
          message: `Ingengo y'imari yarenze (${data.department})`,
          department: data.department,
          spent: data.total_spent,
          budget: data.budget_limit
        }, ['accountant', 'admin', 'headmaster']);
      }
    }
  }
}

// Middleware to track all database operations
const trackDatabaseChange = (table) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    const tracker = new DatabaseChangeTracker();

    res.send = function(data) {
      // Track successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const operation = req.method === 'POST' ? 'INSERT' : 
                         req.method === 'PUT' || req.method === 'PATCH' ? 'UPDATE' : 
                         req.method === 'DELETE' ? 'DELETE' : null;

        if (operation) {
          tracker.trackChange(table, operation, req.body, req.user?.userId);
        }
      }

      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = {
  DatabaseChangeTracker,
  trackDatabaseChange
};

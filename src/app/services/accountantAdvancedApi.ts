import { apiService } from './apiService';

// ============================================
// COMPREHENSIVE ACCOUNTANT API SERVICE
// Advanced API Integration for Financial Management
// ============================================

const API_BASE = '/api/accountant-ultra-advanced';

// Types
export interface Payment {
  id: number;
  student_id: number;
  student_name: string;
  reg_number: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  academic_year: string;
  term: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  recorded_by: number;
  recorded_by_name: string;
  notes?: string;
}

export interface StudentFee {
  id: number;
  student_id: number;
  student_name: string;
  reg_number: string;
  trade: string;
  level: string;
  total_fee: number;
  paid_amount: number;
  balance: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
  academic_year: string;
  term: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor?: string;
  receipt_number?: string;
  status: 'pending' | 'approved' | 'rejected';
  recorded_by: number;
  approved_by?: number;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  student_id: number;
  student_name: string;
  amount: number;
  description: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  paid_at?: string;
}

export interface Budget {
  id: number;
  name: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  academic_year: string;
  term: string;
  status: 'active' | 'closed';
}

export interface Salary {
  id: number;
  staff_id: number;
  staff_name: string;
  position: string;
  base_salary: number;
  deductions: number;
  bonuses: number;
  net_salary: number;
  payment_date: string;
  payment_method: string;
  status: 'pending' | 'paid';
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_balance: number;
  income_by_category: { category: string; amount: number }[];
  expenses_by_category: { category: string; amount: number }[];
  monthly_trends: { month: string; income: number; expenses: number }[];
}

export interface DashboardStats {
  total_students: number;
  total_payments: number;
  total_income: number;
  total_expenses: number;
  outstanding_balance: number;
  pending_payments: number;
  overdue_payments: number;
  recent_transactions: number;
}

// ============================================
// DASHBOARD API FUNCTIONS
// ============================================

// Get accountant dashboard data
export const getAccountantDashboard = async (): Promise<DashboardStats> => {
  try {
    const response = await apiService.request(API_BASE);
    return response || {
      total_students: 0,
      total_payments: 0,
      total_income: 0,
      total_expenses: 0,
      outstanding_balance: 0,
      pending_payments: 0,
      overdue_payments: 0,
      recent_transactions: 0
    };
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return {
      total_students: 0,
      total_payments: 0,
      total_income: 0,
      total_expenses: 0,
      outstanding_balance: 0,
      pending_payments: 0,
      overdue_payments: 0,
      recent_transactions: 0
    };
  }
};

// Get financial summary
export const getFinancialSummary = async (params?: { start_date?: string; end_date?: string }): Promise<FinancialSummary> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const endpoint = `${API_BASE}/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response || {
      total_income: 0,
      total_expenses: 0,
      net_balance: 0,
      income_by_category: [],
      expenses_by_category: [],
      monthly_trends: []
    };
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return {
      total_income: 0,
      total_expenses: 0,
      net_balance: 0,
      income_by_category: [],
      expenses_by_category: [],
      monthly_trends: []
    };
  }
};

// ============================================
// PAYMENTS API FUNCTIONS
// ============================================

// Get all payments
export const getAllPayments = async (params?: { 
  search?: string; 
  status?: string; 
  start_date?: string; 
  end_date?: string;
}): Promise<Payment[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const endpoint = `${API_BASE}/payments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.payments || [];
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

// Record new payment
export const recordPayment = async (data: {
  student_id: number;
  amount: number;
  payment_method: string;
  academic_year?: string;
  term?: string;
  notes?: string;
}): Promise<Payment | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/payments/record`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.payment || null;
  } catch (error) {
    console.error('Error recording payment:', error);
    return null;
  }
};

// Update payment
export const updatePayment = async (id: number, data: Partial<Payment>): Promise<Payment | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.payment || null;
  } catch (error) {
    console.error('Error updating payment:', error);
    return null;
  }
};

// Delete payment
export const deletePayment = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/payments/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting payment:', error);
    return false;
  }
};

// Approve payment
export const approvePayment = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/payments/${id}/approve`, { method: 'PUT' });
    return true;
  } catch (error) {
    console.error('Error approving payment:', error);
    return false;
  }
};

// Get overdue payments
export const getOverduePayments = async (): Promise<Payment[]> => {
  try {
    const response = await apiService.request(`${API_BASE}/payments/overdue`);
    return response.payments || [];
  } catch (error) {
    console.error('Error fetching overdue payments:', error);
    return [];
  }
};

// ============================================
// STUDENT FEES API FUNCTIONS
// ============================================

// Get all student fees
export const getStudentFees = async (params?: { 
  search?: string; 
  payment_status?: string;
  trade?: string;
  level?: string;
}): Promise<StudentFee[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params?.trade) queryParams.append('trade', params.trade);
    if (params?.level) queryParams.append('level', params.level);
    
    const endpoint = `${API_BASE}/fees/students${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.students || [];
  } catch (error) {
    console.error('Error fetching student fees:', error);
    return [];
  }
};

// Update student fee
export const updateStudentFee = async (studentId: number, data: { total_fee?: number; term?: string }): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/fees/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return true;
  } catch (error) {
    console.error('Error updating student fee:', error);
    return false;
  }
};

// Get fee structure
export const getFeeStructure = async (): Promise<any[]> => {
  try {
    const response = await apiService.request(`${API_BASE}/fees/structures`);
    return response.structures || [];
  } catch (error) {
    console.error('Error fetching fee structure:', error);
    return [];
  }
};

// Create fee structure
export const createFeeStructure = async (data: {
  trade_code: string;
  level: string;
  tuition_fee: number;
  registration_fee: number;
  other_fees: number;
}): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/fees/structures`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return true;
  } catch (error) {
    console.error('Error creating fee structure:', error);
    return false;
  }
};

// ============================================
// EXPENSES API FUNCTIONS
// ============================================

// Get all expenses
export const getAllExpenses = async (params?: { 
  search?: string; 
  category?: string;
  start_date?: string;
  end_date?: string;
}): Promise<Expense[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const endpoint = `${API_BASE}/expenses${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.expenses || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

// Add expense
export const addExpense = async (data: {
  description: string;
  amount: number;
  category: string;
  date: string;
  vendor?: string;
  receipt_number?: string;
}): Promise<Expense | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.expense || null;
  } catch (error) {
    console.error('Error adding expense:', error);
    return null;
  }
};

// Update expense
export const updateExpense = async (id: number, data: Partial<Expense>): Promise<Expense | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.expense || null;
  } catch (error) {
    console.error('Error updating expense:', error);
    return null;
  }
};

// Delete expense
export const deleteExpense = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/expenses/${id}`, { method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
};

// Approve expense
export const approveExpense = async (id: number): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/expenses/${id}/approve`, { method: 'PUT' });
    return true;
  } catch (error) {
    console.error('Error approving expense:', error);
    return false;
  }
};

// ============================================
// INVOICES API FUNCTIONS
// ============================================

// Get all invoices
export const getAllInvoices = async (params?: { 
  status?: string;
  student_id?: number;
}): Promise<Invoice[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.student_id) queryParams.append('student_id', params.student_id.toString());
    
    const endpoint = `${API_BASE}/invoices${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.invoices || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }
};

// Create invoice
export const createInvoice = async (data: {
  student_id: number;
  amount: number;
  description: string;
  due_date: string;
}): Promise<Invoice | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/invoices`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.invoice || null;
  } catch (error) {
    console.error('Error creating invoice:', error);
    return null;
  }
};

// Update invoice status
export const updateInvoiceStatus = async (id: number, status: string): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/invoices/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return true;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return false;
  }
};

// ============================================
// BUDGETS API FUNCTIONS
// ============================================

// Get all budgets
export const getAllBudgets = async (): Promise<Budget[]> => {
  try {
    const response = await apiService.request(`${API_BASE}/budgets`);
    return response.budgets || [];
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }
};

// Create budget
export const createBudget = async (data: {
  name: string;
  category: string;
  allocated_amount: number;
  academic_year: string;
  term: string;
}): Promise<Budget | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/budgets`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.budget || null;
  } catch (error) {
    console.error('Error creating budget:', error);
    return null;
  }
};

// Update budget
export const updateBudget = async (id: number, data: Partial<Budget>): Promise<Budget | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.budget || null;
  } catch (error) {
    console.error('Error updating budget:', error);
    return null;
  }
};

// ============================================
// SALARIES API FUNCTIONS
// ============================================

// Get all salaries
export const getAllSalaries = async (params?: { 
  status?: string;
  staff_id?: number;
}): Promise<Salary[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.staff_id) queryParams.append('staff_id', params.staff_id.toString());
    
    const endpoint = `${API_BASE}/salaries${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.salaries || [];
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return [];
  }
};

// Pay salary
export const paySalary = async (data: {
  staff_id: number;
  amount: number;
  payment_method: string;
  deductions?: number;
  bonuses?: number;
}): Promise<Salary | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/salaries`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.salary || null;
  } catch (error) {
    console.error('Error paying salary:', error);
    return null;
  }
};

// ============================================
// REPORTS API FUNCTIONS
// ============================================

// Get financial reports
export const getFinancialReports = async (params: {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  year: number;
  month?: number;
}): Promise<any> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('period', params.period);
    queryParams.append('year', params.year.toString());
    if (params.month) queryParams.append('month', params.month.toString());
    
    const endpoint = `${API_BASE}/reports?${queryParams.toString()}`;
    const response = await apiService.request(endpoint);
    return response || {};
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    return {};
  }
};

// Export report
export const exportReport = async (type: string, format: 'pdf' | 'excel' | 'csv'): Promise<string | null> => {
  try {
    const response = await apiService.request(`${API_BASE}/reports/export?type=${type}&format=${format}`);
    return response.url || null;
  } catch (error) {
    console.error('Error exporting report:', error);
    return null;
  }
};

// ============================================
// NOTIFICATIONS API FUNCTIONS
// ============================================

// Send payment reminder
export const sendPaymentReminder = async (studentId: number): Promise<boolean> => {
  try {
    await apiService.request(`${API_BASE}/notifications/send-reminder`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId })
    });
    return true;
  } catch (error) {
    console.error('Error sending reminder:', error);
    return false;
  }
};

// Send bulk reminders
export const sendBulkReminders = async (studentIds: number[]): Promise<{ sent: number; failed: number }> => {
  try {
    const response = await apiService.request(`${API_BASE}/notifications/bulk-reminder`, {
      method: 'POST',
      body: JSON.stringify({ student_ids: studentIds })
    });
    return { sent: response.sent || 0, failed: response.failed || 0 };
  } catch (error) {
    console.error('Error sending bulk reminders:', error);
    return { sent: 0, failed: studentIds.length };
  }
};

// ============================================
// PARENT PAYMENTS INTEGRATION
// ============================================

// Get all parent payments (auto-sync from parent portal)
export const getParentPayments = async (params?: {
  student_id?: number;
  parent_id?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}): Promise<any[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.student_id) queryParams.append('student_id', params.student_id.toString());
    if (params?.parent_id) queryParams.append('parent_id', params.parent_id.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const endpoint = `/parent-payment-portal/payments${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await apiService.request(endpoint);
    return response.payments || [];
  } catch (error) {
    console.error('Error fetching parent payments:', error);
    return [];
  }
};

// Get parent payment proofs (pending approval)
export const getPendingPaymentProofs = async (): Promise<any[]> => {
  try {
    const response = await apiService.request('/parent-portal-ultra/payment-proofs/pending');
    return response.proofs || [];
  } catch (error) {
    console.error('Error fetching pending payment proofs:', error);
    return [];
  }
};

// Approve payment proof
export const approvePaymentProof = async (proofId: number): Promise<boolean> => {
  try {
    await apiService.request(`/parent-portal-ultra/payment-proofs/${proofId}/approve`, {
      method: 'POST'
    });
    return true;
  } catch (error) {
    console.error('Error approving payment proof:', error);
    return false;
  }
};

// Reject payment proof
export const rejectPaymentProof = async (proofId: number, reason: string): Promise<boolean> => {
  try {
    await apiService.request(`/parent-portal-ultra/payment-proofs/${proofId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
    return true;
  } catch (error) {
    console.error('Error rejecting payment proof:', error);
    return false;
  }
};

// Get complete student fee status with parent payments
export const getStudentFeeStatus = async (studentId?: number): Promise<any> => {
  try {
    const endpoint = studentId 
      ? `${API_BASE}/fees/students/${studentId}/status`
      : `${API_BASE}/fees/students-status`;
    const response = await apiService.request(endpoint);
    return response || {};
  } catch (error) {
    console.error('Error fetching student fee status:', error);
    return {};
  }
};

// Get student payment summary (including parent payments)
export const getStudentPaymentSummary = async (studentId: number): Promise<{
  student: any;
  total_fee: number;
  paid: number;
  balance: number;
  payments: any[];
  parent_payments: any[];
}> => {
  try {
    const response = await apiService.request(`${API_BASE}/fees/students/${studentId}/summary`);
    return response || {
      student: null,
      total_fee: 0,
      paid: 0,
      balance: 0,
      payments: [],
      parent_payments: []
    };
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    return {
      student: null,
      total_fee: 0,
      paid: 0,
      balance: 0,
      payments: [],
      parent_payments: []
    };
  }
};

// Sync parent payments with accountant records
export const syncParentPayments = async (): Promise<{ synced: number; errors: number }> => {
  try {
    const response = await apiService.request(`${API_BASE}/payments/sync-parent-payments`, {
      method: 'POST'
    });
    return { synced: response.synced || 0, errors: response.errors || 0 };
  } catch (error) {
    console.error('Error syncing parent payments:', error);
    return { synced: 0, errors: 0 };
  }
};

// ============================================
// COMBINED API OBJECT
// ============================================

export const accountantApi = {
  // Dashboard
  getAccountantDashboard,
  getFinancialSummary,

  // Payments
  getAllPayments,
  recordPayment,
  updatePayment,
  deletePayment,
  approvePayment,
  getOverduePayments,

  // Student Fees
  getStudentFees,
  updateStudentFee,
  getFeeStructure,
  createFeeStructure,
  getStudentFeeStatus,
  getStudentPaymentSummary,

  // Expenses
  getAllExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  approveExpense,

  // Invoices
  getAllInvoices,
  createInvoice,
  updateInvoiceStatus,

  // Budgets
  getAllBudgets,
  createBudget,
  updateBudget,

  // Salaries
  getAllSalaries,
  paySalary,

  // Reports
  getFinancialReports,
  exportReport,

  // Notifications
  sendPaymentReminder,
  sendBulkReminders,

  // Parent Payments Integration
  getParentPayments,
  getPendingPaymentProofs,
  approvePaymentProof,
  rejectPaymentProof,
  syncParentPayments
};

export default accountantApi;

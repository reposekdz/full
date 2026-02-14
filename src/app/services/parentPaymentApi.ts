/**
 * Garden TVET School - Parent Payment Portal API Service
 * Complete Real-API Integration
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Types
export interface LinkedStudent {
  sheet_id: number;
  student_id: string;
  student_code: string;
  first_name: string;
  last_name: string;
  trade_code: string;
  trade_name: string;
  level_number: string;
  level_display: string;
  current_class: string;
  profile_image?: string;
  total_fees: number;
  paid_amount: number;
  balance: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
  percentage_paid: number;
  relationship: string;
  is_primary: boolean;
}

export interface FeeItem {
  id: number;
  fee_type: string;
  fee_category: string;
  amount: number;
  due_date: string;
  is_mandatory: boolean;
  status: 'paid' | 'pending' | 'overdue';
  paid_amount?: number;
}

export interface PaymentRecord {
  id: number;
  amount: number;
  payment_method: string;
  reference_number: string;
  payment_date: string;
  status: 'completed' | 'pending' | 'failed';
  receipt_number: string;
  bank_name?: string;
  fee_amount?: number;
}

export interface DashboardStats {
  linked_students_count: number;
  total_fees: number;
  total_paid: number;
  total_balance: number;
  overdue_payments: number;
  pending_payments: number;
  collection_rate: number;
}

export interface PaymentInitRequest {
  studentId: string;
  amount: number;
  paymentMethod: string;
  bank?: string;
}

export interface PaymentInitResponse {
  success: boolean;
  message?: string;
  paymentId?: number;
  receiptNumber?: string;
  referenceNumber?: string;
  paymentDetails?: {
    amount: number;
    fee: number;
    total: number;
    method: string;
    status: string;
    demo?: boolean;
  };
  paymentUrl?: string;
}

export interface ReceiptData {
  receipt_number: string;
  student_id: string;
  parent_id?: string;
  amount: number;
  fee_amount: number;
  total_amount: number;
  payment_method: string;
  payment_date: string;
  status: string;
  first_name: string;
  last_name: string;
  student_code: string;
  trade_name?: string;
  current_class?: string;
}

export interface PaymentMethod {
  code: string;
  name: string;
  type: 'bank' | 'mobile';
  enabled: boolean;
  color: string;
  feePercent: number;
}

// API Functions

/**
 * Fetch all linked children for the parent
 */
export const fetchLinkedChildren = async (): Promise<LinkedStudent[]> => {
  const response = await fetch(`${API_BASE}/parent-payment-portal/my-children`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch linked children');
  }
  
  return data.children;
};

/**
 * Fetch dashboard summary
 */
export const fetchDashboardSummary = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE}/parent-payment-portal/dashboard-summary`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch dashboard summary');
  }
  
  return data.summary;
};

/**
 * Fetch fee structure for a student
 */
export const fetchFeeStructure = async (studentId: string): Promise<FeeItem[]> => {
  const response = await fetch(`${API_BASE}/parent-payment-portal/fee-structure/${studentId}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch fee structure');
  }
  
  return data.feeStructure;
};

/**
 * Fetch payment history for a student
 */
export const fetchPaymentHistory = async (studentId: string): Promise<PaymentRecord[]> => {
  const response = await fetch(`${API_BASE}/parent-payment-portal/payment-history/${studentId}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch payment history');
  }
  
  return data.payments;
};

/**
 * Initiate a payment
 */
export const initiatePayment = async (request: PaymentInitRequest): Promise<PaymentInitResponse> => {
  const response = await fetch(`${API_BASE}/parent-payment-portal/initiate-payment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Payment initiation failed');
  }
  
  return data;
};

/**
 * Get payment receipt
 */
export const getReceipt = async (receiptNumber: string): Promise<ReceiptData> => {
  const response = await fetch(`${API_BASE}/parent-payment-portal/receipt/${receiptNumber}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch receipt');
  }
  
  return data.receipt;
};

/**
 * Verify payment status
 */
export const verifyPayment = async (referenceNumber: string): Promise<PaymentRecord> => {
  const response = await fetch(`${API_BASE}/parent-payment-portal/verify/${referenceNumber}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Payment verification failed');
  }
  
  return data.payment;
};

/**
 * Request to link a new child
 */
export const requestLinkChild = async (studentCode: string, relationship: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE}/parent-linking/request`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ student_code: studentCode, relationship }),
  });
  const data = await response.json();
  
  return data;
};

/**
 * Get available payment methods
 */
export const getAvailablePaymentMethods = (): PaymentMethod[] => {
  const gtFee = parseFloat(process.env.REACT_APP_MTN_FEE_PERCENT || '') || 0;
  const bprFee = parseFloat(process.env.REACT_APP_BPR_FEE_PERCENT || '') || 0;
  const equityFee = parseFloat(process.env.REACT_APP_EQUITY_FEE_PERCENT || '') || 0;
  const mtnFee = parseFloat(process.env.REACT_APP_MTN_FEE_PERCENT || '') || 0.5;
  const airtelFee = parseFloat(process.env.REACT_APP_AIRTEL_FEE_PERCENT || '') || 0.5;
  
  const methods: PaymentMethod[] = [];
  
  if (process.env.REACT_APP_GT_BANK_ENABLED === 'true') {
    methods.push({
      code: 'gt_bank',
      name: process.env.REACT_APP_GT_BANK_NAME || 'GT Bank Rwanda',
      type: 'bank',
      enabled: true,
      color: '#1A237E',
      feePercent: gtFee,
    });
  }
  
  if (process.env.REACT_APP_BPR_ENABLED === 'true') {
    methods.push({
      code: 'bpr',
      name: process.env.REACT_APP_BPR_NAME || 'Bank of Kigali (BPR)',
      type: 'bank',
      enabled: true,
      color: '#C62828',
      feePercent: bprFee,
    });
  }
  
  if (process.env.REACT_APP_EQUITY_ENABLED === 'true') {
    methods.push({
      code: 'equity_bank',
      name: process.env.REACT_APP_EQUITY_NAME || 'Equity Bank Rwanda',
      type: 'bank',
      enabled: true,
      color: '#1565C0',
      feePercent: equityFee,
    });
  }
  
  if (process.env.REACT_APP_MTN_ENABLED === 'true') {
    methods.push({
      code: 'mtn_money',
      name: process.env.REACT_APP_MTN_NAME || 'MTN Mobile Money',
      type: 'mobile',
      enabled: true,
      color: '#FFC107',
      feePercent: mtnFee,
    });
  }
  
  if (process.env.REACT_APP_AIRTEL_ENABLED === 'true') {
    methods.push({
      code: 'airtel_money',
      name: process.env.REACT_APP_AIRTEL_NAME || 'Airtel Money',
      type: 'mobile',
      enabled: true,
      color: '#D32F2F',
      feePercent: airtelFee,
    });
  }
  
  return methods;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('rw-RW', { 
    style: 'currency', 
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate processing fee
 */
export const calculateFee = (amount: number, feePercent: number): number => {
  return Math.round(amount * feePercent / 100);
};

/**
 * Calculate total amount with fee
 */
export const calculateTotalWithFee = (amount: number, feePercent: number): number => {
  return amount + calculateFee(amount, feePercent);
};

export default {
  fetchLinkedChildren,
  fetchDashboardSummary,
  fetchFeeStructure,
  fetchPaymentHistory,
  initiatePayment,
  getReceipt,
  verifyPayment,
  requestLinkChild,
  getAvailablePaymentMethods,
  formatCurrency,
  calculateFee,
  calculateTotalWithFee,
};

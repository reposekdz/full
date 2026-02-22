const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

class ProductionAPIService {
  private baseURL: string;
  private wsConnection: WebSocket | null = null;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private retryDelays = [1000, 2000, 4000, 8000, 16000];

  constructor() {
    this.baseURL = API_BASE_URL;
    this.initializeWebSocket();
    this.setupInterceptors();
  }

  // Initialize WebSocket for real-time updates
  private initializeWebSocket() {
    try {
      this.wsConnection = new WebSocket(WS_BASE_URL);
      
      this.wsConnection.onopen = () => {
        console.log('WebSocket connected for real-time updates');
        this.authenticate();
      };

      this.wsConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleRealTimeUpdate(data);
      };

      this.wsConnection.onclose = () => {
        console.log('WebSocket disconnected, attempting reconnection...');
        setTimeout(() => this.initializeWebSocket(), 5000);
      };
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
    }
  }

  // Authenticate WebSocket connection
  private authenticate() {
    const token = this.getAuthToken();
    if (token && this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    }
  }

  // Handle real-time updates
  private handleRealTimeUpdate(data: any) {
    const event = new CustomEvent('realTimeUpdate', { detail: data });
    window.dispatchEvent(event);
  }

  // Setup request/response interceptors
  private setupInterceptors() {
    // Clear expired cache entries every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > value.ttl) {
          this.cache.delete(key);
        }
      }
    }, 300000);
  }

  // Get authentication token
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  // Get default headers
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0',
      'X-Request-ID': this.generateRequestId(),
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cache key generator
  private getCacheKey(url: string, config?: RequestConfig): string {
    return `${config?.method || 'GET'}_${url}_${JSON.stringify(config?.body || {})}`;
  }

  // Check cache
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  // Set cache
  private setCache(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Advanced request method with retry logic and caching
  async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(url, config);

    // Check cache for GET requests
    if (config.method === 'GET' || !config.method) {
      const cached = this.getFromCache(cacheKey);
      if (cached && config.cache !== false) {
        return cached;
      }
    }

    // Check if request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey);
    }

    const requestPromise = this.executeRequest<T>(url, config, cacheKey);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  // Execute request with retry logic
  private async executeRequest<T>(url: string, config: RequestConfig, cacheKey: string): Promise<APIResponse<T>> {
    const maxRetries = config.retries || 3;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(url, config);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        // Cache successful GET requests
        if ((config.method === 'GET' || !config.method) && config.cache !== false) {
          this.setCache(cacheKey, data);
        }

        return {
          success: true,
          data: data.data,
          message: data.message,
          meta: data.meta
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = this.retryDelays[attempt] || 16000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: lastError.message || 'Request failed after retries'
    };
  }

  // Make HTTP request
  private async makeRequest(url: string, config: RequestConfig): Promise<Response> {
    const controller = new AbortController();
    const timeout = config.timeout || 30000;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: config.method || 'GET',
        headers: {
          ...this.getDefaultHeaders(),
          ...config.headers
        },
        body: config.body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Specialized methods for different operations

  // Parent operations
  async getLinkedChildren(): Promise<APIResponse> {
    return this.request('/parent/children/linked', {
      method: 'GET',
      cache: true
    });
  }

  async getChildDetails(childId: number): Promise<APIResponse> {
    return this.request(`/parent/children/${childId}/details`, {
      method: 'GET',
      cache: true
    });
  }

  async getChildGrades(childId: number, term?: string): Promise<APIResponse> {
    const params = term ? `?term=${term}` : '';
    return this.request(`/parent/children/${childId}/grades${params}`, {
      method: 'GET',
      cache: true
    });
  }

  async getChildAttendance(childId: number, dateRange?: { start: string; end: string }): Promise<APIResponse> {
    const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
    return this.request(`/parent/children/${childId}/attendance${params}`, {
      method: 'GET',
      cache: true
    });
  }

  async getChildPayments(childId: number): Promise<APIResponse> {
    return this.request(`/parent/children/${childId}/payments`, {
      method: 'GET',
      cache: true
    });
  }

  // Payment operations
  async initiatePayment(paymentData: any): Promise<APIResponse> {
    return this.request('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async bulkInitiatePayments(paymentsData: any): Promise<APIResponse> {
    return this.request('/payments/bulk-initiate', {
      method: 'POST',
      body: JSON.stringify(paymentsData)
    });
  }

  async getPaymentStatus(paymentId: string): Promise<APIResponse> {
    return this.request(`/payments/${paymentId}/status`, {
      method: 'GET'
    });
  }

  async processPaymentCallback(callbackData: any): Promise<APIResponse> {
    return this.request('/payments/callback', {
      method: 'POST',
      body: JSON.stringify(callbackData)
    });
  }

  // SMS operations
  async sendSMS(smsData: any): Promise<APIResponse> {
    return this.request('/sms/send', {
      method: 'POST',
      body: JSON.stringify(smsData)
    });
  }

  async sendBulkSMS(bulkSMSData: any): Promise<APIResponse> {
    return this.request('/sms/bulk-send', {
      method: 'POST',
      body: JSON.stringify(bulkSMSData)
    });
  }

  // Global Student Sheets operations
  async getGlobalStudents(filters?: any): Promise<APIResponse> {
    const params = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request(`/global-student-sheets${params}`, {
      method: 'GET',
      cache: true
    });
  }

  async addStudent(studentData: any): Promise<APIResponse> {
    return this.request('/global-student-sheets', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async updateStudent(studentId: number, updateData: any): Promise<APIResponse> {
    return this.request(`/global-student-sheets/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  async deleteStudent(studentId: number): Promise<APIResponse> {
    return this.request(`/global-student-sheets/${studentId}`, {
      method: 'DELETE'
    });
  }

  async linkParent(studentId: number, parentData: any): Promise<APIResponse> {
    return this.request(`/global-student-sheets/${studentId}/link-parent`, {
      method: 'POST',
      body: JSON.stringify(parentData)
    });
  }

  async removeConductBulk(studentIds: number[], conductData: any): Promise<APIResponse> {
    return this.request('/global-student-sheets/bulk-remove-conduct', {
      method: 'POST',
      body: JSON.stringify({ studentIds, ...conductData })
    });
  }

  async removeConduct(studentId: number, conductData: any): Promise<APIResponse> {
    return this.request(`/global-student-sheets/${studentId}/remove-conduct`, {
      method: 'POST',
      body: JSON.stringify(conductData)
    });
  }

  async grantLeaveBulk(studentIds: number[], leaveData: any): Promise<APIResponse> {
    return this.request('/global-student-sheets/bulk-grant-leave', {
      method: 'POST',
      body: JSON.stringify({ studentIds, ...leaveData })
    });
  }

  async grantLeave(studentId: number, leaveData: any): Promise<APIResponse> {
    return this.request(`/global-student-sheets/${studentId}/grant-leave`, {
      method: 'POST',
      body: JSON.stringify(leaveData)
    });
  }

  async sendSMSToParents(studentIds: number[], messageData: any): Promise<APIResponse> {
    return this.request('/global-student-sheets/send-sms-parents', {
      method: 'POST',
      body: JSON.stringify({ studentIds, ...messageData })
    });
  }

  async getStudentDetails(studentId: number): Promise<APIResponse> {
    return this.request(`/global-student-sheets/${studentId}/details`, {
      method: 'GET',
      cache: true
    });
  }

  async getParentContacts(studentId: number): Promise<APIResponse> {
    return this.request(`/global-student-sheets/${studentId}/parent-contacts`, {
      method: 'GET',
      cache: true
    });
  }

  async exportStudents(filters?: any): Promise<APIResponse> {
    const params = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.request(`/global-student-sheets/export${params}`, {
      method: 'GET'
    });
  }

  // Notification operations
  async getNotifications(): Promise<APIResponse> {
    return this.request('/notifications', {
      method: 'GET',
      cache: true
    });
  }

  async markNotificationRead(notificationId: number): Promise<APIResponse> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH'
    });
  }

  // Analytics operations
  async getAnalytics(type: string, dateRange?: any): Promise<APIResponse> {
    const params = dateRange ? `?${new URLSearchParams(dateRange).toString()}` : '';
    return this.request(`/analytics/${type}${params}`, {
      method: 'GET',
      cache: true
    });
  }

  // Report operations
  async generateReport(reportType: string, params?: any): Promise<APIResponse> {
    return this.request('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ type: reportType, ...params })
    });
  }

  async getReportStatus(reportId: string): Promise<APIResponse> {
    return this.request(`/reports/${reportId}/status`, {
      method: 'GET'
    });
  }

  async downloadReport(reportId: string): Promise<APIResponse> {
    return this.request(`/reports/${reportId}/download`, {
      method: 'GET'
    });
  }

  // File management
  async uploadFile(file: File, category: string): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return this.request('/files/upload', {
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: formData as any
    });
  }

  async deleteFile(fileId: string): Promise<APIResponse> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE'
    });
  }

  // Health check
  async healthCheck(): Promise<APIResponse> {
    return this.request('/health', {
      method: 'GET',
      timeout: 5000,
      retries: 1
    });
  }

  // Batch operations
  async batchRequest(requests: Array<{ endpoint: string; config?: RequestConfig }>): Promise<APIResponse[]> {
    const promises = requests.map(req => this.request(req.endpoint, req.config));
    return Promise.all(promises);
  }

  // Real-time subscription
  subscribeToUpdates(channel: string, callback: (data: any) => void): () => void {
    const handler = (event: CustomEvent) => {
      if (event.detail.channel === channel) {
        callback(event.detail.data);
      }
    };

    window.addEventListener('realTimeUpdate', handler as EventListener);
    
    // Subscribe to channel via WebSocket
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({
        type: 'subscribe',
        channel: channel
      }));
    }

    // Return unsubscribe function
    return () => {
      window.removeEventListener('realTimeUpdate', handler as EventListener);
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({
          type: 'unsubscribe',
          channel: channel
        }));
      }
    };
  }

  // Cleanup
  destroy(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.cache.clear();
    this.requestQueue.clear();
  }
}

export default new ProductionAPIService();
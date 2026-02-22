import apiService from '@/app/services/apiService';

interface SMSProvider {
  id: string;
  name: string;
  priority: number;
  cost_per_sms: number;
  delivery_rate: number;
  api_endpoint: string;
  is_active: boolean;
}

interface SMSQueue {
  id: number;
  message_id: number;
  priority: number;
  scheduled_at: string;
  retry_count: number;
  status: 'queued' | 'processing' | 'sent' | 'failed';
}

class AdvancedSMSService {
  private providers: SMSProvider[] = [];
  private messageQueue: SMSQueue[] = [];
  private isProcessing = false;

  constructor() {
    this.initializeProviders();
    this.startQueueProcessor();
  }

  // Initialize SMS providers with real API endpoints
  private async initializeProviders() {
    try {
      const response = await apiService.request('/sms/providers/active');
      if (response.success) {
        this.providers = response.providers;
      }
    } catch (error) {
      console.error('Failed to initialize SMS providers:', error);
    }
  }

  // Advanced message sending with provider selection algorithm
  async sendMessage(messageData: any): Promise<any> {
    try {
      // Step 1: Validate and preprocess message
      const processedMessage = await this.preprocessMessage(messageData);
      
      // Step 2: Select optimal provider using algorithm
      const provider = await this.selectOptimalProvider(processedMessage);
      
      // Step 3: Queue message with priority
      const queuedMessage = await this.queueMessage(processedMessage, provider);
      
      // Step 4: Process immediately if high priority
      if (processedMessage.priority === 'urgent' || processedMessage.priority === 'high') {
        return await this.processMessageImmediately(queuedMessage);
      }
      
      return { success: true, message_id: queuedMessage.id, status: 'queued' };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Advanced message preprocessing with AI optimization
  private async preprocessMessage(messageData: any): Promise<any> {
    try {
      const response = await apiService.request('/sms/preprocess', {
        method: 'POST',
        body: JSON.stringify({
          ...messageData,
          ai_optimization: true,
          spam_check: true,
          compliance_check: true,
          character_optimization: true
        })
      });

      if (response.success) {
        return {
          ...messageData,
          optimized_message: response.optimized_message,
          estimated_cost: response.estimated_cost,
          compliance_score: response.compliance_score,
          spam_score: response.spam_score
        };
      }
      
      return messageData;
    } catch (error) {
      console.error('Message preprocessing failed:', error);
      return messageData;
    }
  }

  // Provider selection algorithm based on cost, delivery rate, and load
  private async selectOptimalProvider(messageData: any): Promise<SMSProvider> {
    try {
      const response = await apiService.request('/sms/providers/select', {
        method: 'POST',
        body: JSON.stringify({
          message_type: messageData.message_type,
          priority: messageData.priority,
          recipient_country: messageData.recipient_country,
          estimated_volume: messageData.estimated_volume
        })
      });

      if (response.success && response.provider) {
        return response.provider;
      }

      // Fallback algorithm
      return this.providers
        .filter(p => p.is_active)
        .sort((a, b) => {
          const scoreA = this.calculateProviderScore(a, messageData);
          const scoreB = this.calculateProviderScore(b, messageData);
          return scoreB - scoreA;
        })[0];
    } catch (error) {
      console.error('Provider selection failed:', error);
      return this.providers.find(p => p.is_active) || this.providers[0];
    }
  }

  // Provider scoring algorithm
  private calculateProviderScore(provider: SMSProvider, messageData: any): number {
    let score = 0;
    
    // Delivery rate weight (40%)
    score += provider.delivery_rate * 0.4;
    
    // Cost efficiency weight (30%)
    const costScore = Math.max(0, 100 - (provider.cost_per_sms * 10));
    score += costScore * 0.3;
    
    // Priority weight (20%)
    score += provider.priority * 0.2;
    
    // Load balancing weight (10%)
    const loadScore = Math.max(0, 100 - (this.getProviderLoad(provider.id) * 2));
    score += loadScore * 0.1;
    
    return score;
  }

  // Get current provider load
  private getProviderLoad(providerId: string): number {
    return this.messageQueue.filter(q => 
      q.status === 'processing' && 
      q.message_id.toString().includes(providerId)
    ).length;
  }

  // Queue message with advanced priority algorithm
  private async queueMessage(messageData: any, provider: SMSProvider): Promise<SMSQueue> {
    try {
      const response = await apiService.request('/sms/queue/add', {
        method: 'POST',
        body: JSON.stringify({
          message_data: messageData,
          provider_id: provider.id,
          priority: this.calculateMessagePriority(messageData),
          scheduled_at: messageData.scheduled_at || new Date().toISOString(),
          retry_config: {
            max_retries: 3,
            retry_delay: 30000,
            exponential_backoff: true
          }
        })
      });

      if (response.success) {
        const queueItem = response.queue_item;
        this.messageQueue.push(queueItem);
        return queueItem;
      }
      
      throw new Error('Failed to queue message');
    } catch (error) {
      console.error('Message queuing failed:', error);
      throw error;
    }
  }

  // Calculate message priority score
  private calculateMessagePriority(messageData: any): number {
    let priority = 0;
    
    switch (messageData.priority) {
      case 'urgent': priority = 100; break;
      case 'high': priority = 75; break;
      case 'normal': priority = 50; break;
      case 'low': priority = 25; break;
    }
    
    // Boost priority for certain categories
    if (messageData.category === 'emergency') priority += 25;
    if (messageData.category === 'security') priority += 20;
    if (messageData.category === 'payment') priority += 15;
    
    return Math.min(priority, 100);
  }

  // Process message immediately for high priority
  private async processMessageImmediately(queueItem: SMSQueue): Promise<any> {
    try {
      const response = await apiService.request('/sms/send/immediate', {
        method: 'POST',
        body: JSON.stringify({
          queue_id: queueItem.id,
          bypass_queue: true,
          real_time_tracking: true
        })
      });

      return response;
    } catch (error) {
      console.error('Immediate processing failed:', error);
      throw error;
    }
  }

  // Advanced queue processor with load balancing
  private startQueueProcessor() {
    setInterval(async () => {
      if (this.isProcessing) return;
      
      this.isProcessing = true;
      try {
        await this.processMessageQueue();
      } catch (error) {
        console.error('Queue processing error:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 5000); // Process every 5 seconds
  }

  // Process message queue with advanced algorithms
  private async processMessageQueue() {
    try {
      const response = await apiService.request('/sms/queue/process', {
        method: 'POST',
        body: JSON.stringify({
          batch_size: 50,
          priority_threshold: 50,
          load_balancing: true,
          cost_optimization: true
        })
      });

      if (response.success) {
        // Update local queue state
        this.messageQueue = response.updated_queue || [];
        
        // Process analytics
        if (response.analytics) {
          await this.updateAnalytics(response.analytics);
        }
      }
    } catch (error) {
      console.error('Queue processing failed:', error);
    }
  }

  // Bulk message sending with advanced batching
  async sendBulkMessages(messages: any[], options: any = {}): Promise<any> {
    try {
      const response = await apiService.request('/sms/bulk/send', {
        method: 'POST',
        body: JSON.stringify({
          messages,
          options: {
            batch_size: options.batch_size || 100,
            delay_between_batches: options.delay || 1000,
            priority_queue: options.priority_queue || false,
            cost_optimization: options.cost_optimization || true,
            load_balancing: options.load_balancing || true,
            duplicate_detection: true,
            rate_limiting: true
          }
        })
      });

      return response;
    } catch (error) {
      console.error('Bulk sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Advanced message tracking and analytics
  async trackMessage(messageId: number): Promise<any> {
    try {
      const response = await apiService.request(`/sms/track/${messageId}`, {
        method: 'GET'
      });

      if (response.success) {
        return {
          ...response.tracking_data,
          delivery_path: response.delivery_path,
          provider_response: response.provider_response,
          cost_breakdown: response.cost_breakdown,
          performance_metrics: response.performance_metrics
        };
      }
      
      return null;
    } catch (error) {
      console.error('Message tracking failed:', error);
      return null;
    }
  }

  // Real-time message status updates
  async getMessageStatus(messageId: number): Promise<string> {
    try {
      const response = await apiService.request(`/sms/status/${messageId}`, {
        method: 'GET'
      });

      return response.success ? response.status : 'unknown';
    } catch (error) {
      console.error('Status check failed:', error);
      return 'error';
    }
  }

  // Advanced retry mechanism with exponential backoff
  async retryMessage(messageId: number, options: any = {}): Promise<any> {
    try {
      const response = await apiService.request(`/sms/retry/${messageId}`, {
        method: 'POST',
        body: JSON.stringify({
          retry_options: {
            force_retry: options.force || false,
            change_provider: options.change_provider || true,
            increase_priority: options.increase_priority || false,
            exponential_backoff: true,
            max_delay: 300000 // 5 minutes max delay
          }
        })
      });

      return response;
    } catch (error) {
      console.error('Message retry failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Template management with AI optimization
  async createTemplate(templateData: any): Promise<any> {
    try {
      const response = await apiService.request('/sms/templates/create', {
        method: 'POST',
        body: JSON.stringify({
          ...templateData,
          ai_optimization: true,
          variable_extraction: true,
          compliance_check: true,
          multi_language_support: true,
          usage_analytics: true
        })
      });

      return response;
    } catch (error) {
      console.error('Template creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Campaign management with advanced targeting
  async createCampaign(campaignData: any): Promise<any> {
    try {
      const response = await apiService.request('/sms/campaigns/create', {
        method: 'POST',
        body: JSON.stringify({
          ...campaignData,
          advanced_targeting: true,
          a_b_testing: true,
          auto_optimization: true,
          real_time_analytics: true,
          budget_management: true,
          compliance_check: true
        })
      });

      return response;
    } catch (error) {
      console.error('Campaign creation failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Contact management with intelligent grouping
  async manageContacts(action: string, contactData: any): Promise<any> {
    try {
      const response = await apiService.request('/sms/contacts/manage', {
        method: 'POST',
        body: JSON.stringify({
          action,
          contact_data: contactData,
          intelligent_grouping: true,
          duplicate_detection: true,
          preference_management: true,
          gdpr_compliance: true
        })
      });

      return response;
    } catch (error) {
      console.error('Contact management failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Advanced analytics and reporting
  async getAnalytics(timeframe: string = '24h'): Promise<any> {
    try {
      const response = await apiService.request('/sms/analytics/advanced', {
        method: 'POST',
        body: JSON.stringify({
          timeframe,
          metrics: [
            'delivery_rate',
            'read_rate',
            'response_rate',
            'cost_analysis',
            'provider_performance',
            'campaign_effectiveness',
            'user_engagement',
            'geographic_distribution'
          ],
          real_time: true,
          predictive_analysis: true
        })
      });

      return response;
    } catch (error) {
      console.error('Analytics fetch failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Update analytics data
  private async updateAnalytics(analyticsData: any) {
    try {
      await apiService.request('/sms/analytics/update', {
        method: 'POST',
        body: JSON.stringify(analyticsData)
      });
    } catch (error) {
      console.error('Analytics update failed:', error);
    }
  }

  // Real-time message delivery webhook handler
  async handleDeliveryWebhook(webhookData: any): Promise<void> {
    try {
      await apiService.request('/sms/webhook/delivery', {
        method: 'POST',
        body: JSON.stringify({
          webhook_data: webhookData,
          update_analytics: true,
          trigger_notifications: true,
          update_contact_status: true
        })
      });
    } catch (error) {
      console.error('Webhook handling failed:', error);
    }
  }

  // Advanced message scheduling with timezone support
  async scheduleMessage(messageData: any, scheduleOptions: any): Promise<any> {
    try {
      const response = await apiService.request('/sms/schedule', {
        method: 'POST',
        body: JSON.stringify({
          message_data: messageData,
          schedule_options: {
            ...scheduleOptions,
            timezone_support: true,
            optimal_timing: true,
            recipient_preferences: true,
            load_balancing: true
          }
        })
      });

      return response;
    } catch (error) {
      console.error('Message scheduling failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Cost optimization algorithms
  async optimizeCosts(campaignId?: number): Promise<any> {
    try {
      const response = await apiService.request('/sms/optimize/costs', {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: campaignId,
          optimization_strategies: [
            'provider_selection',
            'message_batching',
            'timing_optimization',
            'route_optimization',
            'volume_discounts'
          ]
        })
      });

      return response;
    } catch (error) {
      console.error('Cost optimization failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Compliance and regulatory checks
  async checkCompliance(messageData: any): Promise<any> {
    try {
      const response = await apiService.request('/sms/compliance/check', {
        method: 'POST',
        body: JSON.stringify({
          message_data: messageData,
          compliance_rules: [
            'gdpr',
            'tcpa',
            'spam_regulations',
            'content_guidelines',
            'opt_out_requirements'
          ]
        })
      });

      return response;
    } catch (error) {
      console.error('Compliance check failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const smsService = new AdvancedSMSService();
export default smsService;
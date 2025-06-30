import { supabase } from './supabase';
import { blockchainService } from './blockchain';

export interface ApiKey {
  id: string;
  userId: string;
  keyHash: string;
  name: string;
  permissions: string[];
  rateLimit: number;
  usageCount: number;
  lastUsed: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface RateLimitConfig {
  basic: { requests: number; window: number };
  pro: { requests: number; window: number };
  premium: { requests: number; window: number };
}

export class ApiUtilities {
  private rateLimits: RateLimitConfig = {
    basic: { requests: 100, window: 3600 },
    pro: { requests: 1000, window: 3600 },
    premium: { requests: 10000, window: 3600 }
  };

  // API Key Management
  async generateApiKey(userId: string, name: string, permissions: string[]): Promise<string> {
    const apiKey = this.generateSecureKey();
    const keyHash = await this.hashApiKey(apiKey);

    const { error } = await supabase
      .from('api_keys')
      .insert({
        user_id: userId,
        key_hash: keyHash,
        name,
        permissions,
        rate_limit: await this.getRateLimitForUser(userId),
        is_active: true
      });

    if (error) throw error;
    return apiKey;
  }

  async validateApiKey(apiKey: string): Promise<{ valid: boolean; userId?: string; permissions?: string[] }> {
    const keyHash = await this.hashApiKey(apiKey);
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('user_id, permissions, is_active, rate_limit, usage_count, last_used')
      .eq('key_hash', keyHash)
      .single();

    if (error || !data || !data.is_active) {
      return { valid: false };
    }

    // Check rate limiting
    const rateLimitPassed = await this.checkRateLimit(keyHash, data.rate_limit);
    if (!rateLimitPassed) {
      return { valid: false };
    }

    // Update usage
    await this.updateApiKeyUsage(keyHash);

    return {
      valid: true,
      userId: data.user_id,
      permissions: data.permissions
    };
  }

  async checkUserPlan(userId: string): Promise<string> {
    const { data, error } = await supabase
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.plan || 'basic';
  }

  // Blockchain Utilities
  async deployContract(userId: string, contractType: string, params: any): Promise<any> {
    const plan = await this.checkUserPlan(userId);
    if (plan === 'basic') {
      throw new Error('Contract deployment requires Pro or Premium plan');
    }

    try {
      const result = await blockchainService.createInvoice(params);
      
      // Log deployment
      await supabase
        .from('contract_deployments')
        .insert({
          user_id: userId,
          contract_type: contractType,
          contract_address: result.invoiceHash,
          transaction_hash: result.hash,
          network: blockchainService.getCurrentNetwork(),
          parameters: params
        });

      return result;
    } catch (error) {
      console.error('Contract deployment failed:', error);
      throw error;
    }
  }

  async getContractStatus(contractAddress: string): Promise<any> {
    try {
      const details = await blockchainService.getInvoiceDetails(contractAddress);
      const isOverdue = await blockchainService.isInvoiceOverdue(contractAddress);
      
      return {
        ...details,
        isOverdue,
        explorerUrl: blockchainService.getExplorerUrl(contractAddress)
      };
    } catch (error) {
      console.error('Failed to get contract status:', error);
      throw error;
    }
  }

  async estimateGasCost(operation: string, params: any): Promise<string> {
    try {
      return await blockchainService.getGasEstimate(operation, params);
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return '0';
    }
  }

  // Invoice Management Utilities
  async createInvoiceWithContract(userId: string, invoiceData: any): Promise<any> {
    const plan = await this.checkUserPlan(userId);
    
    // Check invoice limits
    const limits = this.getInvoiceLimits(plan);
    const currentCount = await this.getUserInvoiceCount(userId);
    
    if (currentCount >= limits.monthly && plan !== 'premium') {
      throw new Error(`Monthly invoice limit reached (${limits.monthly})`);
    }

    try {
      // Create invoice in database
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          user_email: userId,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      // Deploy smart contract if Pro/Premium
      if (plan !== 'basic') {
        const contractResult = await this.deployContract(userId, 'invoice', {
          invoiceId: invoice.invoice_number,
          recipient: invoiceData.recipient_email,
          amount: invoiceData.amount.toString(),
          dueDate: Math.floor(new Date(invoiceData.due_date).getTime() / 1000),
          description: invoiceData.description
        });

        // Update invoice with contract details
        await supabase
          .from('invoices')
          .update({
            smart_contract_address: contractResult.invoiceHash,
            blockchain_tx_hash: contractResult.hash
          })
          .eq('id', invoice.id);

        invoice.smart_contract_address = contractResult.invoiceHash;
        invoice.blockchain_tx_hash = contractResult.hash;
      }

      return invoice;
    } catch (error) {
      console.error('Invoice creation failed:', error);
      throw error;
    }
  }

  async processPayment(invoiceId: string, paymentData: any): Promise<any> {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.smart_contract_address) {
      // Process blockchain payment
      try {
        const txHash = await blockchainService.payInvoice(
          invoice.smart_contract_address,
          invoice.amount.toString()
        );

        await supabase
          .from('invoices')
          .update({
            status: 'paid',
            blockchain_tx_hash: txHash
          })
          .eq('id', invoiceId);

        return { success: true, transactionHash: txHash };
      } catch (error) {
        console.error('Blockchain payment failed:', error);
        throw error;
      }
    } else {
      // Process traditional payment
      await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoiceId);

      return { success: true };
    }
  }

  // Analytics and Reporting
  async getInvoiceAnalytics(userId: string, timeframe: string = '30d'): Promise<any> {
    const plan = await this.checkUserPlan(userId);
    if (plan === 'basic') {
      throw new Error('Analytics requires Pro or Premium plan');
    }

    const startDate = this.getStartDate(timeframe);
    
    const { data, error } = await supabase
      .from('invoices')
      .select('amount, status, created_at, due_date')
      .eq('user_email', userId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    return this.processAnalyticsData(data || []);
  }

  async exportInvoiceData(userId: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
    const plan = await this.checkUserPlan(userId);
    if (plan === 'basic') {
      throw new Error('Data export requires Pro or Premium plan');
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_email', userId);

    if (error) throw error;

    if (format === 'csv') {
      return this.convertToCSV(data || []);
    } else {
      return JSON.stringify(data, null, 2);
    }
  }

  // Webhook Management
  async createWebhook(userId: string, url: string, events: string[]): Promise<string> {
    const plan = await this.checkUserPlan(userId);
    if (plan === 'basic') {
      throw new Error('Webhooks require Pro or Premium plan');
    }

    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        user_id: userId,
        url,
        events,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  async triggerWebhook(userId: string, event: string, payload: any): Promise<void> {
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('url, events')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error || !webhooks) return;

    const relevantWebhooks = webhooks.filter(w => w.events.includes(event));

    for (const webhook of relevantWebhooks) {
      try {
        await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-TrustInvoice-Event': event
          },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error('Webhook delivery failed:', error);
      }
    }
  }

  // Helper Methods
  private generateSecureKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ti_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async hashApiKey(apiKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async getRateLimitForUser(userId: string): Promise<number> {
    const plan = await this.checkUserPlan(userId);
    return this.rateLimits[plan as keyof RateLimitConfig]?.requests || 100;
  }

  private async checkRateLimit(keyHash: string, limit: number): Promise<boolean> {
    const windowStart = new Date(Date.now() - 3600000); // 1 hour ago
    
    const { count, error } = await supabase
      .from('api_usage')
      .select('*', { count: 'exact', head: true })
      .eq('key_hash', keyHash)
      .gte('created_at', windowStart.toISOString());

    if (error) return false;
    
    const currentUsage = count || 0;
    return currentUsage < limit;
  }

  private async updateApiKeyUsage(keyHash: string): Promise<void> {
    await supabase.rpc('increment_usage', { key_hash: keyHash });

    await supabase
      .from('api_usage')
      .insert({ key_hash: keyHash });
  }

  private getInvoiceLimits(plan: string): { monthly: number } {
    const limits = {
      basic: { monthly: 10 },
      pro: { monthly: 100 },
      premium: { monthly: Infinity }
    };
    return limits[plan as keyof typeof limits] || limits.basic;
  }

  private async getUserInvoiceCount(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (error) return 0;
    return count || 0;
  }

  private getStartDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private processAnalyticsData(data: any[]): any {
    const totalAmount = data.reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0);
    const paidInvoices = data.filter(invoice => invoice.status === 'paid');
    const overdueInvoices = data.filter(invoice => 
      invoice.status !== 'paid' && new Date(invoice.due_date) < new Date()
    );

    return {
      totalInvoices: data.length,
      totalAmount,
      paidAmount: paidInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0),
      paidCount: paidInvoices.length,
      overdueCount: overdueInvoices.length,
      averageAmount: totalAmount / data.length || 0,
      paymentRate: (paidInvoices.length / data.length) * 100 || 0
    };
  }

  private convertToCSV(data: any[]): string {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }
}

export const apiUtilities = new ApiUtilities();
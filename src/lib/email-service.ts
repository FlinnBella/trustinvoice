import { supabase } from './supabase';

export interface EmailRequest {
  type: 'invoice_created' | 'payment_received' | 'payment_overdue' | 'contract_deployed';
  recipientEmail: string;
  senderEmail: string;
  invoiceData: {
    invoiceNumber: string;
    amount: number;
    description: string;
    companyName: string;
    dueDate: string;
    pdfUrl?: string;
    contractAddress?: string;
    transactionHash?: string;
    paymentLink?: string;
  };
  userPlan: string;
}

export interface EmailAnalytics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  openRate: number;
  clickRate: number;
  deliveryRate: number;
}

export class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(request: EmailRequest): Promise<{ success: boolean; emailId?: string; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-service`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }

      const result = await response.json();
      return { success: true, emailId: result.emailId };
    } catch (error) {
      console.error('Email service error:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  async sendInvoiceCreatedEmail(
    recipientEmail: string,
    senderEmail: string,
    invoiceData: EmailRequest['invoiceData'],
    userPlan: string = 'basic'
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    return this.sendEmail({
      type: 'invoice_created',
      recipientEmail,
      senderEmail,
      invoiceData,
      userPlan,
    });
  }

  async sendPaymentReceivedEmail(
    recipientEmail: string,
    senderEmail: string,
    invoiceData: EmailRequest['invoiceData'],
    userPlan: string = 'basic'
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    return this.sendEmail({
      type: 'payment_received',
      recipientEmail,
      senderEmail,
      invoiceData,
      userPlan,
    });
  }

  async sendPaymentOverdueEmail(
    recipientEmail: string,
    senderEmail: string,
    invoiceData: EmailRequest['invoiceData'],
    userPlan: string = 'basic'
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    return this.sendEmail({
      type: 'payment_overdue',
      recipientEmail,
      senderEmail,
      invoiceData,
      userPlan,
    });
  }

  async sendContractDeployedEmail(
    recipientEmail: string,
    senderEmail: string,
    invoiceData: EmailRequest['invoiceData'],
    userPlan: string = 'basic'
  ): Promise<{ success: boolean; emailId?: string; error?: string }> {
    return this.sendEmail({
      type: 'contract_deployed',
      recipientEmail,
      senderEmail,
      invoiceData,
      userPlan,
    });
  }

  async getEmailAnalytics(userEmail: string, timeframe: string = '30d'): Promise<EmailAnalytics> {
    try {
      const startDate = this.getStartDate(timeframe);
      
      const { data, error } = await supabase
        .from('email_logs')
        .select('status, open_count, click_count')
        .eq('sender', userEmail)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const totalSent = data.length;
      const delivered = data.filter(log => ['delivered', 'opened', 'clicked'].includes(log.status)).length;
      const opened = data.filter(log => log.open_count > 0).length;
      const clicked = data.filter(log => log.click_count > 0).length;
      const bounced = data.filter(log => log.status === 'bounced').length;

      return {
        totalSent,
        delivered,
        opened,
        clicked,
        bounced,
        openRate: totalSent > 0 ? (opened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (clicked / totalSent) * 100 : 0,
        deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
      };
    } catch (error) {
      console.error('Failed to get email analytics:', error);
      return {
        totalSent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        openRate: 0,
        clickRate: 0,
        deliveryRate: 0,
      };
    }
  }

  async getEmailLogs(userEmail: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('sender', userEmail)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get email logs:', error);
      return [];
    }
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
}

export const emailService = EmailService.getInstance();
/*
  # Resend Email Service with PDF Attachments
  
  Comprehensive email service using Resend API with PDF generation and attachment support.
  Handles all invoice-related email communications with professional templates.
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
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
    pdfDataUrl?: string;
    contractAddress?: string;
    transactionHash?: string;
    paymentLink?: string;
  };
  userPlan: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const emailRequest: EmailRequest = await req.json();
    
    // Validate email addresses
    if (!isValidEmail(emailRequest.recipientEmail) || !isValidEmail(emailRequest.senderEmail)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check plan permissions
    const canSendEmail = checkPlanPermissions(emailRequest.userPlan, emailRequest.type);
    if (!canSendEmail) {
      return new Response(
        JSON.stringify({ error: 'Email feature not available in current plan' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Generate email content based on type
    const emailContent = await generateEmailContent(emailRequest);
    
    // Send email via Resend
    const emailResult = await sendEmailWithResend(emailContent);
    
    if (!emailResult.success) {
      // Retry logic for failed emails
      await new Promise(resolve => setTimeout(resolve, 2000));
      const retryResult = await sendEmailWithResend(emailContent);
      
      if (!retryResult.success) {
        // Log failure to Supabase
        await logEmailFailure(supabaseClient, emailRequest, retryResult.error);
        return new Response(
          JSON.stringify({ error: 'Email delivery failed after retry' }),
          { status: 500, headers: corsHeaders }
        );
      }
      
      emailResult.emailId = retryResult.emailId;
    }

    // Log successful email
    await logEmailSuccess(supabaseClient, emailRequest, emailResult.emailId);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResult.emailId,
        message: 'Email sent successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Email service error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function checkPlanPermissions(plan: string, emailType: string): boolean {
  const planPermissions = {
    basic: ['invoice_created'],
    pro: ['invoice_created', 'payment_received', 'payment_overdue'],
    premium: ['invoice_created', 'payment_received', 'payment_overdue', 'contract_deployed']
  };
  
  return planPermissions[plan as keyof typeof planPermissions]?.includes(emailType) || false;
}

async function generateEmailContent(request: EmailRequest) {
  const { type, recipientEmail, senderEmail, invoiceData, userPlan } = request;
  
  const baseTemplate = getBaseTemplate(userPlan);
  let subject = '';
  let content = '';
  let attachments: any[] = [];

  // Add PDF attachment if available
  if (invoiceData.pdfDataUrl) {
    const base64Data = invoiceData.pdfDataUrl.split(',')[1];
    attachments.push({
      filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
      content: base64Data,
      type: 'application/pdf',
      disposition: 'attachment'
    });
  }

  switch (type) {
    case 'invoice_created':
      subject = `Invoice ${invoiceData.invoiceNumber} from ${invoiceData.companyName}`;
      content = generateInvoiceCreatedContent(invoiceData);
      break;
    
    case 'payment_received':
      subject = `Payment Received - Invoice ${invoiceData.invoiceNumber}`;
      content = generatePaymentReceivedContent(invoiceData);
      break;
    
    case 'payment_overdue':
      subject = `Payment Overdue - Invoice ${invoiceData.invoiceNumber}`;
      content = generatePaymentOverdueContent(invoiceData);
      break;
    
    case 'contract_deployed':
      subject = `Smart Contract Deployed - Invoice ${invoiceData.invoiceNumber}`;
      content = generateContractDeployedContent(invoiceData);
      break;
  }

  return {
    from: 'TrustInvoice <invoices@trustinvoice.com>',
    to: [recipientEmail],
    reply_to: senderEmail,
    subject,
    html: baseTemplate.replace('{{CONTENT}}', content),
    attachments,
    tags: [
      { name: 'category', value: type },
      { name: 'plan', value: userPlan },
      { name: 'invoice', value: invoiceData.invoiceNumber }
    ]
  };
}

function getBaseTemplate(plan: string): string {
  const isPremium = plan === 'premium';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TrustInvoice</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background-color: #f8fafc;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
          background: ${isPremium ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'}; 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .logo { 
          font-size: 32px; 
          margin-bottom: 10px; 
        }
        .header h1 { 
          font-size: 28px; 
          margin-bottom: 8px; 
          font-weight: 600;
        }
        .header p { 
          opacity: 0.9; 
          font-size: 16px; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .footer { 
          background: #f1f5f9; 
          padding: 25px 30px; 
          text-align: center; 
          border-top: 1px solid #e2e8f0;
        }
        .footer p { 
          color: #64748b; 
          font-size: 14px; 
          margin-bottom: 10px;
        }
        .btn { 
          display: inline-block; 
          padding: 15px 30px; 
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .btn:hover { 
          transform: translateY(-2px); 
        }
        .info-box { 
          background: #f8fafc; 
          border: 1px solid #e2e8f0; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .blockchain-info { 
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); 
          border: 1px solid #bbf7d0; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0; 
        }
        .blockchain-info h3 { 
          color: #059669; 
          margin-bottom: 10px; 
        }
        .code { 
          font-family: 'Courier New', monospace; 
          background: #1f2937; 
          color: #f9fafb; 
          padding: 3px 6px; 
          border-radius: 4px; 
          font-size: 12px;
          word-break: break-all;
        }
        .amount { 
          font-size: 32px; 
          font-weight: bold; 
          color: #1e40af; 
          text-align: center; 
          margin: 20px 0; 
        }
        .status-badge { 
          display: inline-block; 
          padding: 6px 12px; 
          border-radius: 20px; 
          font-size: 12px; 
          font-weight: 600; 
          text-transform: uppercase; 
        }
        .status-success { 
          background: #dcfce7; 
          color: #166534; 
        }
        .status-warning { 
          background: #fef3c7; 
          color: #92400e; 
        }
        .status-error { 
          background: #fee2e2; 
          color: #991b1b; 
        }
        @media (max-width: 600px) {
          .container { margin: 10px; }
          .content { padding: 30px 20px; }
          .header { padding: 25px 20px; }
          .amount { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛡️</div>
          <h1>TrustInvoice</h1>
          <p>Secure Blockchain Invoicing</p>
        </div>
        <div class="content">
          {{CONTENT}}
        </div>
        <div class="footer">
          <p>This email was sent by TrustInvoice - Secure blockchain-powered invoicing</p>
          <p>© 2024 TrustInvoice. All rights reserved.</p>
          ${isPremium ? '<p style="color: #8b5cf6; font-weight: 600;">Premium Account</p>' : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateInvoiceCreatedContent(data: any): string {
  return `
    <h2 style="color: #1e40af; margin-bottom: 20px;">New Invoice Received</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      You have received a new invoice from <strong>${data.companyName}</strong>.
    </p>
    
    <div class="info-box">
      <h3 style="margin-bottom: 15px; color: #374151;">Invoice Details</h3>
      <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
      <p><strong>Description:</strong> ${data.description}</p>
      <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
      <div class="amount">$${data.amount.toFixed(2)}</div>
    </div>

    ${data.contractAddress ? `
    <div class="blockchain-info">
      <h3>🔗 Blockchain Security</h3>
      <p>This invoice is secured by a smart contract on the blockchain:</p>
      <p><strong>Contract Address:</strong> <span class="code">${data.contractAddress}</span></p>
      ${data.transactionHash ? `<p><strong>Transaction Hash:</strong> <span class="code">${data.transactionHash}</span></p>` : ''}
      <p style="margin-top: 10px; font-style: italic;">This ensures the invoice is tamper-proof and payment terms are automatically enforced.</p>
    </div>
    ` : ''}

    <div style="text-align: center; margin: 30px 0;">
      ${data.paymentLink ? `
      <a href="${data.paymentLink}" class="btn">Pay Invoice Securely</a>
      ` : `
      <a href="#" class="btn">View Invoice Details</a>
      `}
    </div>

    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
      Please review the attached PDF invoice and make payment by the due date to avoid any late fees.
    </p>
  `;
}

function generatePaymentReceivedContent(data: any): string {
  return `
    <h2 style="color: #059669; margin-bottom: 20px;">Payment Received! 🎉</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Great news! Payment has been received for invoice <strong>${data.invoiceNumber}</strong>.
    </p>
    
    <div class="info-box">
      <h3 style="margin-bottom: 15px; color: #374151;">Payment Details</h3>
      <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
      <p><strong>Amount Paid:</strong> <span style="color: #059669; font-weight: bold;">$${data.amount.toFixed(2)}</span></p>
      <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
      <div style="margin-top: 15px;">
        <span class="status-badge status-success">Paid</span>
      </div>
    </div>

    ${data.transactionHash ? `
    <div class="blockchain-info">
      <h3>🔗 Blockchain Confirmation</h3>
      <p>Payment has been confirmed on the blockchain:</p>
      <p><strong>Transaction Hash:</strong> <span class="code">${data.transactionHash}</span></p>
      <p style="margin-top: 10px; font-style: italic;">This payment is now permanently recorded and cannot be reversed.</p>
    </div>
    ` : ''}

    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
      Thank you for your prompt payment. A receipt has been generated and is available in your account.
    </p>
  `;
}

function generatePaymentOverdueContent(data: any): string {
  const daysOverdue = Math.floor((Date.now() - new Date(data.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  
  return `
    <h2 style="color: #dc2626; margin-bottom: 20px;">Payment Overdue Notice</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      This is a friendly reminder that payment for invoice <strong>${data.invoiceNumber}</strong> is now overdue.
    </p>
    
    <div class="info-box" style="border-color: #fca5a5; background: #fef2f2;">
      <h3 style="margin-bottom: 15px; color: #dc2626;">Overdue Invoice Details</h3>
      <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
      <p><strong>Original Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
      <p><strong>Days Overdue:</strong> <span style="color: #dc2626; font-weight: bold;">${daysOverdue} days</span></p>
      <div class="amount" style="color: #dc2626;">$${data.amount.toFixed(2)}</div>
      <div style="margin-top: 15px;">
        <span class="status-badge status-error">Overdue</span>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      ${data.paymentLink ? `
      <a href="${data.paymentLink}" class="btn" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">Pay Now to Avoid Fees</a>
      ` : `
      <a href="#" class="btn" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">Pay Now</a>
      `}
    </div>

    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
      Please make payment as soon as possible to avoid additional late fees. If you have any questions or need to discuss payment terms, please contact us immediately.
    </p>
  `;
}

function generateContractDeployedContent(data: any): string {
  return `
    <h2 style="color: #7c3aed; margin-bottom: 20px;">Smart Contract Deployed Successfully</h2>
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your invoice <strong>${data.invoiceNumber}</strong> has been secured with a smart contract on the Algorand blockchain.
    </p>
    
    <div class="info-box">
      <h3 style="margin-bottom: 15px; color: #374151;">Invoice Details</h3>
      <p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>
      <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
      <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
    </div>

    <div class="blockchain-info">
      <h3>🔗 Algorand Smart Contract Information</h3>
      <p>Your invoice is now protected by blockchain technology:</p>
      <p><strong>Contract Address:</strong> <span class="code">${data.contractAddress}</span></p>
      <p><strong>Deployment Transaction:</strong> <span class="code">${data.transactionHash}</span></p>
      <p style="margin-top: 10px; font-style: italic;">
        This smart contract will automatically handle payment processing, escrow, and dispute resolution according to your invoice terms.
      </p>
    </div>

    <div style="background: #ede9fe; border: 1px solid #c4b5fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #7c3aed; margin-bottom: 10px;">What happens next?</h3>
      <ul style="margin-left: 20px; color: #374151;">
        <li>The invoice has been sent to the recipient</li>
        <li>Payment will be automatically processed when received</li>
        <li>You'll be notified of any payment activity</li>
        <li>Funds will be released according to contract terms</li>
      </ul>
    </div>

    <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
      You can track the status of your smart contract and payments in your TrustInvoice dashboard.
    </p>
  `;
}

async function sendEmailWithResend(emailContent: any) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: errorData };
    }

    const result = await response.json();
    return { success: true, emailId: result.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function logEmailSuccess(supabase: any, request: EmailRequest, emailId: string) {
  try {
    await supabase
      .from('email_logs')
      .insert({
        email_id: emailId,
        type: request.type,
        recipient: request.recipientEmail,
        sender: request.senderEmail,
        invoice_number: request.invoiceData.invoiceNumber,
        status: 'sent',
        plan: request.userPlan,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log email success:', error);
  }
}

async function logEmailFailure(supabase: any, request: EmailRequest, error: string) {
  try {
    await supabase
      .from('email_logs')
      .insert({
        type: request.type,
        recipient: request.recipientEmail,
        sender: request.senderEmail,
        invoice_number: request.invoiceData.invoiceNumber,
        status: 'failed',
        error_message: error,
        plan: request.userPlan,
        created_at: new Date().toISOString()
      });
  } catch (logError) {
    console.error('Failed to log email failure:', logError);
  }
}
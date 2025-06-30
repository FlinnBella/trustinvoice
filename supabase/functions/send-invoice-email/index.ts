/*
  # Send Invoice Email with Smart Contract Integration
  
  This edge function sends invoice emails via Resend and updates
  the Algorand smart contract to mark the invoice as "sent".
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  recipientEmail: string;
  invoiceData: {
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    companyName: string;
    applicationId?: number;
    accountMnemonic?: string;
  };
  pdfUrl: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, invoiceData, pdfUrl }: EmailRequest = await req.json();
    
    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Prepare email content
    const emailContent = {
      from: 'TrustInvoice <noreply@trustinvoice.com>',
      to: recipientEmail,
      subject: `Invoice ${invoiceData.invoiceNumber} from ${invoiceData.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Invoice from ${invoiceData.companyName}</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</p>
            <p><strong>Amount:</strong> $${invoiceData.amount.toFixed(2)}</p>
            <p><strong>Due Date:</strong> ${new Date(invoiceData.dueDate).toLocaleDateString()}</p>
          </div>
          
          <p>Please find your invoice attached. You can pay securely through our platform.</p>
          
          ${invoiceData.applicationId ? `
            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #059669;">
                🔗 <strong>Blockchain Verified:</strong> This invoice is secured on the Algorand blockchain.
                <br>
                <small>Application ID: ${invoiceData.applicationId}</small>
              </p>
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Powered by TrustInvoice - Secure, blockchain-verified invoicing
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
          content: pdfUrl
        }
      ]
    };

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      throw new Error(`Email sending failed: ${errorData}`);
    }

    const emailResult = await emailResponse.json();

    // Update smart contract if application ID and mnemonic are provided
    let contractUpdateResult: { success: boolean; transactionId?: string; round?: number; status?: string; timestamp?: string; explorerUrl?: string; error?: string } | null = null;
    if (invoiceData.applicationId && invoiceData.accountMnemonic) {
      try {
        const algosdk = await import('https://esm.sh/algosdk@2.7.0');
        
        // Configure Algorand client
        const algodClient = new algosdk.Algodv2(
          '',
          'https://testnet-api.4160.nodely.dev',
          443
        );

        // Restore account
        const account = algosdk.mnemonicToSecretKey(invoiceData.accountMnemonic);
        
        // Get suggested parameters
        const suggestedParams = await algodClient.getTransactionParams().do();
        
        // Create application call to mark as sent
        const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          from: account.addr,
          appIndex: invoiceData.applicationId,
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          appArgs: [new Uint8Array(Buffer.from('mark_sent'))],
          suggestedParams,
          note: new Uint8Array(Buffer.from(`Invoice ${invoiceData.invoiceNumber} sent via email`))
        });
        
        // Sign and send transaction
        const signedTxn = appCallTxn.signTxn(account.sk);
        const txResponse = await algodClient.sendRawTransaction(signedTxn).do();
        
        // Wait for confirmation
        const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txResponse.txId, 4);
        
        contractUpdateResult = {
          success: true,
          transactionId: txResponse.txId,
          round: confirmedTxn['confirmed-round'],
          status: 'sent',
          timestamp: new Date().toISOString(),
          explorerUrl: `https://testnet.algoexplorer.io/tx/${txResponse.txId}`
        };
        
      } catch (contractError: any) {
        console.error('Smart contract update failed:', contractError);
        contractUpdateResult = {
          success: false,
          error: contractError.message
        };
      }
    }

    const response = {
      success: true,
      emailId: emailResult.id,
      recipientEmail,
      invoiceNumber: invoiceData.invoiceNumber,
      sentAt: new Date().toISOString(),
      smartContract: contractUpdateResult,
      message: 'Invoice email sent successfully' + (contractUpdateResult?.success ? ' and smart contract updated' : '')
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending invoice email:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
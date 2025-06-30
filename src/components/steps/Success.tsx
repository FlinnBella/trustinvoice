import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Mail, ExternalLink, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { emailService } from '../../lib/email-service';
import { pdfGenerator } from '../../lib/pdf-generator';
import { useToast } from '../../hooks/useToast';
import { InvoiceData } from '../../types';

interface SuccessProps {
  onStartNew: () => void;
  invoiceId: string;
  invoiceData?: {
    recipientEmail: string;
    userEmail: string;
    invoiceNumber: string;
    amount: number;
    description: string;
    companyName: string;
    dueDate: string;
    contractAddress?: string;
    transactionHash?: string;
  };
  userPlan?: string;
}

export const Success: React.FC<SuccessProps> = ({ 
  onStartNew, 
  invoiceId, 
  invoiceData,
  userPlan = 'basic'
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    // Auto-generate PDF and send email when component mounts
    if (invoiceData) {
      handleAutoProcessing();
    }
  }, [invoiceData]);

  const handleAutoProcessing = async () => {
    if (!invoiceData) return;

    try {
      // Generate PDF first
      setIsGeneratingPDF(true);
      const fullInvoiceData: InvoiceData = {
        id: invoiceId,
        userEmail: invoiceData.userEmail,
        recipientEmail: invoiceData.recipientEmail,
        amount: invoiceData.amount,
        description: invoiceData.description,
        dueDate: invoiceData.dueDate,
        invoiceNumber: invoiceData.invoiceNumber,
        companyName: invoiceData.companyName,
        companyAddress: '',
        items: [
          {
            description: invoiceData.description,
            quantity: 1,
            rate: invoiceData.amount,
            amount: invoiceData.amount
          }
        ],
        status: 'sent',
        smart_contract_address: invoiceData.contractAddress,
        blockchain_tx_hash: invoiceData.transactionHash
      };

      const pdfDataUrl = await pdfGenerator.getPDFDataURL(fullInvoiceData);
      setPdfGenerated(true);
      setIsGeneratingPDF(false);

      // Send email with PDF attachment
      setIsSendingEmail(true);
      const result = await emailService.sendInvoiceCreatedEmail(
        invoiceData.recipientEmail,
        invoiceData.userEmail,
        {
          invoiceNumber: invoiceData.invoiceNumber,
          amount: invoiceData.amount,
          description: invoiceData.description,
          companyName: invoiceData.companyName,
          dueDate: invoiceData.dueDate,
          contractAddress: invoiceData.contractAddress,
          transactionHash: invoiceData.transactionHash,
          paymentLink: `${window.location.origin}/pay/${invoiceId}`,
          pdfDataUrl: pdfDataUrl
        },
        userPlan
      );

      setIsSendingEmail(false);

      if (result.success) {
        setEmailSent(true);
        success('Email Sent', 'Invoice email sent successfully with PDF attachment');
      } else {
        error('Email Failed', result.error || 'Failed to send email');
      }
    } catch (err) {
      console.error('Auto-processing failed:', err);
      setIsGeneratingPDF(false);
      setIsSendingEmail(false);
      error('Processing Failed', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoiceData) return;

    try {
      const fullInvoiceData: InvoiceData = {
        id: invoiceId,
        userEmail: invoiceData.userEmail,
        recipientEmail: invoiceData.recipientEmail,
        amount: invoiceData.amount,
        description: invoiceData.description,
        dueDate: invoiceData.dueDate,
        invoiceNumber: invoiceData.invoiceNumber,
        companyName: invoiceData.companyName,
        companyAddress: '',
        items: [
          {
            description: invoiceData.description,
            quantity: 1,
            rate: invoiceData.amount,
            amount: invoiceData.amount
          }
        ],
        status: 'sent',
        smart_contract_address: invoiceData.contractAddress,
        blockchain_tx_hash: invoiceData.transactionHash
      };

      await pdfGenerator.downloadPDF(fullInvoiceData);
      success('PDF Downloaded', 'Invoice PDF downloaded successfully');
    } catch (err) {
      console.error('PDF download failed:', err);
      error('Download Failed', 'Failed to download PDF');
    }
  };

  const handleResendEmail = async () => {
    if (!invoiceData) return;

    try {
      setIsSendingEmail(true);
      
      const fullInvoiceData: InvoiceData = {
        id: invoiceId,
        userEmail: invoiceData.userEmail,
        recipientEmail: invoiceData.recipientEmail,
        amount: invoiceData.amount,
        description: invoiceData.description,
        dueDate: invoiceData.dueDate,
        invoiceNumber: invoiceData.invoiceNumber,
        companyName: invoiceData.companyName,
        companyAddress: '',
        items: [
          {
            description: invoiceData.description,
            quantity: 1,
            rate: invoiceData.amount,
            amount: invoiceData.amount
          }
        ],
        status: 'sent',
        smart_contract_address: invoiceData.contractAddress,
        blockchain_tx_hash: invoiceData.transactionHash
      };

      const pdfDataUrl = await pdfGenerator.getPDFDataURL(fullInvoiceData);

      const result = await emailService.sendInvoiceCreatedEmail(
        invoiceData.recipientEmail,
        invoiceData.userEmail,
        {
          invoiceNumber: invoiceData.invoiceNumber,
          amount: invoiceData.amount,
          description: invoiceData.description,
          companyName: invoiceData.companyName,
          dueDate: invoiceData.dueDate,
          contractAddress: invoiceData.contractAddress,
          transactionHash: invoiceData.transactionHash,
          paymentLink: `${window.location.origin}/pay/${invoiceId}`,
          pdfDataUrl: pdfDataUrl
        },
        userPlan
      );

      if (result.success) {
        success('Email Sent', 'Invoice email resent successfully');
      } else {
        error('Email Failed', result.error || 'Failed to send email');
      }
    } catch (err) {
      console.error('Error resending email:', err);
      error('Send Failed', 'Failed to send email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-400" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Invoice Created Successfully! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-300 mb-8"
        >
          Your invoice has been created and is being processed.
          {invoiceData?.contractAddress && " It's also secured on the Algorand blockchain!"}
        </motion.p>

        {/* Processing Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Processing Status</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">PDF Generation</span>
                <div className="flex items-center space-x-2">
                  {isGeneratingPDF ? (
                    <LoadingSpinner size="sm" />
                  ) : pdfGenerated ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                  )}
                  <span className={`text-sm ${pdfGenerated ? 'text-green-400' : 'text-gray-400'}`}>
                    {isGeneratingPDF ? 'Generating...' : pdfGenerated ? 'Complete' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Email Delivery</span>
                <div className="flex items-center space-x-2">
                  {isSendingEmail ? (
                    <LoadingSpinner size="sm" />
                  ) : emailSent ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                  )}
                  <span className={`text-sm ${emailSent ? 'text-green-400' : 'text-gray-400'}`}>
                    {isSendingEmail ? 'Sending...' : emailSent ? 'Sent' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-white mb-2">Invoice Details</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>Invoice ID: <span className="font-mono text-white">{invoiceId}</span></div>
                  {invoiceData && (
                    <>
                      <div>Amount: <span className="text-white">${invoiceData.amount.toFixed(2)}</span></div>
                      <div>Recipient: <span className="text-white">{invoiceData.recipientEmail}</span></div>
                      <div>Due Date: <span className="text-white">{new Date(invoiceData.dueDate).toLocaleDateString()}</span></div>
                    </>
                  )}
                  <div>Status: <span className="text-green-400">Created</span></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">Next Steps</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>✓ Invoice PDF generated</div>
                  <div>✓ Email sent to recipient</div>
                  {invoiceData?.contractAddress && <div>✓ Smart contract deployed</div>}
                  <div>⏳ Awaiting recipient payment</div>
                </div>
              </div>
            </div>

            {invoiceData?.contractAddress && (
              <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-600/30">
                <h4 className="font-semibold text-green-300 mb-2">🔗 Algorand Blockchain Security</h4>
                <div className="space-y-1 text-sm text-green-300">
                  <div>Contract: <span className="font-mono text-xs break-all">{invoiceData.contractAddress}</span></div>
                  {invoiceData.transactionHash && (
                    <div>Transaction: <span className="font-mono text-xs break-all">{invoiceData.transactionHash}</span></div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2"
            disabled={!pdfGenerated}
          >
            <Download size={16} />
            <span>Download PDF</span>
          </Button>
          
          {invoiceData?.contractAddress && (
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => window.open(`https://testnet.algoexplorer.io/tx/${invoiceData.transactionHash}`, '_blank')}
            >
              <ExternalLink size={16} />
              <span>View on Blockchain</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={isSendingEmail}
            className="flex items-center space-x-2"
          >
            {isSendingEmail ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Mail size={16} />
            )}
            <span>Resend Email</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Button
            onClick={onStartNew}
            size="lg"
            className="px-8 py-4"
          >
            Create Another Invoice
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-8 text-sm text-gray-400"
        >
          You'll receive email notifications when the payment is received and processed.
          {userPlan !== 'basic' && " Track email opens and clicks in your dashboard."}
        </motion.div>
      </motion.div>
    </div>
  );
};
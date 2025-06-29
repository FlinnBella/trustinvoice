import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Mail, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { emailService } from '../../lib/email-service';

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
  useEffect(() => {
    // Send invoice created email when component mounts
    if (invoiceData) {
      const sendInvoiceEmail = async () => {
        try {
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
              paymentLink: `${window.location.origin}/pay/${invoiceId}`
            },
            userPlan
          );

          if (!result.success) {
            console.error('Failed to send invoice email:', result.error);
          }
        } catch (error) {
          console.error('Error sending invoice email:', error);
        }
      };

      sendInvoiceEmail();
    }
  }, [invoiceData, invoiceId, userPlan]);

  const handleResendEmail = async () => {
    if (!invoiceData) return;

    try {
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
          paymentLink: `${window.location.origin}/pay/${invoiceId}`
        },
        userPlan
      );

      if (result.success) {
        alert('Email sent successfully!');
      } else {
        alert('Failed to send email: ' + result.error);
      }
    } catch (error) {
      console.error('Error resending email:', error);
      alert('Failed to send email');
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
          Your invoice has been created and sent to the recipient via email.
          {invoiceData?.contractAddress && " It's also secured on the blockchain!"}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
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
                  <div>Status: <span className="text-green-400">Sent</span></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-2">Next Steps</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>✓ Invoice email sent</div>
                  <div>✓ Payment tracking active</div>
                  {invoiceData?.contractAddress && <div>✓ Smart contract deployed</div>}
                  <div>⏳ Awaiting recipient payment</div>
                </div>
              </div>
            </div>

            {invoiceData?.contractAddress && (
              <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-600/30">
                <h4 className="font-semibold text-green-300 mb-2">🔗 Blockchain Security</h4>
                <div className="space-y-1 text-sm text-green-300">
                  <div>Contract: <span className="font-mono text-xs">{invoiceData.contractAddress}</span></div>
                  {invoiceData.transactionHash && (
                    <div>Transaction: <span className="font-mono text-xs">{invoiceData.transactionHash}</span></div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Download Invoice</span>
          </Button>
          
          {invoiceData?.contractAddress && (
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <ExternalLink size={16} />
              <span>View on Blockchain</span>
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleResendEmail}
            className="flex items-center space-x-2"
          >
            <Mail size={16} />
            <span>Resend Email</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
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
          transition={{ delay: 1.4 }}
          className="mt-8 text-sm text-gray-400"
        >
          You'll receive email notifications when the payment is received and processed.
          {userPlan !== 'basic' && " Track email opens and clicks in your dashboard."}
        </motion.div>
      </motion.div>
    </div>
  );
};
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Mail, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface SuccessProps {
  onStartNew: () => void;
  invoiceId: string;
}

export const Success: React.FC<SuccessProps> = ({ onStartNew, invoiceId }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-black mb-4"
        >
          Smart Contract Executed Successfully!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-600 mb-8"
        >
          Your invoice has been secured on the blockchain and sent to the recipient.
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
                <h3 className="font-semibold text-black mb-2">Invoice Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Invoice ID: <span className="font-mono">{invoiceId}</span></div>
                  <div>Blockchain: Ethereum Mainnet</div>
                  <div>Status: Confirmed</div>
                  <div>Confirmations: 12/12</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-black mb-2">Next Steps</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>✓ Smart contract deployed</div>
                  <div>✓ Email notification sent</div>
                  <div>✓ Payment tracking active</div>
                  <div>⏳ Awaiting recipient payment</div>
                </div>
              </div>
            </div>
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
          
          <Button
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ExternalLink size={16} />
            <span>View on Blockchain</span>
          </Button>
          
          <Button
            variant="outline"
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
          className="mt-8 text-sm text-gray-500"
        >
          You'll receive email notifications when the payment is received and processed.
        </motion.div>
      </motion.div>
    </div>
  );
};
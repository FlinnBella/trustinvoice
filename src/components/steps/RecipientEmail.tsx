import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface RecipientEmailProps {
  onNext: (recipientEmail: string) => void;
  onBack: () => void;
  initialEmail?: string;
}

export const RecipientEmail: React.FC<RecipientEmailProps> = ({ onNext, onBack, initialEmail = '' }) => {
  const [recipientEmail, setRecipientEmail] = useState(initialEmail);
  const [isValid, setIsValid] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setRecipientEmail(value);
    setIsValid(validateEmail(value));
  };

  const handleNext = () => {
    if (isValid) {
      onNext(recipientEmail);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Mail className="w-8 h-8 text-blue-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Who should receive this invoice?
            </h2>
            <p className="text-gray-300">
              Enter the recipient's email address for secure delivery
            </p>
          </div>

          <div className="space-y-6">
            <Input
              label="Recipient Email Address"
              type="email"
              value={recipientEmail}
              onChange={handleEmailChange}
              placeholder="client@company.com"
              required
            />

            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
              <p className="text-sm text-blue-300">
                <strong>Secure Delivery:</strong> The invoice will be sent via encrypted email
                with blockchain verification for authenticity.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center space-x-2 flex-1"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!isValid}
                className="flex items-center space-x-2 flex-2"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { BackgroundCurves } from '../animations/BackgroundCurves';
import { Navigation } from '../layout/Navigation';

interface EmailCaptureProps {
  onNext: (email: string) => void;
  onBack: () => void;
  initialEmail?: string;
}

export const EmailCapture: React.FC<EmailCaptureProps> = ({ onNext, onBack, initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [isValid, setIsValid] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setIsValid(validateEmail(value));
  };

  const handleSubmit = () => {
    if (isValid) {
      onNext(email);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <BackgroundCurves />
      <Navigation />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10 mt-20"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Mail className="w-8 h-8 text-f5f5f5" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-f5f5f5 mb-2">
              Let's Get Started
            </h2>
            <p className="text-gray-300">
              Enter your email to begin creating your secure invoice
            </p>
          </div>

          <div className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="your@email.com"
              required
            />

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
                onClick={handleSubmit}
                disabled={!isValid}
                className="flex items-center space-x-2 flex-2"
              >
                <span>Continue</span>
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Your email is encrypted and never shared with third parties
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
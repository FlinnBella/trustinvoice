import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Mail, CreditCard, CheckCircle } from 'lucide-react';

interface ProcessingAnimationProps {
  currentStep: number;
}

export const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({ currentStep }) => {
  const steps = [
    { icon: Upload, label: 'Upload' },
    { icon: FileText, label: 'Process' },
    { icon: Mail, label: 'Send' },
    { icon: CreditCard, label: 'Payment' },
    { icon: CheckCircle, label: 'Complete' }
  ];

  return (
    <div className="flex items-center justify-center space-x-8 py-12">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentStep;
        const isCurrent = index === currentStep;

        return (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: isCurrent ? 1.2 : isActive ? 1 : 0.8,
              opacity: isActive ? 1 : 0.3
            }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-2"
          >
            <div
              className={`p-4 rounded-full ${
                isActive ? 'bg-f5f5f5 text-black' : 'bg-gray-800 text-gray-500'
              }`}
            >
              <Icon size={24} />
            </div>
            <span className={`text-sm font-medium ${
              isActive ? 'text-f5f5f5' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};
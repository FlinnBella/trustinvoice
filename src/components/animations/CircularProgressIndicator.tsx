import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Mail, CreditCard, CheckCircle } from 'lucide-react';

interface CircularProgressIndicatorProps {
  currentStep: number;
}

export const CircularProgressIndicator: React.FC<CircularProgressIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { icon: Upload, label: 'Upload' },
    { icon: FileText, label: 'Process' },
    { icon: Mail, label: 'Send' },
    { icon: CreditCard, label: 'Payment' },
    { icon: CheckCircle, label: 'Complete' }
  ];

  return (
    <div className="flex items-center justify-center space-x-4 md:space-x-8 py-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index <= currentStep;
        const isCurrent = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={index} className="flex flex-col items-center space-y-2">
            {/* Circular Progress Ring */}
            <div className="relative w-12 h-12 md:w-16 md:h-16">
              {/* Background circle */}
              <svg className="w-12 h-12 md:w-16 md:h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="rgba(75, 85, 99, 0.3)"
                  strokeWidth="4"
                  fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={isCompleted ? "#10b981" : isCurrent ? "#f5f5f5" : "rgba(75, 85, 99, 0.3)"}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: isCompleted ? 1 : isCurrent ? 0.75 : isActive ? 0.25 : 0 
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  style={{
                    strokeDasharray: "175.929",
                    strokeDashoffset: "175.929"
                  }}
                />
              </svg>
              
              {/* Icon container */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{
                  scale: isCurrent ? 1.1 : isActive ? 1 : 0.8,
                  opacity: isActive ? 1 : 0.4
                }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-0 flex items-center justify-center rounded-full ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-f5f5f5 text-black' 
                    : isActive 
                    ? 'bg-gray-700 text-f5f5f5' 
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                <Icon size={16} className="md:w-5 md:h-5" />
              </motion.div>
            </div>
            
            {/* Step label */}
            <motion.span 
              className={`text-xs md:text-sm font-medium transition-colors duration-300 ${
                isActive ? 'text-f5f5f5' : 'text-gray-500'
              }`}
              animate={{ opacity: isActive ? 1 : 0.6 }}
            >
              {step.label}
            </motion.span>
          </div>
        );
      })}
    </div>
  );
};
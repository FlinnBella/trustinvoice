import React from 'react';
import { CircularProgressIndicator } from './CircularProgressIndicator';

interface ProcessingAnimationProps {
  currentStep: number;
}

export const ProcessingAnimation: React.FC<ProcessingAnimationProps> = ({ currentStep }) => {
  return <CircularProgressIndicator currentStep={currentStep} />;
};
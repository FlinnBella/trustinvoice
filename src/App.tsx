import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LandingPage } from './components/steps/LandingPage';
import { EmailCapture } from './components/steps/EmailCapture';
import { InvoiceMethod } from './components/steps/InvoiceMethod';
import { InvoiceUpload } from './components/steps/InvoiceUpload';
import { InvoiceCreation } from './components/steps/InvoiceCreation';
import { RecipientEmail } from './components/steps/RecipientEmail';
import { PricingPlans } from './components/steps/PricingPlans';
import { Payment } from './components/steps/Payment';
import { Success } from './components/steps/Success';
import { ProcessingAnimation } from './components/animations/ProcessingAnimation';
import { ToastContainer } from './components/ui/Toast';
import { InvoiceFlowNavigation } from './components/layout/InvoiceFlowNavigation';
import { useToast } from './hooks/useToast';
import { UserFlow, InvoiceData, PricingPlan } from './types';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userFlow, setUserFlow] = useState<UserFlow>({
    step: 0,
    email: '',
    invoiceMethod: 'upload',
    invoiceData: {},
    selectedPlan: null,
    uploadedFile: null
  });

  const { toasts, removeToast } = useToast();

  const steps = [
    'landing',
    'email',
    'method',
    'invoice',
    'recipient',
    'pricing',
    'payment',
    'success'
  ];

  const updateFlow = (updates: Partial<UserFlow>) => {
    setUserFlow(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setUserFlow({
      step: 0,
      email: '',
      invoiceMethod: 'upload',
      invoiceData: {},
      selectedPlan: null,
      uploadedFile: null
    });
  };

  const handleGetStarted = () => {
    updateFlow({ step: 1 });
    nextStep();
  };

  const handleEmailCapture = (email: string) => {
    updateFlow({ email, step: 2 });
    nextStep();
  };

  const handleMethodSelection = (method: 'upload' | 'create') => {
    updateFlow({ invoiceMethod: method, step: 3 });
    nextStep();
  };

  const handleInvoiceUpload = (file: File) => {
    updateFlow({ uploadedFile: file, step: 4 });
    nextStep();
  };

  const handleInvoiceCreation = (invoiceData: Partial<InvoiceData>) => {
    updateFlow({ invoiceData, step: 4 });
    nextStep();
  };

  const handleRecipientEmail = (recipientEmail: string) => {
    updateFlow({ 
      invoiceData: { ...userFlow.invoiceData, recipientEmail },
      step: 5 
    });
    nextStep();
  };

  const handlePlanSelection = (plan: PricingPlan) => {
    updateFlow({ selectedPlan: plan, step: 6 });
    nextStep();
  };

  const handlePaymentComplete = () => {
    updateFlow({ step: 7 });
    nextStep();
  };

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      
      case 'email':
        return (
          <EmailCapture
            onNext={handleEmailCapture}
            onBack={prevStep}
            initialEmail={userFlow.email}
          />
        );
      
      case 'method':
        return (
          <InvoiceMethod
            onNext={handleMethodSelection}
            onBack={prevStep}
          />
        );
      
      case 'invoice':
        return userFlow.invoiceMethod === 'upload' ? (
          <InvoiceUpload
            onNext={handleInvoiceUpload}
            onBack={prevStep}
          />
        ) : (
          <InvoiceCreation
            onNext={handleInvoiceCreation}
            onBack={prevStep}
            userEmail={userFlow.email}
          />
        );
      
      case 'recipient':
        return (
          <RecipientEmail
            onNext={handleRecipientEmail}
            onBack={prevStep}
            initialEmail={userFlow.invoiceData.recipientEmail}
          />
        );
      
      case 'pricing':
        return (
          <PricingPlans
            onNext={handlePlanSelection}
            onBack={prevStep}
          />
        );
      
      case 'payment':
        return (
          <Payment
            onNext={handlePaymentComplete}
            onBack={prevStep}
            selectedPlan={userFlow.selectedPlan!}
          />
        );
      
      case 'success':
        return (
          <Success
            onStartNew={resetFlow}
            invoiceId={`TI-${Date.now()}`}
            invoiceData={{
              recipientEmail: userFlow.invoiceData.recipientEmail || '',
              userEmail: userFlow.email,
              invoiceNumber: userFlow.invoiceData.invoiceNumber || '',
              amount: userFlow.invoiceData.amount || 0,
              description: userFlow.invoiceData.description || '',
              companyName: userFlow.invoiceData.companyName || '',
              dueDate: userFlow.invoiceData.dueDate || '',
              contractAddress: userFlow.invoiceData.smart_contract_address,
              transactionHash: userFlow.invoiceData.blockchain_tx_hash
            }}
            userPlan={userFlow.selectedPlan?.id || 'basic'}
          />
        );
      
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  // Show simplified navigation during invoice flow (steps 1-7)
  const isInInvoiceFlow = currentStep > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Conditional Navigation */}
      {isInInvoiceFlow && <InvoiceFlowNavigation />}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Circular Progress Indicator - Only on Get Started flow */}
      {currentStep > 0 && currentStep < steps.length - 1 && (
        <div className="relative z-10 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <ProcessingAnimation currentStep={Math.min(currentStep - 1, 4)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className={currentStep > 0 && currentStep < steps.length - 1 ? '' : 'w-full'}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Processing Animation Overlay */}
      {/*{userFlow.step === 4 && (
        <ProcessingAnimation currentStep={currentStep} />
      )}*/}
    </div>
  );
}

export default App;
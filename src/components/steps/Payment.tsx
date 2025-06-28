import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowLeft, Shield, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PricingPlan } from '../../types';

interface PaymentProps {
  onNext: () => void;
  onBack: () => void;
  selectedPlan: PricingPlan;
}

export const Payment: React.FC<PaymentProps> = ({ onNext, onBack, selectedPlan }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Complete Your Payment
          </h2>
          <p className="text-xl text-gray-600">
            Secure payment to activate your smart contract
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Smart Contract Fee</span>
                <span className="font-medium">${selectedPlan.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium">$0.99</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${(selectedPlan.price + 0.99).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Blockchain Security</span>
              </div>
              <p className="text-sm text-green-700">
                Your invoice will be secured by an immutable smart contract on the Ethereum network.
              </p>
            </div>
          </Card>

          {/* Payment Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Payment Details</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <CreditCard className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-6 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Your payment information is encrypted and secure</span>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center space-x-2 flex-1"
                disabled={isProcessing}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </Button>
              
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex items-center space-x-2 flex-2"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    <span>Pay ${(selectedPlan.price + 0.99).toFixed(2)}</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};
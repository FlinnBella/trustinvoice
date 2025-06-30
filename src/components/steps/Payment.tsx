import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowLeft, Shield, Lock, Wallet } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PricingPlan } from '../../types';
import { AlgorandService } from '../../lib/algorand';
import { useToast } from '../../hooks/useToast';

interface PaymentProps {
  onNext: () => void;
  onBack: () => void;
  selectedPlan: PricingPlan;
}

export const Payment: React.FC<PaymentProps> = ({ onNext, onBack, selectedPlan }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAlgorandProcessing, setIsAlgorandProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'algorand'>('card');
  const { addToast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onNext();
  };

  const handleAlgorandPayment = async () => {
    setIsAlgorandProcessing(true);
    
    try {
      const algorandService = new AlgorandService('testnet');
      
      // Generate a new account for demo (in real app, user would connect wallet)
      const payerAccount = algorandService.generateAccount();
      const recipientAccount = algorandService.generateAccount();
      
      addToast({ type: 'info', title: 'Connecting to Algorand Testnet...' });
      
      // Convert price to microAlgos (1 ALGO = 1,000,000 microAlgos)
      const amountInAlgos = selectedPlan.price / 100; // Convert to a reasonable ALGO amount
      const amountInMicroAlgos = algorandService.algosToMicroAlgos(amountInAlgos);
      
      // Deploy contract first
      addToast({ type: 'info', title: 'Deploying smart contract...' });
      const appId = await algorandService.deployInvoiceContract(payerAccount);
      
      // Create invoice
      addToast({ type: 'info', title: 'Creating invoice on blockchain...' });
      const invoiceResult = await algorandService.createInvoice(payerAccount, {
        id: `invoice_${Date.now()}`,
        amount: amountInMicroAlgos,
        recipient: recipientAccount.addr,
        dueDate: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      });
      
      addToast({ type: 'success', title: '✅ Payment successful on Algorand!' });
      addToast({ type: 'info', title: `Transaction ID: ${invoiceResult.txId}` });
      
      setIsAlgorandProcessing(false);
      onNext();
      
    } catch (error) {
      console.error('Algorand payment failed:', error);
      addToast({ type: 'error', title: '❌ Algorand payment failed. Please try again.' });
      setIsAlgorandProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Complete Your Payment
          </h2>
          <p className="text-xl text-gray-300">
            Secure payment to activate your smart contract
          </p>
        </div>

        {/* Payment Method Selection */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`px-6 py-3 rounded-md transition-all ${
                paymentMethod === 'card'
                  ? 'bg-white text-gray-900 font-medium'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <CreditCard className="w-5 h-5 inline mr-2" />
              Credit Card
            </button>
            <button
              onClick={() => setPaymentMethod('algorand')}
              className={`px-6 py-3 rounded-md transition-all ${
                paymentMethod === 'algorand'
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Wallet className="w-5 h-5 inline mr-2" />
              Algorand Crypto
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">Plan</span>
                <span className="font-medium text-white">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Smart Contract Fee</span>
                <span className="font-medium text-white">
                  {paymentMethod === 'algorand' 
                    ? `${(selectedPlan.price / 100).toFixed(2)} ALGO` 
                    : `$${selectedPlan.price}`
                  }
                </span>
              </div>
              {paymentMethod === 'card' && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Processing Fee</span>
                  <span className="font-medium text-white">$0.99</span>
                </div>
              )}
              <hr className="my-3 border-gray-600" />
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-white">Total</span>
                <span className="text-white">
                  {paymentMethod === 'algorand' 
                    ? `${(selectedPlan.price / 100).toFixed(2)} ALGO` 
                    : `$${(selectedPlan.price + 0.99).toFixed(2)}`
                  }
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${
              paymentMethod === 'algorand' 
                ? 'bg-blue-900/20 border-blue-600/30' 
                : 'bg-green-900/20 border-green-600/30'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <Shield className={`w-5 h-5 ${
                  paymentMethod === 'algorand' ? 'text-blue-400' : 'text-green-400'
                }`} />
                <span className={`font-medium ${
                  paymentMethod === 'algorand' ? 'text-blue-300' : 'text-green-300'
                }`}>
                  {paymentMethod === 'algorand' ? 'Algorand Blockchain' : 'Blockchain Security'}
                </span>
              </div>
              <p className={`text-sm ${
                paymentMethod === 'algorand' ? 'text-blue-300' : 'text-green-300'
              }`}>
                {paymentMethod === 'algorand' 
                  ? 'Your invoice will be secured by a smart contract on the Algorand blockchain with instant finality and low fees.'
                  : 'Your invoice will be secured by an immutable smart contract on the Ethereum network.'
                }
              </p>
            </div>
          </Card>

          {/* Payment Form */}
          <Card className="p-6">
            {paymentMethod === 'card' ? (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400"
                      />
                      <CreditCard className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-6 text-sm text-gray-400">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Algorand Crypto Payment</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
                    <h4 className="font-medium text-blue-300 mb-2">✨ Demo Payment</h4>
                    <p className="text-sm text-blue-300 mb-3">
                      This demo will create test accounts and deploy a smart contract on Algorand Testnet.
                    </p>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>• Network: Algorand Testnet</div>
                      <div>• Amount: {(selectedPlan.price / 100).toFixed(2)} ALGO</div>
                      <div>• No real funds required</div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-300 mb-2">🔗 Nodely Integration</h4>
                    <p className="text-sm text-gray-400">
                      Using Nodely's free Algorand testnet endpoints for reliable blockchain connectivity.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-6 text-sm text-gray-400">
                  <Shield className="w-4 h-4" />
                  <span>Powered by Algorand blockchain technology</span>
                </div>
              </>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center space-x-2 flex-1"
                disabled={isProcessing || isAlgorandProcessing}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </Button>
              
              {paymentMethod === 'card' ? (
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
                        className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
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
              ) : (
                <Button
                  onClick={handleAlgorandPayment}
                  disabled={isAlgorandProcessing}
                  className="flex items-center space-x-2 flex-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                >
                  {isAlgorandProcessing ? (
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
                      <Wallet size={16} />
                      <span>Pay {(selectedPlan.price / 100).toFixed(2)} ALGO</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};
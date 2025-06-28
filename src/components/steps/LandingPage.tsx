import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, Zap, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { FloatingElements } from '../animations/FloatingElements';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <FloatingElements />
      
      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <Shield className="w-8 h-8 text-black" />
            <span className="text-2xl font-bold text-black">TrustInvoice</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center space-x-8"
          >
            <a href="#features" className="text-gray-600 hover:text-black transition-colors">Features</a>
            <a href="#security" className="text-gray-600 hover:text-black transition-colors">Security</a>
            <a href="#pricing" className="text-gray-600 hover:text-black transition-colors">Pricing</a>
          </motion.div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-7xl font-bold text-black mb-8 leading-tight"
            >
              Security, Trust,
              <br />
              <span className="text-gray-600">Reliability</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Enterprise-grade invoice processing with uncompromising privacy.
              Blockchain-secured smart contracts for seamless business transactions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                onClick={onGetStarted}
                size="lg"
                className="flex items-center space-x-2 px-8 py-4"
              >
                <span>Get Started with an Invoice</span>
                <ArrowRight size={20} />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4"
              >
                Schedule Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-4">
              Secure Document Processing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced features designed for modern businesses
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: 'Secure Document Upload',
                description: 'Auto-processing for payment flows with drag-and-drop interface and real-time validation'
              },
              {
                icon: FileText,
                title: 'Invoice Generation',
                description: 'Pre-built templates, custom field configuration, and smart form auto-fill capabilities'
              },
              {
                icon: Lock,
                title: 'Privacy-First Architecture',
                description: 'End-to-end encryption, secure email integration, and multi-factor authentication'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow"
              >
                <feature.icon className="w-12 h-12 text-black mb-6" />
                <h3 className="text-xl font-semibold text-black mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-black mb-6">
                Blockchain-Secured Smart Contracts
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Every invoice is protected by immutable smart contracts on Ethereum and Polygon networks,
                ensuring transparency and automatic execution of payment terms.
              </p>
              
              <div className="space-y-4">
                {[
                  'Immutable transaction records',
                  'Automated payment processing',
                  'Multi-cryptocurrency support',
                  'Zero-knowledge privacy protection'
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-8 h-8 text-black" />
                  <span className="text-lg font-semibold">Smart Contract</span>
                </div>
                
                <div className="space-y-4 text-sm font-mono">
                  <div className="text-gray-600">// Invoice Contract</div>
                  <div className="text-blue-600">contract InvoicePayment &lbrace;</div>
                  <div className="ml-4 text-gray-800">address payable recipient;</div>
                  <div className="ml-4 text-gray-800">uint256 amount;</div>
                  <div className="ml-4 text-gray-800">bool paid = false;</div>
                  <div className="text-blue-600">&rbrace;</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

const CheckCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const Upload: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileText: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
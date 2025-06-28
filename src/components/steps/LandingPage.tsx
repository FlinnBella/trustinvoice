import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, Zap, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { McKinseyCurves } from '../animations/McKinseyCurves';
import { Navigation } from '../layout/Navigation';
import { Browser3D } from '../3d/Browser3D';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <McKinseyCurves />
      <Navigation />
      
      {/* Hero Section */}
      <main className="relative z-10 px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-f5f5f5 mb-8 leading-tight hero-title"
              >
                Security, Trust,
                <br />
                <span className="text-gray-400">Reliability</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-gray-300 mb-12 leading-relaxed professional-serif"
              >
                Enterprise-grade invoice processing with uncompromising privacy.
                Blockchain-secured smart contracts for seamless business transactions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 items-start"
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

            {/* Right side - 3D Browser */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="relative h-96 lg:h-[500px]"
            >
              <Browser3D />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 max-w-4xl"
          >
            <h2 className="text-4xl font-bold text-f5f5f5 mb-4 professional-serif">
              Secure Document Processing
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl professional-serif">
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
                className="p-8"
              >
                <feature.icon className="w-12 h-12 text-f5f5f5 mb-6" />
                <h3 className="text-xl font-semibold text-f5f5f5 mb-4 professional-serif">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed professional-serif">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-f5f5f5 mb-6 professional-serif">
                Blockchain-Secured Smart Contracts
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed professional-serif">
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
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300 professional-serif">{item}</span>
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
              <div className="bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-8 h-8 text-f5f5f5" />
                  <span className="text-lg font-semibold text-f5f5f5 professional-serif">Smart Contract</span>
                </div>
                
                <div className="space-y-4 text-sm code-font">
                  <div className="text-gray-400">// Invoice Contract</div>
                  <div className="text-blue-400">contract InvoicePayment &lbrace;</div>
                  <div className="ml-4 text-gray-300">address payable recipient;</div>
                  <div className="ml-4 text-gray-300">uint256 amount;</div>
                  <div className="ml-4 text-gray-300">bool paid = false;</div>
                  <div className="text-blue-400">&rbrace;</div>
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
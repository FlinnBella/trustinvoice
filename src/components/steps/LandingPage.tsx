import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, Zap, Globe } from 'lucide-react';
import { Button } from '../ui/Button';
import { McKinseyCurves } from '../animations/McKinseyCurves';
import { InvisibleNavigation } from '../layout/InvisibleNavigation';
import { PhotorealisticBrowser3D } from '../3d/PhotorealisticBrowser3D';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const securityRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Scroll-triggered animations
    if (featuresRef.current) {
      gsap.fromTo(featuresRef.current.children,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (securityRef.current) {
      gsap.fromTo(securityRef.current.children,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: securityRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <McKinseyCurves />
      <InvisibleNavigation />
      
      {/* Hero Section */}
      <main ref={heroRef} className="relative z-10 px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left side - Text content */}
            <div className="max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1, ease: "power3.out" }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-f5f5f5 mb-8 leading-tight hero-title"
              >
                Security, Trust,
                <br />
                <span className="text-gray-400">Reliability</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1, ease: "power3.out" }}
                className="text-xl text-gray-300 mb-12 leading-relaxed professional-serif max-w-xl"
              >
                Enterprise-grade invoice processing with uncompromising privacy.
                Blockchain-secured smart contracts for seamless business transactions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 1, ease: "power3.out" }}
                className="flex flex-col sm:flex-row gap-4 items-start"
              >
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="flex items-center space-x-2 px-8 py-4 text-lg"
                >
                  <span>Get Started with an Invoice</span>
                  <ArrowRight size={20} />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  Schedule Demo
                </Button>
              </motion.div>
            </div>

            {/* Right side - 3D Browser */}
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 1.5, ease: "power3.out" }}
              className="relative h-96 lg:h-[600px]"
            >
              <PhotorealisticBrowser3D />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 max-w-4xl">
            <h2 className="text-5xl font-bold text-f5f5f5 mb-6 professional-serif">
              Secure Document Processing
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl professional-serif leading-relaxed">
              Advanced features designed for modern businesses that demand security, efficiency, and reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Upload,
                title: 'Secure Document Upload',
                description: 'Auto-processing for payment flows with drag-and-drop interface, real-time validation, and enterprise-grade encryption for all uploaded documents.'
              },
              {
                icon: FileText,
                title: 'Invoice Generation',
                description: 'Pre-built professional templates, custom field configuration, smart form auto-fill capabilities, and automated calculations for accurate invoicing.'
              },
              {
                icon: Lock,
                title: 'Privacy-First Architecture',
                description: 'End-to-end encryption, secure email integration, multi-factor authentication, and zero-knowledge privacy protection for all transactions.'
              }
            ].map((feature, index) => (
              <div key={index} className="p-8 group">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-gray-700 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-f5f5f5" />
                </div>
                <h3 className="text-2xl font-semibold text-f5f5f5 mb-6 professional-serif">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed professional-serif text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" ref={securityRef} className="relative z-10 px-6 py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-bold text-f5f5f5 mb-8 professional-serif">
                Blockchain-Secured Smart Contracts
              </h2>
              <p className="text-2xl text-gray-300 mb-12 leading-relaxed professional-serif">
                Every invoice is protected by immutable smart contracts on Ethereum and Polygon networks,
                ensuring transparency and automatic execution of payment terms.
              </p>
              
              <div className="space-y-6">
                {[
                  'Immutable transaction records',
                  'Automated payment processing',
                  'Multi-cryptocurrency support',
                  'Zero-knowledge privacy protection'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 professional-serif text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-2xl shadow-2xl border border-gray-700">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-f5f5f5 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-black" />
                  </div>
                  <span className="text-2xl font-semibold text-f5f5f5 professional-serif">Smart Contract</span>
                </div>
                
                <div className="space-y-4 text-base code-font">
                  <div className="text-gray-400">// Invoice Contract</div>
                  <div className="text-blue-400">contract InvoicePayment &lbrace;</div>
                  <div className="ml-6 text-gray-300">address payable recipient;</div>
                  <div className="ml-6 text-gray-300">uint256 amount;</div>
                  <div className="ml-6 text-gray-300">bool paid = false;</div>
                  <div className="ml-6 text-gray-300">uint256 dueDate;</div>
                  <div className="text-blue-400">&rbrace;</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-f5f5f5 mb-8 professional-serif">
            Simple, Transparent Pricing
          </h2>
          <p className="text-2xl text-gray-300 mb-16 professional-serif max-w-3xl mx-auto">
            Choose the plan that fits your business needs. All plans include blockchain security and smart contract execution.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 px-6 py-32 bg-gradient-to-t from-black to-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-f5f5f5 mb-8 professional-serif">
            About TrustInvoice
          </h2>
          <p className="text-2xl text-gray-300 professional-serif max-w-4xl mx-auto leading-relaxed">
            Built by security experts and blockchain pioneers, TrustInvoice represents the future of business transactions.
            Our platform combines cutting-edge technology with intuitive design to deliver unparalleled security and reliability.
          </p>
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
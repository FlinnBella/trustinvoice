import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, Zap, Globe, Upload, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { FixedMcKinseyCurves } from '../animations/FixedMcKinseyCurves';
import { ResponsiveNavigation } from '../layout/ResponsiveNavigation';
import { OptimizedBrowser3D } from '../3d/OptimizedBrowser3D';
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
  const pricingRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Enhanced scroll-triggered animations
    if (featuresRef.current) {
      gsap.fromTo(featuresRef.current.children,
        { y: 120, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (securityRef.current) {
      gsap.fromTo(securityRef.current.children,
        { x: -120, opacity: 0, rotationY: -15 },
        {
          x: 0,
          opacity: 1,
          rotationY: 0,
          duration: 1.4,
          stagger: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: securityRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (pricingRef.current) {
      gsap.fromTo(pricingRef.current.children,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: pricingRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    if (aboutRef.current) {
      gsap.fromTo(aboutRef.current.children,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: aboutRef.current,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <FixedMcKinseyCurves />
      <ResponsiveNavigation />
      
      {/* Hero Section */}
      <main ref={heroRef} className="relative z-10 px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
            {/* Left side - Text content */}
            <div className="max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight hero-title"
              >
                Security, Trust,
                <br />
                <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">Reliability</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
                className="text-xl text-gray-300 mb-12 leading-relaxed professional-font max-w-xl"
              >
                Enterprise-grade invoice processing with uncompromising privacy.
                Blockchain-secured smart contracts for seamless business transactions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 1.2, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4 items-start"
              >
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="flex items-center space-x-3 px-8 py-4 text-lg bg-white text-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  <span>Get Started with an Invoice</span>
                  <ArrowRight size={20} />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  Schedule Demo
                </Button>
              </motion.div>
            </div>

            {/* Right side - 3D Browser */}
            <motion.div
              initial={{ opacity: 0, x: 120, scale: 0.7 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 1.8, ease: "easeOut" }}
              className="relative h-96 lg:h-[650px]"
            >
              <OptimizedBrowser3D />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="relative z-10 px-6 py-32 section-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 max-w-4xl">
            <h2 className="text-5xl font-bold text-white mb-6 professional-font">
              Secure Document Processing
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl professional-font leading-relaxed">
              Advanced features designed for modern businesses that demand security, efficiency, and reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Upload,
                title: 'Secure Document Upload',
                description: 'Auto-processing for payment flows with drag-and-drop interface, real-time validation, and enterprise-grade encryption for all uploaded documents.',
                color: 'from-blue-500 to-blue-700'
              },
              {
                icon: FileText,
                title: 'Invoice Generation',
                description: 'Pre-built professional templates, custom field configuration, smart form auto-fill capabilities, and automated calculations for accurate invoicing.',
                color: 'from-green-500 to-green-700'
              },
              {
                icon: Lock,
                title: 'Privacy-First Architecture',
                description: 'End-to-end encryption, secure email integration, multi-factor authentication, and zero-knowledge privacy protection for all transactions.',
                color: 'from-purple-500 to-purple-700'
              }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="p-8 group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all duration-300"
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-6 professional-font">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed professional-font text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" ref={securityRef} className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-bold text-white mb-8 professional-font">
                Blockchain-Secured Smart Contracts
              </h2>
              <p className="text-2xl text-gray-300 mb-12 leading-relaxed professional-font">
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
                  <motion.div 
                    key={index} 
                    className="flex items-center space-x-4"
                    whileHover={{ x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 professional-font text-lg">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-10 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-white to-gray-200 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-black" />
                  </div>
                  <span className="text-2xl font-semibold text-white professional-font">Smart Contract</span>
                </div>
                
                <div className="space-y-4 text-base font-mono">
                  <div className="text-gray-400">// Invoice Contract</div>
                  <div className="text-blue-400">contract InvoicePayment &lbrace;</div>
                  <div className="ml-6 text-gray-300">address payable recipient;</div>
                  <div className="ml-6 text-gray-300">uint256 amount;</div>
                  <div className="ml-6 text-gray-300">bool paid = false;</div>
                  <div className="ml-6 text-gray-300">uint256 dueDate;</div>
                  <div className="ml-6 text-green-400">modifier onlyAfterDue() &lbrace;</div>
                  <div className="ml-12 text-gray-300">require(block.timestamp &gt; dueDate);</div>
                  <div className="ml-12 text-gray-300">_;</div>
                  <div className="ml-6 text-green-400">&rbrace;</div>
                  <div className="text-blue-400">&rbrace;</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="relative z-10 px-6 py-32 section-gradient">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-8 professional-font">
            Simple, Transparent Pricing
          </h2>
          <p className="text-2xl text-gray-300 mb-16 professional-font max-w-3xl mx-auto">
            Choose the plan that fits your business needs. All plans include blockchain security and smart contract execution.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Basic',
                price: '$9.99',
                features: ['Up to 10 invoices/month', 'Basic templates', 'Email support', 'Blockchain security']
              },
              {
                name: 'Pro',
                price: '$29.99',
                features: ['Up to 100 invoices/month', 'Custom templates', 'Priority support', 'Advanced analytics'],
                popular: true
              },
              {
                name: 'Enterprise',
                price: '$99.99',
                features: ['Unlimited invoices', 'White-label solution', 'Dedicated support', 'API access']
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`p-8 rounded-2xl border backdrop-blur-sm ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-500/50' 
                    : 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50'
                }`}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                <div className="text-4xl font-bold text-white mb-6">{plan.price}<span className="text-lg text-gray-400">/month</span></div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-gray-300 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white text-black hover:bg-gray-100'}`}
                >
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" ref={aboutRef} className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-8 professional-font">
            About TrustInvoice
          </h2>
          <p className="text-2xl text-gray-300 professional-font max-w-4xl mx-auto leading-relaxed mb-12">
            Built by security experts and blockchain pioneers, TrustInvoice represents the future of business transactions.
            Our platform combines cutting-edge technology with intuitive design to deliver unparalleled security and reliability.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: '10K+', label: 'Secure Transactions' },
              { number: '99.9%', label: 'Uptime Guarantee' },
              { number: '24/7', label: 'Expert Support' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400 professional-font">{stat.label}</div>
              </motion.div>
            ))}
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
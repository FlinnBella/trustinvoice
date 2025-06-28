import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, Zap, Globe, Upload, FileText, TrendingUp, Users, Award } from 'lucide-react';
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
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      if (featuresRef.current) {
        gsap.fromTo(featuresRef.current.children,
          { y: 80, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            stagger: 0.15,
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
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.2,
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

      if (pricingRef.current) {
        gsap.fromTo(pricingRef.current.children,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pricingRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      if (aboutRef.current) {
        gsap.fromTo(aboutRef.current.children,
          { scale: 0.9, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "back.out(1.2)",
            scrollTrigger: {
              trigger: aboutRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="min-h-screen mckinsey-gradient-bg relative overflow-hidden">
      <FixedMcKinseyCurves />
      <ResponsiveNavigation />
      
      {/* Hero Section */}
      <main ref={heroRef} className="relative z-10 px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[85vh]">
            {/* Left side - Text content */}
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="mb-6"
              >
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600/20 to-teal-600/20 border border-blue-400/30 rounded-full text-sm mckinsey-font-medium text-blue-200 backdrop-blur-sm">
                  Enterprise-Grade Security
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                className="text-display-1 text-white mb-8 hero-title will-change-transform"
              >
                Transforming
                <br />
                <span className="mckinsey-text-gradient">Business Invoicing</span>
                <br />
                <span className="mckinsey-serif text-heading-1 mckinsey-gold-gradient">with Blockchain</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                className="text-body-large text-slate-300 mb-12 mckinsey-font max-w-xl will-change-opacity leading-relaxed"
              >
                Revolutionize your financial operations with our enterprise-grade platform. 
                Combining cutting-edge blockchain technology with intuitive design for 
                unparalleled security and efficiency.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-6 items-start will-change-transform"
              >
                <Button
                  onClick={onGetStarted}
                  size="lg"
                  className="flex items-center space-x-3 px-10 py-5 text-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-blue-400/30 shadow-mckinsey-medium mckinsey-font-semibold"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight size={20} />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="px-10 py-5 text-lg border-2 border-slate-300/30 text-slate-200 hover:bg-slate-200/10 hover:border-slate-200/50 transition-all duration-300 focus:ring-4 focus:ring-slate-400/20 mckinsey-font-medium backdrop-blur-sm"
                >
                  Explore Solutions
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="mt-16 flex items-center space-x-8 text-sm text-slate-400 mckinsey-font"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                  <span>24/7 Support</span>
                </div>
              </motion.div>
            </div>

            {/* Right side - 3D Browser */}
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: 0.4, duration: 1.5, ease: "easeOut" }}
              className="relative h-96 lg:h-[650px] will-change-transform"
            >
              <OptimizedBrowser3D />
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="relative z-10 px-6 py-32 mckinsey-section-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 max-w-4xl">
            <motion.div className="mb-8">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-teal-600/20 to-blue-600/20 border border-teal-400/30 rounded-full text-sm mckinsey-font-medium text-teal-200 backdrop-blur-sm">
                Core Capabilities
              </span>
            </motion.div>
            <h2 className="text-display-2 text-white mb-8 mckinsey-font-semibold">
              Engineered for
              <span className="mckinsey-text-gradient"> Excellence</span>
            </h2>
            <p className="text-body-large text-slate-300 max-w-3xl mckinsey-font leading-relaxed">
              Our platform delivers enterprise-grade solutions that transform how organizations 
              handle financial documentation and blockchain integration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: 'Intelligent Document Processing',
                description: 'Advanced AI-powered document analysis with real-time validation, automated data extraction, and seamless integration with existing enterprise systems.',
                color: 'mckinsey-accent-blue',
                metrics: '99.7% Accuracy'
              },
              {
                icon: FileText,
                title: 'Dynamic Invoice Generation',
                description: 'Professional templates with intelligent automation, custom branding capabilities, and sophisticated calculation engines for complex billing scenarios.',
                color: 'mckinsey-accent-teal',
                metrics: '50% Faster Processing'
              },
              {
                icon: Lock,
                title: 'Enterprise Security Framework',
                description: 'Military-grade encryption, zero-trust architecture, comprehensive audit trails, and compliance with global financial regulations.',
                color: 'mckinsey-accent-indigo',
                metrics: 'Bank-Level Security'
              }
            ].map((feature, index) => (
              <motion.div 
                key={index} 
                className="group mckinsey-card-gradient rounded-2xl p-8 hover:shadow-mckinsey-strong transition-all duration-500 will-change-transform"
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-mckinsey-soft`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-heading-2 text-white mckinsey-font-semibold">{feature.title}</h3>
                    <span className="text-xs px-3 py-1 bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-400/30 rounded-full text-green-300 mckinsey-font-medium">
                      {feature.metrics}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed mckinsey-font text-body-medium">{feature.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-600/30">
                  <button className="text-blue-400 hover:text-blue-300 mckinsey-font-medium text-sm flex items-center space-x-2 group-hover:translate-x-2 transition-transform duration-300">
                    <span>Learn More</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
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
              <motion.div className="mb-8">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-400/30 rounded-full text-sm mckinsey-font-medium text-purple-200 backdrop-blur-sm">
                  Blockchain Innovation
                </span>
              </motion.div>

              <h2 className="text-display-2 text-white mb-8 mckinsey-font-semibold">
                Next-Generation
                <br />
                <span className="mckinsey-text-gradient">Smart Contracts</span>
              </h2>
              <p className="text-body-large text-slate-300 mb-12 leading-relaxed mckinsey-font max-w-xl">
                Leverage immutable blockchain technology for transparent, automated, and 
                secure financial transactions across multiple cryptocurrency networks.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Shield, text: 'Immutable transaction ledger', detail: 'Permanent record keeping' },
                  { icon: Zap, text: 'Automated payment execution', detail: 'Smart contract triggers' },
                  { icon: Globe, text: 'Multi-network compatibility', detail: 'Ethereum & Polygon support' },
                  { icon: Award, text: 'Zero-knowledge privacy', detail: 'Advanced cryptography' }
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start space-x-4 group"
                    whileHover={{ x: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
                      <item.icon className="w-5 h-5 text-blue-300" />
                    </div>
                    <div>
                      <span className="text-slate-200 mckinsey-font-medium text-body-medium block">{item.text}</span>
                      <span className="text-slate-400 mckinsey-font text-sm">{item.detail}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mckinsey-card-gradient p-10 rounded-2xl shadow-mckinsey-strong">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-mckinsey-soft">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-heading-2 text-white mckinsey-font-semibold">Smart Contract Architecture</span>
                </div>
                
                <div className="space-y-4 text-sm font-mono bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                  <div className="text-slate-400 mckinsey-font">// Enterprise Invoice Contract</div>
                  <div className="text-blue-300">contract TrustInvoicePayment &#123;</div>
                  <div className="ml-4 text-slate-300">address payable recipient;</div>
                  <div className="ml-4 text-slate-300">uint256 immutable amount;</div>
                  <div className="ml-4 text-slate-300">bool private paid = false;</div>
                  <div className="ml-4 text-slate-300">uint256 immutable dueDate;</div>
                  <div className="ml-4 text-green-300">modifier onlyAfterDue() &#123;</div>
                  <div className="ml-8 text-slate-300"\>require(block.timestamp &gt; dueDate);</div>
                  <div className="ml-8 text-slate-300">_;</div>
                  <div className="ml-4 text-green-300">&#125;</div>
                  <div className="ml-4 text-yellow-300"\>event PaymentExecuted(uint256 amount);</div>
                  <div className="text-blue-300">&#125;</div>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 mckinsey-font-medium">Contract Verified</span>
                  </div>
                  <span className="text-slate-400 mckinsey-font">Gas Optimized</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="relative z-10 px-6 py-32 mckinsey-section-gradient">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div className="mb-8">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-gold-600/20 to-yellow-600/20 border border-gold-400/30 rounded-full text-sm mckinsey-font-medium text-gold-200 backdrop-blur-sm">
              Investment Plans
            </span>
          </motion.div>

          <h2 className="text-display-2 text-white mb-8 mckinsey-font-semibold">
            Enterprise-Grade
            <span className="mckinsey-text-gradient"> Solutions</span>
          </h2>
          <p className="text-body-large text-slate-300 mb-16 mckinsey-font max-w-3xl mx-auto leading-relaxed">
            Scalable pricing designed for organizations of all sizes. Every plan includes 
            comprehensive blockchain security and automated smart contract execution.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Professional',
                price: '$49',
                description: 'Perfect for growing businesses',
                features: ['Up to 50 invoices/month', 'Professional templates', 'Email support', 'Blockchain security', 'Basic analytics'],
                highlight: false
              },
              {
                name: 'Enterprise',
                price: '$149',
                description: 'Advanced features for scale',
                features: ['Up to 500 invoices/month', 'Custom templates', 'Priority support', 'Advanced analytics', 'API access', 'White-label options'],
                highlight: true
              },
              {
                name: 'Global',
                price: '$399',
                description: 'Complete enterprise solution',
                features: ['Unlimited invoices', 'Full customization', 'Dedicated support', 'Enterprise security', 'Custom integrations', 'SLA guarantee']
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`p-8 rounded-2xl backdrop-blur-sm will-change-transform ${
                  plan.highlight 
                    ? 'mckinsey-card-gradient border-2 border-blue-400/50 shadow-mckinsey-strong' 
                    : 'mckinsey-card-gradient shadow-mckinsey-medium'
                }`}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {plan.highlight && (
                  <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-full text-sm mckinsey-font-semibold mb-6 inline-block">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-heading-2 text-white mb-2 mckinsey-font-semibold">{plan.name}</h3>
                  <p className="text-slate-400 mckinsey-font text-sm mb-4">{plan.description}</p>
                  <div className="text-display-1 text-white mb-2 mckinsey-font-semibold">{plan.price}</div>
                  <div className="text-slate-400 mckinsey-font">per month</div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-slate-300 flex items-start mckinsey-font text-sm">
                      <CheckCircle className="w-5 h-5 text-teal-400 mr-3 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full py-4 mckinsey-font-semibold ${
                    plan.highlight 
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white' 
                      : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 border border-slate-600/50'
                  }`}
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
          <motion.div className="mb-8">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-slate-600/20 to-slate-500/20 border border-slate-400/30 rounded-full text-sm mckinsey-font-medium text-slate-200
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Crown, Zap, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PricingPlan } from '../../types';
import { pricingPlans } from '../../lib/pricing';

interface PricingPlansProps {
  onNext: (plan: PricingPlan) => void;
  onBack: () => void;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({ onNext, onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const handleNext = () => {
    if (selectedPlan) {
      onNext(selectedPlan);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return Shield;
      case 'pro':
        return Zap;
      case 'premium':
        return Crown;
      default:
        return Shield;
    }
  };

  const getPlanGradient = (planId: string, isSelected: boolean) => {
    if (isSelected) {
      switch (planId) {
        case 'basic':
          return 'bg-gradient-to-br from-blue-600/30 to-blue-800/30 border-blue-400/50';
        case 'pro':
          return 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-400/50';
        case 'premium':
          return 'bg-gradient-to-br from-emerald-600/30 to-teal-800/30 border-emerald-400/50';
        default:
          return 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50';
      }
    }
    
    switch (planId) {
      case 'basic':
        return 'bg-gradient-to-br from-blue-600/10 to-blue-800/10 border-blue-400/20';
      case 'pro':
        return 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-400/30';
      case 'premium':
        return 'bg-gradient-to-br from-emerald-600/10 to-teal-800/10 border-emerald-400/20';
      default:
        return 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50';
    }
  };

  const getPlanGlow = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'from-blue-500/20 to-blue-600/20';
      case 'pro':
        return 'from-purple-500/30 to-pink-500/30';
      case 'premium':
        return 'from-emerald-500/20 to-teal-600/20';
      default:
        return 'from-slate-500/20 to-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Choose Your Smart Contract Plan
          </h2>
          <p className="text-xl text-gray-300">
            Select the plan that best fits your invoicing needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {pricingPlans.map((plan, index) => {
            const Icon = getPlanIcon(plan.id);
            const isSelected = selectedPlan?.id === plan.id;
            const gradientClasses = getPlanGradient(plan.id, isSelected);
            const glowClasses = getPlanGlow(plan.id);
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Recommended
                    </div>
                  </div>
                )}
                
                <div
                  className={`relative p-8 h-full cursor-pointer transition-all duration-200 rounded-xl border backdrop-blur-sm ${gradientClasses} ${
                    isSelected ? 'ring-2 ring-white shadow-xl transform scale-105' : ''
                  } ${plan.recommended ? 'transform scale-105' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {/* Glow Effects */}
                  {plan.recommended ? (
                    <div className={`absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br ${glowClasses} rounded-full blur-2xl opacity-60`}></div>
                  ) : (
                    <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${glowClasses} rounded-full blur-xl opacity-40`}></div>
                  )}
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                        plan.id === 'basic' ? 'bg-blue-900/50' :
                        plan.id === 'pro' ? 'bg-purple-900/50' :
                        'bg-emerald-900/50'
                      }`}>
                        <Icon className={`w-8 h-8 ${
                          plan.id === 'basic' ? 'text-blue-400' :
                          plan.id === 'pro' ? 'text-purple-400' :
                          'text-emerald-400'
                        }`} />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-white mb-1">
                        ${plan.price}
                      </div>
                      <div className="text-gray-400">per month</div>
                    </div>

                    <div className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Selection button at bottom */}
                    <div className="mt-auto">
                      <Button
                        variant={isSelected ? 'primary' : 'outline'}
                        className="w-full"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        {isSelected ? 'Selected' : 'Select Plan'}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex space-x-3 justify-center">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!selectedPlan}
            className="flex items-center space-x-2"
          >
            <span>Continue to Payment</span>
            <ArrowRight size={16} />
          </Button>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-700/50 max-w-2xl mx-auto">
            <h4 className="font-semibold text-white mb-2">Blockchain Security Included</h4>
            <p className="text-gray-300 text-sm">
              All plans include smart contract execution on Ethereum and Polygon networks,
              ensuring immutable transaction records and automated payment processing.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
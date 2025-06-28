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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Choose Your Smart Contract Plan
          </h2>
          <p className="text-xl text-gray-600">
            Select the plan that best fits your invoicing needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {pricingPlans.map((plan, index) => {
            const Icon = getPlanIcon(plan.id);
            const isSelected = selectedPlan?.id === plan.id;
            
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
                    <div className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                      Recommended
                    </div>
                  </div>
                )}
                
                <Card
                  hover
                  className={`p-8 h-full cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'ring-2 ring-black shadow-xl'
                      : plan.recommended
                      ? 'border-black'
                      : ''
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      plan.id === 'basic' ? 'bg-blue-100' :
                      plan.id === 'pro' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      <Icon className={`w-8 h-8 ${
                        plan.id === 'basic' ? 'text-blue-600' :
                        plan.id === 'pro' ? 'text-green-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-black mb-1">
                      ${plan.price}
                    </div>
                    <div className="text-gray-500">per month</div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => setSelectedPlan(plan)}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </Button>
                </Card>
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <h4 className="font-semibold text-black mb-2">Blockchain Security Included</h4>
            <p className="text-gray-600 text-sm">
              All plans include smart contract execution on Ethereum and Polygon networks,
              ensuring immutable transaction records and automated payment processing.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
import { PricingPlan } from '../types';

export const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 10,
    invoicesPerMonth: 10,
    features: [
      'Up to 10 invoices per month',
      'Basic email notifications',
      'Standard templates',
      'PDF generation',
      'Basic support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 30,
    invoicesPerMonth: 100,
    recommended: true,
    features: [
      'Up to 100 invoices per month',
      'Advanced email notifications',
      'Custom templates',
      'Smart contract execution',
      'Priority support',
      'Analytics dashboard',
      'Multi-currency support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 90,
    invoicesPerMonth: -1, // Unlimited
    features: [
      'Unlimited invoices',
      'White-label solution',
      'API access',
      'Advanced smart contracts',
      'Dedicated support',
      'Custom integrations',
      'Enterprise security',
      'Bulk operations'
    ]
  }
];
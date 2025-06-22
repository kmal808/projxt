import { SubscriptionPlan } from '@/types/subscription';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: 0,
    billingPeriod: 'monthly',
    limits: {
      maxProjects: 1,
      maxCrews: 1,
      maxTeamMembers: 1,
      maxStorage: 100,
      features: ['basic'],
    },
    features: [
      '1 Project',
      '1 Crew',
      'Individual Use Only',
      'Basic Features',
      '100MB Storage',
      'Community Support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    tier: 'basic',
    price: 29,
    billingPeriod: 'monthly',
    limits: {
      maxProjects: 5,
      maxCrews: 3,
      maxTeamMembers: 10,
      maxStorage: 1000,
      features: ['basic', 'scheduling'],
    },
    features: [
      'Up to 5 Projects',
      'Up to 3 Crews',
      'Up to 10 Team Members',
      '1GB Storage',
      'Basic Features',
      'Scheduling',
      'Basic Reporting',
      'Email Support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    tier: 'professional',
    price: 79,
    billingPeriod: 'monthly',
    limits: {
      maxProjects: 15,
      maxCrews: 10,
      maxTeamMembers: 25,
      maxStorage: 5000,
      features: ['all'],
    },
    features: [
      'Up to 15 Projects',
      'Up to 10 Crews',
      'Up to 25 Team Members',
      '5GB Storage',
      'All Features',
      'Advanced Reporting',
      'Priority Support',
      'Custom Branding',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    price: 199,
    billingPeriod: 'monthly',
    limits: {
      maxProjects: Infinity,
      maxCrews: Infinity,
      maxTeamMembers: Infinity,
      maxStorage: 20000,
      features: ['all', 'api', 'white-label'],
    },
    features: [
      'Unlimited Projects',
      'Unlimited Crews',
      'Unlimited Team Members',
      '20GB Storage',
      'All Features',
      'Custom Integrations',
      'Dedicated Support',
      'White Labeling',
      'API Access',
    ],
  },
];

export const YEARLY_DISCOUNT = 0.17; // 17% off for yearly billing

export const getYearlyPrice = (monthlyPrice: number) => {
  return Math.round(monthlyPrice * 12 * (1 - YEARLY_DISCOUNT));
};
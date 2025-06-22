export type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';

export interface SubscriptionLimits {
  maxProjects: number;
  maxCrews: number;
  maxTeamMembers: number;
  maxStorage: number; // in MB
  features: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  limits: SubscriptionLimits;
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

export interface SubscriptionUsage {
  projects: number;
  crews: number;
  teamMembers: number;
  storage: number;
}
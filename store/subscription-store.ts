import { create } from 'zustand';
import { trpcClient } from '@/lib/trpc';
import type { Subscription, SubscriptionUsage } from '@/types/subscription';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';

interface SubscriptionState {
  subscription: Subscription | null;
  usage: SubscriptionUsage | null;
  isLoading: boolean;
  error: string | null;

  // Fetch current subscription
  fetchSubscription: () => Promise<void>;
  
  // Fetch current usage
  fetchUsage: () => Promise<void>;
  
  // Check if action is allowed based on current limits
  canAddProject: () => boolean;
  canAddCrew: () => boolean;
  canInviteTeamMember: () => boolean;
  
  // Subscription management
  upgradePlan: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  usage: null,
  isLoading: false,
  error: null,

  fetchSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await trpcClient.subscription.getCurrentSubscription.query();
      set({ subscription: result.subscription });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUsage: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await trpcClient.subscription.getUsage.query();
      set({ usage: result.usage });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  canAddProject: () => {
    const { subscription, usage } = get();
    if (!subscription || !usage) return false;

    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === subscription.tier);
    if (!plan) return false;

    return usage.projects < plan.limits.maxProjects;
  },

  canAddCrew: () => {
    const { subscription, usage } = get();
    if (!subscription || !usage) return false;

    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === subscription.tier);
    if (!plan) return false;

    return usage.crews < plan.limits.maxCrews;
  },

  canInviteTeamMember: () => {
    const { subscription, usage } = get();
    if (!subscription || !usage) return false;

    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === subscription.tier);
    if (!plan) return false;

    return usage.teamMembers < plan.limits.maxTeamMembers;
  },

  upgradePlan: async (planId: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await trpcClient.subscription.upgradePlan.mutate({ planId });
      set({ subscription: result.subscription });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await trpcClient.subscription.cancelSubscription.mutate();
      set({ subscription: result.subscription });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resumeSubscription: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await trpcClient.subscription.resumeSubscription.mutate();
      set({ subscription: result.subscription });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
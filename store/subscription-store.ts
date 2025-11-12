import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Subscription, SubscriptionUsage } from '@/types/subscription';
import { SUBSCRIPTION_PLANS } from '@/constants/subscription-plans';

interface SubscriptionState {
  subscription: Subscription | null;
  usage: SubscriptionUsage | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;

  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
  fetchUsage: () => Promise<void>;
  canAddProject: () => boolean;
  canAddCrew: () => boolean;
  canInviteTeamMember: () => boolean;
  purchaseSubscription: (productId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  validateReceipt: () => Promise<void>;
}

// Mock implementation for development
export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => {
      console.log('Subscription store initializing...');
      return {
      subscription: null,
      usage: null,
      isLoading: false,
      error: null,
      isConnected: false,

      connect: async () => {
        set({ isConnected: true });
      },

      disconnect: async () => {
        set({ isConnected: false });
      },

      fetchSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
          await get().validateReceipt();
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUsage: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock usage data
          set({
            usage: {
              projects: 1,
              crews: 1,
              teamMembers: 1,
              storage: 0
            }
          });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      canAddProject: () => {
        const { subscription, usage } = get();
        if (!usage) return true;
        if (!subscription) return true;

        const plan = SUBSCRIPTION_PLANS.find(p => p.tier === subscription.tier);
        if (!plan) return true;

        return usage.projects < plan.limits.maxProjects;
      },

      canAddCrew: () => {
        const { subscription, usage } = get();
        if (!usage) return true;
        if (!subscription) return true;

        const plan = SUBSCRIPTION_PLANS.find(p => p.tier === subscription.tier);
        if (!plan) return true;

        return usage.crews < plan.limits.maxCrews;
      },

      canInviteTeamMember: () => {
        const { subscription, usage } = get();
        if (!usage) return true;
        if (!subscription) return true;

        const plan = SUBSCRIPTION_PLANS.find(p => p.tier === subscription.tier);
        if (!plan) return true;

        return usage.teamMembers < plan.limits.maxTeamMembers;
      },

      purchaseSubscription: async (productId: string) => {
        if (Platform.OS === 'web') {
          throw new Error('In-app purchases are not available on web');
        }
        
        set({ isLoading: true, error: null });
        try {
          // Mock purchase flow
          const plan = SUBSCRIPTION_PLANS.find(p => p.productId === productId);
          if (!plan) {
            throw new Error('Invalid product ID');
          }

          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({
            subscription: {
              id: "mock-" + Date.now(),
              userId: "current-user",
              planId: plan.id,
              tier: plan.tier,
              status: "active",
              currentPeriodStart: new Date().toISOString(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              cancelAtPeriodEnd: false
            }
          });
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      restorePurchases: async () => {
        if (Platform.OS === 'web') {
          throw new Error('In-app purchases are not available on web');
        }
        
        set({ isLoading: true, error: null });
        try {
          // Mock restore flow
          const { subscription } = get();
          if (!subscription) {
            throw new Error('No subscription to restore');
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      validateReceipt: async () => {
        if (Platform.OS === 'web') return;
        
        set({ isLoading: true, error: null });
        try {
          const { subscription } = get();
          if (subscription) {
            const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
            if (currentPeriodEnd < new Date()) {
              set({ subscription: null });
            }
          }
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      }
    };
    },
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        console.log('Subscription store: Starting rehydration');
        return (state, error) => {
          if (error) {
            console.error('Subscription store: Rehydration failed', error);
          } else {
            console.log('Subscription store: Rehydration complete');
          }
        };
      },
      partialize: (state) => ({
        subscription: state.subscription,
        usage: state.usage
      })
    }
  )
);
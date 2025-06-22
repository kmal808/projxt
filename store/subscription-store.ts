import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';
import type { Subscription, SubscriptionUsage } from '@/types/subscription';
import { SUBSCRIPTION_PLANS, PRODUCT_IDS } from '@/constants/subscription-plans';

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

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      usage: null,
      isLoading: false,
      error: null,
      isConnected: false,

      connect: async () => {
        if (Platform.OS === 'web') return;
        
        try {
          await InAppPurchases.connectAsync();
          
          const response = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
          
          if (response?.responseCode === InAppPurchases.IAPResponseCode.OK && response.results) {
            console.log('Products loaded:', response.results);
          }
          
          InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
            if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
              results.forEach(async (purchase) => {
                if (!purchase.acknowledged) {
                  const plan = SUBSCRIPTION_PLANS.find(p => p.productId === purchase.productId);
                  if (plan) {
                    set({
                      subscription: {
                        id: purchase.orderId,
                        userId: 'current-user',
                        planId: plan.id,
                        tier: plan.tier,
                        status: 'active',
                        currentPeriodStart: new Date().toISOString(),
                        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        cancelAtPeriodEnd: false
                      }
                    });
                  }
                  
                  await InAppPurchases.finishTransactionAsync(purchase, false);
                }
              });
            }
          });
          
          set({ isConnected: true });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      disconnect: async () => {
        if (Platform.OS === 'web') return;
        
        try {
          await InAppPurchases.disconnectAsync();
          set({ isConnected: false });
        } catch (error: any) {
          set({ error: error.message });
        }
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

      purchaseSubscription: async (productId: string) => {
        if (Platform.OS === 'web') {
          throw new Error('In-app purchases are not available on web');
        }
        
        set({ isLoading: true, error: null });
        try {
          const result = await InAppPurchases.purchaseItemAsync(productId);
          
          if (!result) {
            throw new Error('Purchase failed - no response');
          }
          
          if (result.responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
            throw new Error('Purchase cancelled');
          }
          
          if (result.responseCode !== InAppPurchases.IAPResponseCode.OK) {
            throw new Error('Purchase failed');
          }
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
          const response = await InAppPurchases.getPurchaseHistoryAsync();
          
          if (response?.responseCode === InAppPurchases.IAPResponseCode.OK && response.results && response.results.length > 0) {
            const latestPurchase = response.results[response.results.length - 1];
            const plan = SUBSCRIPTION_PLANS.find(p => p.productId === latestPurchase.productId);
            if (plan) {
              set({
                subscription: {
                  id: latestPurchase.orderId,
                  userId: 'current-user',
                  planId: plan.id,
                  tier: plan.tier,
                  status: 'active',
                  currentPeriodStart: new Date().toISOString(),
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  cancelAtPeriodEnd: false
                }
              });
            }
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
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        subscription: state.subscription,
        usage: state.usage
      })
    }
  )
);
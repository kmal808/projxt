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

  // Setup
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Fetch current subscription
  fetchSubscription: () => Promise<void>;
  
  // Fetch current usage
  fetchUsage: () => Promise<void>;
  
  // Check if action is allowed based on current limits
  canAddProject: () => boolean;
  canAddCrew: () => boolean;
  canInviteTeamMember: () => boolean;
  
  // Subscription management
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
          
          // Get available products
          const { responseCode, results } = await InAppPurchases.getProductsAsync(PRODUCT_IDS);
          
          if (responseCode === InAppPurchases.IAPResponseCode.OK) {
            console.log('Products loaded:', results);
          }
          
          // Setup purchase listener
          InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
            if (responseCode === InAppPurchases.IAPResponseCode.OK) {
              results.forEach(async (purchase) => {
                if (!purchase.acknowledged) {
                  // Process the purchase
                  const plan = SUBSCRIPTION_PLANS.find(p => p.productId === purchase.productId);
                  if (plan) {
                    set({
                      subscription: {
                        id: purchase.orderId,
                        userId: 'current-user', // Replace with actual user ID
                        planId: plan.id,
                        tier: plan.tier,
                        status: 'active',
                        currentPeriodStart: new Date().toISOString(),
                        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        cancelAtPeriodEnd: false
                      }
                    });
                  }
                  
                  // Finish the transaction
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
          // In a real app, you'd validate the receipt with your backend here
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
          // In a real app, you'd fetch this from your backend
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
          const { responseCode } = await InAppPurchases.purchaseItemAsync(productId);
          
          if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
            throw new Error('Purchase cancelled');
          }
          
          if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
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
          const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
          
          if (responseCode === InAppPurchases.IAPResponseCode.OK) {
            // Process restored purchases
            const latestPurchase = results[results.length - 1];
            if (latestPurchase) {
              const plan = SUBSCRIPTION_PLANS.find(p => p.productId === latestPurchase.productId);
              if (plan) {
                set({
                  subscription: {
                    id: latestPurchase.orderId,
                    userId: 'current-user', // Replace with actual user ID
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
          // In a real app, you'd validate the receipt with your backend here
          // For now, we'll just check if we have an active subscription in state
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
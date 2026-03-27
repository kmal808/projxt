import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useSubscriptionStore } from '@/store/subscription-store';
import { SUBSCRIPTION_PLANS, getYearlyPrice } from '@/constants/subscription-plans';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';

export default function SubscriptionScreen() {
  const { 
    subscription, 
    purchaseSubscription, 
    restorePurchases,
    isLoading,
    connect,
    disconnect
  } = useSubscriptionStore();
  
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    if (Platform.OS !== 'web') {
      connect();
      return () => {
        disconnect();
      };
    }
  }, []);

  const handleUpgrade = async (plan: typeof SUBSCRIPTION_PLANS[0]) => {
    if (isLoading || !plan.productId) return;

    try {
      await purchaseSubscription(plan.productId);
      Alert.alert('Success', 'Your subscription has been updated');
    } catch (error: any) {
      if (error.message !== 'Purchase cancelled') {
        Alert.alert('Error', error.message || 'Failed to upgrade subscription');
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      Alert.alert('Success', 'Your purchases have been restored');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to restore purchases');
    }
  };

  const renderFeature = (feature: string, included: boolean) => (
    <View style={styles.featureRow} key={feature}>
      {included ? (
        <Check size={16} color={Colors.success} />
      ) : (
        <X size={16} color={Colors.textLight} />
      )}
      <Text style={[styles.featureText, !included && styles.featureTextDisabled]}>
        {feature}
      </Text>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ 
          title: 'Subscription Plans',
          headerBackTitle: 'Back',
        }} />
        <View style={styles.webMessage}>
          <Text style={styles.webMessageText}>
            Subscription management is only available in the mobile app.
          </Text>
          <Text style={styles.webMessageSubtext}>
            Please download our app from the App Store to manage your subscription.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Subscription Plans',
        headerBackTitle: 'Back',
      }} />

      <View style={styles.billingToggle}>
        <TouchableOpacity
          style={[
            styles.billingOption,
            billingPeriod === 'monthly' && styles.billingOptionActive
          ]}
          onPress={() => setBillingPeriod('monthly')}
        >
          <Text style={[
            styles.billingOptionText,
            billingPeriod === 'monthly' && styles.billingOptionTextActive
          ]}>
            Monthly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.billingOption,
            billingPeriod === 'yearly' && styles.billingOptionActive
          ]}
          onPress={() => setBillingPeriod('yearly')}
        >
          <Text style={[
            styles.billingOptionText,
            billingPeriod === 'yearly' && styles.billingOptionTextActive
          ]}>
            Yearly (Save 17%)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.plansContainer}>
        {SUBSCRIPTION_PLANS.map((plan) => {
          const price = billingPeriod === 'yearly' 
            ? getYearlyPrice(plan.price) 
            : plan.price;
          
          const isCurrentPlan = subscription?.tier === plan.tier;
          const planId = billingPeriod === 'yearly' 
            ? plan.id.replace('monthly', 'yearly')
            : plan.id;

          return (
            <View key={planId} style={[
              styles.planCard,
              isCurrentPlan && styles.currentPlanCard
            ]}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>
                  ${price}
                  <Text style={styles.billingPeriod}>
                    /{billingPeriod === 'yearly' ? 'year' : 'month'}
                  </Text>
                </Text>
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature) => renderFeature(feature, true))}
              </View>

              <Button
                title={isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                onPress={() => handleUpgrade(plan)}
                disabled={isCurrentPlan || isLoading}
                loading={isLoading}
                variant={isCurrentPlan ? 'outline' : 'primary'}
                style={styles.upgradeButton}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Restore Purchases"
          onPress={handleRestore}
          variant="outline"
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webMessageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  webMessageSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  billingToggle: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  billingOptionActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  billingOptionText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  billingOptionTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  plansContainer: {
    padding: 16,
  },
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentPlanCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  billingPeriod: {
    fontSize: 14,
    color: Colors.textLight,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
  },
  featureTextDisabled: {
    color: Colors.textLight,
  },
  upgradeButton: {
    marginTop: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
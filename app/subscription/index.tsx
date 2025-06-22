import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { useSubscriptionStore } from '@/store/subscription-store';
import { SUBSCRIPTION_PLANS, getYearlyPrice } from '@/constants/subscription-plans';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';

export default function SubscriptionScreen() {
  const { subscription, upgradePlan } = useSubscriptionStore();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      await upgradePlan(planId);
      Alert.alert('Success', 'Your subscription has been updated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upgrade subscription');
    } finally {
      setIsLoading(false);
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

          return (
            <View key={plan.id} style={[
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
                onPress={() => handleUpgrade(plan.id)}
                disabled={isCurrentPlan || isLoading}
                loading={isLoading}
                variant={isCurrentPlan ? 'outline' : 'primary'}
                style={styles.upgradeButton}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
});
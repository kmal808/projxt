// ... existing imports ...
import { CreditCard } from 'lucide-react-native';
import { useSubscriptionStore } from '@/store/subscription-store';

export default function SettingsScreen() {
  // ... existing code ...
  const { subscription } = useSubscriptionStore();

  // Add this section after the profile section and before the preferences section
  const renderSubscriptionSection = () => (
    <>
      <Text style={styles.sectionTitle}>Subscription</Text>
      <Card>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/subscription')}
        >
          <View style={styles.settingIconContainer}>
            <CreditCard size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>
              {subscription?.tier.charAt(0).toUpperCase() + subscription?.tier.slice(1)} Plan
            </Text>
            <Text style={styles.settingDescription}>
              Manage your subscription and billing
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </Card>
    </>
  );

  // Add renderSubscriptionSection() to the return statement
  // after the profile card and before the preferences section
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ... existing profile section ... */}
      
      {renderSubscriptionSection()}
      
      {/* ... rest of the existing sections ... */}
    </ScrollView>
  );
}
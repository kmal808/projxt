// ... existing imports ...
import { useSubscriptionStore } from '@/store/subscription-store';

export default function InviteUserScreen() {
  const { canInviteTeamMember } = useSubscriptionStore();
  // ... existing code ...

  const handleInvite = async () => {
    if (!validateForm()) return;
    
    if (!canInviteTeamMember()) {
      Alert.alert(
        'Subscription Limit Reached',
        'You have reached the maximum number of team members allowed on your current plan. Please upgrade to invite more team members.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'View Plans',
            onPress: () => router.push('/subscription')
          }
        ]
      );
      return;
    }
    
    setIsLoading(true);
    
    // ... rest of the existing invite code ...
  };

  // ... rest of the component ...
}
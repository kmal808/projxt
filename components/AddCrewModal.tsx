// ... existing imports ...
import { useSubscriptionStore } from '@/store/subscription-store';

export default function AddCrewModal({ visible, onClose }: AddCrewModalProps) {
  const { canAddCrew } = useSubscriptionStore();
  // ... existing code ...

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (!canAddCrew()) {
      Alert.alert(
        'Subscription Limit Reached',
        'You have reached the maximum number of crews allowed on your current plan. Please upgrade to add more crews.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'View Plans',
            onPress: () => {
              onClose();
              router.push('/subscription');
            }
          }
        ]
      );
      return;
    }
    
    setIsSubmitting(true);
    
    // ... rest of the existing submit code ...
  };

  // ... rest of the component ...
}
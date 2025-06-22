// ... existing imports ...
import { useSubscriptionStore } from '@/store/subscription-store';

export default function AddProjectModal({ visible, onClose }: AddProjectModalProps) {
  const { canAddProject } = useSubscriptionStore();
  // ... existing code ...

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (!canAddProject()) {
      Alert.alert(
        'Subscription Limit Reached',
        'You have reached the maximum number of projects allowed on your current plan. Please upgrade to add more projects.',
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
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCrewsStore } from '@/store/crews-store';
import { useSubscriptionStore } from '@/store/subscription-store';
import Input from './ui/Input';
import Button from './ui/Button';
import Colors from '@/constants/colors';
import { X, Users } from 'lucide-react-native';

interface AddCrewModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddCrewModal({ visible, onClose }: AddCrewModalProps) {
  const router = useRouter();
  const { addCrew } = useCrewsStore();
  const { canAddCrew } = useSubscriptionStore();
  
  const [crewName, setCrewName] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!crewName.trim()) {
      newErrors.crewName = 'Crew name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
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
    
    try {
      const newCrew = {
        name: crewName,
        members: [],
        projects: [],
        schedule: [],
      };
      
      await addCrew(newCrew);
      
      const crewsStore = useCrewsStore.getState();
      if (crewsStore.error) {
        throw new Error(crewsStore.error);
      }
      
      resetForm();
      onClose();
      Alert.alert('Success', 'Crew added successfully');
    } catch (error: any) {
      console.error('Add crew error:', error);
      const errorMessage = error?.message || 'Failed to add crew';
      
      if (errorMessage.includes('company')) {
        Alert.alert(
          'No Company Found',
          'You need to be part of a company to add crews. Please contact your administrator to be invited to a company, or create a new company in Settings.',
          [
            { text: 'OK', style: 'cancel' },
            { 
              text: 'Go to Settings',
              onPress: () => {
                onClose();
                router.push('/(tabs)/settings');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setCrewName('');
    setErrors({});
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Crew</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Input
              label="Crew Name"
              placeholder="Enter crew name"
              value={crewName}
              onChangeText={setCrewName}
              error={errors.crewName}
              leftIcon={<Users size={18} color={Colors.textLight} />}
            />
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleClose}
                style={styles.button}
              />
              <Button
                title="Add Crew"
                onPress={handleSubmit}
                loading={isSubmitting}
                style={styles.button}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  keyboardAvoidingView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

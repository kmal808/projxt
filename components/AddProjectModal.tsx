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
import { useProjectsStore } from '@/store/projects-store';
import { useSubscriptionStore } from '@/store/subscription-store';
import Input from './ui/Input';
import Button from './ui/Button';
import Colors from '@/constants/colors';
import { X, Building, MapPin, Calendar, DollarSign } from 'lucide-react-native';

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddProjectModal({ visible, onClose }: AddProjectModalProps) {
  const router = useRouter();
  const { addProject } = useProjectsStore();
  const { canAddProject } = useSubscriptionStore();
  
  const [projectName, setProjectName] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    
    if (!client.trim()) {
      newErrors.client = 'Client name is required';
    }
    
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
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
    
    try {
      const newProject = {
        name: projectName,
        number: `PRJ-${Date.now()}`,
        client,
        location,
        budget: parseFloat(budget) || 0,
        startDate,
        endDate,
        status: 'pending' as const,
        crews: [],
        tasks: [],
        documents: [],
      };
      
      await addProject(newProject);
      
      resetForm();
      onClose();
      Alert.alert('Success', 'Project added successfully');
    } catch (error) {
      console.error('Error adding project:', error);
      Alert.alert('Error', 'Failed to add project');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setProjectName('');
    setClient('');
    setLocation('');
    setBudget('');
    setStartDate('');
    setEndDate('');
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
            <Text style={styles.modalTitle}>Add Project</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Input
              label="Project Name"
              placeholder="Enter project name"
              value={projectName}
              onChangeText={setProjectName}
              error={errors.projectName}
              leftIcon={<Building size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Client"
              placeholder="Enter client name"
              value={client}
              onChangeText={setClient}
              error={errors.client}
            />
            
            <Input
              label="Location"
              placeholder="Enter project location"
              value={location}
              onChangeText={setLocation}
              error={errors.location}
              leftIcon={<MapPin size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Budget (optional)"
              placeholder="Enter budget"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              leftIcon={<DollarSign size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Start Date"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
              error={errors.startDate}
              leftIcon={<Calendar size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="End Date (optional)"
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
              leftIcon={<Calendar size={18} color={Colors.textLight} />}
            />
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleClose}
                style={styles.button}
              />
              <Button
                title="Add Project"
                onPress={handleSubmit}
                loading={isSubmitting}
                style={styles.button}
              />
            </View>
          </ScrollView>
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
    maxHeight: '80%',
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
    marginBottom: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});

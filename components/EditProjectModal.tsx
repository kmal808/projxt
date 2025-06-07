import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useProjectsStore } from '@/store/projects-store';
import Input from './ui/Input';
import Button from './ui/Button';
import Colors from '@/constants/colors';
import { X, Calendar, MapPin, DollarSign, Users, Hash } from 'lucide-react-native';
import { Project } from '@/types';

interface EditProjectModalProps {
  visible: boolean;
  onClose: () => void;
  project: Project | null;
}

export default function EditProjectModal({ visible, onClose, project }: EditProjectModalProps) {
  const { updateProject } = useProjectsStore();
  
  const [projectName, setProjectName] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('pending');
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (project && visible) {
      setProjectName(project.name);
      setProjectNumber(project.number);
      setClient(project.client);
      setLocation(project.location);
      setBudget(project.budget.toString());
      setStartDate(project.startDate);
      setEndDate(project.endDate || '');
      setStatus(project.status);
    }
  }, [project, visible]);
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    
    if (!projectNumber.trim()) {
      newErrors.projectNumber = 'Project number is required';
    }
    
    if (!client.trim()) {
      newErrors.client = 'Client name is required';
    }
    
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!budget.trim()) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(Number(budget)) || Number(budget) <= 0) {
      newErrors.budget = 'Budget must be a positive number';
    }
    
    if (!startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      newErrors.startDate = 'Use format YYYY-MM-DD';
    }
    
    if (endDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      newErrors.endDate = 'Use format YYYY-MM-DD';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!project || !validateForm()) return;
    
    setIsSubmitting(true);
    
    // Create updated project object
    const updatedProject = {
      name: projectName,
      number: projectNumber,
      client,
      location,
      budget: Number(budget),
      startDate,
      endDate: endDate || undefined,
      status: status as 'pending' | 'active' | 'completed' | 'on-hold',
    };
    
    // Update project in store
    updateProject(project.id, updatedProject);
    
    // Close modal
    onClose();
    setIsSubmitting(false);
  };
  
  const handleClose = () => {
    setErrors({});
    onClose();
  };
  
  const renderStatusOption = (value: string, label: string) => {
    return (
      <TouchableOpacity
        style={[
          styles.statusOption,
          status === value && styles.selectedStatusOption
        ]}
        onPress={() => setStatus(value)}
      >
        <Text
          style={[
            styles.statusOptionText,
            status === value && styles.selectedStatusOptionText
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  
  if (!project) return null;
  
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
            <Text style={styles.modalTitle}>Edit Project</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Input
              label="Project Name"
              placeholder="Enter project name"
              value={projectName}
              onChangeText={setProjectName}
              error={errors.projectName}
              leftIcon={<Users size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Project Number"
              placeholder="e.g. PRJ-2023-001"
              value={projectNumber}
              onChangeText={setProjectNumber}
              error={errors.projectNumber}
              leftIcon={<Hash size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Client"
              placeholder="Enter client name"
              value={client}
              onChangeText={setClient}
              error={errors.client}
              leftIcon={<Users size={18} color={Colors.textLight} />}
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
              label="Budget ($)"
              placeholder="Enter budget amount"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              error={errors.budget}
              leftIcon={<DollarSign size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Start Date (YYYY-MM-DD)"
              placeholder="e.g. 2023-10-15"
              value={startDate}
              onChangeText={setStartDate}
              error={errors.startDate}
              leftIcon={<Calendar size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="End Date (YYYY-MM-DD, optional)"
              placeholder="e.g. 2024-03-30"
              value={endDate}
              onChangeText={setEndDate}
              error={errors.endDate}
              leftIcon={<Calendar size={18} color={Colors.textLight} />}
            />
            
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Project Status</Text>
              <View style={styles.statusOptions}>
                {renderStatusOption('pending', 'Pending')}
                {renderStatusOption('active', 'Active')}
                {renderStatusOption('on-hold', 'On Hold')}
                {renderStatusOption('completed', 'Completed')}
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleClose}
                style={styles.button}
              />
              <Button
                title="Save Changes"
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
    maxHeight: '90%',
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
    maxHeight: '80%',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.text,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  selectedStatusOption: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  statusOptionText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  selectedStatusOptionText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
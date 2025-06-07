import React, { useState } from 'react';
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
import { X, Calendar, AlertCircle, User } from 'lucide-react-native';
import { Task } from '@/types';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
}

export default function AddTaskModal({ visible, onClose, projectId }: AddTaskModalProps) {
  const { addTaskToProject } = useProjectsStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      newErrors.dueDate = 'Use format YYYY-MM-DD';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Create new task object
    const newTask: Task = {
      id: `task-${Date.now()}`,
      projectId,
      title,
      description: description || undefined,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined,
      status: 'todo',
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add task to project
    addTaskToProject(projectId, newTask);
    
    // Reset form and close modal
    resetForm();
    onClose();
    setIsSubmitting(false);
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAssignedTo('');
    setDueDate('');
    setPriority('medium');
    setErrors({});
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const renderPriorityOption = (value: 'low' | 'medium' | 'high', label: string) => {
    return (
      <TouchableOpacity
        style={[
          styles.priorityOption,
          priority === value && styles.selectedPriorityOption,
          value === 'low' && styles.lowPriority,
          value === 'medium' && styles.mediumPriority,
          value === 'high' && styles.highPriority,
        ]}
        onPress={() => setPriority(value)}
      >
        <Text
          style={[
            styles.priorityOptionText,
            priority === value && styles.selectedPriorityOptionText
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
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
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Input
              label="Task Title"
              placeholder="Enter task title"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />
            
            <Input
              label="Description (optional)"
              placeholder="Enter task description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            
            <Input
              label="Assigned To (optional)"
              placeholder="Enter assignee name"
              value={assignedTo}
              onChangeText={setAssignedTo}
              leftIcon={<User size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Due Date (YYYY-MM-DD, optional)"
              placeholder="e.g. 2023-10-15"
              value={dueDate}
              onChangeText={setDueDate}
              error={errors.dueDate}
              leftIcon={<Calendar size={18} color={Colors.textLight} />}
            />
            
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityLabel}>Priority</Text>
              <View style={styles.priorityOptions}>
                {renderPriorityOption('low', 'Low')}
                {renderPriorityOption('medium', 'Medium')}
                {renderPriorityOption('high', 'High')}
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
                title="Add Task"
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
  priorityContainer: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: Colors.text,
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedPriorityOption: {
    borderColor: Colors.primary,
  },
  lowPriority: {
    backgroundColor: Colors.success + '10',
  },
  mediumPriority: {
    backgroundColor: Colors.warning + '10',
  },
  highPriority: {
    backgroundColor: Colors.danger + '10',
  },
  priorityOptionText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  selectedPriorityOptionText: {
    color: Colors.text,
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
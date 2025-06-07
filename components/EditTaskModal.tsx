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
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { useProjectsStore } from '@/store/projects-store';
import Input from './ui/Input';
import Button from './ui/Button';
import Colors from '@/constants/colors';
import { X, Calendar, AlertCircle, User, Trash2 } from 'lucide-react-native';
import { Task } from '@/types';

interface EditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  task: Task | null;
  projectId: string;
}

export default function EditTaskModal({ visible, onClose, task, projectId }: EditTaskModalProps) {
  const { updateTaskInProject, deleteTaskFromProject } = useProjectsStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'completed'>('todo');
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (task && visible) {
      setTitle(task.title);
      setDescription(task.description || '');
      setAssignedTo(task.assignedTo || '');
      setDueDate(task.dueDate || '');
      setPriority(task.priority);
      setStatus(task.status);
    }
  }, [task, visible]);
  
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
    if (!task || !validateForm()) return;
    
    setIsSubmitting(true);
    
    // Create updated task object
    const updatedTask: Partial<Task> = {
      title,
      description: description || undefined,
      assignedTo: assignedTo || undefined,
      dueDate: dueDate || undefined,
      priority,
      status,
      updatedAt: new Date().toISOString(),
    };
    
    // Update task in project
    updateTaskInProject(projectId, task.id, updatedTask);
    
    // Close modal
    onClose();
    setIsSubmitting(false);
  };
  
  const handleDelete = () => {
    if (!task) return;
    
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteTaskFromProject(projectId, task.id);
            onClose();
          }
        }
      ]
    );
  };
  
  const handleClose = () => {
    setErrors({});
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
  
  const renderStatusOption = (value: 'todo' | 'in_progress' | 'completed', label: string) => {
    return (
      <TouchableOpacity
        style={[
          styles.statusOption,
          status === value && styles.selectedStatusOption,
          value === 'todo' && styles.todoStatus,
          value === 'in_progress' && styles.inProgressStatus,
          value === 'completed' && styles.completedStatus,
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
  
  if (!task) return null;
  
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
            <Text style={styles.modalTitle}>Edit Task</Text>
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
            
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status</Text>
              <View style={styles.statusOptions}>
                {renderStatusOption('todo', 'To Do')}
                {renderStatusOption('in_progress', 'In Progress')}
                {renderStatusOption('completed', 'Completed')}
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Delete Task"
                variant="danger"
                onPress={handleDelete}
                leftIcon={<Trash2 size={16} color="#FFFFFF" />}
                style={styles.deleteButton}
              />
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
    justifyContent: 'space-between',
  },
  statusOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedStatusOption: {
    borderColor: Colors.primary,
  },
  todoStatus: {
    backgroundColor: Colors.textLight + '10',
  },
  inProgressStatus: {
    backgroundColor: Colors.primary + '10',
  },
  completedStatus: {
    backgroundColor: Colors.success + '10',
  },
  statusOptionText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  selectedStatusOptionText: {
    color: Colors.text,
    fontWeight: '500',
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
  deleteButton: {
    flex: 1,
  },
});
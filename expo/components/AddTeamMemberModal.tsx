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
  ScrollView
} from 'react-native';
import { useCrewsStore } from '@/store/crews-store';
import Input from './ui/Input';
import Button from './ui/Button';
import Colors from '@/constants/colors';
import { X, User, Mail, Phone, Briefcase } from 'lucide-react-native';
import { User as UserType, Crew } from '@/types';

interface AddTeamMemberModalProps {
  visible: boolean;
  onClose: () => void;
  crew: Crew | null;
}

export default function AddTeamMemberModal({ visible, onClose, crew }: AddTeamMemberModalProps) {
  const { addMemberToCrew } = useCrewsStore();
  
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberRole, setMemberRole] = useState('field');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!memberName.trim()) {
      newErrors.memberName = 'Name is required';
    }
    
    if (!memberEmail.trim()) {
      newErrors.memberEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(memberEmail)) {
      newErrors.memberEmail = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm() || !crew) return;
    
    setIsSubmitting(true);
    
    // Create new member object
    const newMember: UserType = {
      id: `user${Date.now()}`,
      name: memberName,
      email: memberEmail,
      role: 'field',
      crewId: crew.id,
      phone: memberPhone,
    };
    
    // Add member to crew
    addMemberToCrew(crew.id, newMember);
    
    // Reset form and close modal
    resetForm();
    onClose();
    setIsSubmitting(false);
  };
  
  const resetForm = () => {
    setMemberName('');
    setMemberEmail('');
    setMemberPhone('');
    setMemberRole('field');
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
            <Text style={styles.modalTitle}>Add Team Member</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Input
              label="Name"
              placeholder="Enter team member name"
              value={memberName}
              onChangeText={setMemberName}
              error={errors.memberName}
              leftIcon={<User size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Email"
              placeholder="Enter email address"
              value={memberEmail}
              onChangeText={setMemberEmail}
              error={errors.memberEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Phone (optional)"
              placeholder="Enter phone number"
              value={memberPhone}
              onChangeText={setMemberPhone}
              keyboardType="phone-pad"
              leftIcon={<Phone size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Role"
              placeholder="Enter role"
              value={memberRole}
              onChangeText={setMemberRole}
              leftIcon={<Briefcase size={18} color={Colors.textLight} />}
            />
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleClose}
                style={styles.button}
              />
              <Button
                title="Add Member"
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 0,
    maxHeight: '80%',
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
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
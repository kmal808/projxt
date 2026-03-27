import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput
} from 'react-native';
import { X } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Colors from '@/constants/colors';
import { useInventoryStore } from '@/store/inventory-store';
import { useProjectsStore } from '@/store/projects-store';
import { useAuthStore } from '@/store/auth-store';
import { InventoryItem } from '@/types';

type ProductType = 'windows' | 'siding' | 'entry_doors' | 'security_doors' | 'other';

interface AddInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  editItem?: InventoryItem;
}

const itemTypes: { value: ProductType; label: string }[] = [
  { value: 'windows', label: 'Windows' },
  { value: 'siding', label: 'Siding' },
  { value: 'entry_doors', label: 'Entry Doors' },
  { value: 'security_doors', label: 'Security Doors' },
  { value: 'other', label: 'Other' }
];

export default function AddInventoryModal({ visible, onClose, editItem }: AddInventoryModalProps) {
  const { addItem, updateItem } = useInventoryStore();
  const { projects } = useProjectsStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<{
    jobName: string;
    jobNumber: string;
    manufacturerOrderNumber: string;
    itemType: ProductType;
    quantity: string;
    notes: string;
  }>(editItem ? {
    jobName: editItem.jobName,
    jobNumber: editItem.jobNumber,
    manufacturerOrderNumber: editItem.manufacturerOrderNumber,
    itemType: (editItem.itemType as ProductType) || 'windows',
    quantity: editItem.quantity.toString(),
    notes: editItem.notes || '',
  } : {
    jobName: '',
    jobNumber: '',
    manufacturerOrderNumber: '',
    itemType: 'windows',
    quantity: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{
    jobName?: string;
    jobNumber?: string;
    manufacturerOrderNumber?: string;
    quantity?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      jobName?: string;
      jobNumber?: string;
      manufacturerOrderNumber?: string;
      quantity?: string;
    } = {};
    
    if (!formData.jobName) {
      newErrors.jobName = 'Job name is required';
    }
    
    if (!formData.jobNumber) {
      newErrors.jobNumber = 'Job number is required';
    }
    
    if (!formData.manufacturerOrderNumber) {
      newErrors.manufacturerOrderNumber = 'Order number is required';
    }
    
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (editItem) {
      updateItem(editItem.id, {
        ...formData,
        quantity: Number(formData.quantity),
      });
    } else {
      const now = new Date().toISOString();
      addItem({
        ...formData,
        name: formData.jobName,
        category: formData.itemType,
        unit: 'pcs',
        location: '',
        quantity: Number(formData.quantity),
        dateAdded: now
      });
    }
    
    onClose();
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectJob = (project: { name: string; number: string }) => {
    setFormData(prev => ({
      ...prev,
      jobName: project.name,
      jobNumber: project.number,
    }));
    if (errors.jobName) {
      setErrors(prev => ({ ...prev, jobName: undefined }));
    }
    if (errors.jobNumber) {
      setErrors(prev => ({ ...prev, jobNumber: undefined }));
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Job Information</Text>
            
            <View style={styles.jobSelection}>
              <Text style={styles.label}>Select from existing jobs:</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.jobChipsContainer}
              >
                {projects.map(project => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.jobChip,
                      formData.jobNumber === project.number && styles.selectedJobChip
                    ]}
                    onPress={() => handleSelectJob({ name: project.name, number: project.number })}
                  >
                    <Text 
                      style={[
                        styles.jobChipText,
                        formData.jobNumber === project.number && styles.selectedJobChipText
                      ]}
                    >
                      {project.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <Input
              label="Job Name"
              value={formData.jobName}
              onChangeText={(text) => handleChange('jobName', text)}
              placeholder="Enter job name"
              error={errors.jobName}
              containerStyle={styles.inputContainer}
            />
            
            <Input
              label="Job Number"
              value={formData.jobNumber}
              onChangeText={(text) => handleChange('jobNumber', text)}
              placeholder="Enter job number"
              error={errors.jobNumber}
              containerStyle={styles.inputContainer}
            />
            
            <Input
              label="Manufacturer Order Number"
              value={formData.manufacturerOrderNumber}
              onChangeText={(text) => handleChange('manufacturerOrderNumber', text)}
              placeholder="Enter order number"
              error={errors.manufacturerOrderNumber}
              containerStyle={styles.inputContainer}
            />
            
            <Text style={styles.sectionTitle}>Item Details</Text>
            
            <Text style={styles.label}>Item Type</Text>
            <View style={styles.itemTypeContainer}>
              {itemTypes.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.itemTypeChip,
                    formData.itemType === type.value && styles.selectedItemTypeChip
                  ]}
                  onPress={() => handleChange('itemType', type.value)}
                >
                  <Text 
                    style={[
                      styles.itemTypeChipText,
                      formData.itemType === type.value && styles.selectedItemTypeChipText
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Input
              label="Quantity"
              value={formData.quantity}
              onChangeText={(text) => handleChange('quantity', text)}
              placeholder="Enter quantity"
              keyboardType="numeric"
              error={errors.quantity}
              containerStyle={styles.inputContainer}
            />
            
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={formData.notes}
              onChangeText={(text) => handleChange('notes', text)}
              placeholder="Enter any additional notes about this item"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={onClose}
                variant="secondary"
                style={styles.button}
              />
              <Button
                title={editItem ? 'Save Changes' : 'Add Item'}
                onPress={handleSubmit}
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  jobSelection: {
    marginBottom: 16,
  },
  jobChipsContainer: {
    paddingVertical: 8,
  },
  jobChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedJobChip: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  jobChipText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  selectedJobChipText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  itemTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  itemTypeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedItemTypeChip: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  itemTypeChipText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  selectedItemTypeChipText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  notesInput: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    color: Colors.text,
    marginBottom: 24,
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
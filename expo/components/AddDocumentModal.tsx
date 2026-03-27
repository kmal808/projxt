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
  Alert
} from 'react-native';
import { useProjectsStore } from '@/store/projects-store';
import Input from './ui/Input';
import Button from './ui/Button';
import Colors from '@/constants/colors';
import { X, FileText, Upload } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { ProjectDocument } from '@/types';

interface AddDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
}

export default function AddDocumentModal({ visible, onClose, projectId }: AddDocumentModalProps) {
  const { addDocumentToProject } = useProjectsStore();
  
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const file = result.assets[0];
      setSelectedFile(file);
      
      // Auto-fill name and type if not already filled
      if (!documentName) {
        setDocumentName(file.name);
      }
      
      if (!documentType) {
        // Extract file extension
        const fileExtension = file.name.split('.').pop()?.toUpperCase() || '';
        setDocumentType(fileExtension);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!documentName.trim()) {
      newErrors.documentName = 'Document name is required';
    }
    
    if (!documentType.trim()) {
      newErrors.documentType = 'Document type is required';
    }
    
    if (!selectedFile) {
      newErrors.file = 'Please select a file';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would upload the file to a server
      // For this demo, we'll just use the file URI
      
      // Create new document object
      const newDocument: ProjectDocument = {
        id: `doc-${Date.now()}`,
        name: documentName,
        type: documentType,
        uri: selectedFile?.uri || '',
        size: selectedFile?.size || 0,
        uploadedBy: 'Current User',
        uploadedAt: new Date().toISOString(),
      };
      
      // Add document to project
      addDocumentToProject(projectId, newDocument);
      
      // Reset form and close modal
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding document:', error);
      Alert.alert('Error', 'Failed to add document');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setDocumentName('');
    setDocumentType('');
    setSelectedFile(null);
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
            <Text style={styles.modalTitle}>Add Document</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.uploadContainer}
              onPress={pickDocument}
            >
              <View style={styles.uploadIconContainer}>
                <Upload size={24} color={Colors.primary} />
              </View>
              <Text style={styles.uploadText}>
                {selectedFile ? selectedFile.name : 'Tap to select a document'}
              </Text>
              {errors.file && <Text style={styles.errorText}>{errors.file}</Text>}
            </TouchableOpacity>
            
            <Input
              label="Document Name"
              placeholder="Enter document name"
              value={documentName}
              onChangeText={setDocumentName}
              error={errors.documentName}
              leftIcon={<FileText size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Document Type"
              placeholder="e.g. PDF, DOCX, JPG"
              value={documentType}
              onChangeText={setDocumentType}
              error={errors.documentType}
            />
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleClose}
                style={styles.button}
              />
              <Button
                title="Add Document"
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
  uploadContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
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
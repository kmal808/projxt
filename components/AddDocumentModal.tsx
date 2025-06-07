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
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { useProjectsStore } from '@/store/projects-store';
import Input from './ui/Input';
import Button from './ui/Button';
import Colors from '@/constants/colors';
import { X, FileText, Tag, User, Upload } from 'lucide-react-native';
import { ProjectDocument } from '@/types';
import { useAuthStore } from '@/store/auth-store';
import * as DocumentPicker from 'expo-document-picker';

interface AddDocumentModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
}

export default function AddDocumentModal({ visible, onClose, projectId }: AddDocumentModalProps) {
  const { addDocumentToProject } = useProjectsStore();
  const { user } = useAuthStore();
  
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [tags, setTags] = useState('');
  const [folder, setFolder] = useState('');
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
      
      setSelectedFile(result.assets[0]);
      
      // Auto-fill name if empty
      if (!name) {
        setName(result.assets[0].name);
      }
      
      // Auto-detect type from file extension
      if (!type) {
        const fileExtension = result.assets[0].name.split('.').pop()?.toLowerCase();
        if (fileExtension) {
          if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            setType('Image');
          } else if (['pdf'].includes(fileExtension)) {
            setType('PDF Document');
          } else if (['doc', 'docx'].includes(fileExtension)) {
            setType('Word Document');
          } else if (['xls', 'xlsx'].includes(fileExtension)) {
            setType('Spreadsheet');
          } else if (['ppt', 'pptx'].includes(fileExtension)) {
            setType('Presentation');
          } else {
            setType(fileExtension.toUpperCase());
          }
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };
  
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Document name is required';
    }
    
    if (!type.trim()) {
      newErrors.type = 'Document type is required';
    }
    
    if (!selectedFile) {
      newErrors.file = 'Please select a file';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm() || !user) return;
    
    setIsSubmitting(true);
    
    // Create new document object
    const newDocument: ProjectDocument = {
      id: `doc-${Date.now()}`,
      name,
      type,
      size: selectedFile?.size || 0,
      uri: selectedFile?.uri || '',
      uploadedBy: user.name,
      uploadedAt: new Date().toISOString(),
      folder: folder || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
    };
    
    // Add document to project
    addDocumentToProject(projectId, newDocument);
    
    // Reset form and close modal
    resetForm();
    onClose();
    setIsSubmitting(false);
  };
  
  const resetForm = () => {
    setName('');
    setType('');
    setTags('');
    setFolder('');
    setSelectedFile(null);
    setErrors({});
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            <Text style={styles.modalTitle}>Upload Document</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.filePickerButton} 
              onPress={pickDocument}
            >
              <Upload size={24} color={Colors.primary} />
              <Text style={styles.filePickerText}>
                {selectedFile ? 'Change File' : 'Select File'}
              </Text>
            </TouchableOpacity>
            
            {selectedFile && (
              <View style={styles.selectedFileContainer}>
                <FileText size={20} color={Colors.text} />
                <View style={styles.selectedFileInfo}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.selectedFileSize}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
              </View>
            )}
            
            {errors.file && (
              <Text style={styles.errorText}>{errors.file}</Text>
            )}
            
            <Input
              label="Document Name"
              placeholder="Enter document name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              leftIcon={<FileText size={18} color={Colors.textLight} />}
            />
            
            <Input
              label="Document Type"
              placeholder="e.g. Contract, Invoice, Plan"
              value={type}
              onChangeText={setType}
              error={errors.type}
            />
            
            <Input
              label="Folder (optional)"
              placeholder="e.g. Contracts, Invoices, Plans"
              value={folder}
              onChangeText={setFolder}
            />
            
            <Input
              label="Tags (optional, comma separated)"
              placeholder="e.g. important, reviewed, final"
              value={tags}
              onChangeText={setTags}
              leftIcon={<Tag size={18} color={Colors.textLight} />}
            />
            
            <View style={styles.uploadInfo}>
              <User size={16} color={Colors.textLight} />
              <Text style={styles.uploadInfoText}>
                Will be uploaded by {user?.name || 'you'}
              </Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleClose}
                style={styles.button}
              />
              <Button
                title="Upload Document"
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
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  filePickerText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedFileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedFileSize: {
    fontSize: 12,
    color: Colors.textLight,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginBottom: 16,
  },
  uploadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  uploadInfoText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
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
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onClose }) => {
  const { user, updateUser } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    title: user?.title || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      try {
        updateUser({
          ...user,
          ...formData,
        });
        Alert.alert('Success', 'Profile updated successfully');
        onClose();
      } catch {
        Alert.alert('Error', 'Failed to update profile');
      }
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
        style={styles.keyboardAvoid}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
              <View style={styles.avatarContainer}>
                <Avatar
                  name={formData.name}
                  size={80}
                  uri={formData.avatar}
                />
                <TouchableOpacity style={styles.changeAvatarButton}>
                  <Text style={styles.changeAvatarText}>Change Photo</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: theme.text,
                      backgroundColor: theme === Colors ? Colors.background : Colors.dark.card,
                      borderColor: errors.name ? Colors.danger : theme.border
                    }
                  ]}
                  value={formData.name}
                  onChangeText={(value) => handleChange('name', value)}
                  placeholder="Your name"
                  placeholderTextColor={theme.textLight}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: theme.text,
                      backgroundColor: theme === Colors ? Colors.background : Colors.dark.card,
                      borderColor: errors.email ? Colors.danger : theme.border
                    }
                  ]}
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholder="Your email"
                  placeholderTextColor={theme.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Phone</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: theme.text,
                      backgroundColor: theme === Colors ? Colors.background : Colors.dark.card,
                      borderColor: theme.border
                    }
                  ]}
                  value={formData.phone}
                  onChangeText={(value) => handleChange('phone', value)}
                  placeholder="Your phone number"
                  placeholderTextColor={theme.textLight}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Job Title</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: theme.text,
                      backgroundColor: theme === Colors ? Colors.background : Colors.dark.card,
                      borderColor: theme.border
                    }
                  ]}
                  value={formData.title}
                  onChangeText={(value) => handleChange('title', value)}
                  placeholder="Your job title"
                  placeholderTextColor={theme.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Bio</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    { 
                      color: theme.text,
                      backgroundColor: theme === Colors ? Colors.background : Colors.dark.card,
                      borderColor: theme.border
                    }
                  ]}
                  value={formData.bio}
                  onChangeText={(value) => handleChange('bio', value)}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={theme.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={onClose}
                style={styles.button}
              />
              <Button
                title="Save Changes"
                variant="primary"
                onPress={handleSubmit}
                style={styles.button}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  changeAvatarButton: {
    marginTop: 8,
  },
  changeAvatarText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default EditProfileModal;
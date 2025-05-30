import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';

export default function RequestAdminScreen() {
  const router = useRouter();
  const { user, requestAdminAccess } = useAuthStore();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for your request.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await requestAdminAccess(reason);
      Alert.alert(
        'Request Submitted',
        'Your request for admin access has been submitted and is pending approval.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit admin access request.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Request Admin Access',
          headerLeft: () => (
            <Button
              title=""
              onPress={() => router.back()}
              variant="outline"
              size="small"
              leftIcon={<ArrowLeft size={20} color={Colors.text} />}
              style={styles.backButton}
            />
          )
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Shield size={48} color={Colors.primary} />
        </View>
        
        <Text style={styles.title}>Request Admin Access</Text>
        
        <Text style={styles.description}>
          Admin access provides additional privileges including user management, system configuration, and advanced reporting capabilities.
        </Text>
        
        <Text style={styles.label}>Why do you need admin access?</Text>
        <TextInput
          style={styles.input}
          value={reason}
          onChangeText={setReason}
          placeholder="Explain why you need admin privileges..."
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        
        <Text style={styles.note}>
          Your request will be reviewed by an existing administrator. You will be notified once a decision has been made.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={styles.button}
          />
          
          <Button
            title="Submit Request"
            onPress={handleSubmit}
            loading={isSubmitting}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    marginBottom: 16,
  },
  note: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginBottom: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
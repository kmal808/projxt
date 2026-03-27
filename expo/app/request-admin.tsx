import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, TextInput } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { ShieldCheck } from 'lucide-react-native';

export default function RequestAdminScreen() {
  const router = useRouter();
  
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const requestAdminAccess = useAuthStore((state) => state.requestAdminAccess);

  const validateForm = () => {
    if (!reason || reason.trim().length < 10) {
      setError('Please provide a detailed reason (at least 10 characters)');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleRequest = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await requestAdminAccess(reason);
      
      Alert.alert(
        'Request Submitted',
        'Your request for admin access has been submitted. You will be notified when it is reviewed.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Admin request error:', error);
      Alert.alert('Request Failed', error.message || 'An error occurred while submitting your request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen options={{ 
        title: 'Request Admin Access',
        headerBackTitle: 'Back',
      }} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ShieldCheck size={48} color={Colors.primary} />
        </View>
        
        <Text style={styles.title}>Request Admin Access</Text>
        <Text style={styles.subtitle}>
          Admin access provides additional privileges for managing users, projects, and system settings.
          Please explain why you need admin access.
        </Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>Reason for Request</Text>
          <TextInput
            style={[styles.textArea, error ? styles.textAreaError : null]}
            placeholder="Explain why you need admin access..."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          
          <Button
            title="Submit Request"
            onPress={handleRequest}
            loading={isLoading}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 120,
  },
  textAreaError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: -8,
  },
  button: {
    marginTop: 16,
  },
});
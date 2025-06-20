import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, Share } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth-store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { Mail, Users } from 'lucide-react-native';

export default function InviteUserScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'field' | 'office' | 'sales'>('field');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  
  const inviteUser = useAuthStore((state) => state.inviteUser);

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInvite = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const inviteLink = await inviteUser(email, role);
      
      // Share the invitation link
      await Share.share({
        message: `You've been invited to join Projxt! Click the link to register: ${inviteLink}`,
        title: 'Projxt Invitation',
      });
      
      Alert.alert(
        'Invitation Sent',
        'The user has been invited to join Projxt.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Invitation error:', error);
      Alert.alert('Invitation Failed', error.message || 'An error occurred while sending the invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen options={{ 
        title: 'Invite User',
        headerBackTitle: 'Back',
      }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Invite Team Member</Text>
        <Text style={styles.subtitle}>
          Send an invitation to join your Projxt team
        </Text>
        
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon={<Mail size={18} color={Colors.textLight} />}
          />
          
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>
              <Users size={16} color={Colors.textLight} style={styles.roleIcon} />
              Select Role
            </Text>
            
            <View style={styles.roleButtons}>
              <Button
                title="Field"
                onPress={() => setRole('field')}
                style={[
                  styles.roleButton,
                  role === 'field' ? styles.roleButtonActive : null,
                ]}
                textStyle={[
                  styles.roleButtonText,
                  role === 'field' ? styles.roleButtonTextActive : null,
                ]}
                type={role === 'field' ? 'primary' : 'outline'}
              />
              
              <Button
                title="Office"
                onPress={() => setRole('office')}
                style={[
                  styles.roleButton,
                  role === 'office' ? styles.roleButtonActive : null,
                ]}
                textStyle={[
                  styles.roleButtonText,
                  role === 'office' ? styles.roleButtonTextActive : null,
                ]}
                type={role === 'office' ? 'primary' : 'outline'}
              />
              
              <Button
                title="Manager"
                onPress={() => setRole('manager')}
                style={[
                  styles.roleButton,
                  role === 'manager' ? styles.roleButtonActive : null,
                ]}
                textStyle={[
                  styles.roleButtonText,
                  role === 'manager' ? styles.roleButtonTextActive : null,
                ]}
                type={role === 'manager' ? 'primary' : 'outline'}
              />
              
              <Button
                title="Sales"
                onPress={() => setRole('sales')}
                style={[
                  styles.roleButton,
                  role === 'sales' ? styles.roleButtonActive : null,
                ]}
                textStyle={[
                  styles.roleButtonText,
                  role === 'sales' ? styles.roleButtonTextActive : null,
                ]}
                type={role === 'sales' ? 'primary' : 'outline'}
              />
              
              <Button
                title="Admin"
                onPress={() => setRole('admin')}
                style={[
                  styles.roleButton,
                  role === 'admin' ? styles.roleButtonActive : null,
                ]}
                textStyle={[
                  styles.roleButtonText,
                  role === 'admin' ? styles.roleButtonTextActive : null,
                ]}
                type={role === 'admin' ? 'primary' : 'outline'}
              />
            </View>
          </View>
          
          <Button
            title="Send Invitation"
            onPress={handleInvite}
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
    gap: 24,
  },
  roleSection: {
    gap: 12,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    marginRight: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    minWidth: 80,
    paddingHorizontal: 12,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
  },
  roleButtonText: {
    fontSize: 12,
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  button: {
    marginTop: 16,
  },
});
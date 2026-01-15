import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore, User } from '@/store/auth-store';
import { useSubscriptionStore } from '@/store/subscription-store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Colors from '@/constants/colors';
import { UserPlus, Mail, Shield } from 'lucide-react-native';

type UserRole = User['role'];

export default function InviteUserScreen() {
  const router = useRouter();
  const { inviteUser, isLoading } = useAuthStore();
  const { canInviteTeamMember } = useSubscriptionStore();
  
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');
  const [errors, setErrors] = useState<{ email?: string }>({});

  const roles: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'crew_leader', label: 'Crew Leader' },
    { value: 'worker', label: 'Worker' },
  ];

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInvite = async () => {
    if (!validateForm()) return;
    
    if (!canInviteTeamMember()) {
      Alert.alert(
        'Subscription Limit Reached',
        'You have reached the maximum number of team members allowed on your current plan. Please upgrade to invite more team members.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'View Plans',
            onPress: () => router.push('/subscription')
          }
        ]
      );
      return;
    }
    
    try {
      await inviteUser(email, selectedRole);
      Alert.alert(
        'Invitation Sent',
        `An invitation has been sent to ${email}`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send invitation');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Invite User' }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <UserPlus size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Invite a Team Member</Text>
            <Text style={styles.subtitle}>
              Send an invitation to add a new member to your team
            </Text>
          </View>
          
          <View style={styles.form}>
            <Input
              label="Email Address"
              placeholder="Enter email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Mail size={18} color={Colors.textLight} />}
            />
            
            <Text style={styles.roleLabel}>Select Role</Text>
            <View style={styles.rolesContainer}>
              {roles.map((role) => (
                <Button
                  key={role.value}
                  title={role.label}
                  variant={selectedRole === role.value ? 'primary' : 'outline'}
                  onPress={() => setSelectedRole(role.value)}
                  style={styles.roleButton}
                  leftIcon={<Shield size={16} color={selectedRole === role.value ? '#FFFFFF' : Colors.primary} />}
                />
              ))}
            </View>
          </View>
          
          <View style={styles.actions}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => router.back()}
              style={styles.actionButton}
            />
            <Button
              title="Send Invitation"
              onPress={handleInvite}
              loading={isLoading}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  rolesContainer: {
    gap: 8,
  },
  roleButton: {
    marginBottom: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

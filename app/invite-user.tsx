import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Mail, Users } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';

export default function InviteUserScreen() {
  const router = useRouter();
  const { user, inviteUser } = useAuthStore();
  
  // Check if current user is admin or manager
  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Access Denied' }} />
        <View style={styles.accessDenied}>
          <Users size={48} color={Colors.danger} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You do not have permission to invite users. Only administrators and managers can invite new users.
          </Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'field' | 'office' | 'sales'>('field');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleInvite = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const inviteLink = await inviteUser(email, role);
      
      Alert.alert(
        'Invitation Sent',
        `An invitation has been sent to ${email} with role: ${role}.\n\nInvitation Link: ${inviteLink}`,
        [
          { 
            text: 'OK', 
            onPress: () => router.back() 
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Invitation Failed', error.message || 'An error occurred while sending the invitation');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRoleSelect = (selectedRole: 'admin' | 'manager' | 'field' | 'office' | 'sales') => {
    setRole(selectedRole);
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Invite User',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Invite Team Member</Text>
        <Text style={styles.subtitle}>
          Send an invitation to a new team member to join your organization
        </Text>
        
        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="Enter email address"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={error}
            leftIcon={<Mail size={18} color={Colors.textLight} />}
          />
          
          <Text style={styles.roleLabel}>Select Role</Text>
          
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'admin' && styles.roleButtonActive
              ]}
              onPress={() => handleRoleSelect('admin')}
            >
              <Text style={[
                styles.roleButtonText,
                role === 'admin' && styles.roleButtonTextActive
              ]}>Admin</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'manager' && styles.roleButtonActive
              ]}
              onPress={() => handleRoleSelect('manager')}
            >
              <Text style={[
                styles.roleButtonText,
                role === 'manager' && styles.roleButtonTextActive
              ]}>Manager</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'field' && styles.roleButtonActive
              ]}
              onPress={() => handleRoleSelect('field')}
            >
              <Text style={[
                styles.roleButtonText,
                role === 'field' && styles.roleButtonTextActive
              ]}>Field</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'office' && styles.roleButtonActive
              ]}
              onPress={() => handleRoleSelect('office')}
            >
              <Text style={[
                styles.roleButtonText,
                role === 'office' && styles.roleButtonTextActive
              ]}>Office</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'sales' && styles.roleButtonActive
              ]}
              onPress={() => handleRoleSelect('sales')}
            >
              <Text style={[
                styles.roleButtonText,
                role === 'sales' && styles.roleButtonTextActive
              ]}>Sales</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.roleDescription}>
            <Text style={styles.roleDescriptionTitle}>Role Description:</Text>
            <Text style={styles.roleDescriptionText}>
              {role === 'admin' && "Full access to all features, including user management and system settings."}
              {role === 'manager' && "Can manage projects, crews, and inventory. Limited access to system settings."}
              {role === 'field' && "Access to field operations, time tracking, and project updates."}
              {role === 'office' && "Access to administrative functions, reporting, and document management."}
              {role === 'sales' && "Access to client information, proposals, and sales reporting."}
            </Text>
          </View>
          
          <Button
            title="Send Invitation"
            onPress={handleInvite}
            loading={isLoading}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  roleDescription: {
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleDescriptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  roleDescriptionText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.danger,
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
});
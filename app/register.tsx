import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, User, Mail, Lock, Phone, Briefcase } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { inviteCode, email: invitedEmail, role: invitedRole } = params;
  
  const { register } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: invitedEmail as string || '',
    password: '',
    confirmPassword: '',
    phone: '',
    title: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        title: formData.title,
        inviteCode: inviteCode as string,
        role: invitedRole as any || 'field',
      });
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please verify your email to continue.',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/') 
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Create Account',
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
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>
          {inviteCode 
            ? 'Complete your registration to join your team' 
            : 'Sign up to start managing your projects'}
        </Text>
        
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(value) => updateFormField('name', value)}
            error={errors.name}
            leftIcon={<User size={18} color={Colors.textLight} />}
          />
          
          <Input
            label="Email"
            placeholder="Enter your email address"
            value={formData.email}
            onChangeText={(value) => updateFormField('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            editable={!invitedEmail}
            leftIcon={<Mail size={18} color={Colors.textLight} />}
          />
          
          <Input
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(value) => updateFormField('password', value)}
            secureTextEntry
            error={errors.password}
            leftIcon={<Lock size={18} color={Colors.textLight} />}
          />
          
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormField('confirmPassword', value)}
            secureTextEntry
            error={errors.confirmPassword}
            leftIcon={<Lock size={18} color={Colors.textLight} />}
          />
          
          <Input
            label="Phone Number (Optional)"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(value) => updateFormField('phone', value)}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={Colors.textLight} />}
          />
          
          <Input
            label="Job Title (Optional)"
            placeholder="Enter your job title"
            value={formData.title}
            onChangeText={(value) => updateFormField('title', value)}
            leftIcon={<Briefcase size={18} color={Colors.textLight} />}
          />
          
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.button}
          />
          
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  button: {
    marginTop: 8,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 4,
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = params;
  
  const { resetPassword, requestPasswordReset } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const validateResetForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateRequestForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleResetPassword = async () => {
    if (!validateResetForm()) return;
    
    setIsLoading(true);
    
    try {
      await resetPassword(token as string, password);
      
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now log in with your new password.',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/') 
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Password Reset Failed', error.message || 'An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRequestReset = async () => {
    if (!validateRequestForm()) return;
    
    setIsLoading(true);
    
    try {
      await requestPasswordReset(email);
      
      Alert.alert(
        'Password Reset Email Sent',
        'If an account exists with this email, you will receive a password reset link shortly.',
        [
          { 
            text: 'OK', 
            onPress: () => router.replace('/') 
          }
        ]
      );
    } catch (error: any) {
      // Don't show specific errors for security reasons
      Alert.alert(
        'Password Reset Email Sent',
        'If an account exists with this email, you will receive a password reset link shortly.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // If token is provided, show reset password form
  // Otherwise, show request reset form
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: token ? 'Reset Password' : 'Forgot Password',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.content}>
        {token ? (
          // Reset Password Form
          <>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
              Please enter your new password below
            </Text>
            
            <View style={styles.form}>
              <Input
                label="New Password"
                placeholder="Enter your new password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
                leftIcon={<Lock size={18} color={Colors.textLight} />}
              />
              
              <Input
                label="Confirm Password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={errors.confirmPassword}
                leftIcon={<Lock size={18} color={Colors.textLight} />}
              />
              
              <Button
                title="Reset Password"
                onPress={handleResetPassword}
                loading={isLoading}
                style={styles.button}
              />
            </View>
          </>
        ) : (
          // Request Reset Form
          <>
            <Text style={styles.title}>Forgot Your Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password
            </Text>
            
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              
              <Button
                title="Send Reset Link"
                onPress={handleRequestReset}
                loading={isLoading}
                style={styles.button}
              />
              
              <TouchableOpacity 
                style={styles.backToLoginButton}
                onPress={() => router.replace('/')}
              >
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    padding: 8,
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
  backToLoginButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backToLoginText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});
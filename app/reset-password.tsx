import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth-store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { Mail, Lock } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token as string | undefined;
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const validateRequestForm = () => {
    const newErrors: { email?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateResetForm = () => {
    const newErrors: {
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestReset = async () => {
    if (!validateRequestForm()) return;
    
    setIsLoading(true);
    
    try {
      await requestPasswordReset(email);
      
      Alert.alert(
        'Reset Email Sent',
        'If an account exists with this email, you will receive password reset instructions.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Password reset request error:', error);
      Alert.alert('Request Failed', error.message || 'An error occurred during the request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateResetForm() || !token) return;
    
    setIsLoading(true);
    
    try {
      await resetPassword(token, newPassword);
      
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset. You can now log in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => router.push('/'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      Alert.alert('Reset Failed', error.message || 'An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen options={{ 
        title: token ? 'Reset Password' : 'Forgot Password',
        headerBackTitle: 'Back',
      }} />
      
      <View style={styles.content}>
        {token ? (
          // Reset password form
          <>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below
            </Text>
            
            <View style={styles.form}>
              <Input
                label="New Password"
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                error={errors.newPassword}
                leftIcon={<Lock size={18} color={Colors.textLight} />}
              />
              
              <Input
                label="Confirm Password"
                placeholder="Confirm new password"
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
          // Request reset form
          <>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password
            </Text>
            
            <View style={styles.form}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                leftIcon={<Mail size={18} color={Colors.textLight} />}
              />
              
              <Button
                title="Send Reset Link"
                onPress={handleRequestReset}
                loading={isLoading}
                style={styles.button}
              />
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password?</Text>
                <TouchableOpacity onPress={() => router.push('/')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
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
    gap: 16,
  },
  button: {
    marginTop: 8,
  },
  loginContainer: {
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
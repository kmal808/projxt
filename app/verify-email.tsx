import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { CheckCircle, XCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = params;
  
  const { verifyEmail } = useAuthStore();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setIsVerifying(false);
        setIsSuccess(false);
        setErrorMessage('Invalid verification token');
        return;
      }
      
      try {
        await verifyEmail(token as string);
        setIsSuccess(true);
      } catch (error: any) {
        setIsSuccess(false);
        setErrorMessage(error.message || 'Failed to verify email');
      } finally {
        setIsVerifying(false);
      }
    };
    
    verify();
  }, [token, verifyEmail]);
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Email Verification' }} />
      
      <View style={styles.content}>
        {isVerifying ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Verifying your email...</Text>
          </View>
        ) : isSuccess ? (
          <View style={styles.successContainer}>
            <CheckCircle size={64} color={Colors.success} />
            <Text style={styles.successTitle}>Email Verified!</Text>
            <Text style={styles.successText}>
              Your email has been successfully verified. You can now log in to your account.
            </Text>
            <Button
              title="Go to Login"
              onPress={() => router.replace('/')}
              style={styles.button}
            />
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <XCircle size={64} color={Colors.danger} />
            <Text style={styles.errorTitle}>Verification Failed</Text>
            <Text style={styles.errorText}>
              {errorMessage || 'There was a problem verifying your email. Please try again or contact support.'}
            </Text>
            <Button
              title="Go to Login"
              onPress={() => router.replace('/')}
              style={styles.button}
            />
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
  },
  successContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.success,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.danger,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
});
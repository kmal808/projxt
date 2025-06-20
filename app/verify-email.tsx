import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { CheckCircle, XCircle } from 'lucide-react-native';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params.token as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const verifyEmail = useAuthStore((state) => state.verifyEmail);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError('No verification token provided');
      return;
    }
    
    const verify = async () => {
      try {
        await verifyEmail(token);
        setIsVerified(true);
      } catch (error: any) {
        console.error('Email verification error:', error);
        setError(error.message || 'An error occurred during email verification');
      } finally {
        setIsLoading(false);
      }
    };
    
    verify();
  }, [token, verifyEmail]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen options={{ 
        title: 'Verify Email',
        headerBackTitle: 'Back',
      }} />
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Verifying your email...</Text>
          </View>
        ) : isVerified ? (
          <View style={styles.resultContainer}>
            <CheckCircle size={64} color={Colors.success} />
            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>
              Your email has been successfully verified. You can now sign in to your account.
            </Text>
            <Button
              title="Sign In"
              onPress={() => router.push('/')}
              style={styles.button}
            />
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <XCircle size={64} color={Colors.error} />
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>
              {error || 'We could not verify your email. The verification link may have expired.'}
            </Text>
            <Button
              title="Back to Sign In"
              onPress={() => router.push('/')}
              style={styles.button}
            />
            <TouchableOpacity 
              style={styles.resendContainer}
              onPress={() => router.push('/reset-password')}
            >
              <Text style={styles.resendText}>Need a new verification link?</Text>
            </TouchableOpacity>
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
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 16,
  },
  resultContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
  resendContainer: {
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary,
  },
});
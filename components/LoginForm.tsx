import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Input from './ui/Input';
import Button from './ui/Button';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Mail, Lock, User } from 'lucide-react-native';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  // For development/demo purposes only
  const handleDemoLogin = async (role: 'admin' | 'manager' | 'field' | 'office' | 'sales') => {
    setIsLoading(true);
    
    try {
      // Get demo user by role
      let demoEmail = '';
      let demoPassword = 'password123'; // Demo password for all accounts
      
      switch (role) {
        case 'admin':
          demoEmail = 'admin@projxt.com';
          break;
        case 'manager':
          demoEmail = 'manager@projxt.com';
          break;
        case 'field':
          demoEmail = 'field@projxt.com';
          break;
        case 'office':
          demoEmail = 'office@projxt.com';
          break;
        case 'sales':
          demoEmail = 'sales@projxt.com';
          break;
      }
      
      const success = await login(demoEmail, demoPassword);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        throw new Error('Demo login failed');
      }
    } catch (error: any) {
      console.error('Demo login error:', error);
      Alert.alert('Login Failed', error.message || 'An error occurred during demo login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
      
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
        leftIcon={<Lock size={18} color={Colors.textLight} />}
      />
      
      <View style={styles.forgotPasswordContainer}>
        <TouchableOpacity onPress={() => router.push('/reset-password')}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      
      <Button
        title="Sign In"
        onPress={handleLogin}
        loading={isLoading}
        style={styles.button}
      />
      
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.registerLink}>Create Account</Text>
        </TouchableOpacity>
      </View>
      
      {/* Demo section - Remove this in production */}
      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>Demo Accounts</Text>
        <Text style={styles.demoSubtitle}>Quick access with different roles</Text>
        
        <View style={styles.demoButtons}>
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={() => handleDemoLogin('admin')}
            disabled={isLoading}
          >
            <User size={16} color={Colors.primary} />
            <Text style={styles.demoButtonText}>Admin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={() => handleDemoLogin('manager')}
            disabled={isLoading}
          >
            <User size={16} color={Colors.secondary} />
            <Text style={styles.demoButtonText}>Manager</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={() => handleDemoLogin('field')}
            disabled={isLoading}
          >
            <User size={16} color={Colors.accent} />
            <Text style={styles.demoButtonText}>Field</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={() => handleDemoLogin('office')}
            disabled={isLoading}
          >
            <User size={16} color={Colors.success} />
            <Text style={styles.demoButtonText}>Office</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.demoButton} 
            onPress={() => handleDemoLogin('sales')}
            disabled={isLoading}
          >
            <User size={16} color={Colors.info} />
            <Text style={styles.demoButtonText}>Sales</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
  },
  button: {
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 4,
  },
  demoSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  demoSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 16,
  },
  demoButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoButtonText: {
    marginLeft: 6,
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
});

export default LoginForm;
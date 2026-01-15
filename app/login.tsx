import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/auth-store';
import LoginForm from '@/components/LoginForm';
import Colors from '@/constants/colors';
import { HardHat, Building, Hammer, Users, Briefcase, BarChart3 } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[Colors.primary, '#1E40AF']}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
          <HardHat size={40} color="#FFFFFF" />
          <Text style={styles.logoText}>Projxt</Text>
        </View>
        <Text style={styles.tagline}>Complete Suite for Specialty Contractors</Text>
      </LinearGradient>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.subtitleText}>Sign in to your account to continue</Text>
        
        <LoginForm />
        
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>All-in-One Solution</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Building size={20} color={Colors.primary} />
              </View>
              <Text style={styles.featureText}>Project Management</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.success + '20' }]}>
                <Users size={20} color={Colors.success} />
              </View>
              <Text style={styles.featureText}>Crew Management</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.accent + '20' }]}>
                <Hammer size={20} color={Colors.accent} />
              </View>
              <Text style={styles.featureText}>Field Operations</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.info + '20' }]}>
                <Briefcase size={20} color={Colors.info} />
              </View>
              <Text style={styles.featureText}>Inventory Tracking</Text>
            </View>
            
            <View style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.secondary + '20' }]}>
                <BarChart3 size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.featureText}>Payroll and Reporting</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  tagline: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 32,
  },
  featuresSection: {
    marginTop: 40,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
  },
});

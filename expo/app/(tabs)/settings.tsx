import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { useSubscriptionStore } from '@/store/subscription-store';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import Colors from '@/constants/colors';
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  CreditCard,
  Users,
  UserPlus
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { mode, setMode, isDarkMode } = useThemeStore();
  const { subscription } = useSubscriptionStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const handleThemeChange = () => {
    const modes: Array<{ mode: 'light' | 'dark' | 'system'; label: string }> = [
      { mode: 'light', label: 'Light' },
      { mode: 'dark', label: 'Dark' },
      { mode: 'system', label: 'System' }
    ];

    Alert.alert(
      'Choose Theme',
      'Select your preferred theme',
      modes.map(({ mode: themeMode, label }) => ({
        text: label,
        onPress: () => setMode(themeMode)
      }))
    );
  };

  const getThemeIcon = () => {
    if (mode === 'system') return <Smartphone size={20} color={Colors.primary} />;
    return isDarkMode ? <Moon size={20} color={Colors.primary} /> : <Sun size={20} color={Colors.primary} />;
  };

  const getThemeLabel = () => {
    if (mode === 'system') return 'System';
    return isDarkMode ? 'Dark' : 'Light';
  };

  const isAdmin = user?.role === 'admin';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar 
            uri={user?.avatar} 
            name={user?.name || 'User'} 
            size={80} 
          />
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userRole}>
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
          </Text>
        </View>

        {/* Account Settings */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.settingIconContainer}>
              <User size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Edit Profile</Text>
              <Text style={styles.settingDescription}>Update your personal information</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Subscription Section */}
        <Text style={styles.sectionTitle}>Subscription</Text>
        <Card>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/subscription')}
          >
            <View style={styles.settingIconContainer}>
              <CreditCard size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>
                {subscription?.tier ? 
                  subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) + ' Plan' : 
                  'Free Plan'
                }
              </Text>
              <Text style={styles.settingDescription}>
                Manage your subscription and billing
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <Text style={styles.sectionTitle}>Administration</Text>
            <Card>
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => router.push('/user-management')}
              >
                <View style={styles.settingIconContainer}>
                  <Users size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>User Management</Text>
                  <Text style={styles.settingDescription}>Manage team members and permissions</Text>
                </View>
                <ChevronRight size={20} color={Colors.textLight} />
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => router.push('/invite-user')}
              >
                <View style={styles.settingIconContainer}>
                  <UserPlus size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>Invite Users</Text>
                  <Text style={styles.settingDescription}>Send invitations to new team members</Text>
                </View>
                <ChevronRight size={20} color={Colors.textLight} />
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleThemeChange}
          >
            <View style={styles.settingIconContainer}>
              {getThemeIcon()}
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Theme</Text>
              <Text style={styles.settingDescription}>{getThemeLabel()} mode</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Bell size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>Manage notification preferences</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Security & Privacy */}
        <Text style={styles.sectionTitle}>Security & Privacy</Text>
        <Card>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/privacy-security')}
          >
            <View style={styles.settingIconContainer}>
              <Shield size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy & Security</Text>
              <Text style={styles.settingDescription}>Manage your privacy settings</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Support */}
        <Text style={styles.sectionTitle}>Support</Text>
        <Card>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help & Support</Text>
              <Text style={styles.settingDescription}>Get help and contact support</Text>
            </View>
            <ChevronRight size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Sign Out */}
        <Card>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleLogout}
          >
            <View style={styles.settingIconContainer}>
              <LogOut size={20} color={Colors.danger} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: Colors.danger }]}>Sign Out</Text>
              <Text style={styles.settingDescription}>Sign out of your account</Text>
            </View>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 72,
  },
});
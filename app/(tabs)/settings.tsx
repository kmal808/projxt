import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, Moon, Sun, Bell, Shield, HelpCircle, Info, 
  LogOut, ChevronRight, Settings as SettingsIcon, Users
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import Card from '@/components/ui/Card';
import EditProfileModal from '@/components/EditProfileModal';
import AppPreferencesModal from '@/components/AppPreferencesModal';
import Button from '@/components/ui/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  
  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('notifications-enabled', value.toString());
    } catch (error) {
      console.error('Error saving notification preference:', error);
    }
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          }
        }
      ]
    );
  };
  
  const openHelpSupport = () => {
    // TODO open TestFlight feedback or support email
    const testFlightUrl = 'https://testflight.apple.com/join/projext';
    
    if (Platform.OS === 'web') {
      Alert.alert(
        'Help & Support',
        'Please contact support@projext.com for assistance.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Help & Support',
        'Would you like to provide feedback through TestFlight or contact support directly?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'TestFlight', 
            onPress: () => {
              // TODO use Linking to open TestFlight
              Alert.alert('TestFlight', 'Opening TestFlight feedback...');
            }
          },
          { 
            text: 'Email Support', 
            onPress: () => {
              // TODO use Linking to open email
              Alert.alert('Email', 'Opening email to support@projxt.com...');
            }
          }
        ]
      );
    }
  };
  
  const navigateToUserManagement = () => {
    router.push('/user-management');
  };
  
  const requestAdminAccess = () => {
    Alert.prompt(
      'Request Admin Access',
      'Please provide a reason for requesting admin access:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async (reason) => {
            if (!reason) {
              Alert.alert('Error', 'Please provide a reason for your request.');
              return;
            }
            
            try {
              const { requestAdminAccess } = useAuthStore.getState();
              await requestAdminAccess(reason);
              Alert.alert(
                'Request Submitted',
                'Your request for admin access has been submitted and is pending approval.'
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to submit admin access request.');
            }
          }
        }
      ],
      'plain-text'
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      {/* Profile Section */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
              </View>
            ) : (
              <View style={styles.avatar}>
                <User size={24} color="#FFFFFF" />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileRole}>{user?.role || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>
        
        <Button
          title="Edit Profile"
          onPress={() => setShowEditProfileModal(true)}
          variant="outline"
          style={styles.editProfileButton}
        />
      </Card>
      
      {/* Preferences Section */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      
      <Card>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setShowPreferencesModal(true)}
        >
          <View style={styles.settingIconContainer}>
            <SettingsIcon size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>App Preferences</Text>
            <Text style={styles.settingDescription}>Customize app behavior and appearance</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            {isDarkMode ? (
              <Moon size={20} color={Colors.primary} />
            ) : (
              <Sun size={20} color={Colors.primary} />
            )}
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Toggle dark theme</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: Colors.primary + '80' }}
            thumbColor={isDarkMode ? Colors.primary : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingIconContainer}>
            <Bell size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Notifications</Text>
            <Text style={styles.settingDescription}>Enable push notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: Colors.primary + '80' }}
            thumbColor={notificationsEnabled ? Colors.primary : '#f4f3f4'}
          />
        </View>
      </Card>
      
      {/* Admin Section - Only visible to admins */}
      {user?.role === 'admin' && (
        <>
          <Text style={styles.sectionTitle}>Administration</Text>
          
          <Card>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={navigateToUserManagement}
            >
              <View style={styles.settingIconContainer}>
                <Users size={20} color={Colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>User Management</Text>
                <Text style={styles.settingDescription}>Manage users and roles</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </Card>
        </>
      )}
      
      {/* Admin Request - Only visible to non-admins */}
      {user?.role !== 'admin' && (
        <>
          <Text style={styles.sectionTitle}>Administration</Text>
          
          <Card>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={requestAdminAccess}
            >
              <View style={styles.settingIconContainer}>
                <Shield size={20} color={Colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Request Admin Access</Text>
                <Text style={styles.settingDescription}>Apply for administrative privileges</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </Card>
        </>
      )}
      
      {/* Support Section */}
      <Text style={styles.sectionTitle}>Support</Text>
      
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
            <Text style={styles.settingDescription}>Manage your data and security settings</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={openHelpSupport}
        >
          <View style={styles.settingIconContainer}>
            <HelpCircle size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Help & Support</Text>
            <Text style={styles.settingDescription}>Get assistance and report issues</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert(
            'About Projxt',
            'Version 1.0.0\n\nProjxt is a comprehensive management solution for specialty contractors, providing tools for project management, crew coordination, inventory tracking, and more.\n\n© 2023 Projxt Inc.'
          )}
        >
          <View style={styles.settingIconContainer}>
            <Info size={20} color={Colors.primary} />
          </View>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>About</Text>
            <Text style={styles.settingDescription}>App version and information</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </Card>
      
      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <LogOut size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      {/* Modals */}
      <EditProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
      
      <AppPreferencesModal
        visible={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textLight,
  },
  editProfileButton: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingItem_last: {
    borderBottomWidth: 0,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.error,
  },
});
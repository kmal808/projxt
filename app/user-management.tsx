import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Stack } from 'expo-router';
import { User, ChevronRight, ArrowLeft, Shield, Home, Settings } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@projxt.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '2',
    name: 'Project Manager',
    email: 'manager@projxt.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '3',
    name: 'Field Worker',
    email: 'field@projxt.com',
    role: 'field',
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '4',
    name: 'Office Staff',
    email: 'office@projxt.com',
    role: 'office',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '5',
    name: 'Sales Rep',
    email: 'sales@projxt.com',
    role: 'sales',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: '6',
    name: 'Demo User',
    email: 'demo@projxt.com',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  }
];

export default function UserManagementScreen() {
  const router = useRouter();
  const { user, adminRequests, approveAdminRequest, rejectAdminRequest, updateUserRole } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors;
  const [selectedUser, setSelectedUser] = useState<null | typeof MOCK_USERS[0]>(null);
  
  // Check if current user is admin
  if (user?.role !== 'admin') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: 'Access Denied' }} />
        <View style={styles.accessDenied}>
          <Shield size={48} color={Colors.danger} />
          <Text style={[styles.accessDeniedTitle, { color: theme.text }]}>Access Denied</Text>
          <Text style={[styles.accessDeniedText, { color: theme.text }]}>
            You do not have permission to access this page. Only administrators can manage users.
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
  
  const handleUserPress = (user: typeof MOCK_USERS[0]) => {
    setSelectedUser(user);
    
    Alert.alert(
      'User Management',
      `Manage ${user.name} (${user.email})`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedUser(null) },
        { 
          text: 'Change Role', 
          onPress: () => showRoleSelectionDialog(user)
        }
      ]
    );
  };
  
  const showRoleSelectionDialog = (user: typeof MOCK_USERS[0]) => {
    Alert.alert(
      'Change User Role',
      `Select a new role for ${user.name}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Admin', onPress: () => confirmRoleChange(user, 'admin') },
        { text: 'Manager', onPress: () => confirmRoleChange(user, 'manager') },
        { text: 'Field', onPress: () => confirmRoleChange(user, 'field') },
        { text: 'Office', onPress: () => confirmRoleChange(user, 'office') },
        { text: 'Sales', onPress: () => confirmRoleChange(user, 'sales') }
      ]
    );
  };
  
  const confirmRoleChange = (user: typeof MOCK_USERS[0], newRole: 'admin' | 'manager' | 'field' | 'office' | 'sales') => {
    if (user.role === newRole) {
      Alert.alert('No Change', `${user.name} is already a ${newRole}.`);
      return;
    }
    
    Alert.alert(
      'Confirm Role Change',
      `Are you sure you want to change ${user.name}'s role from ${user.role} to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Update user role
            updateUserRole(user.id, newRole);
            
            // Update local mock data for UI
            const updatedUser = MOCK_USERS.find(u => u.id === user.id);
            if (updatedUser) {
              updatedUser.role = newRole;
            }
            
            Alert.alert('Success', `${user.name}'s role has been updated to ${newRole}.`);
          }
        }
      ]
    );
  };
  
  const handleAdminRequest = (requestId: string, userName: string, approve: boolean) => {
    Alert.alert(
      approve ? 'Approve Request' : 'Reject Request',
      `Are you sure you want to ${approve ? 'approve' : 'reject'} the admin access request from ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            if (approve) {
              approveAdminRequest(requestId);
              Alert.alert('Success', `${userName} has been granted admin access.`);
            } else {
              rejectAdminRequest(requestId);
              Alert.alert('Success', `${userName}'s admin access request has been rejected.`);
            }
          }
        }
      ]
    );
  };
  
  const renderUserItem = ({ item }: { item: typeof MOCK_USERS[0] }) => (
    <TouchableOpacity
      style={[styles.userItem, { borderBottomColor: theme.border }]}
      onPress={() => handleUserPress(item)}
    >
      <View style={styles.userAvatar}>
        {item.avatar ? (
          <Text style={styles.userAvatarText}>{item.name.charAt(0)}</Text>
        ) : (
          <User size={20} color="#FFFFFF" />
        )}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.userEmail, { color: theme.textLight }]}>{item.email}</Text>
      </View>
      
      <View style={styles.userRole}>
        <Text style={[
          styles.userRoleText,
          item.role === 'admin' && styles.adminRole,
          item.role === 'manager' && styles.managerRole,
          item.role === 'field' && styles.fieldRole,
          item.role === 'office' && styles.officeRole,
          item.role === 'sales' && styles.salesRole,
        ]}>
          {item.role}
        </Text>
      </View>
      
      <ChevronRight size={16} color={theme.textLight} />
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'User Management',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>User Management</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textLight }]}>Manage users and their roles</Text>
      </View>
      
      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={[styles.navButton, { backgroundColor: theme.card }]} 
          onPress={() => router.replace('/(tabs)')}
        >
          <Home size={20} color={Colors.primary} />
          <Text style={[styles.navButtonText, { color: theme.text }]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, { backgroundColor: theme.card }]} 
          onPress={() => router.replace('/(tabs)/settings')}
        >
          <Settings size={20} color={Colors.primary} />
          <Text style={[styles.navButtonText, { color: theme.text }]}>Settings</Text>
        </TouchableOpacity>
      </View>
      
      {/* Admin Requests Section */}
      {adminRequests.length > 0 && (
        <Card style={styles.requestsCard}>
          <Text style={[styles.requestsTitle, { color: theme.text }]}>Admin Access Requests</Text>
          
          {adminRequests.map((request) => (
            <View key={request.userId} style={[styles.requestItem, { borderBottomColor: theme.border }]}>
              <View style={styles.requestInfo}>
                <Text style={[styles.requestName, { color: theme.text }]}>{request.userName}</Text>
                <Text style={[styles.requestDate, { color: theme.textLight }]}>
                  Requested: {new Date(request.requestDate).toLocaleDateString()}
                </Text>
                <Text style={[styles.requestReason, { color: theme.text }]}>
                  Reason: {request.reason}
                </Text>
              </View>
              
              <View style={styles.requestActions}>
                <TouchableOpacity 
                  style={[styles.requestButton, styles.approveButton]}
                  onPress={() => handleAdminRequest(request.userId, request.userName, true)}
                >
                  <Text style={styles.requestButtonText}>Approve</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.requestButton, styles.rejectButton, { borderColor: Colors.danger }]}
                  onPress={() => handleAdminRequest(request.userId, request.userName, false)}
                >
                  <Text style={[styles.requestButtonText, styles.rejectButtonText, { color: Colors.danger }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>
      )}
      
      {/* Users List */}
      <Card style={styles.usersCard}>
        <Text style={[styles.usersTitle, { color: theme.text }]}>All Users</Text>
        
        <FlatList
          data={MOCK_USERS}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
      </Card>
      
      {/* Bottom Navigation Button */}
      <View style={styles.bottomNavContainer}>
        <Button
          title="Return to Settings"
          onPress={() => router.replace('/(tabs)/settings')}
          style={styles.bottomNavButton}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  navigationButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.card,
    gap: 8,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  requestsCard: {
    marginBottom: 16,
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  requestItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  requestInfo: {
    marginBottom: 12,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  requestReason: {
    fontSize: 14,
    color: Colors.text,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  requestButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  approveButton: {
    backgroundColor: Colors.success,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  requestButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  rejectButtonText: {
    color: Colors.danger,
  },
  usersCard: {
    flex: 1,
  },
  usersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  usersList: {
    paddingBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textLight,
  },
  userRole: {
    marginRight: 12,
  },
  userRoleText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  adminRole: {
    color: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  managerRole: {
    color: Colors.secondary,
    backgroundColor: Colors.secondary + '20',
  },
  fieldRole: {
    color: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  officeRole: {
    color: Colors.success,
    backgroundColor: Colors.success + '20',
  },
  salesRole: {
    color: Colors.info,
    backgroundColor: Colors.info + '20',
  },
  backButton: {
    padding: 8,
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
  bottomNavContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  bottomNavButton: {
    width: '100%',
  },
});
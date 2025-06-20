import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Stack } from 'expo-router';
import { User, ChevronRight, ArrowLeft, Shield, Home, Settings, UserPlus, Search, Filter, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';

export default function UserManagementScreen() {
  const router = useRouter();
  const { user, users, adminRequests, approveAdminRequest, rejectAdminRequest, updateUserRole, deleteUser } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<null | typeof users[0]>(null);
  
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
  
  // Filter users based on search query and role filter
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.title && u.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = selectedRole ? u.role === selectedRole : true;
    
    return matchesSearch && matchesRole;
  });
  
  const handleUserPress = (user: typeof users[0]) => {
    setSelectedUser(user);
    
    Alert.alert(
      'User Management',
      `Manage ${user.name} (${user.email})`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSelectedUser(null) },
        { 
          text: 'Change Role', 
          onPress: () => showRoleSelectionDialog(user)
        },
        { 
          text: 'Delete User', 
          style: 'destructive',
          onPress: () => confirmDeleteUser(user)
        }
      ]
    );
  };
  
  const showRoleSelectionDialog = (user: typeof users[0]) => {
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
  
  const confirmRoleChange = (user: typeof users[0], newRole: 'admin' | 'manager' | 'field' | 'office' | 'sales') => {
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
            
            Alert.alert('Success', `${user.name}'s role has been updated to ${newRole}.`);
          }
        }
      ]
    );
  };
  
  const confirmDeleteUser = (user: typeof users[0]) => {
    // Don't allow deleting yourself
    if (user.id === user?.id) {
      Alert.alert('Error', 'You cannot delete your own account.');
      return;
    }
    
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              Alert.alert('Success', `${user.name} has been deleted.`);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user');
            }
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
  
  const handleRoleFilter = (role: string | null) => {
    setSelectedRole(role === selectedRole ? null : role);
  };
  
  const renderUserItem = ({ item }: { item: typeof users[0] }) => (
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
        {item.title && (
          <Text style={[styles.userTitle, { color: theme.textLight }]}>{item.title}</Text>
        )}
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
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>User Management</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textLight }]}>Manage users and their roles</Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Invite User"
            onPress={() => router.push('/invite-user')}
            leftIcon={<UserPlus size={18} color="#FFFFFF" />}
            style={styles.actionButton}
          />
        </View>
        
        {/* Search and Filter */}
        <Card style={styles.searchCard}>
          <View style={styles.searchContainer}>
            <Search size={18} color={theme.textLight} style={styles.searchIcon} />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              containerStyle={styles.searchInputContainer}
            />
          </View>
          
          <Text style={[styles.filterLabel, { color: theme.text }]}>Filter by role:</Text>
          
          <View style={styles.roleFilters}>
            <TouchableOpacity
              style={[
                styles.roleFilterButton,
                selectedRole === 'admin' && styles.roleFilterButtonActive
              ]}
              onPress={() => handleRoleFilter('admin')}
            >
              <Text style={[
                styles.roleFilterText,
                selectedRole === 'admin' && styles.roleFilterTextActive
              ]}>Admin</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleFilterButton,
                selectedRole === 'manager' && styles.roleFilterButtonActive
              ]}
              onPress={() => handleRoleFilter('manager')}
            >
              <Text style={[
                styles.roleFilterText,
                selectedRole === 'manager' && styles.roleFilterTextActive
              ]}>Manager</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleFilterButton,
                selectedRole === 'field' && styles.roleFilterButtonActive
              ]}
              onPress={() => handleRoleFilter('field')}
            >
              <Text style={[
                styles.roleFilterText,
                selectedRole === 'field' && styles.roleFilterTextActive
              ]}>Field</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleFilterButton,
                selectedRole === 'office' && styles.roleFilterButtonActive
              ]}
              onPress={() => handleRoleFilter('office')}
            >
              <Text style={[
                styles.roleFilterText,
                selectedRole === 'office' && styles.roleFilterTextActive
              ]}>Office</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roleFilterButton,
                selectedRole === 'sales' && styles.roleFilterButtonActive
              ]}
              onPress={() => handleRoleFilter('sales')}
            >
              <Text style={[
                styles.roleFilterText,
                selectedRole === 'sales' && styles.roleFilterTextActive
              ]}>Sales</Text>
            </TouchableOpacity>
          </View>
          
          {selectedRole && (
            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={() => setSelectedRole(null)}
            >
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </Card>
        
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
          <View style={styles.usersHeader}>
            <Text style={[styles.usersTitle, { color: theme.text }]}>All Users</Text>
            <Text style={[styles.usersCount, { color: theme.textLight }]}>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            </Text>
          </View>
          
          {filteredUsers.length > 0 ? (
            <FlatList
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.usersList}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.textLight }]}>
                No users found matching your criteria
              </Text>
            </View>
          )}
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
      </ScrollView>
    </View>
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
    paddingBottom: 40,
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
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  searchCard: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  roleFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  roleFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleFilterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleFilterText: {
    fontSize: 12,
    color: Colors.text,
  },
  roleFilterTextActive: {
    color: '#FFFFFF',
  },
  clearFilterButton: {
    alignSelf: 'flex-start',
  },
  clearFilterText: {
    fontSize: 12,
    color: Colors.primary,
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
  usersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  usersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  usersCount: {
    fontSize: 12,
    color: Colors.textLight,
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
    marginBottom: 2,
  },
  userTitle: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
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
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
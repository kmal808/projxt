import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore, User } from '@/store/auth-store';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Colors from '@/constants/colors';
import { UserPlus, Shield, UserX, UserCheck, AlertCircle } from 'lucide-react-native';

export default function UserManagementScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // In a real app, you would fetch these from your backend
  const [users, setUsers] = useState<User[]>([]);
  const [adminRequests, setAdminRequests] = useState<Array<{
    userId: string;
    userName: string;
    reason: string;
    requestDate: string;
  }>>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulated data loading
  useEffect(() => {
    // In a real app, you would fetch users and admin requests from your backend
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@projxt.com',
          role: 'admin',
          isEmailVerified: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Project Manager',
          email: 'manager@projxt.com',
          role: 'project_manager',
          isEmailVerified: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Field Worker',
          email: 'field@projxt.com',
          role: 'worker',
          isEmailVerified: true,
          createdAt: new Date().toISOString()
        }
      ]);
      
      setAdminRequests([
        {
          userId: '3',
          userName: 'Field Worker',
          reason: 'Need to manage project settings and user permissions',
          requestDate: new Date().toISOString()
        }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const handleInviteUser = () => {
    router.push('/invite-user');
  };
  
  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In a real app, you would call your backend to delete the user
            setUsers(users.filter(user => user.id !== userId));
          },
        },
      ]
    );
  };
  
  const handleUpdateRole = (userId: string, userName: string, currentRole: User['role']) => {
    // In a real app, you would show a modal or navigate to a screen to select the new role
    Alert.alert(
      'Update Role',
      `Select a new role for ${userName}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Admin',
          onPress: () => {
            // In a real app, you would call your backend to update the user's role
            setUsers(users.map(user => 
              user.id === userId ? { ...user, role: 'admin' } : user
            ));
          },
        },
        {
          text: 'Project Manager',
          onPress: () => {
            setUsers(users.map(user => 
              user.id === userId ? { ...user, role: 'project_manager' } : user
            ));
          },
        },
        {
          text: 'Crew Leader',
          onPress: () => {
            setUsers(users.map(user => 
              user.id === userId ? { ...user, role: 'crew_leader' } : user
            ));
          },
        },
        {
          text: 'Worker',
          onPress: () => {
            setUsers(users.map(user => 
              user.id === userId ? { ...user, role: 'worker' } : user
            ));
          },
        },
      ]
    );
  };
  
  const handleApproveAdminRequest = (userId: string, userName: string) => {
    Alert.alert(
      'Approve Request',
      `Are you sure you want to grant admin access to ${userName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: () => {
            // In a real app, you would call your backend to approve the request
            setAdminRequests(adminRequests.filter(request => request.userId !== userId));
            setUsers(users.map(user => 
              user.id === userId ? { ...user, role: 'admin' } : user
            ));
          },
        },
      ]
    );
  };
  
  const handleRejectAdminRequest = (userId: string, userName: string) => {
    Alert.alert(
      'Reject Request',
      `Are you sure you want to reject the admin request from ${userName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            // In a real app, you would call your backend to reject the request
            setAdminRequests(adminRequests.filter(request => request.userId !== userId));
          },
        },
      ]
    );
  };
  
  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Avatar 
          name={item.name} 
          size={40} 
          uri={item.avatar}
        />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleUpdateRole(item.id, item.name, item.role)}
        >
          <Shield size={18} color={Colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteUser(item.id, item.name)}
        >
          <UserX size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderAdminRequestItem = ({ item }: { item: any }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestHeader}>
        <AlertCircle size={18} color={Colors.warning} />
        <Text style={styles.requestTitle}>Admin Access Request</Text>
      </View>
      
      <Text style={styles.requestUser}>{item.userName}</Text>
      <Text style={styles.requestReason}>{item.reason}</Text>
      <Text style={styles.requestDate}>
        Requested on {new Date(item.requestDate).toLocaleDateString()}
      </Text>
      
      <View style={styles.requestActions}>
        <Button
          title="Approve"
          onPress={() => handleApproveAdminRequest(item.userId, item.userName)}
          variant="success"
          style={styles.requestButton}
        />
        
        <Button
          title="Reject"
          onPress={() => handleRejectAdminRequest(item.userId, item.userName)}
          variant="error"
          style={styles.requestButton}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen options={{ 
        title: 'User Management',
        headerBackTitle: 'Back',
      }} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Users</Text>
          
          <Button
            title="Invite User"
            onPress={handleInviteUser}
            leftIcon={<UserPlus size={16} color="#FFFFFF" />}
            style={styles.inviteButton}
          />
        </View>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading users...</Text>
          </View>
        ) : (
          <>
            {adminRequests.length > 0 && (
              <View style={styles.requestsSection}>
                <Text style={styles.sectionTitle}>Admin Requests</Text>
                <FlatList
                  data={adminRequests}
                  renderItem={renderAdminRequestItem}
                  keyExtractor={(item) => item.userId}
                  contentContainerStyle={styles.requestsList}
                />
              </View>
            )}
            
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.usersList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No users found</Text>
                </View>
              }
            />
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  inviteButton: {
    paddingHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usersList: {
    paddingBottom: 16,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  roleContainer: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  requestsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  requestsList: {
    gap: 8,
  },
  requestItem: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.warning + '50',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.warning,
    marginLeft: 8,
  },
  requestUser: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  requestReason: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 16,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    flex: 1,
  },
});
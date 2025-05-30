import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Colors from '@/constants/colors';
import { Mail, Phone, MapPin, Briefcase, Calendar, Edit2, Camera, Users } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  
  // Default values if user is null
  const userName = user?.name || 'User';
  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'No role';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerRight: () => (
            <TouchableOpacity style={styles.editButton}>
              <Edit2 size={18} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar 
              name={userName} 
              size={100} 
              imageUrl={user?.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userRole}>{userRole}</Text>
          
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Years</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
          </View>
        </View>
        
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.infoItem}>
            <Mail size={18} color={Colors.textLight} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'No email'}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Phone size={18} color={Colors.textLight} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>(555) 123-4567</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <MapPin size={18} color={Colors.textLight} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>Portland, OR</Text>
            </View>
          </View>
        </Card>
        
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Work Information</Text>
          
          <View style={styles.infoItem}>
            <Briefcase size={18} color={Colors.textLight} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>
                {user?.role === 'admin' ? 'Administration' : 
                 user?.role === 'manager' ? 'Project Management' :
                 user?.role === 'field' ? 'Field Operations' :
                 user?.role === 'office' ? 'Office Administration' :
                 'Sales'}
              </Text>
            </View>
          </View>
          
          {user?.crewId && (
            <View style={styles.infoItem}>
              <Users size={18} color={Colors.textLight} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Crew</Text>
                <Text style={styles.infoValue}>
                  {user.crewId === 'crew1' ? 'Alpha Team' : 
                   user.crewId === 'crew2' ? 'Beta Team' : 
                   'Gamma Team'}
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.infoItem}>
            <Calendar size={18} color={Colors.textLight} style={styles.infoIcon} />
            <View>
              <Text style={styles.infoLabel}>Joined</Text>
              <Text style={styles.infoValue}>January 15, 2021</Text>
            </View>
          </View>
        </Card>
        
        <View style={styles.actionsContainer}>
          <Button
            title="Change Password"
            variant="outline"
            style={styles.actionButton}
          />
          
          <Button
            title="Update Profile"
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 16,
  },
  userStats: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.border,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginHorizontal: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
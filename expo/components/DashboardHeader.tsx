import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Avatar from './ui/Avatar';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Bell, Search } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onSearchPress?: () => void;
  onNotificationPress?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onSearchPress,
  onNotificationPress,
}) => {
  const colors = useThemeColors();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleProfilePress = () => {
    router.push('/profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Avatar 
            name={user?.name || 'User'} 
            size={40} 
            uri={user?.avatar}
          />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: colors.textLight }]}>{subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.rightSection}>
        {onSearchPress && (
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.background }]} 
            onPress={onSearchPress}
          >
            <Search size={20} color={colors.text} />
          </TouchableOpacity>
        )}
        
        {onNotificationPress && (
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: colors.background }]} 
            onPress={onNotificationPress}
          >
            <Bell size={20} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default DashboardHeader;
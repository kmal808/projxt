import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

type StatusType = 'pending' | 'active' | 'completed' | 'on-hold' | 'todo' | 'in_progress' | 'open' | 'approved' | 'delivered';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
      case 'in_progress':
        return Colors.primary;
      case 'completed':
      case 'delivered':
        return Colors.success;
      case 'pending':
      case 'todo':
      case 'open':
        return Colors.warning;
      case 'on-hold':
        return Colors.secondary;
      case 'approved':
        return Colors.info;
      default:
        return Colors.textLight;
    }
  };

  const getStatusText = () => {
    // Convert status to readable format
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: getStatusColor() + '20' }, // 20% opacity
      size === 'small' ? styles.smallBadge : {}
    ]}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={[
        styles.text, 
        { color: getStatusColor() },
        size === 'small' ? styles.smallText : {}
      ]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  smallBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
  smallText: {
    fontSize: 10,
  },
});

export default StatusBadge;
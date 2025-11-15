import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './ui/Card';
import { useThemeColors } from '@/hooks/useThemeColors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
}) => {
  const colors = useThemeColors();
  const cardColor = color || colors.primary;
  
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textLight }]}>{title}</Text>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: cardColor + '20' }]}>
            {icon}
          </View>
        )}
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: cardColor }]}>{value}</Text>
        
        {trend && (
          <View style={[
            styles.trendContainer, 
            { 
              backgroundColor: trend.isPositive ? colors.success + '20' : colors.danger + '20' 
            }
          ]}>
            <Text style={[
              styles.trendText, 
              { 
                color: trend.isPositive ? colors.success : colors.danger 
              }
            ]}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trendContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StatCard;
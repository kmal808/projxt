import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/theme-store';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
  variant?: 'default' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 2,
  variant = 'default',
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors;
  
  return (
    <View
      style={[
        styles.card,
        { 
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        variant === 'outlined' && styles.outlined,
        variant === 'default' && { 
          elevation,
          shadowColor: isDarkMode ? '#000' : '#000',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outlined: {
    borderWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default Card;
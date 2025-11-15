import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  color,
  text,
  fullScreen = false,
}) => {
  const colors = useThemeColors();
  const indicatorColor = color || colors.primary;
  
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size={size} color={indicatorColor} />
        {text && <Text style={[styles.text, { color: colors.textLight }]}>{text}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={indicatorColor} />
      {text && <Text style={[styles.text, { color: colors.textLight }]}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default LoadingIndicator;
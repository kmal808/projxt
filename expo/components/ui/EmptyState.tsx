import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Button from './Button';
import { useThemeColors } from '@/hooks/useThemeColors';

interface EmptyStateProps {
  title: string;
  description?: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  actionButton?: React.ReactNode;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  message,
  icon,
  actionLabel,
  onAction,
  actionButton,
  style,
}) => {
  const colors = useThemeColors();
  const displayMessage = message || description;
  
  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {displayMessage && <Text style={[styles.description, { color: colors.textLight }]}>{displayMessage}</Text>}
      {actionButton ? (
        actionButton
      ) : actionLabel && onAction ? (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
          variant="primary"
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 120,
  },
});

export default EmptyState;
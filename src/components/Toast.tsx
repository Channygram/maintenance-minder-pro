import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Toast types
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss?: () => void;
}

const getConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return { icon: 'checkmark-circle' as const, color: colors.secondary, bgColor: colors.secondary + '20' };
    case 'error':
      return { icon: 'close-circle' as const, color: colors.danger, bgColor: colors.danger + '20' };
    case 'warning':
      return { icon: 'warning' as const, color: colors.warning, bgColor: colors.warning + '20' };
    default:
      return { icon: 'information-circle' as const, color: colors.primary, bgColor: colors.primary + '20' };
  }
};

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onDismiss }) => {
  const config = getConfig(type);
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: config.bgColor }]}
      onPress={onDismiss}
      activeOpacity={0.9}
    >
      <Ionicons name={config.icon} size={24} color={config.color} />
      <Text style={[styles.message, { color: config.color }]}>{message}</Text>
      {onDismiss && (
        <Ionicons name="close" size={20} color={config.color} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});

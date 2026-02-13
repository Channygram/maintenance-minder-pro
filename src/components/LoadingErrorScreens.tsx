import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <View style={styles.container}>
      <LoadingSpinner size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

interface ErrorScreenProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  title = 'Oops!', 
  message, 
  onRetry 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.errorIcon}>
        <Ionicons name="alert-circle" size={64} color={colors.danger} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 40,
  },
  errorIcon: {
    marginBottom: 20,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

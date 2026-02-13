import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../theme/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = colors.primary,
  message 
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    
    animation.start();
    
    return () => animation.stop();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 48;
      default: return 32;
    }
  };

  const spinnerSize = getSize();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: spinnerSize / 2,
            borderWidth: spinnerSize / 4,
            borderColor: color,
            borderTopColor: 'transparent',
            transform: [{ rotate: spin }],
          },
        ]}
      />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  spinner: {},
  message: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface FABProps {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
  color?: string;
  backgroundColor?: string;
}

export const FAB: React.FC<FABProps> = ({
  icon = 'add',
  onPress,
  style,
  color = colors.white,
  backgroundColor = colors.primary,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.fab, { backgroundColor }, style]}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={28} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

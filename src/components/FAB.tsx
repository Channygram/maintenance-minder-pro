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
  size?: 'small' | 'medium' | 'large';
}

export const FAB: React.FC<FABProps> = ({
  icon = 'add',
  onPress,
  style,
  color = colors.white,
  backgroundColor = colors.primary,
  size = 'medium',
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 44, height: 44, radius: 22, iconSize: 20 };
      case 'large':
        return { width: 64, height: 64, radius: 32, iconSize: 32 };
      default:
        return { width: 56, height: 56, radius: 28, iconSize: 24 };
    }
  };

  const sizeConfig = getSize();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.fab, 
        { 
          backgroundColor,
          width: sizeConfig.width,
          height: sizeConfig.height,
          borderRadius: sizeConfig.radius,
        }, 
        style
      ]}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={sizeConfig.iconSize} color={color} />
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

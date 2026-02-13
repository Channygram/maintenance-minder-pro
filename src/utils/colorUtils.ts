// Color utilities

import { colors } from '../theme/colors';

export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getLuminance = (hex: string): number => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  // Perceived luminance formula
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const isDarkMode = (): boolean => {
  // This app is always dark mode
  return true;
};

export const getContrastColor = (bgColor: string): string => {
  const luminance = getLuminance(bgColor);
  return luminance > 0.5 ? colors.black : colors.white;
};

// Get color with alpha
export const withAlpha = (color: string, alpha: number): string => {
  return hexToRgba(color, alpha);
};

// Generate a gradient colors array
export const generateGradient = (
  startColor: string,
  endColor: string,
  steps: number
): string[] => {
  const result: string[] = [];
  
  const startR = parseInt(startColor.slice(1, 3), 16);
  const startG = parseInt(startColor.slice(3, 5), 16);
  const startB = parseInt(startColor.slice(5, 7), 16);
  
  const endR = parseInt(endColor.slice(1, 3), 16);
  const endG = parseInt(endColor.slice(3, 5), 16);
  const endB = parseInt(endColor.slice(5, 7), 16);
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(startR + (endR - startR) * ratio);
    const g = Math.round(startG + (endG - startG) * ratio);
    const b = Math.round(startB + (endB - startB) * ratio);
    result.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
  }
  
  return result;
};

// Priority colors
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical':
      return colors.danger;
    case 'high':
      return colors.warning;
    case 'medium':
      return colors.primary;
    case 'low':
    default:
      return colors.secondary;
  }
};

// Status colors
export const getStatusColor = (status: 'overdue' | 'dueSoon' | 'upcoming' | 'completed'): string => {
  switch (status) {
    case 'overdue':
      return colors.danger;
    case 'dueSoon':
      return colors.warning;
    case 'upcoming':
      return colors.primary;
    case 'completed':
    default:
      return colors.secondary;
  }
};

// Common constants and mappings

import { Ionicons } from '@expo/vector-icons';

// Item type icons
export const ITEM_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  car: 'car',
  home: 'home',
  appliance: 'flash',
  other: 'ellipse',
};

// Priority colors
export const PRIORITY_COLORS_MAP: Record<string, string> = {
  low: '#10B981',    // Green
  medium: '#F59E0B', // Amber
  high: '#F97316',   // Orange
  critical: '#EF4444', // Red
};

// Status colors
export const STATUS_COLORS: Record<string, string> = {
  overdue: '#EF4444',
  dueSoon: '#F59E0B',
  upcoming: '#6366F1',
  completed: '#10B981',
  inactive: '#64748B',
};

// Task completion icons
export const COMPLETION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  oilChange: 'water',
  tireRotation: 'sync',
  filterChange: 'filter',
  inspection: 'search',
  cleaning: 'sparkles',
  replacement: 'refresh',
  default: 'checkmark-circle',
};

// Item category emojis
export const ITEM_CATEGORY_EMOJIS: Record<string, string> = {
  car: '🚗',
  home: '🏠',
  appliance: '🔌',
  other: '📦',
};

// Maintenance category icons
export const MAINTENANCE_CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  preventive: 'shield-checkmark',
  corrective: 'build',
  cleaning: 'sparkles',
  replacement: 'refresh',
  checkup: 'clipboard',
  default: 'construct',
};

// Reminder frequency labels
export const REMINDER_FREQUENCY_LABELS: Record<string, string> = {
  '0': 'Same day',
  '1': '1 day before',
  '2': '2 days before',
  '3': '3 days before',
  '7': '1 week before',
  '14': '2 weeks before',
  '30': '1 month before',
};

// Interval labels
export const INTERVAL_LABELS: Record<string, string> = {
  '7': 'Weekly',
  '14': 'Bi-weekly',
  '30': 'Monthly',
  '90': 'Quarterly',
  '180': 'Semi-annually',
  '365': 'Annually',
  '0': 'One-time',
};

// Document types for maintenance records
export const DOCUMENT_TYPES = [
  { id: 'receipt', label: 'Receipt', icon: 'receipt' },
  { id: 'warranty', label: 'Warranty', icon: 'shield-checkmark' },
  { id: 'manual', label: 'Manual', icon: 'book' },
  { id: 'invoice', label: 'Invoice', icon: 'document-text' },
  { id: 'photo', label: 'Photo', icon: 'camera' },
  { id: 'other', label: 'Other', icon: 'folder' },
];

// Service provider categories
export const PROVIDER_CATEGORIES = [
  { id: 'mechanic', label: 'Mechanic', icon: 'car' },
  { id: 'plumber', label: 'Plumber', icon: 'water' },
  { id: 'electrician', label: 'Electrician', icon: 'flash' },
  { id: 'hvac', label: 'HVAC', icon: 'thermometer' },
  { id: 'handyman', label: 'Handyman', icon: 'construct' },
  { id: 'cleaner', label: 'Cleaner', icon: 'sparkles' },
  { id: 'pest', label: 'Pest Control', icon: 'bug' },
  { id: 'landscaper', label: 'Landscaper', icon: 'leaf' },
  { id: 'other', label: 'Other', icon: 'person' },
];

// Expense categories
export const EXPENSE_CATEGORIES = [
  { id: 'parts', label: 'Parts', icon: 'cube' },
  { id: 'labor', label: 'Labor', icon: 'person' },
  { id: 'supplies', label: 'Supplies', icon: 'basket' },
  { id: 'service', label: 'Service Fee', icon: 'card' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

// Time of day for scheduling
export const TIME_OF_DAY = [
  { id: 'morning', label: 'Morning (8am - 12pm)', icon: 'sunny' },
  { id: 'afternoon', label: 'Afternoon (12pm - 5pm)', icon: 'partly-sunny' },
  { id: 'evening', label: 'Evening (5pm - 8pm)', icon: 'moon' },
  { id: 'anytime', label: 'Anytime', icon: 'time' },
];

// Get icon for item type
export const getIconForItemType = (type: string): string => {
  return ITEM_TYPE_ICONS[type] || 'ellipse';
};

// Get icon for task category
export const getIconForTask = (taskName: string): string => {
  const nameLower = taskName.toLowerCase();
  
  if (nameLower.includes('oil')) return 'water';
  if (nameLower.includes('tire')) return 'sync';
  if (nameLower.includes('filter')) return 'filter';
  if (nameLower.includes('clean')) return 'sparkles';
  if (nameLower.includes('inspect')) return 'search';
  if (nameLower.includes('replace') || nameLower.includes('change')) return 'refresh';
  
  return 'checkmark-circle';
};

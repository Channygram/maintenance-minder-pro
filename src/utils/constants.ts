import { Ionicons } from '@expo/vector-icons';

export const APP_NAME = 'Maintenance Minder Pro';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  ITEMS: '@maintenance_minder_items',
  TASKS: '@maintenance_minder_tasks',
  LOGS: '@maintenance_minder_logs',
  SETTINGS: '@maintenance_minder_settings',
  ONBOARDING_COMPLETE: '@maintenance_minder_onboarding',
} as const;

export const ITEM_TYPES = ['car', 'home', 'appliance', 'other'] as const;

export const ITEM_SUBTYPES: Record<string, string[]> = {
  car: ['Sedan', 'SUV', 'Truck', 'Van', 'Motorcycle', 'Sports Car', 'Electric', 'Hybrid', 'Other'],
  home: ['House', 'Apartment', 'Condo', 'Townhouse', 'Mobile Home', 'Garage', 'Other'],
  appliance: ['Refrigerator', 'Dishwasher', 'Washing Machine', 'Dryer', 'Oven/Range', 'Microwave', 'HVAC', 'Water Heater', 'Garage Door', 'Pool Equipment', 'Other'],
  other: ['Other'],
};

export const ITEM_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  car: 'car',
  home: 'home',
  appliance: 'cube',
  other: 'ellipse',
};

export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

export const REMINDER_OPTIONS = [
  { label: 'Same day', value: 0 },
  { label: '1 day before', value: 1 },
  { label: '3 days before', value: 3 },
  { label: '1 week before', value: 7 },
  { label: '2 weeks before', value: 14 },
] as const;

export const INTERVAL_PRESETS = [
  { label: 'Weekly', days: 7 },
  { label: 'Bi-weekly', days: 14 },
  { label: 'Monthly', days: 30 },
  { label: 'Quarterly', days: 90 },
  { label: 'Semi-annually', days: 180 },
  { label: 'Annually', days: 365 },
  { label: 'One-time', days: 0 },
] as const;

export const DEFAULT_SETTINGS = {
  notificationsEnabled: true,
  defaultReminderDays: 3,
  darkMode: true,
};

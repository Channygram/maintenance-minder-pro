// Constants and configurations for the app

// App Info
export const APP_CONFIG = {
  name: 'Maintenance Minder Pro',
  version: '1.0.0',
  buildNumber: '1',
  bundleId: 'com.maintenanceminder.pro',
  packageName: 'com.maintenanceminder.pro',
};

// Feature Flags
export const FEATURES = {
  enableCloudSync: false, // Coming soon
  enableNotifications: true,
  enableStatistics: true,
  enableYearInReview: true,
  enableWarrantyTracker: true,
  enableServiceProviders: true,
  enableGlobalSearch: true,
  enableTips: true,
  enableImportExport: true,
};

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Layout Constants
export const LAYOUT = {
  screenPadding: 16,
  cardPadding: 16,
  cardRadius: 16,
  buttonRadius: 12,
  inputRadius: 12,
  borderRadius: 8,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Font Sizes
export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Priority Labels
export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// Item Type Labels
export const TYPE_LABELS = {
  car: 'Vehicle',
  home: 'Home',
  appliance: 'Appliance',
  other: 'Other',
};

// Date Format Options
export const DATE_FORMATS = {
  short: 'MMM d',
  medium: 'MMM d, yyyy',
  long: 'MMMM d, yyyy',
  time: 'h:mm a',
  dateTime: 'MMM d, yyyy h:mm a',
};

// Storage Keys (extended)
export const STORAGE_CONFIG = {
  // Main data
  items: '@mmp_items',
  tasks: '@mmp_tasks',
  logs: '@mmp_logs',
  settings: '@mmp_settings',
  onboarding: '@mmp_onboarding',
  
  // App state
  lastSync: '@mmp_last_sync',
  deviceId: '@mmp_device_id',
  
  // Cache
  providers: '@mmp_providers',
  recentItems: '@mmp_recent_items',
  searchHistory: '@mmp_search_history',
};

// Notification Channels (Android)
export const NOTIFICATION_CHANNELS = {
  maintenance: 'maintenance_reminders',
  warranty: 'warranty_alerts',
  general: 'general',
};

// Maximum Limits
export const LIMITS = {
  maxItems: 500,
  maxTasksPerItem: 100,
  maxLogsPerTask: 1000,
  maxSearchResults: 50,
  maxImportSize: 1024 * 1024, // 1MB
};

// Maintenance Intervals (in days)
export const COMMON_INTERVALS = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 90,
  biannual: 180,
  annual: 365,
  biennial: 730,
};

// Reminder Options
export const REMINDER_OPTIONS = [
  { label: 'Same day', value: 0 },
  { label: '1 day before', value: 1 },
  { label: '2 days before', value: 2 },
  { label: '3 days before', value: 3 },
  { label: '1 week before', value: 7 },
  { label: '2 weeks before', value: 14 },
  { label: '1 month before', value: 30 },
];

// Cost Estimates (for reference)
export const ESTIMATED_COSTS = {
  oilChange: { min: 30, max: 80, avg: 50 },
  tireRotation: { min: 0, max: 50, avg: 25 },
  brakeService: { min: 100, max: 300, avg: 200 },
  hvacFilter: { min: 20, max: 60, avg: 35 },
  waterHeaterFlush: { min: 50, max: 150, avg: 100 },
  dryerVentClean: { min: 50, max: 150, avg: 100 },
  chimneyClean: { min: 100, max: 300, avg: 200 },
  septicPump: { min: 200, max: 500, avg: 350 },
};

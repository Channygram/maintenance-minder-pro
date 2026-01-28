export interface Item {
  id: string;
  name: string;
  type: 'car' | 'home' | 'appliance' | 'other';
  subtype?: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  location?: string;
  notes?: string;
  imageUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTask {
  id: string;
  itemId: string;
  name: string;
  description?: string;
  intervalDays: number;
  lastCompleted?: string;
  nextDue: string;
  reminderDaysBefore: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost?: number;
  notes?: string;
  isActive: boolean;
}

export interface MaintenanceLog {
  id: string;
  taskId: string;
  itemId: string;
  completedAt: string;
  cost?: number;
  provider?: string;
  notes?: string;
  receiptUri?: string;
}

export interface Settings {
  notificationsEnabled: boolean;
  defaultReminderDays: number;
  darkMode: boolean;
}

export interface AppState {
  items: Item[];
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  settings: Settings;
  isLoading: boolean;
  onboardingComplete: boolean;
}

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SET_TASKS'; payload: MaintenanceTask[] }
  | { type: 'ADD_TASK'; payload: MaintenanceTask }
  | { type: 'UPDATE_TASK'; payload: MaintenanceTask }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_LOGS'; payload: MaintenanceLog[] }
  | { type: 'ADD_LOG'; payload: MaintenanceLog }
  | { type: 'SET_SETTINGS'; payload: Settings }
  | { type: 'SET_ONBOARDING_COMPLETE'; payload: boolean }
  | { type: 'LOAD_ALL_DATA'; payload: Partial<AppState> };

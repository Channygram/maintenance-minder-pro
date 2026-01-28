import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item, MaintenanceTask, MaintenanceLog, Settings } from '../context/types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';

export const saveItems = async (items: Item[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
};

export const loadItems = async (): Promise<Item[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);
  return data ? JSON.parse(data) : [];
};

export const saveTasks = async (tasks: MaintenanceTask[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const loadTasks = async (): Promise<MaintenanceTask[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
  return data ? JSON.parse(data) : [];
};

export const saveLogs = async (logs: MaintenanceLog[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
};

export const loadLogs = async (): Promise<MaintenanceLog[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
  return data ? JSON.parse(data) : [];
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const loadSettings = async (): Promise<Settings> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

export const setOnboardingComplete = async (complete: boolean): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, JSON.stringify(complete));
};

export const getOnboardingComplete = async (): Promise<boolean> => {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return data ? JSON.parse(data) : false;
};

export const exportAllData = async (): Promise<string> => {
  const items = await loadItems();
  const tasks = await loadTasks();
  const logs = await loadLogs();
  const settings = await loadSettings();
  
  return JSON.stringify({ items, tasks, logs, settings }, null, 2);
};

export const clearAllData = async (): Promise<void> => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ITEMS,
    STORAGE_KEYS.TASKS,
    STORAGE_KEYS.LOGS,
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.ONBOARDING_COMPLETE,
  ]);
};

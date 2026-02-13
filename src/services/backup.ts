// Backup and data management utilities

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item, MaintenanceTask, MaintenanceLog, Settings } from '../context/types';
import { STORAGE_KEYS } from '../utils/constants';

export interface BackupData {
  version: string;
  createdAt: string;
  items: Item[];
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  settings: Settings;
}

export interface BackupMetadata {
  id: string;
  createdAt: string;
  size: number;
  itemCount: number;
  taskCount: number;
}

const BACKUP_LIST_KEY = '@mmp_backup_list';
const BACKUP_DATA_PREFIX = '@mmp_backup_';

export const createBackup = async (name?: string): Promise<BackupMetadata> => {
  const now = new Date().toISOString();
  
  // Load all data
  const [itemsData, tasksData, logsData, settingsData] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.ITEMS),
    AsyncStorage.getItem(STORAGE_KEYS.TASKS),
    AsyncStorage.getItem(STORAGE_KEYS.LOGS),
    AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
  ]);

  const items: Item[] = itemsData ? JSON.parse(itemsData) : [];
  const tasks: MaintenanceTask[] = tasksData ? JSON.parse(tasksData) : [];
  const logs: MaintenanceLog[] = logsData ? JSON.parse(logsData) : [];
  const settings: Settings = settingsData ? JSON.parse(settingsData) : {};

  const backup: BackupData = {
    version: '1.0.0',
    createdAt: now,
    items,
    tasks,
    logs,
    settings,
  };

  const backupId = `backup_${Date.now()}`;
  const backupJson = JSON.stringify(backup);
  const size = new Blob([backupJson]).size;

  // Save backup data
  await AsyncStorage.setItem(BACKUP_DATA_PREFIX + backupId, backupJson);

  // Update backup list
  const metadata: BackupMetadata = {
    id: backupId,
    createdAt: now,
    size,
    itemCount: items.length,
    taskCount: tasks.length,
  };

  const existingBackups = await getBackupList();
  const updatedBackups = [metadata, ...existingBackups].slice(0, 10); // Keep last 10
  await AsyncStorage.setItem(BACKUP_LIST_KEY, JSON.stringify(updatedBackups));

  return metadata;
};

export const getBackupList = async (): Promise<BackupMetadata[]> => {
  const data = await AsyncStorage.getItem(BACKUP_LIST_KEY);
  return data ? JSON.parse(data) : [];
};

export const getBackup = async (id: string): Promise<BackupData | null> => {
  const data = await AsyncStorage.getItem(BACKUP_DATA_PREFIX + id);
  return data ? JSON.parse(data) : null;
};

export const restoreBackup = async (id: string): Promise<boolean> => {
  try {
    const backup = await getBackup(id);
    if (!backup) return false;

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(backup.items)),
      AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(backup.tasks)),
      AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(backup.logs)),
      AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(backup.settings)),
    ]);

    return true;
  } catch (error) {
    console.error('Restore failed:', error);
    return false;
  }
};

export const deleteBackup = async (id: string): Promise<void> => {
  await AsyncStorage.removeItem(BACKUP_DATA_PREFIX + id);
  
  const backups = await getBackupList();
  const updated = backups.filter(b => b.id !== id);
  await AsyncStorage.setItem(BACKUP_LIST_KEY, JSON.stringify(updated));
};

export const exportBackupToString = async (): Promise<string> => {
  const [itemsData, tasksData, logsData, settingsData] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.ITEMS),
    AsyncStorage.getItem(STORAGE_KEYS.TASKS),
    AsyncStorage.getItem(STORAGE_KEYS.LOGS),
    AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
  ]);

  const data = {
    items: JSON.parse(itemsData || '[]'),
    tasks: JSON.parse(tasksData || '[]'),
    logs: JSON.parse(logsData || '[]'),
    settings: JSON.parse(settingsData || '{}'),
  };

  return JSON.stringify(data, null, 2);
};

export const importBackupFromString = async (jsonString: string): Promise<boolean> => {
  try {
    const data = JSON.parse(jsonString);
    
    if (!Array.isArray(data.items) || !Array.isArray(data.tasks) || !Array.isArray(data.logs)) {
      throw new Error('Invalid backup format');
    }

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data.items)),
      AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks)),
      AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs)),
      data.settings && AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings)),
    ]);

    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
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

export const getStorageInfo = async (): Promise<{
  items: number;
  tasks: number;
  logs: number;
  totalSize: number;
}> => {
  const [itemsData, tasksData, logsData] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.ITEMS),
    AsyncStorage.getItem(STORAGE_KEYS.TASKS),
    AsyncStorage.getItem(STORAGE_KEYS.LOGS),
  ]);

  const items = JSON.parse(itemsData || '[]');
  const tasks = JSON.parse(tasksData || '[]');
  const logs = JSON.parse(logsData || '[]');

  const totalSize = 
    (itemsData?.length || 0) + 
    (tasksData?.length || 0) + 
    (logsData?.length || 0);

  return {
    items: items.length,
    tasks: tasks.length,
    logs: logs.length,
    totalSize,
  };
};

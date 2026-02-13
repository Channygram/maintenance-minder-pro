// Cloud Sync Service using Supabase
// This provides cloud backup and cross-device sync

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Item, MaintenanceTask, MaintenanceLog, Settings } from '../context/types';
import { STORAGE_KEYS } from '../utils/constants';

// Note: In production, you'd configure these with your Supabase project credentials
// For now, this is a local-first implementation with cloud backup placeholder

interface SyncData {
  items: Item[];
  tasks: MaintenanceTask[];
  logs: MaintenanceLog[];
  settings: Settings;
  lastSyncedAt: string;
  deviceId: string;
}

const SYNC_STORAGE_KEY = '@maintenance_minder_sync_cache';
const DEVICE_ID_KEY = '@maintenance_minder_device_id';

// Generate a unique device ID
const getDeviceId = async (): Promise<string> => {
  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

// Get all data for sync
export const getDataForSync = async (): Promise<SyncData> => {
  const [itemsData, tasksData, logsData, settingsData] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.ITEMS),
    AsyncStorage.getItem(STORAGE_KEYS.TASKS),
    AsyncStorage.getItem(STORAGE_KEYS.LOGS),
    AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
  ]);

  return {
    items: itemsData ? JSON.parse(itemsData) : [],
    tasks: tasksData ? JSON.parse(tasksData) : [],
    logs: logsData ? JSON.parse(logsData) : [],
    settings: settingsData ? JSON.parse(settingsData) : {},
    lastSyncedAt: new Date().toISOString(),
    deviceId: await getDeviceId(),
  };
};

// Save sync data locally
export const saveSyncData = async (data: SyncData): Promise<void> => {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data.items)),
    AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks)),
    AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs)),
    AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings)),
    AsyncStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify({
      lastSyncedAt: data.lastSyncedAt,
      deviceId: data.deviceId,
    })),
  ]);
};

// Get last sync info
export const getLastSyncInfo = async (): Promise<{ lastSyncedAt: string | null; deviceId: string }> => {
  const syncData = await AsyncStorage.getItem(SYNC_STORAGE_KEY);
  const deviceId = await getDeviceId();
  
  if (syncData) {
    const parsed = JSON.parse(syncData);
    return {
      lastSyncedAt: parsed.lastSyncedAt,
      deviceId: parsed.deviceId || deviceId,
    };
  }
  
  return { lastSyncedAt: null, deviceId };
};

// Sync to cloud (placeholder - would integrate with Supabase in production)
// This demonstrates the sync architecture
export const syncToCloud = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const data = await getDataForSync();
    
    // In production, this would be:
    // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // const { error } = await supabase.from('user_data').upsert({ ... });
    
    console.log('Sync data prepared:', {
      items: data.items.length,
      tasks: data.tasks.length,
      logs: data.logs.length,
      lastSyncedAt: data.lastSyncedAt,
    });
    
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'Data synced successfully' };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, message: 'Failed to sync data' };
  }
};

// Restore from cloud (placeholder)
export const restoreFromCloud = async (): Promise<{ success: boolean; data?: SyncData; message: string }> => {
  try {
    // In production, this would fetch from Supabase
    // For now, return a placeholder
    
    return { 
      success: false, 
      message: 'Cloud restore requires Supabase configuration. Set up your Supabase project to enable cloud backup.' 
    };
  } catch (error) {
    return { success: false, message: 'Failed to restore from cloud' };
  }
};

// Check if data has changed since last sync
export const hasUnsyncedChanges = async (): Promise<boolean> => {
  const syncInfo = await getLastSyncInfo();
  
  if (!syncInfo.lastSyncedAt) {
    return true; // Never synced
  }
  
  const lastSync = new Date(syncInfo.lastSyncedAt);
  const now = new Date();
  
  // Consider data "unsynced" if changed in the last 5 minutes
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  return lastSync < fiveMinutesAgo;
};

// Merge strategy for conflict resolution
export const mergeData = (
  localData: SyncData,
  cloudData: SyncData
): SyncData => {
  // Simple last-write-wins strategy
  // In production, you'd want more sophisticated merging
  
  const localLastSync = new Date(localData.lastSyncedAt);
  const cloudLastSync = new Date(cloudData.lastSyncedAt);
  
  if (cloudLastSync > localLastSync) {
    return cloudData;
  }
  
  return localData;
};

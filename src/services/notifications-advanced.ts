// Notification scheduling and management utilities

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MaintenanceTask, Item } from '../context/types';
import { parseISO, subDays, addDays, format, isBefore, isAfter } from 'date-fns';

export interface ScheduledNotification {
  id: string;
  taskId: string;
  itemId: string;
  title: string;
  body: string;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'cancelled';
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Configure Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('maintenance', {
      name: 'Maintenance Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
      sound: 'default',
    });

    // Warranty alerts channel
    await Notifications.setNotificationChannelAsync('warranty', {
      name: 'Warranty Alerts',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
      sound: 'default',
    });
  }

  return true;
};

export const scheduleTaskReminder = async (
  task: MaintenanceTask,
  item: Item,
  daysBefore: number = 3
): Promise<string | null> => {
  try {
    const dueDate = parseISO(task.nextDue);
    const reminderDate = subDays(dueDate, daysBefore);

    // Don't schedule if reminder date is in the past
    if (isBefore(reminderDate, new Date())) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 ${task.name} Due Soon`,
        body: `${item.name} - ${task.name} is due in ${daysBefore} day${daysBefore > 1 ? 's' : ''}`,
        data: { 
          type: 'task_reminder',
          taskId: task.id, 
          itemId: item.id 
        },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
};

export const scheduleWarrantyExpiryReminder = async (
  item: Item,
  daysBefore: number = 30
): Promise<string | null> => {
  if (!item.warrantyExpiry) return null;

  try {
    const warrantyDate = parseISO(item.warrantyExpiry);
    const reminderDate = subDays(warrantyDate, daysBefore);

    if (isBefore(reminderDate, new Date())) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ Warranty Expiring Soon`,
        body: `${item.name} - Warranty expires on ${format(warrantyDate, 'MMM d, yyyy')}`,
        data: { 
          type: 'warranty_reminder',
          itemId: item.id 
        },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule warranty notification:', error);
    return null;
  }
};

export const cancelTaskNotifications = async (taskId: string): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      const data = notification.content.data as any;
      if (data?.taskId === taskId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Failed to cancel notifications:', error);
  }
};

export const cancelItemNotifications = async (itemId: string): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      const data = notification.content.data as any;
      if (data?.itemId === itemId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Failed to cancel notifications:', error);
  }
};

export const getScheduledNotifications = async (): Promise<ScheduledNotification[]> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    
    return notifications.map(notification => ({
      id: notification.identifier,
      taskId: (notification.content.data as any)?.taskId || '',
      itemId: (notification.content.data as any)?.itemId || '',
      title: notification.content.title || 'Notification',
      body: notification.content.body || '',
      scheduledFor: new Date(),
      status: 'pending' as const,
    }));
  } catch (error) {
    console.error('Failed to get notifications:', error);
    return [];
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel all notifications:', error);
  }
};

export const rescheduleAllNotifications = async (
  tasks: MaintenanceTask[],
  items: Item[]
): Promise<void> => {
  // Cancel all existing
  await cancelAllNotifications();

  // Reschedule for active tasks
  for (const task of tasks) {
    if (task.isActive) {
      const item = items.find(i => i.id === task.itemId);
      if (item) {
        await scheduleTaskReminder(task, item, task.reminderDaysBefore);
      }
    }
  }

  // Reschedule warranty reminders
  for (const item of items) {
    if (item.warrantyExpiry) {
      await scheduleWarrantyExpiryReminder(item);
    }
  }
};

export const getNotificationPreferences = async (): Promise<{
  enabled: boolean;
  sounds: boolean;
  badges: boolean;
}> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return {
      enabled: status === 'granted',
      sounds: true,
      badges: true,
    };
  } catch {
    return {
      enabled: false,
      sounds: false,
      badges: false,
    };
  }
};

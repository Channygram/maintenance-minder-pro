import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MaintenanceTask, Item } from '../context/types';
import { addDays, subDays, parseISO } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('maintenance', {
      name: 'Maintenance Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }
  
  return true;
};

export const scheduleTaskNotification = async (
  task: MaintenanceTask,
  item: Item
): Promise<string | null> => {
  try {
    const dueDate = parseISO(task.nextDue);
    const notificationDate = subDays(dueDate, task.reminderDaysBefore);
    
    // Don't schedule if notification date is in the past
    if (notificationDate <= new Date()) {
      return null;
    }
    
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔧 ${task.name} Due Soon`,
        body: `${item.name}: ${task.name} is due in ${task.reminderDaysBefore} days`,
        data: { taskId: task.id, itemId: item.id },
      },
      trigger: {
        type: 'date',
        date: notificationDate,
      } as any,
    });
    
    return id;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
};

export const cancelNotification = async (notificationId: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const scheduleAllTaskNotifications = async (
  tasks: MaintenanceTask[],
  items: Item[]
): Promise<void> => {
  await cancelAllNotifications();
  
  const itemMap = new Map(items.map((item) => [item.id, item]));
  
  for (const task of tasks) {
    if (task.isActive) {
      const item = itemMap.get(task.itemId);
      if (item) {
        await scheduleTaskNotification(task, item);
      }
    }
  }
};

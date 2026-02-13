import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Card, Button, Header } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { isOverdue, isDueSoon, getDaysUntilDue, formatDate } from '../../utils/dates';

export const NotificationsCenterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { state } = useApp();
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    checkPermissions();
    checkScheduledNotifications();
  }, []);

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const checkScheduledNotifications = async () => {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    setScheduledCount(notifications.length);
  };

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    
    if (status === 'granted') {
      Alert.alert('Success', 'Notification permissions granted!');
    } else {
      Alert.alert(
        'Permissions Required',
        'Please enable notifications in your device settings to receive maintenance reminders.'
      );
    }
  };

  const openSettings = async () => {
    // Open notification settings - may not be available on all platforms
    try {
      await Notifications.getPermissionsAsync();
    } catch (e) {
      Alert.alert('Settings', 'Please enable notifications in your device settings.');
    }
  };

  const activeTasks = state.tasks.filter(t => t.isActive);
  const overdueTasks = activeTasks.filter(t => isOverdue(t.nextDue));
  const upcomingTasks = activeTasks.filter(t => isDueSoon(t.nextDue) && !isOverdue(t.nextDue));

  const getItemForTask = (itemId: string) => {
    return state.items.find(i => i.id === itemId);
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Notifications</Text>

        {/* Permission Status */}
        <Card>
          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <Ionicons 
                name={permissionStatus === 'granted' ? 'checkmark-circle' : 'alert-circle'} 
                size={24} 
                color={permissionStatus === 'granted' ? colors.secondary : colors.warning} 
              />
              <View style={styles.permissionText}>
                <Text style={styles.permissionTitle}>
                  {permissionStatus === 'granted' ? 'Notifications Enabled' : 'Notifications Disabled'}
                </Text>
                <Text style={styles.permissionSubtitle}>
                  {permissionStatus === 'granted' 
                    ? 'You will receive maintenance reminders'
                    : 'Enable to get timely maintenance reminders'}
                </Text>
              </View>
            </View>
          </View>
          
          {permissionStatus !== 'granted' ? (
            <Button
              title="Enable Notifications"
              onPress={requestPermissions}
              style={{ marginTop: 16 }}
            />
          ) : (
            <Button
              title="Notification Settings"
              variant="outline"
              onPress={openSettings}
              style={{ marginTop: 16 }}
            />
          )}
        </Card>

        {/* Scheduled Notifications */}
        <Card style={{ marginTop: 16 }}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{scheduledCount}</Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.danger }]}>{overdueTasks.length}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.warning }]}>{upcomingTasks.length}</Text>
              <Text style={styles.statLabel}>Due Soon</Text>
            </View>
          </View>
        </Card>

        {/* Upcoming Tasks */}
        <Text style={styles.sectionTitle}>🔔 Upcoming Reminders</Text>
        
        {upcomingTasks.length === 0 && overdueTasks.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>No upcoming reminders</Text>
            </View>
          </Card>
        ) : (
          <>
            {/* Overdue */}
            {overdueTasks.length > 0 && (
              <>
                <Text style={[styles.sectionSubtitle, { color: colors.danger }]}>
                  ⚠️ Overdue ({overdueTasks.length})
                </Text>
                {overdueTasks.slice(0, 5).map(task => {
                  const item = getItemForTask(task.itemId);
                  return (
                    <Card key={task.id} style={styles.notificationCard}>
                      <View style={styles.notificationRow}>
                        <Ionicons name="alert-circle" size={20} color={colors.danger} />
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationTitle}>{task.name}</Text>
                          <Text style={styles.notificationSubtitle}>
                            {item?.name} • {getDaysUntilDue(task.nextDue)} days overdue
                          </Text>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </>
            )}

            {/* Due Soon */}
            {upcomingTasks.length > 0 && (
              <>
                <Text style={[styles.sectionSubtitle, { color: colors.warning }]}>
                  📅 Due This Week ({upcomingTasks.length})
                </Text>
                {upcomingTasks.slice(0, 10).map(task => {
                  const item = getItemForTask(task.itemId);
                  return (
                    <Card key={task.id} style={styles.notificationCard}>
                      <View style={styles.notificationRow}>
                        <Ionicons name="time" size={20} color={colors.warning} />
                        <View style={styles.notificationContent}>
                          <Text style={styles.notificationTitle}>{task.name}</Text>
                          <Text style={styles.notificationSubtitle}>
                            {item?.name} • Due in {getDaysUntilDue(task.nextDue)} days
                          </Text>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </>
            )}
          </>
        )}

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Ionicons name="bulb" size={24} color={colors.warning} />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Tips</Text>
            <Text style={styles.tipsText}>
              • Long-press any task to defer it{'\n'}
              • Complete tasks to automatically reschedule{'\n'}
              • Adjust reminder days in task settings
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionText: {
    marginLeft: 12,
    flex: 1,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  permissionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  notificationCard: {
    marginBottom: 8,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  notificationSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
    backgroundColor: colors.warning + '10',
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});

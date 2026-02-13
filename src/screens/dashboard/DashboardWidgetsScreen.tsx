import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { parseISO, format } from 'date-fns';

export const DashboardWidgetsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  // Calculate quick stats
  const totalItems = state.items.length;
  const totalTasks = state.tasks.filter(t => t.isActive).length;
  const overdueTasks = state.tasks.filter(t => t.isActive && new Date(t.nextDue) < new Date()).length;
  const totalSpent = state.logs.reduce((sum, log) => sum + (log.cost || 0), 0);

  // Recent activity
  const recentLogs = [...state.logs]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 3);

  // Upcoming this week
  const thisWeekTasks = state.tasks
    .filter(t => {
      if (!t.isActive) return false;
      const due = new Date(t.nextDue);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return due >= now && due <= weekFromNow;
    })
    .slice(0, 5);

  const getItemForTask = (itemId: string) => state.items.find(i => i.id === itemId);

  const handleShare = async () => {
    const message = `📊 My Maintenance Stats:\n\n🔧 ${totalItems} Items tracked\n✅ ${totalTasks} Active tasks\n⚠️ ${overdueTasks} Overdue\n💰 $${totalSpent.toFixed(2)} spent on maintenance\n\n#MaintenanceMinderPro`;
    await Share.share({ message });
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Dashboard</Text>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Ionicons name="cube" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{totalItems}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="checkbox" size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="alert-circle" size={24} color={colors.danger} />
            <Text style={[styles.statValue, { color: colors.danger }]}>{overdueTasks}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="wallet" size={24} color={colors.warning} />
            <Text style={styles.statValue}>${totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('QuickAdd')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="flash" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Quick Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('TasksList')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="list" size={24} color={colors.secondary} />
            </View>
            <Text style={styles.actionLabel}>All Tasks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Calendar')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="calendar" size={24} color={colors.warning} />
            </View>
            <Text style={styles.actionLabel}>Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Stats')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.danger + '20' }]}>
              <Ionicons name="stats-chart" size={24} color={colors.danger} />
            </View>
            <Text style={styles.actionLabel}>Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming This Week */}
        {thisWeekTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 This Week</Text>
            {thisWeekTasks.map(task => {
              const item = getItemForTask(task.itemId);
              return (
                <Card key={task.id}>
                  <TouchableOpacity 
                    onPress={() => item && navigation.navigate('ItemDetail', { itemId: item.id })}
                  >
                    <View style={styles.taskRow}>
                      <View style={[styles.priorityDot, { backgroundColor: 
                        new Date(task.nextDue) < new Date() ? colors.danger : colors.warning 
                      }]} />
                      <View style={styles.taskContent}>
                        <Text style={styles.taskName}>{task.name}</Text>
                        <Text style={styles.taskItem}>{item?.name}</Text>
                      </View>
                      <Text style={styles.taskDue}>
                        {format(parseISO(task.nextDue), 'EEE, MMM d')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
        )}

        {/* Recent Activity */}
        {recentLogs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Recent Activity</Text>
            {recentLogs.map(log => {
              const task = state.tasks.find(t => t.id === log.taskId);
              const item = state.items.find(i => i.id === log.itemId);
              return (
                <Card key={log.id}>
                  <View style={styles.logRow}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
                    <View style={styles.logContent}>
                      <Text style={styles.logTask}>{task?.name}</Text>
                      <Text style={styles.logItem}>{item?.name}</Text>
                    </View>
                    <Text style={styles.logDate}>
                      {format(parseISO(log.completedAt), 'MMM d')}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Share Button */}
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color={colors.primary} />
          <Text style={styles.shareText}>Share My Stats</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  taskItem: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  taskDue: {
    color: colors.textMuted,
    fontSize: 13,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logContent: {
    flex: 1,
    marginLeft: 12,
  },
  logTask: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  logItem: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  logDate: {
    color: colors.textMuted,
    fontSize: 13,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  shareText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});

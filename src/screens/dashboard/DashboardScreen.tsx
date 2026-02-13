import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, TaskCard, FAB, EmptyState } from '../../components';
import { useApp } from '../../context/AppContext';
import { addDays } from 'date-fns';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { getGreeting } from '../../utils/helpers';
import { isOverdue, isDueSoon } from '../../utils/dates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state, updateTask } = useApp();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const activeTasks = state.tasks.filter((t) => t.isActive);
  const overdueTasks = activeTasks.filter((t) => isOverdue(t.nextDue));
  const dueSoonTasks = activeTasks.filter((t) => isDueSoon(t.nextDue) && !isOverdue(t.nextDue));

  const getItemForTask = (taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId);
    return task ? state.items.find((i) => i.id === task.itemId) : undefined;
  };

  const handleTaskPress = (taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (task) {
      navigation.navigate('ItemDetail', { itemId: task.itemId });
    }
  };

  const handleCompleteTask = (taskId: string) => {
    navigation.navigate('CompleteTask', { taskId });
  };

  const handleDeferTask = async (taskId: string, days: number) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      const newDueDate = addDays(new Date(), days);
      await updateTask({ ...task, nextDue: newDueDate.toISOString() });
    }
  };

  if (state.items.length === 0) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top }]}>
        <EmptyState
          icon="construct-outline"
          title="No items yet"
          message="Add your first car, home, or appliance to start tracking maintenance"
          actionLabel="Add Item"
          onAction={() => navigation.navigate('AddItem')}
        />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.title}>Dashboard</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="layers-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{state.items.length}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
            <Text style={[styles.statValue, { color: colors.danger }]}>{overdueTasks.length}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.warning }]}>{dueSoonTasks.length}</Text>
            <Text style={styles.statLabel}>Due Soon</Text>
          </Card>
        </View>

        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={styles.sectionTitle}>⚠️ Overdue</Text>
            {overdueTasks.slice(0, 5).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                item={getItemForTask(task.id)}
                onPress={() => handleTaskPress(task.id)}
                onComplete={() => handleCompleteTask(task.id)}
                onDefer={(days) => handleDeferTask(task.id, days)}
              />
            ))}
          </View>
        )}

        {/* Due Soon */}
        {dueSoonTasks.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={styles.sectionTitle}>📅 Due This Week</Text>
            {dueSoonTasks.slice(0, 5).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                item={getItemForTask(task.id)}
                onPress={() => handleTaskPress(task.id)}
                onComplete={() => handleCompleteTask(task.id)}
                onDefer={(days) => handleDeferTask(task.id, days)}
              />
            ))}
          </View>
        )}

        {overdueTasks.length === 0 && dueSoonTasks.length === 0 && (
          <Card style={styles.allGoodCard}>
            <Ionicons name="checkmark-circle" size={48} color={colors.secondary} />
            <Text style={styles.allGoodTitle}>All caught up!</Text>
            <Text style={styles.allGoodText}>No urgent maintenance tasks right now.</Text>
          </Card>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <FAB 
          icon="flash" 
          onPress={() => navigation.navigate('QuickAdd')} 
          style={styles.fabSecondary}
          size="small"
        />
        <FAB icon="add" onPress={() => navigation.navigate('AddItem')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  greeting: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 4,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
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
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  allGoodCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fabSecondary: {
    backgroundColor: colors.secondary,
  },
  allGoodTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  allGoodText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
});

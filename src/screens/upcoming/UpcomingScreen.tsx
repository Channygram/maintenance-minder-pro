import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, EmptyState } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { parseISO, isWithinInterval, startOfDay, endOfDay, addDays, format } from 'date-fns';
import { isOverdue, isDueSoon } from '../../utils/dates';

export const UpcomingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const upcomingByDay = useMemo(() => {
    const now = new Date();
    const days: { date: Date; tasks: typeof state.tasks }[] = [];
    
    // Group tasks by day for next 14 days
    for (let i = 0; i < 14; i++) {
      const dayStart = addDays(startOfDay(now), i);
      const dayEnd = addDays(endOfDay(now), i);
      
      const tasksForDay = state.tasks
        .filter(task => {
          if (!task.isActive) return false;
          const dueDate = parseISO(task.nextDue);
          return isWithinInterval(dueDate, { start: dayStart, end: dayEnd });
        })
        .sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime());

      if (tasksForDay.length > 0 || i < 3) {
        days.push({ date: dayStart, tasks: tasksForDay });
      }
    }
    
    return days;
  }, [state.tasks]);

  const getDayLabel = (date: Date, index: number) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    if (index < 7) return format(date, 'EEEE');
    return format(date, 'EEE, MMM d');
  };

  const getItemForTask = (itemId: string) => {
    return state.items.find(i => i.id === itemId);
  };

  const handleTaskPress = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      navigation.navigate('ItemDetail', { itemId: task.itemId });
    }
  };

  const handleCompleteTask = (taskId: string) => {
    navigation.navigate('CompleteTask', { taskId });
  };

  const hasAnyTasks = upcomingByDay.some(d => d.tasks.length > 0);

  if (!hasAnyTasks) {
    return (
      <View style={commonStyles.container}>
        <ScrollView
          style={commonStyles.scrollContainer}
          contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
        >
          <Text style={styles.title}>Upcoming</Text>
          
          <EmptyState
            icon="calendar-outline"
            title="No upcoming tasks"
            message="Add some items and maintenance tasks to see them here"
            actionLabel="Add Item"
            onAction={() => navigation.navigate('AddItem')}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Upcoming</Text>
        <Text style={styles.subtitle}>Next 2 weeks</Text>

        {upcomingByDay.map((day, index) => {
          const hasOverdue = index === 0 && day.tasks.some(t => isOverdue(t.nextDue));
          
          return (
            <View key={day.date.toISOString()}>
              <View style={styles.dayHeader}>
                <Text style={[
                  styles.dayLabel,
                  hasOverdue && styles.dayLabelOverdue
                ]}>
                  {getDayLabel(day.date, index)}
                </Text>
                {day.tasks.length > 0 && (
                  <View style={[styles.countBadge, hasOverdue && styles.countBadgeOverdue]}>
                    <Text style={[styles.countText, hasOverdue && styles.countTextOverdue]}>
                      {day.tasks.length}
                    </Text>
                  </View>
                )}
              </View>

              {day.tasks.length === 0 ? (
                index < 7 && (
                  <Card style={styles.emptyDay}>
                    <Text style={styles.emptyDayText}>No tasks scheduled</Text>
                  </Card>
                )
              ) : (
                day.tasks.map(task => {
                  const item = getItemForTask(task.itemId);
                  const taskOverdue = isOverdue(task.nextDue);
                  
                  return (
                    <TouchableOpacity
                      key={task.id}
                      onPress={() => handleTaskPress(task.id)}
                      activeOpacity={0.7}
                    >
                      <Card>
                        <View style={styles.taskRow}>
                          <View style={[
                            styles.priorityDot,
                            { 
                              backgroundColor: taskOverdue 
                                ? colors.danger 
                                : task.priority === 'high' 
                                  ? colors.warning 
                                  : colors.primary 
                            }
                          ]} />
                          <View style={styles.taskContent}>
                            <Text style={styles.taskName}>{task.name}</Text>
                            <Text style={styles.taskItem}>{item?.name || 'Unknown'}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.completeButton}
                            onPress={() => handleCompleteTask(task.id)}
                          >
                            <Ionicons name="checkmark-circle-outline" size={28} color={colors.secondary} />
                          </TouchableOpacity>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 16,
  },
  dayLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  dayLabelOverdue: {
    color: colors.danger,
  },
  countBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeOverdue: {
    backgroundColor: colors.danger + '20',
  },
  countText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  countTextOverdue: {
    color: colors.danger,
  },
  emptyDay: {
    opacity: 0.5,
  },
  emptyDayText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '500',
  },
  taskItem: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  completeButton: {
    padding: 4,
  },
});

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, TaskCard, EmptyState } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';

export const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const tasksForDate = useMemo(() => {
    return state.tasks.filter((task) => {
      if (!task.isActive) return false;
      const dueDate = parseISO(task.nextDue);
      return isSameDay(dueDate, selectedDate);
    });
  }, [state.tasks, selectedDate]);

  const getTaskCountForDay = (day: Date) => {
    return state.tasks.filter((task) => {
      if (!task.isActive) return false;
      const dueDate = parseISO(task.nextDue);
      return isSameDay(dueDate, day);
    }).length;
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleTaskPress = (taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (task) {
      navigation.navigate('ItemDetail', { itemId: task.itemId });
    }
  };

  const handleCompleteTask = (taskId: string) => {
    navigation.navigate('CompleteTask', { taskId });
  };

  const getItemForTask = (taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId);
    return task ? state.items.find((i) => i.id === task.itemId) : undefined;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfMonth = days[0].getDay();

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Calendar</Text>

        {/* Month Navigation */}
        <Card>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{format(currentMonth, 'MMMM yyyy')}</Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Week Day Headers */}
          <View style={styles.weekRow}>
            {weekDays.map((day) => (
              <View key={day} style={styles.weekDay}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <View key={`empty-${i}`} style={styles.dayCell} />
            ))}

            {/* Day cells */}
            {days.map((day) => {
              const taskCount = getTaskCountForDay(day);
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={[
                    styles.dayCell,
                    isToday && styles.todayCell,
                    isSelected && styles.selectedCell,
                  ]}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isToday && styles.todayText,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {format(day, 'd')}
                  </Text>
                  {taskCount > 0 && (
                    <View style={[styles.taskDot, isSelected && styles.taskDotSelected]}>
                      {taskCount > 1 && <Text style={styles.taskDotText}>{taskCount}</Text>}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Tasks for Selected Date */}
        <View style={commonStyles.section}>
          <Text style={styles.sectionTitle}>
            {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE, MMM d')}
          </Text>

          {tasksForDate.length === 0 ? (
            <Card>
              <View style={styles.emptyDay}>
                <Ionicons name="calendar-outline" size={32} color={colors.textMuted} />
                <Text style={styles.emptyDayText}>No tasks scheduled</Text>
              </View>
            </Card>
          ) : (
            tasksForDate.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                item={getItemForTask(task.id)}
                onPress={() => handleTaskPress(task.id)}
                onComplete={() => handleCompleteTask(task.id)}
              />
            ))
          )}
        </View>
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
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  todayCell: {
    backgroundColor: colors.primary + '20',
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  dayText: {
    color: colors.text,
    fontSize: 14,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '600',
  },
  selectedText: {
    color: colors.white,
    fontWeight: '600',
  },
  taskDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  taskDotSelected: {
    backgroundColor: colors.white,
  },
  taskDotText: {
    color: colors.white,
    fontSize: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyDayText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
});

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { parseISO, format, subDays } from 'date-fns';
import { formatCurrency } from '../../utils/helpers';

export const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const recentLogs = useMemo(() => {
    return [...state.logs]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 50);
  }, [state.logs]);

  // Group by date
  const groupedLogs = useMemo(() => {
    const groups: { date: string; logs: typeof recentLogs }[] = [];
    
    recentLogs.forEach(log => {
      const logDate = parseISO(log.completedAt);
      const dateStr = format(logDate, 'yyyy-MM-dd');
      const existing = groups.find(g => g.date === dateStr);
      
      if (existing) {
        existing.logs.push(log);
      } else {
        groups.push({ date: dateStr, logs: [log] });
      }
    });
    
    return groups;
  }, [recentLogs]);

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    const today = new Date();
    const yesterday = subDays(today, 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    }
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    }
    return format(date, 'EEEE, MMM d');
  };

  const getItemForLog = (itemId: string) => {
    return state.items.find(i => i.id === itemId);
  };

  const getTaskForLog = (taskId: string) => {
    return state.tasks.find(t => t.id === taskId);
  };

  const totalSpending = recentLogs.reduce((sum, log) => sum + (log.cost || 0), 0);

  if (recentLogs.length === 0) {
    return (
      <View style={commonStyles.container}>
        <ScrollView
          style={commonStyles.scrollContainer}
          contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
        >
          <Text style={styles.title}>History</Text>
          
          <Card style={styles.emptyCard}>
            <Ionicons name="time-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyText}>
              Complete some maintenance tasks to see your service history here
            </Text>
          </Card>
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
        <Text style={styles.title}>History</Text>

        {/* Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{recentLogs.length}</Text>
              <Text style={styles.summaryLabel}>Tasks Done</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(totalSpending)}</Text>
              <Text style={styles.summaryLabel}>Total Spent</Text>
            </View>
          </View>
        </Card>

        {/* Grouped by date */}
        {groupedLogs.map(group => {
          const daySpending = group.logs.reduce((sum, log) => sum + (log.cost || 0), 0);
          
          return (
            <View key={group.date}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateLabel}>{getDateLabel(group.date)}</Text>
                {daySpending > 0 && (
                  <Text style={styles.daySpending}>{formatCurrency(daySpending)}</Text>
                )}
              </View>

              {group.logs.map(log => {
                const task = getTaskForLog(log.taskId);
                const item = getItemForLog(log.itemId);
                
                return (
                  <TouchableOpacity
                    key={log.id}
                    onPress={() => item && navigation.navigate('ItemDetail', { itemId: item.id })}
                  >
                    <Card>
                      <View style={styles.logRow}>
                        <View style={styles.logIcon}>
                          <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
                        </View>
                        <View style={styles.logContent}>
                          <Text style={styles.logTask}>{task?.name || 'Task'}</Text>
                          <Text style={styles.logItem}>{item?.name || 'Unknown'}</Text>
                          {log.provider && (
                            <Text style={styles.logProvider}>📍 {log.provider}</Text>
                          )}
                        </View>
                        <View style={styles.logRight}>
                          {log.cost && (
                            <Text style={styles.logCost}>{formatCurrency(log.cost)}</Text>
                          )}
                          <Text style={styles.logTime}>
                            {format(parseISO(log.completedAt), 'h:mm a')}
                          </Text>
                        </View>
                      </View>
                      {log.notes && (
                        <Text style={styles.logNotes} numberOfLines={2}>
                          "{log.notes}"
                        </Text>
                      )}
                    </Card>
                  </TouchableOpacity>
                );
              })}
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
    marginBottom: 20,
  },
  summaryCard: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  dateLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  daySpending: {
    color: colors.textMuted,
    fontSize: 14,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logIcon: {
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logTask: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  logItem: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  logProvider: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  logRight: {
    alignItems: 'flex-end',
  },
  logCost: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  logTime: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  logNotes: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
    paddingLeft: 36,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

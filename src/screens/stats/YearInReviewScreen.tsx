import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { format, subYears, subMonths, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { formatCurrency } from '../../utils/helpers';

export const YearInReviewScreen: React.FC = () => {
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const yearlyStats = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const lastYearStart = subYears(yearStart, 1);
    const lastYearEnd = subYears(yearEnd, 1);

    // This year's data
    const thisYearLogs = state.logs.filter(log => {
      const logDate = parseISO(log.completedAt);
      return isWithinInterval(logDate, { start: yearStart, end: now });
    });

    const lastYearLogs = state.logs.filter(log => {
      const logDate = parseISO(log.completedAt);
      return isWithinInterval(logDate, { start: lastYearStart, end: lastYearEnd });
    });

    // Tasks completed
    const tasksCompleted = thisYearLogs.length;
    const lastYearTasks = lastYearLogs.length;
    const taskGrowth = lastYearTasks > 0 ? ((tasksCompleted - lastYearTasks) / lastYearTasks) * 100 : 0;

    // Spending
    const thisYearSpending = thisYearLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const lastYearSpending = lastYearLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const spendingGrowth = lastYearSpending > 0 ? ((thisYearSpending - lastYearSpending) / lastYearSpending) * 100 : 0;

    // Most common tasks
    const taskCounts = thisYearLogs.reduce((acc, log) => {
      const task = state.tasks.find(t => t.id === log.taskId);
      const name = task?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTasks = Object.entries(taskCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Items maintained
    const itemsMaintained = new Set(thisYearLogs.map(l => l.itemId)).size;
    const totalItems = state.items.length;

    // Streak (consecutive months with at least one task)
    let streak = 0;
    for (let i = 0; i < 12; i++) {
      const monthStart = subMonths(now, i);
      const monthLogs = thisYearLogs.filter(log => {
        const logDate = parseISO(log.completedAt);
        return logDate.getMonth() === monthStart.getMonth() && logDate.getFullYear() === monthStart.getFullYear();
      });
      if (monthLogs.length > 0) {
        streak++;
      } else {
        break;
      }
    }

    return {
      tasksCompleted,
      lastYearTasks,
      taskGrowth,
      thisYearSpending,
      lastYearSpending,
      spendingGrowth,
      topTasks,
      itemsMaintained,
      totalItems,
      streak,
    };
  }, [state.items, state.tasks, state.logs]);

  const generateShareText = () => {
    return `📊 My Maintenance Year in Review

🔧 Tasks Completed: ${yearlyStats.tasksCompleted}
💰 Total Spent: ${formatCurrency(yearlyStats.thisYearSpending)}
📅 Items Maintained: ${yearlyStats.itemsMaintained}/${yearlyStats.totalItems}
🔥 Current Streak: ${yearlyStats.streak} months

#MaintenanceMinderPro`;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: generateShareText(),
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Year in Review</Text>
        <Text style={styles.subtitle}>{format(new Date(), 'yyyy')}</Text>

        {/* Hero Card */}
        <Card variant="elevated" style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="trophy" size={48} color={colors.warning} />
          </View>
          <Text style={styles.heroTitle}>What a year!</Text>
          <Text style={styles.heroText}>
            You've completed {yearlyStats.tasksCompleted} maintenance tasks and counting.
          </Text>
        </Card>

        {/* Main Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Ionicons name="checkmark-done" size={28} color={colors.secondary} />
            <Text style={styles.statValue}>{yearlyStats.tasksCompleted}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
            {yearlyStats.taskGrowth !== 0 && (
              <View style={[styles.growthBadge, { backgroundColor: yearlyStats.taskGrowth > 0 ? colors.secondary + '20' : colors.danger + '20' }]}>
                <Ionicons 
                  name={yearlyStats.taskGrowth > 0 ? 'trending-up' : 'trending-down'} 
                  size={14} 
                  color={yearlyStats.taskGrowth > 0 ? colors.secondary : colors.danger} 
                />
                <Text style={[styles.growthText, { color: yearlyStats.taskGrowth > 0 ? colors.secondary : colors.danger }]}>
                  {Math.abs(yearlyStats.taskGrowth).toFixed(0)}%
                </Text>
              </View>
            )}
          </Card>

          <Card style={styles.statCard}>
            <Ionicons name="wallet" size={28} color={colors.primary} />
            <Text style={styles.statValue}>{formatCurrency(yearlyStats.thisYearSpending)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
            {yearlyStats.spendingGrowth !== 0 && (
              <View style={[styles.growthBadge, { backgroundColor: yearlyStats.spendingGrowth > 0 ? colors.danger + '20' : colors.secondary + '20' }]}>
                <Ionicons 
                  name={yearlyStats.spendingGrowth > 0 ? 'trending-up' : 'trending-down'} 
                  size={14} 
                  color={yearlyStats.spendingGrowth > 0 ? colors.danger : colors.secondary} 
                />
                <Text style={[styles.growthText, { color: yearlyStats.spendingGrowth > 0 ? colors.danger : colors.secondary }]}>
                  {Math.abs(yearlyStats.spendingGrowth).toFixed(0)}%
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Streak */}
        <Card>
          <View style={styles.streakRow}>
            <View style={styles.streakIcon}>
              <Ionicons name="flame" size={32} color={colors.warning} />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakValue}>{yearlyStats.streak}</Text>
              <Text style={styles.streakLabel}>Month Streak</Text>
            </View>
            <Text style={styles.streakText}>
              {yearlyStats.streak === 12 ? '🎉 Amazing!' : yearlyStats.streak >= 6 ? '🔥 Great job!' : '💪 Keep going!'}
            </Text>
          </View>
        </Card>

        {/* Top Tasks */}
        {yearlyStats.topTasks.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={styles.sectionTitle}>🏆 Most Common Tasks</Text>
            <Card>
              {yearlyStats.topTasks.map(([name, count], index) => (
                <View key={name} style={[styles.topTaskRow, index > 0 && styles.topTaskBorder]}>
                  <View style={styles.topTaskRank}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <Text style={styles.topTaskName}>{name}</Text>
                  <Text style={styles.topTaskCount}>{count}x</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Items Maintained */}
        <View style={commonStyles.section}>
          <Text style={styles.sectionTitle}>📦 Items Maintained</Text>
          <Card>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min((yearlyStats.itemsMaintained / Math.max(yearlyStats.totalItems, 1)) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {yearlyStats.itemsMaintained} of {yearlyStats.totalItems} items maintained
              </Text>
            </View>
          </Card>
        </View>

        {/* Share Button */}
        <Button
          title="Share Your Progress"
          onPress={handleShare}
          variant="outline"
          icon={<Ionicons name="share-social" size={20} color={colors.primary} />}
          style={{ marginTop: 16 }}
        />
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
    marginBottom: 24,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroText: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    fontSize: 13,
    marginTop: 4,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakInfo: {
    flex: 1,
    marginLeft: 16,
  },
  streakValue: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  streakLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  streakText: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  topTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  topTaskBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  topTaskRank: {
    width: 32,
  },
  rankText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  topTaskName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  topTaskCount: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});

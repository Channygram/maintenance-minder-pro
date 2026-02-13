import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { format, subDays, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { formatCurrency } from '../../utils/helpers';

export const StatsScreen: React.FC = () => {
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    // Tasks completed in last 30 days
    const recentLogs = state.logs.filter(log => {
      const logDate = parseISO(log.completedAt);
      return isWithinInterval(logDate, { start: thirtyDaysAgo, end: now });
    });

    // Previous 30 days for comparison
    const previousLogs = state.logs.filter(log => {
      const logDate = parseISO(log.completedAt);
      return isWithinInterval(logDate, { start: sixtyDaysAgo, end: thirtyDaysAgo });
    });

    // Total spending
    const totalSpending = state.logs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const recentSpending = recentLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const previousSpending = previousLogs.reduce((sum, log) => sum + (log.cost || 0), 0);

    // Spending change
    const spendingChange = previousSpending > 0 
      ? ((recentSpending - previousSpending) / previousSpending) * 100 
      : 0;

    // Completion rate
    const activeTasks = state.tasks.filter(t => t.isActive);
    const overdueTasks = activeTasks.filter(t => new Date(t.nextDue) < now);
    const upcomingTasks = activeTasks.filter(t => {
      const dueDate = parseISO(t.nextDue);
      return isWithinInterval(dueDate, { start: now, end: subDays(now, -7) });
    });

    // Items by type
    const itemsByType = state.items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average cost per task type
    const costByItem = state.logs.reduce((acc, log) => {
      const item = state.items.find(i => i.id === log.itemId);
      if (item) {
        const key = item.name;
        if (!acc[key]) acc[key] = { total: 0, count: 0 };
        acc[key].total += log.cost || 0;
        acc[key].count += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const topSpendingItems = Object.entries(costByItem)
      .map(([name, data]) => ({ name, avg: data.count > 0 ? data.total / data.count : 0, total: data.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalItems: state.items.length,
      totalTasks: activeTasks.length,
      overdueTasks: overdueTasks.length,
      upcomingTasks: upcomingTasks.length,
      completedThisMonth: recentLogs.length,
      totalSpending,
      recentSpending,
      spendingChange,
      itemsByType,
      topSpendingItems,
    };
  }, [state.items, state.tasks, state.logs]);

  const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    car: 'car',
    home: 'home',
    appliance: 'flash',
    other: 'ellipse',
  };

  const typeLabels: Record<string, string> = {
    car: 'Vehicles',
    home: 'Properties',
    appliance: 'Appliances',
    other: 'Other',
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Statistics</Text>

        {/* Overview Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="cube" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="checkmark-done" size={24} color={colors.secondary} />
            <Text style={styles.statValue}>{stats.completedThisMonth}</Text>
            <Text style={styles.statLabel}>Completed (30d)</Text>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="alert-circle" size={24} color={colors.danger} />
            <Text style={[styles.statValue, { color: colors.danger }]}>{stats.overdueTasks}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="time" size={24} color={colors.warning} />
            <Text style={[styles.statValue, { color: colors.warning }]}>{stats.upcomingTasks}</Text>
            <Text style={styles.statLabel}>Due This Week</Text>
          </Card>
        </View>

        {/* Spending */}
        <Text style={styles.sectionTitle}>💰 Spending</Text>
        <Card>
          <View style={styles.spendingRow}>
            <View>
              <Text style={styles.spendingLabel}>Last 30 Days</Text>
              <Text style={styles.spendingValue}>{formatCurrency(stats.recentSpending)}</Text>
            </View>
            <View style={[
              styles.changeBadge,
              { backgroundColor: stats.spendingChange > 0 ? colors.danger + '20' : colors.secondary + '20' }
            ]}>
              <Ionicons 
                name={stats.spendingChange > 0 ? 'trending-up' : 'trending-down'} 
                size={16} 
                color={stats.spendingChange > 0 ? colors.danger : colors.secondary} 
              />
              <Text style={[
                styles.changeText,
                { color: stats.spendingChange > 0 ? colors.danger : colors.secondary }
              ]}>
                {Math.abs(stats.spendingChange).toFixed(0)}%
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.spendingRow}>
            <Text style={styles.spendingLabel}>All Time Total</Text>
            <Text style={styles.spendingValueLarge}>{formatCurrency(stats.totalSpending)}</Text>
          </View>
        </Card>

        {/* Items by Type */}
        <Text style={styles.sectionTitle}>📦 Items by Type</Text>
        <Card>
          {Object.entries(stats.itemsByType).length === 0 ? (
            <Text style={styles.emptyText}>No items tracked yet</Text>
          ) : (
            Object.entries(stats.itemsByType).map(([type, count], index) => (
              <View key={type} style={[styles.typeRow, index > 0 && styles.typeRowBorder]}>
                <View style={styles.typeInfo}>
                  <Ionicons name={typeIcons[type] || 'ellipse'} size={20} color={colors.primary} />
                  <Text style={styles.typeLabel}>{typeLabels[type] || type}</Text>
                </View>
                <Text style={styles.typeCount}>{count}</Text>
              </View>
            ))
          )}
        </Card>

        {/* Top Spending Items */}
        {stats.topSpendingItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🏆 Top Spending Items</Text>
            <Card>
              {stats.topSpendingItems.map((item, index) => (
                <View key={item.name} style={[styles.topItemRow, index > 0 && styles.typeRowBorder]}>
                  <View style={styles.topItemInfo}>
                    <Text style={styles.topItemRank}>#{index + 1}</Text>
                    <Text style={styles.topItemName}>{item.name}</Text>
                  </View>
                  <Text style={styles.topItemCost}>{formatCurrency(item.total)}</Text>
                </View>
              ))}
            </Card>
          </>
        )}
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
    marginTop: 24,
    marginBottom: 12,
  },
  spendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spendingLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  spendingValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '600',
    marginTop: 4,
  },
  spendingValueLarge: {
    color: colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  typeRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  typeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeLabel: {
    color: colors.text,
    fontSize: 16,
  },
  typeCount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  topItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  topItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topItemRank: {
    color: colors.textMuted,
    fontSize: 14,
    width: 24,
  },
  topItemName: {
    color: colors.text,
    fontSize: 16,
  },
  topItemCost: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});

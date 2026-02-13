// Analytics and reporting utilities

import { Item, MaintenanceTask, MaintenanceLog } from '../context/types';
import { parseISO, differenceInDays, differenceInMonths, startOfMonth, endOfMonth, isWithinInterval, subDays } from 'date-fns';

export interface AnalyticsData {
  overview: {
    totalItems: number;
    totalTasks: number;
    activeTasks: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
  spending: {
    total: number;
    averagePerTask: number;
    byMonth: { month: string; amount: number }[];
    byCategory: { category: string; amount: number }[];
  };
  tasks: {
    completedThisMonth: number;
    completedLastMonth: number;
    averageCompletionTime: number;
    mostCommonTasks: { name: string; count: number }[];
  };
  items: {
    byType: { type: string; count: number }[];
    mostMaintained: { name: string; taskCount: number }[];
  };
}

export const generateAnalytics = (
  items: Item[],
  tasks: MaintenanceTask[],
  logs: MaintenanceLog[]
): AnalyticsData => {
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = subDays(thisMonthStart, 1);
  const lastMonthEnd = endOfMonth(subDays(thisMonthStart, 1));

  // Overview
  const activeTasks = tasks.filter(t => t.isActive);
  const overdueTasks = activeTasks.filter(t => new Date(t.nextDue) < now);
  const completedTasks = logs.length;
  const completionRate = tasks.length > 0 ? (completedTasks / (completedTasks + activeTasks.length)) * 100 : 0;

  // Spending
  const totalSpending = logs.reduce((sum, log) => sum + (log.cost || 0), 0);
  const averagePerTask = completedTasks > 0 ? totalSpending / completedTasks : 0;

  // By month (last 6 months)
  const byMonth: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = subDays(startOfMonth(now), i * 30);
    const monthEnd = addDays(endOfMonth(monthStart), 1);
    const monthLogs = logs.filter(log => {
      const logDate = parseISO(log.completedAt);
      return isWithinInterval(logDate, { start: monthStart, end: monthEnd });
    });
    byMonth.push({
      month: format(monthStart, 'MMM'),
      amount: monthLogs.reduce((sum, log) => sum + (log.cost || 0), 0),
    });
  }

  // By category (item type)
  const byCategory: { category: string; amount: number }[] = [];
  const categoryMap = new Map<string, number>();
  logs.forEach(log => {
    const item = items.find(i => i.id === log.itemId);
    if (item && log.cost) {
      const current = categoryMap.get(item.type) || 0;
      categoryMap.set(item.type, current + log.cost);
    }
  });
  categoryMap.forEach((amount, type) => {
    byCategory.push({ category: type, amount });
  });

  // Tasks
  const thisMonthLogs = logs.filter(log => {
    const logDate = parseISO(log.completedAt);
    return isWithinInterval(logDate, { start: thisMonthStart, end: now });
  });
  const lastMonthLogs = logs.filter(log => {
    const logDate = parseISO(log.completedAt);
    return isWithinInterval(logDate, { start: lastMonthStart, end: lastMonthEnd });
  });

  // Most common tasks
  const taskCountMap = new Map<string, number>();
  logs.forEach(log => {
    const task = tasks.find(t => t.id === log.taskId);
    if (task) {
      const current = taskCountMap.get(task.name) || 0;
      taskCountMap.set(task.name, current + 1);
    }
  });
  const mostCommonTasks = Array.from(taskCountMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Items by type
  const byType = items.reduce((acc, item) => {
    const existing = acc.find(i => i.type === item.type);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ type: item.type, count: 1 });
    }
    return acc;
  }, [] as { type: string; count: number }[]);

  // Most maintained items
  const itemTaskCount = new Map<string, number>();
  logs.forEach(log => {
    const current = itemTaskCount.get(log.itemId) || 0;
    itemTaskCount.set(log.itemId, current + 1);
  });
  const mostMaintained = Array.from(itemTaskCount.entries())
    .map(([itemId, taskCount]) => ({
      name: items.find(i => i.id === itemId)?.name || 'Unknown',
      taskCount,
    }))
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 5);

  return {
    overview: {
      totalItems: items.length,
      totalTasks: tasks.length,
      activeTasks: activeTasks.length,
      completedTasks,
      overdueTasks: overdueTasks.length,
      completionRate,
    },
    spending: {
      total: totalSpending,
      averagePerTask,
      byMonth,
      byCategory,
    },
    tasks: {
      completedThisMonth: thisMonthLogs.length,
      completedLastMonth: lastMonthLogs.length,
      averageCompletionTime: 0, // Would need task creation dates to calculate
      mostCommonTasks,
    },
    items: {
      byType,
      mostMaintained,
    },
  };
};

// Helper function
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function format(date: Date, formatStr: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (formatStr === 'MMM') {
    return months[date.getMonth()];
  }
  return date.toISOString();
}

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Item, MaintenanceTask } from '../context/types';
import { colors } from '../theme/colors';
import { ITEM_ICONS } from '../utils/constants';
import { formatDate, isOverdue, isDueSoon, getDaysUntilDue } from '../utils/dates';

interface ItemCardProps {
  item: Item;
  tasks: MaintenanceTask[];
  onPress: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, tasks, onPress }) => {
  const itemTasks = tasks.filter((t) => t.itemId === item.id && t.isActive);
  const nextTask = itemTasks
    .sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())[0];

  const getStatusColor = () => {
    if (!nextTask) return colors.textMuted;
    if (isOverdue(nextTask.nextDue)) return colors.danger;
    if (isDueSoon(nextTask.nextDue)) return colors.warning;
    return colors.secondary;
  };

  const getStatusText = () => {
    if (!nextTask) return 'No tasks';
    const days = getDaysUntilDue(nextTask.nextDue);
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  const iconName = ITEM_ICONS[item.type] || 'ellipse';

  return (
    <Card onPress={onPress} variant="elevated">
      <View style={styles.row}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={iconName as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>{item.brand ? `${item.brand} ${item.model || ''}` : item.type}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
        </View>
      </View>
      {nextTask && (
        <View style={styles.taskPreview}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.taskText}>{nextTask.name}</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  type: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  taskPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 6,
  },
  taskText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});

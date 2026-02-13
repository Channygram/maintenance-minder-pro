import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { MaintenanceTask, Item } from '../context/types';
import { colors } from '../theme/colors';
import { PRIORITY_COLORS } from '../utils/constants';
import { formatDate, isOverdue, getDaysUntilDue } from '../utils/dates';
import { addDays } from 'date-fns';

interface TaskCardProps {
  task: MaintenanceTask;
  item?: Item;
  onPress: () => void;
  onComplete?: () => void;
  onDefer?: (days: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, item, onPress, onComplete, onDefer }) => {
  const isTaskOverdue = isOverdue(task.nextDue);
  const daysUntil = getDaysUntilDue(task.nextDue);
  const priorityColor = PRIORITY_COLORS[task.priority];
  const [showActions, setShowActions] = useState(false);

  const getDueText = () => {
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `Due in ${daysUntil} days`;
  };

  const handleLongPress = () => {
    if (!onDefer) return;
    
    Alert.alert(
      'Defer Task',
      `Push "${task.name}" to a later date?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '1 day', onPress: () => onDefer(1) },
        { text: '3 days', onPress: () => onDefer(3) },
        { text: '1 week', onPress: () => onDefer(7) },
        { text: '2 weeks', onPress: () => onDefer(14) },
      ]
    );
  };

  return (
    <Card onPress={onPress} onLongPress={handleLongPress}>
      <View style={styles.row}>
        <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />
        <View style={styles.content}>
          <Text style={styles.name}>{task.name}</Text>
          {item && <Text style={styles.itemName}>{item.name}</Text>}
          <View style={styles.dueDateRow}>
            <Ionicons
              name={isTaskOverdue ? 'alert-circle' : 'calendar-outline'}
              size={14}
              color={isTaskOverdue ? colors.danger : colors.textMuted}
            />
            <Text style={[styles.dueText, isTaskOverdue && styles.overdueText]}>
              {getDueText()}
            </Text>
          </View>
        </View>
        {onComplete && (
          <TouchableOpacity onPress={onComplete} style={styles.completeButton}>
            <Ionicons name="checkmark-circle-outline" size={28} color={colors.secondary} />
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityBar: {
    width: 4,
    height: '100%',
    minHeight: 50,
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  itemName: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  dueText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  overdueText: {
    color: colors.danger,
    fontWeight: '500',
  },
  completeButton: {
    padding: 8,
  },
});

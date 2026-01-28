import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, Header, Card } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { PRIORITY_LEVELS, PRIORITY_COLORS, INTERVAL_PRESETS, REMINDER_OPTIONS } from '../../utils/constants';
import { generateId } from '../../utils/helpers';
import { addDays } from 'date-fns';
import { MaintenanceTask } from '../../context/types';

export const AddEditTaskScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { state, addTask, updateTask, deleteTask } = useApp();
  
  const taskId = route.params?.taskId;
  const itemId = route.params?.itemId;
  const isEditing = !!taskId;

  const existingTask = isEditing ? state.tasks.find((t) => t.id === taskId) : undefined;
  const targetItemId = itemId || existingTask?.itemId;

  const [name, setName] = useState(existingTask?.name || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [intervalDays, setIntervalDays] = useState(existingTask?.intervalDays || 90);
  const [priority, setPriority] = useState<MaintenanceTask['priority']>(existingTask?.priority || 'medium');
  const [reminderDays, setReminderDays] = useState(existingTask?.reminderDaysBefore || 3);
  const [estimatedCost, setEstimatedCost] = useState(existingTask?.estimatedCost?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    if (!targetItemId) {
      Alert.alert('Error', 'No item selected');
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const task: MaintenanceTask = {
        id: isEditing ? taskId : generateId(),
        itemId: targetItemId,
        name: name.trim(),
        description: description.trim() || undefined,
        intervalDays,
        nextDue: existingTask?.nextDue || addDays(now, intervalDays).toISOString(),
        reminderDaysBefore: reminderDays,
        priority,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        isActive: existingTask?.isActive ?? true,
        lastCompleted: existingTask?.lastCompleted,
      };

      if (isEditing) {
        await updateTask(task);
      } else {
        await addTask(task);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(taskId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={commonStyles.container}>
      <Header
        title={isEditing ? 'Edit Task' : 'Add Task'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={commonStyles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
        <Input
          label="Task Name *"
          value={name}
          onChangeText={setName}
          placeholder="e.g., Oil Change, Filter Replacement"
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Additional details..."
          multiline
          numberOfLines={2}
          style={{ minHeight: 60, textAlignVertical: 'top' }}
        />

        {/* Interval Selection */}
        <Text style={styles.label}>Repeat Interval</Text>
        <View style={styles.chipGrid}>
          {INTERVAL_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.label}
              style={[styles.chip, intervalDays === preset.days && styles.chipActive]}
              onPress={() => setIntervalDays(preset.days)}
            >
              <Text style={[styles.chipText, intervalDays === preset.days && styles.chipTextActive]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Priority Selection */}
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityGrid}>
          {PRIORITY_LEVELS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityChip,
                { borderColor: PRIORITY_COLORS[p] },
                priority === p && { backgroundColor: PRIORITY_COLORS[p] },
              ]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reminder Selection */}
        <Text style={styles.label}>Remind Me</Text>
        <View style={styles.chipGrid}>
          {REMINDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, reminderDays === option.value && styles.chipActive]}
              onPress={() => setReminderDays(option.value)}
            >
              <Text style={[styles.chipText, reminderDays === option.value && styles.chipTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Estimated Cost ($)"
          value={estimatedCost}
          onChangeText={setEstimatedCost}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <Button
          title={isEditing ? 'Save Changes' : 'Add Task'}
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: 24 }}
        />

        {isEditing && (
          <Button
            title="Delete Task"
            onPress={handleDelete}
            variant="danger"
            style={{ marginTop: 12 }}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  priorityText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  priorityTextActive: {
    color: colors.white,
  },
});

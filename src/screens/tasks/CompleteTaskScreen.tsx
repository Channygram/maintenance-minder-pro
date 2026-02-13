import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, Header, Card } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { generateId } from '../../utils/helpers';
import { addDays, parseISO } from 'date-fns';
import { MaintenanceLog } from '../../context/types';

export const CompleteTaskScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { state, updateTask, addLog } = useApp();
  const { taskId } = route.params;

  const task = state.tasks.find((t) => t.id === taskId);
  const item = task ? state.items.find((i) => i.id === task.itemId) : undefined;

  const [cost, setCost] = useState('');
  const [provider, setProvider] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!task || !item) {
    return (
      <View style={commonStyles.container}>
        <Header title="Task Not Found" showBack onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const handleComplete = async () => {
    // Validate cost if provided
    if (cost && isNaN(parseFloat(cost))) {
      Alert.alert('Invalid Cost', 'Please enter a valid number for the cost');
      return;
    }

    const costValue = cost ? parseFloat(cost) : 0;
    if (costValue < 0) {
      Alert.alert('Invalid Cost', 'Cost cannot be negative');
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      
      // Create log entry
      const log: MaintenanceLog = {
        id: generateId(),
        taskId: task.id,
        itemId: task.itemId,
        completedAt: now.toISOString(),
        cost: costValue > 0 ? costValue : undefined,
        provider: provider.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      await addLog(log);

      // Determine next due date
      let nextDueDate: Date;
      if (task.intervalDays > 0) {
        nextDueDate = addDays(now, task.intervalDays);
      } else {
        // One-time task - keep the same due date or mark inactive
        nextDueDate = parseISO(task.nextDue);
      }

      // Update task with new due date
      const updatedTask = {
        ...task,
        lastCompleted: now.toISOString(),
        nextDue: nextDueDate.toISOString(),
      };

      await updateTask(updatedTask);

      // Show success with details
      const costText = costValue > 0 ? `$${costValue.toFixed(2)}` : 'free';
      Alert.alert(
        '✅ Task Completed!', 
        `${task.name} marked as complete.\n\nCost: ${costText}${provider.trim() ? `\nProvider: ${provider.trim()}` : ''}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Complete task error:', error);
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <Header title="Complete Task" showBack onBack={() => navigation.goBack()} />

      <ScrollView style={commonStyles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Task Info */}
        <Card variant="elevated">
          <View style={styles.taskHeader}>
            <Ionicons name="checkmark-circle" size={48} color={colors.secondary} />
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>{task.name}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Log Details (Optional)</Text>

        <Input
          label="Cost ($)"
          value={cost}
          onChangeText={setCost}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />

        <Input
          label="Service Provider"
          value={provider}
          onChangeText={setProvider}
          placeholder="e.g., Jiffy Lube, DIY"
        />

        <Input
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any notes about this service..."
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        {task.intervalDays > 0 && (
          <Card style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              This task will be rescheduled for {task.intervalDays} days from now
            </Text>
          </Card>
        )}

        <Button
          title="Mark as Complete"
          onPress={handleComplete}
          loading={loading}
          style={{ marginTop: 24 }}
          icon={<Ionicons name="checkmark" size={20} color={colors.white} />}
        />

        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  taskInfo: {
    flex: 1,
  },
  taskName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemName: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primary + '20',
  },
  infoText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
});

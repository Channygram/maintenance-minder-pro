import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, TaskCard, Button, Header } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { ITEM_ICONS } from '../../utils/constants';
import { formatDate, isOverdue } from '../../utils/dates';

export const ItemDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { state, deleteItem } = useApp();
  const { itemId } = route.params;

  const item = state.items.find((i) => i.id === itemId);
  const itemTasks = state.tasks.filter((t) => t.itemId === itemId);
  const itemLogs = state.logs.filter((l) => l.itemId === itemId);

  if (!item) {
    return (
      <View style={commonStyles.container}>
        <Header title="Item Not Found" showBack onBack={() => navigation.goBack()} />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"? This will also delete all associated tasks.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteItem(item.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleCompleteTask = (taskId: string) => {
    navigation.navigate('CompleteTask', { taskId });
  };

  const iconName = ITEM_ICONS[item.type] || 'ellipse';
  const warrantyExpired = item.warrantyExpiry && new Date(item.warrantyExpiry) < new Date();

  return (
    <View style={commonStyles.container}>
      <Header
        title={item.name}
        showBack
        onBack={() => navigation.goBack()}
        rightAction={{
          icon: 'create-outline',
          onPress: () => navigation.navigate('EditItem', { itemId: item.id }),
        }}
      />

      <ScrollView style={commonStyles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Item Info Card */}
        <Card variant="elevated">
          <View style={styles.itemHeader}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name={iconName as any} size={32} color={colors.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              {item.brand && (
                <Text style={styles.itemBrand}>
                  {item.brand} {item.model}
                </Text>
              )}
              <Text style={styles.itemType}>{item.type}</Text>
            </View>
          </View>

          {item.warrantyExpiry && (
            <View style={[styles.warrantyBadge, { backgroundColor: warrantyExpired ? colors.danger + '20' : colors.secondary + '20' }]}>
              <Ionicons
                name={warrantyExpired ? 'alert-circle' : 'shield-checkmark'}
                size={16}
                color={warrantyExpired ? colors.danger : colors.secondary}
              />
              <Text style={[styles.warrantyText, { color: warrantyExpired ? colors.danger : colors.secondary }]}>
                Warranty {warrantyExpired ? 'expired' : 'until'} {formatDate(item.warrantyExpiry)}
              </Text>
            </View>
          )}

          {item.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{item.notes}</Text>
            </View>
          )}
        </Card>

        {/* Tasks Section */}
        <View style={commonStyles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Maintenance Tasks</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddTask', { itemId: item.id })}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {itemTasks.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No maintenance tasks yet</Text>
              <Button
                title="Add Task"
                onPress={() => navigation.navigate('AddTask', { itemId: item.id })}
                variant="outline"
                size="small"
                style={{ marginTop: 12 }}
              />
            </Card>
          ) : (
            itemTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => navigation.navigate('EditTask', { taskId: task.id })}
                onComplete={() => handleCompleteTask(task.id)}
              />
            ))
          )}
        </View>

        {/* Service History */}
        {itemLogs.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={styles.sectionTitle}>Service History</Text>
            {itemLogs.slice(0, 5).map((log) => {
              const task = state.tasks.find((t) => t.id === log.taskId);
              return (
                <Card key={log.id}>
                  <View style={styles.logRow}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.secondary} />
                    <View style={styles.logContent}>
                      <Text style={styles.logTitle}>{task?.name || 'Task'}</Text>
                      <Text style={styles.logDate}>{formatDate(log.completedAt)}</Text>
                    </View>
                    {log.cost && <Text style={styles.logCost}>${log.cost}</Text>}
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* Delete Button */}
        <Button
          title="Delete Item"
          onPress={handleDelete}
          variant="danger"
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemBrand: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  itemType: {
    color: colors.primary,
    fontSize: 12,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  warrantyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warrantyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  notesText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logContent: {
    flex: 1,
  },
  logTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  logDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
  logCost: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

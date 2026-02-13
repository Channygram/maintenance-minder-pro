import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, TaskCard, EmptyState } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isOverdue, isDueSoon } from '../../utils/dates';

type FilterType = 'all' | 'overdue' | 'dueSoon' | 'completed';
type SortType = 'date' | 'priority' | 'name';

export const TasksScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date');

  const filteredTasks = useMemo(() => {
    let tasks = state.tasks.filter(t => t.isActive);

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(t => {
        const item = state.items.find(i => i.id === t.itemId);
        return (
          t.name.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          item?.name.toLowerCase().includes(query)
        );
      });
    }

    // Filter
    switch (filter) {
      case 'overdue':
        tasks = tasks.filter(t => isOverdue(t.nextDue));
        break;
      case 'dueSoon':
        tasks = tasks.filter(t => isDueSoon(t.nextDue) && !isOverdue(t.nextDue));
        break;
    }

    // Sort
    tasks.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return tasks;
  }, [state.tasks, state.items, searchQuery, filter, sortBy]);

  const getItemForTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    return task ? state.items.find(i => i.id === task.itemId) : undefined;
  };

  const handleTaskPress = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      navigation.navigate('ItemDetail', { itemId: task.itemId });
    }
  };

  const handleCompleteTask = (taskId: string) => {
    navigation.navigate('CompleteTask', { taskId });
  };

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: state.tasks.filter(t => t.isActive).length },
    { value: 'overdue', label: 'Overdue', count: state.tasks.filter(t => t.isActive && isOverdue(t.nextDue)).length },
    { value: 'dueSoon', label: 'Due Soon', count: state.tasks.filter(t => t.isActive && isDueSoon(t.nextDue) && !isOverdue(t.nextDue)).length },
  ];

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Tasks</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textDark}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textMuted}
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                filter === option.value && styles.filterChipActive,
                option.value === 'overdue' && filter === 'overdue' && styles.filterChipOverdue,
              ]}
              onPress={() => setFilter(option.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === option.value && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
              <View
                style={[
                  styles.filterBadge,
                  filter === option.value && styles.filterBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    filter === option.value && styles.filterBadgeTextActive,
                  ]}
                >
                  {option.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          {(['date', 'priority', 'name'] as SortType[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortOption, sortBy === option && styles.sortOptionActive]}
              onPress={() => setSortBy(option)}
            >
              <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}>
                {option === 'date' ? 'Date' : option === 'priority' ? 'Priority' : 'Name'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon="clipboard-outline"
            title={searchQuery ? 'No results found' : 'No tasks'}
            message={searchQuery ? `No tasks match "${searchQuery}"` : 'Add an item to get started with maintenance tasks'}
          />
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              item={getItemForTask(task.id)}
              onPress={() => handleTaskPress(task.id)}
              onComplete={() => handleCompleteTask(task.id)}
            />
          ))
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipOverdue: {
    backgroundColor: colors.danger,
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  filterBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: colors.white + '30',
  },
  filterBadgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterBadgeTextActive: {
    color: colors.white,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginRight: 12,
  },
  sortOption: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  sortOptionActive: {
    backgroundColor: colors.primary + '20',
  },
  sortOptionText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
});

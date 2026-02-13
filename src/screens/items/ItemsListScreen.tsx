import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ItemCard, FAB, EmptyState } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SortOption = 'name' | 'type' | 'date' | 'priority';

export const ItemsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showSortOptions, setShowSortOptions] = useState(false);

  const filteredItems = state.items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'date':
        return (new Date(b.createdAt).getTime()) - (new Date(a.createdAt).getTime());
      case 'priority':
        // Sort by most overdue tasks
        const aTasks = state.tasks.filter(t => t.itemId === a.id && t.isActive);
        const bTasks = state.tasks.filter(t => t.itemId === b.id && t.isActive);
        const aOverdue = aTasks.filter(t => new Date(t.nextDue) < new Date()).length;
        const bOverdue = bTasks.filter(t => new Date(t.nextDue) < new Date()).length;
        return bOverdue - aOverdue;
      default:
        return 0;
    }
  });

  const groupedItems = sortedItems.reduce((acc, item) => {
    const type = item.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, typeof sortedItems>);

  const typeLabels: Record<string, string> = {
    car: '🚗 Vehicles',
    home: '🏠 Home',
    appliance: '🔌 Appliances',
    other: '📦 Other',
  };

  if (state.items.length === 0) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top }]}>
        <EmptyState
          icon="cube-outline"
          title="No items yet"
          message="Add your first item to start tracking maintenance schedules"
          actionLabel="Add Item"
          onAction={() => navigation.navigate('AddItem')}
        />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>My Items</Text>

        {/* Search and Sort Row */}
        <View style={styles.searchSortRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
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
          <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortOptions(!showSortOptions)}>
            <Ionicons name="swap-vertical" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Sort Options */}
        {showSortOptions && (
          <View style={styles.sortOptions}>
            {(['name', 'type', 'date', 'priority'] as SortOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.sortOption, sortBy === option && styles.sortOptionActive]}
                onPress={() => {
                  setSortBy(option);
                  setShowSortOptions(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}>
                  {option === 'name' ? 'Name' : option === 'type' ? 'Type' : option === 'date' ? 'Recently Added' : 'Priority'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
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

        {/* Grouped Items */}
        {Object.entries(groupedItems).map(([type, items]) => (
          <View key={type} style={commonStyles.section}>
            <Text style={styles.sectionTitle}>{typeLabels[type] || type}</Text>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                tasks={state.tasks}
                onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
              />
            ))}
          </View>
        ))}

        {filteredItems.length === 0 && searchQuery.length > 0 && (
          <EmptyState
            icon="search-outline"
            title="No results"
            message={`No items found for "${searchQuery}"`}
          />
        )}
      </ScrollView>

      <FAB icon="add" onPress={() => navigation.navigate('AddItem')} />
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
  searchSortRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
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
  sortButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  sortOption: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sortOptionActive: {
    backgroundColor: colors.primary,
  },
  sortOptionText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  sortOptionTextActive: {
    color: colors.white,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});

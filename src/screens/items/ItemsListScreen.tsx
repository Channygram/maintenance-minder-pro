import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ItemCard, FAB, EmptyState } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ItemsListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = state.items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedItems = filteredItems.reduce((acc, item) => {
    const type = item.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

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
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});

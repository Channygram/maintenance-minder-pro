import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateId, toISOString } from '../../utils/helpers';
import { getTemplatesForType, createTasksFromTemplates } from '../../services/templates';
import { Item } from '../../context/types';

interface QuickAddItem {
  name: string;
  type: 'car' | 'home' | 'appliance';
  icon: keyof typeof Ionicons.glyphMap;
  examples: string[];
}

const QUICK_ADD_ITEMS: QuickAddItem[] = [
  {
    name: 'Car',
    type: 'car',
    icon: 'car',
    examples: ['Honda Accord', 'Toyota Camry', 'Ford F-150'],
  },
  {
    name: 'Home',
    type: 'home',
    icon: 'home',
    examples: ['Main House', 'Lake Cabin', 'Apartment'],
  },
  {
    name: 'Refrigerator',
    type: 'appliance',
    icon: 'snow',
    examples: ['Samsung Fridge', 'Kitchen Fridge'],
  },
  {
    name: 'HVAC',
    type: 'appliance',
    icon: 'thermometer',
    examples: ['Central AC', 'Furnace', 'Heat Pump'],
  },
  {
    name: 'Water Heater',
    type: 'appliance',
    icon: 'water',
    examples: ['Gas Heater', 'Electric Heater', 'Tankless'],
  },
  {
    name: 'Washing Machine',
    type: 'appliance',
    icon: 'shirt',
    examples: ['LG Washer', 'Samsung Washer'],
  },
  {
    name: 'Dishwasher',
    type: 'appliance',
    icon: 'restaurant',
    examples: ['Bosch Dishwasher', 'Kitchen Dishwasher'],
  },
  {
    name: 'Garage Door',
    type: 'appliance',
    icon: 'car-sport',
    examples: ['Main Garage', 'Secondary Garage'],
  },
];

export const QuickAddScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { addItem, addTask, state } = useApp();
  const insets = useSafeAreaInsets();

  const handleQuickAdd = async (quickItem: QuickAddItem) => {
    const now = toISOString();
    const item: Item = {
      id: generateId(),
      name: quickItem.examples[0],
      type: quickItem.type,
      createdAt: now,
      updatedAt: now,
    };

    await addItem(item);

    // Add template tasks
    const templates = getTemplatesForType(quickItem.type);
    const tasks = createTasksFromTemplates(item.id, templates, state.settings.defaultReminderDays);
    for (const task of tasks) {
      await addTask(task);
    }

    // Navigate to edit the item name
    navigation.navigate('EditItem', { itemId: item.id });
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Quick Add</Text>
        <Text style={styles.subtitle}>
          Tap an item type to add it with recommended maintenance tasks
        </Text>

        <View style={styles.grid}>
          {QUICK_ADD_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.card}
              onPress={() => handleQuickAdd(item)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={32} color={colors.primary} />
              </View>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardExample}>{item.examples[0]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            We'll automatically add recommended maintenance tasks based on what you select.
            You can edit or remove tasks after adding.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardExample: {
    color: colors.textMuted,
    fontSize: 13,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 24,
    backgroundColor: colors.primary + '10',
  },
  infoText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});

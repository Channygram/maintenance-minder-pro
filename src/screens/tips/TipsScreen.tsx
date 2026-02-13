import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';

interface Tip {
  id: string;
  category: 'car' | 'home' | 'appliance' | 'general';
  title: string;
  content: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TIPS: Tip[] = [
  // Car Tips
  {
    id: '1',
    category: 'car',
    title: 'Check Tire Pressure Monthly',
    content: 'Proper tire inflation improves fuel economy by up to 3%. Check when tires are cold for accurate readings.',
    icon: 'car-sport',
  },
  {
    id: '2',
    category: 'car',
    title: 'Change Oil Every 5,000 Miles',
    content: 'Regular oil changes extend engine life. Modern synthetic oils can last longer, but check your manual.',
    icon: 'water',
  },
  {
    id: '3',
    category: 'car',
    title: 'Inspect Brakes Regularly',
    content: 'Listen for squeaking and check brake pad thickness. Replace pads before they damage rotors.',
    icon: 'alert-circle',
  },
  {
    id: '4',
    category: 'car',
    title: 'Keep Battery Terminals Clean',
    content: 'Corroded terminals can cause starting problems. Clean with baking soda and water twice a year.',
    icon: 'battery-full',
  },
  
  // Home Tips
  {
    id: '5',
    category: 'home',
    title: 'Replace HVAC Filters quarterly',
    content: 'Dirty filters reduce efficiency and air quality. Mark your calendar when you replace them.',
    icon: 'leaf',
  },
  {
    id: '6',
    category: 'home',
    title: 'Test Smoke Detectors Monthly',
    content: 'Press the test button to ensure alarms work. Replace batteries twice a year when you change clocks.',
    icon: 'notifications',
  },
  {
    id: '7',
    category: 'home',
    title: 'Clean Gutters Twice Year',
    content: 'Clogged gutters cause water damage. Clean in spring and fall, or more often if you have many trees.',
    icon: 'rainy',
  },
  {
    id: '8',
    category: 'home',
    title: 'Flush Water Heater Annually',
    content: 'Drain sediment to maintain efficiency. This extends the heater\'s life and improves hot water quality.',
    icon: 'flame',
  },
  
  // Appliance Tips
  {
    id: '9',
    category: 'appliance',
    title: 'Clean Refrigerator Coils',
    content: 'Dusty coils make fridges work harder. Vacuum behind the fridge once or twice a year.',
    icon: 'snow',
  },
  {
    id: '10',
    category: 'appliance',
    title: 'Clean Dishwasher Monthly',
    content: 'Run empty with vinegar or a dishwasher cleaner. Check and clean the filter regularly.',
    icon: 'restaurant',
  },
  {
    id: '11',
    category: 'appliance',
    title: 'Descale Your Coffee Maker',
    content: 'Mineral buildup affects taste and function. Run equal parts water and vinegar through monthly.',
    icon: 'cafe',
  },
  {
    id: '12',
    category: 'appliance',
    title: 'Clean Dryer Vent Annually',
    content: 'Clogged vents are a fire hazard. Disconnect and clean the entire vent hose yearly.',
    icon: 'flash',
  },
  
  // General Tips
  {
    id: '13',
    category: 'general',
    title: 'Create a Maintenance Calendar',
    content: 'Schedule reminders for all your maintenance tasks. Consistency prevents bigger problems.',
    icon: 'calendar',
  },
  {
    id: '14',
    category: 'general',
    title: 'Keep Maintenance Records',
    content: 'Document all repairs and services. This increases resale value and helps diagnose recurring issues.',
    icon: 'document-text',
  },
  {
    id: '15',
    category: 'general',
    title: 'Address Problems Early',
    content: 'Small issues become expensive problems. Fix leaks, squeaks, and warnings promptly.',
    icon: 'build',
  },
];

const CATEGORIES = [
  { value: 'all', label: 'All', icon: 'apps' as const },
  { value: 'car', label: 'Car', icon: 'car' as const },
  { value: 'home', label: 'Home', icon: 'home' as const },
  { value: 'appliance', label: 'Appliance', icon: 'flash' as const },
  { value: 'general', label: 'General', icon: 'bulb' as const },
];

export const TipsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTips = selectedCategory === 'all' 
    ? TIPS 
    : TIPS.filter(tip => tip.category === selectedCategory);

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Maintenance Tips</Text>
        <Text style={styles.subtitle}>Expert advice to keep your stuff running smoothly</Text>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryScroll}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryChip,
                selectedCategory === cat.value && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Ionicons 
                name={cat.icon} 
                size={16} 
                color={selectedCategory === cat.value ? colors.white : colors.textMuted} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === cat.value && styles.categoryTextActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tips List */}
        {filteredTips.map(tip => (
          <Card key={tip.id}>
            <View style={styles.tipRow}>
              <View style={styles.tipIconContainer}>
                <Ionicons name={tip.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.content}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 20,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: '500',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});

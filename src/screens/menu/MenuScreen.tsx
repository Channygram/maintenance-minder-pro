import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface QuickLink {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
  color: string;
}

const QUICK_LINKS: QuickLink[] = [
  { id: '1', title: 'Dashboard', subtitle: 'Overview & stats', icon: 'home', screen: 'DashboardMain', color: colors.primary },
  { id: '2', title: 'All Tasks', subtitle: 'View & manage tasks', icon: 'list', screen: 'TasksList', color: colors.secondary },
  { id: '3', title: 'Calendar', subtitle: 'Schedule view', icon: 'calendar', screen: 'Calendar', color: colors.warning },
  { id: '4', title: 'Statistics', subtitle: 'Analytics & trends', icon: 'stats-chart', screen: 'Stats', color: colors.danger },
  { id: '5', title: 'Quick Add', subtitle: 'Fast item addition', icon: 'flash', screen: 'QuickAdd', color: colors.primary },
  { id: '6', title: 'Providers', subtitle: 'Service contacts', icon: 'people', screen: 'Providers', color: colors.secondary },
  { id: '7', title: 'Warranties', subtitle: 'Track warranties', icon: 'shield-checkmark', screen: 'WarrantyTracker', color: colors.warning },
  { id: '8', title: 'History', subtitle: 'Completed tasks', icon: 'time', screen: 'History', color: colors.danger },
  { id: '9', title: 'Upcoming', subtitle: 'Due soon', icon: 'alert-circle', screen: 'Upcoming', color: colors.primary },
  { id: '10', title: 'Tips', subtitle: 'Maintenance advice', icon: 'bulb', screen: 'Tips', color: colors.secondary },
  { id: '11', title: 'Notifications', subtitle: 'Reminder center', icon: 'notifications', screen: 'NotificationsCenter', color: colors.warning },
  { id: '12', title: 'Year in Review', subtitle: 'Annual summary', icon: 'trophy', screen: 'YearInReview', color: colors.danger },
];

export const MenuScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Menu</Text>
        <Text style={styles.subtitle}>Quick access to all features</Text>

        <View style={styles.grid}>
          {QUICK_LINKS.map((link) => (
            <TouchableOpacity
              key={link.id}
              style={styles.linkCard}
              onPress={() => navigation.navigate(link.screen as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: link.color + '20' }]}>
                <Ionicons name={link.icon} size={24} color={link.color} />
              </View>
              <Text style={styles.linkTitle}>{link.title}</Text>
              <Text style={styles.linkSubtitle}>{link.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="construct" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Maintenance Minder Pro</Text>
              <Text style={styles.infoSubtitle}>Version 1.0.0</Text>
            </View>
          </View>
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
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  linkCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  linkTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  linkSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  infoCard: {
    marginTop: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  infoSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
});

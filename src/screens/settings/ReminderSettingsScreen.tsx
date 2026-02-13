import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Input, Button, Header } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { generateId, toISOString } from '../../utils/helpers';

interface ReminderTemplate {
  id: string;
  name: string;
  daysBefore: number;
  icon: keyof typeof Ionicons.glyphMap;
}

const REMINDER_TEMPLATES: ReminderTemplate[] = [
  { id: '1', name: 'Day before', daysBefore: 1, icon: 'today' },
  { id: '2', name: '3 days before', daysBefore: 3, icon: 'calendar' },
  { id: '3', name: '1 week before', daysBefore: 7, icon: 'calendar-outline' },
  { id: '4', name: '2 weeks before', daysBefore: 14, icon: 'time' },
  { id: '5', name: '1 month before', daysBefore: 30, icon: 'albums' },
];

export const ReminderSettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state, updateSettings } = useApp();
  const insets = useSafeAreaInsets();
  const [selectedReminder, setSelectedReminder] = useState(state.settings.defaultReminderDays);

  const handleSave = async () => {
    await updateSettings({
      ...state.settings,
      defaultReminderDays: selectedReminder,
    });
    Alert.alert('Saved', 'Default reminder setting updated!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={commonStyles.container}>
      <Header
        title="Reminder Settings"
        showBack
        onBack={() => navigation.goBack()}
      />
      
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.title}>Default Reminder</Text>
        <Text style={styles.subtitle}>
          New tasks will use this reminder time by default
        </Text>

        {/* Reminder Options */}
        <Card>
          {REMINDER_TEMPLATES.map((template, index) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.optionRow,
                index < REMINDER_TEMPLATES.length - 1 && styles.optionBorder
              ]}
              onPress={() => setSelectedReminder(template.daysBefore)}
            >
              <View style={styles.optionInfo}>
                <Ionicons name={template.icon} size={24} color={colors.primary} />
                <Text style={styles.optionText}>{template.name}</Text>
              </View>
              <View style={[
                styles.radioOuter,
                selectedReminder === template.daysBefore && styles.radioOuterActive
              ]}>
                {selectedReminder === template.daysBefore && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Info Box */}
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            You can also set individual reminders for each task when creating or editing it.
          </Text>
        </Card>

        {/* Save Button */}
        <Button
          title="Save Settings"
          onPress={handleSave}
          style={{ marginTop: 24, marginHorizontal: 16 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginHorizontal: 16,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 8,
    marginBottom: 24,
    marginHorizontal: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: colors.primary + '10',
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});

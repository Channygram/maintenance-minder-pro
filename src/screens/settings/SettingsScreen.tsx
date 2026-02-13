import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share, Linking, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { exportAllData, clearAllData, importAllData } from '../../services/storage';
import { APP_NAME, APP_VERSION, REMINDER_OPTIONS } from '../../utils/constants';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state, updateSettings } = useApp();
  const insets = useSafeAreaInsets();
  const [exporting, setExporting] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  const handleToggleNotifications = async () => {
    await updateSettings({
      ...state.settings,
      notificationsEnabled: !state.settings.notificationsEnabled,
    });
  };

  const handleSetDefaultReminder = async (days: number) => {
    await updateSettings({
      ...state.settings,
      defaultReminderDays: days,
    });
    setShowReminderPicker(false);
  };

  const currentReminderLabel = REMINDER_OPTIONS.find(r => r.value === state.settings.defaultReminderDays)?.label || '3 days before';

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await exportAllData();
      await Share.share({
        message: data,
        title: 'Maintenance Minder Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = () => {
    setShowImportModal(true);
  };

  const handleConfirmImport = async () => {
    if (importText.trim()) {
      const success = await importAllData(importText);
      setShowImportModal(false);
      setImportText('');
      if (success) {
        Alert.alert('Success', 'Data imported successfully. Please restart the app.');
      } else {
        Alert.alert('Error', 'Failed to import data. Please check the JSON format.');
      }
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your items, tasks, and logs. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Done', 'All data has been cleared. Please restart the app.');
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    // Replace with actual App Store URL when published
    Linking.openURL('https://apps.apple.com');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  const SettingRow: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }> = ({ icon, title, subtitle, onPress, rightElement, danger }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.iconContainer, danger && { backgroundColor: colors.danger + '20' }]}>
        <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && { color: colors.danger }]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />)}
    </TouchableOpacity>
  );

  const Toggle: React.FC<{ value: boolean; onToggle: () => void }> = ({ value, onToggle }) => (
    <TouchableOpacity
      onPress={onToggle}
      style={[styles.toggle, value && styles.toggleActive]}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
    </TouchableOpacity>
  );

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Settings</Text>

        {/* Notifications Section */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card>
          <SettingRow
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Get reminders for upcoming tasks"
            rightElement={
              <Toggle value={state.settings.notificationsEnabled} onToggle={handleToggleNotifications} />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="time-outline"
            title="Default Reminder"
            subtitle={currentReminderLabel}
            onPress={() => setShowReminderPicker(true)}
          />
        </Card>

        {/* Reminder Picker Modal */}
        <Modal visible={showReminderPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Default Reminder Time</Text>
              <Text style={styles.modalSubtitle}>New tasks will use this reminder setting</Text>
              {REMINDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.reminderOption,
                    state.settings.defaultReminderDays === option.value && styles.reminderOptionActive,
                  ]}
                  onPress={() => handleSetDefaultReminder(option.value)}
                >
                  <Text
                    style={[
                      styles.reminderOptionText,
                      state.settings.defaultReminderDays === option.value && styles.reminderOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {state.settings.defaultReminderDays === option.value && (
                    <Ionicons name="checkmark" size={20} color={colors.white} />
                  )}
                </TouchableOpacity>
              ))}
              <Button title="Cancel" variant="outline" onPress={() => setShowReminderPicker(false)} style={{ marginTop: 16 }} />
            </View>
          </View>
        </Modal>

        {/* Data Section */}
        <Text style={styles.sectionTitle}>Data</Text>
        <Card>
          <SettingRow
            icon="download-outline"
            title="Export Data"
            subtitle="Download your data as JSON"
            onPress={handleExportData}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="cloud-upload-outline"
            title="Import Data"
            subtitle="Restore from JSON backup"
            onPress={handleImportData}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="trash-outline"
            title="Clear All Data"
            subtitle="Delete all items and tasks"
            onPress={handleClearData}
            danger
          />
        </Card>

        {/* Import Modal */}
        <Modal visible={showImportModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Import Data</Text>
              <Text style={styles.modalSubtitle}>Paste your exported JSON below. This will replace all existing data.</Text>
              <Input
                value={importText}
                onChangeText={setImportText}
                placeholder="Paste JSON here..."
                multiline
                numberOfLines={6}
                style={{ minHeight: 120, textAlignVertical: 'top' }}
              />
              <View style={styles.modalButtons}>
                <Button title="Cancel" variant="outline" onPress={() => { setShowImportModal(false); setImportText(''); }} style={{ flex: 1, marginRight: 8 }} />
                <Button title="Import" onPress={handleConfirmImport} style={{ flex: 1, marginLeft: 8 }} disabled={!importText.trim()} />
              </View>
            </View>
          </View>
        </Modal>

        {/* About Section */}
        <Text style={styles.sectionTitle}>About</Text>
        <Card>
          <SettingRow
            icon="star-outline"
            title="Rate This App"
            subtitle="Help us by leaving a review"
            onPress={handleRateApp}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="information-circle-outline"
            title="Version"
            rightElement={<Text style={styles.versionText}>{APP_VERSION}</Text>}
          />
        </Card>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.appTagline}>Never miss another maintenance task</Text>
        </View>
      </ScrollView>
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
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: colors.text,
    fontSize: 16,
  },
  settingSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceLight,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  appName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  appTagline: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  reminderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  reminderOptionActive: {
    backgroundColor: colors.primary,
  },
  reminderOptionText: {
    color: colors.text,
    fontSize: 16,
  },
  reminderOptionTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
});

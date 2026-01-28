import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { exportAllData, clearAllData } from '../../services/storage';
import { APP_NAME, APP_VERSION, REMINDER_OPTIONS } from '../../utils/constants';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state, updateSettings } = useApp();
  const insets = useSafeAreaInsets();
  const [exporting, setExporting] = useState(false);

  const handleToggleNotifications = async () => {
    await updateSettings({
      ...state.settings,
      notificationsEnabled: !state.settings.notificationsEnabled,
    });
  };

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
        </Card>

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
            icon="trash-outline"
            title="Clear All Data"
            subtitle="Delete all items and tasks"
            onPress={handleClearData}
            danger
          />
        </Card>

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
});

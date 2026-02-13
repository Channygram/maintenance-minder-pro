import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { parseISO, format } from 'date-fns';

export const ExportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const handleExportJSON = async () => {
    const data = {
      items: state.items,
      tasks: state.tasks,
      logs: state.logs,
      settings: state.settings,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    await Share.share({
      message: JSON.stringify(data, null, 2),
      title: 'Maintenance Minder Export',
    });
  };

  const handleExportReadable = async () => {
    const lines: string[] = [
      '# Maintenance Minder Pro - Export',
      `Generated: ${format(new Date(), 'PPP')}`,
      '',
      '## Items',
      ...state.items.map(item => `- ${item.name} (${item.type})`),
      '',
      '## Active Tasks',
      ...state.tasks.filter(t => t.isActive).map(task => {
        const item = state.items.find(i => i.id === task.itemId);
        return `- ${task.name} - ${item?.name || 'Unknown'} (Due: ${format(parseISO(task.nextDue), 'PPP')})`;
      }),
      '',
      '## Recent History',
      ...state.logs.slice(0, 10).map(log => {
        const task = state.tasks.find(t => t.id === log.taskId);
        const item = state.items.find(i => i.id === log.itemId);
        return `- ${task?.name} - ${item?.name} (${format(parseISO(log.completedAt), 'PPP')})`;
      }),
    ];

    await Share.share({
      message: lines.join('\n'),
      title: 'Maintenance Minder Report',
    });
  };

  const stats = [
    { label: 'Items', value: state.items.length, icon: 'cube' as const },
    { label: 'Tasks', value: state.tasks.filter(t => t.isActive).length, icon: 'list' as const },
    { label: 'Completed', value: state.logs.length, icon: 'checkmark-circle' as const },
    { label: 'Providers', value: 0, icon: 'people' as const },
  ];

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Export Data</Text>
        <Text style={styles.subtitle}>Download your data in various formats</Text>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <Card>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={stat.label} style={[styles.statItem, index % 2 === 0 && styles.statBorder]}>
                <Ionicons name={stat.icon} size={24} color={colors.primary} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Export Options */}
        <Text style={styles.sectionTitle}>Export Options</Text>
        
        <TouchableOpacity style={styles.exportOption} onPress={handleExportJSON}>
          <View style={[styles.exportIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="code-slash" size={24} color={colors.primary} />
          </View>
          <View style={styles.exportContent}>
            <Text style={styles.exportTitle}>JSON Export</Text>
            <Text style={styles.exportText}>Full data backup, importable</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.exportOption} onPress={handleExportReadable}>
          <View style={[styles.exportIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="document-text" size={24} color={colors.secondary} />
          </View>
          <View style={styles.exportContent}>
            <Text style={styles.exportTitle}>Readable Report</Text>
            <Text style={styles.exportText}>Human-friendly summary</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Info */}
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Export your data to back it up or transfer to another device. JSON exports can be imported back into the app.
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
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exportContent: {
    flex: 1,
  },
  exportTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  exportText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
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

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { APP_CONFIG, FEATURES } from '../../utils/config';

export const AboutScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>About</Text>

        {/* App Info */}
        <Card variant="elevated" style={styles.appCard}>
          <View style={styles.appIcon}>
            <Ionicons name="construct" size={48} color={colors.primary} />
          </View>
          <Text style={styles.appName}>{APP_CONFIG.name}</Text>
          <Text style={styles.appVersion}>Version {APP_CONFIG.version}</Text>
        </Card>

        {/* Features */}
        <Text style={styles.sectionTitle}>Features</Text>
        <Card>
          {Object.entries(FEATURES).map(([key, enabled], index) => (
            <View 
              key={key} 
              style={[
                styles.featureRow, 
                index < Object.keys(FEATURES).length - 1 && styles.featureBorder
              ]}
            >
              <View style={styles.featureInfo}>
                <Ionicons 
                  name={enabled ? 'checkmark-circle' : 'close-circle'} 
                  size={20} 
                  color={enabled ? colors.secondary : colors.textMuted} 
                />
                <Text style={[styles.featureName, !enabled && styles.featureDisabled]}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Links */}
        <Text style={styles.sectionTitle}>Links</Text>
        <Card>
          <TouchableOpacity style={styles.linkRow} onPress={() => openLink('https://example.com/privacy')}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} onPress={() => openLink('https://example.com/terms')}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} onPress={() => openLink('https://example.com/support')}>
            <Ionicons name="help-circle" size={20} color={colors.primary} />
            <Text style={styles.linkText}>Support</Text>
          </TouchableOpacity>
        </Card>

        {/* Credits */}
        <Text style={styles.sectionTitle}>Credits</Text>
        <Card>
          <Text style={styles.creditsText}>
            Built with ❤️ for people who want to take better care of their stuff.
          </Text>
          <Text style={styles.creditsSubtext}>
            © 2026 Maintenance Minder Pro{'\n'}
            All rights reserved.
          </Text>
        </Card>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>App Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Object.keys(FEATURES).length}</Text>
              <Text style={styles.statLabel}>Features</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>15+</Text>
              <Text style={styles.statLabel}>Templates</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4+</Text>
              <Text style={styles.statLabel}>Screens</Text>
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
    marginBottom: 24,
  },
  appCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  appVersion: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 24,
  },
  featureRow: {
    paddingVertical: 8,
  },
  featureBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureName: {
    color: colors.text,
    fontSize: 15,
  },
  featureDisabled: {
    color: colors.textMuted,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  linkText: {
    color: colors.text,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  creditsText: {
    color: colors.text,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  creditsSubtext: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  statsCard: {
    marginTop: 24,
  },
  statsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});

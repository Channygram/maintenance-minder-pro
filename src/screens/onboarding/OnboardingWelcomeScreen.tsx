import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';

export const OnboardingWelcomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 40, paddingHorizontal: 24 }}
      >
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="construct" size={64} color={colors.primary} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Maintenance Minder Pro</Text>
        <Text style={styles.subtitle}>Never miss a maintenance task again</Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="cube" size={24} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Track Everything</Text>
              <Text style={styles.featureText}>Cars, home, appliances - all in one place</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="notifications" size={24} color={colors.secondary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Smart Reminders</Text>
              <Text style={styles.featureText}>Never forget important maintenance again</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="wallet" size={24} color={colors.warning} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Track Spending</Text>
              <Text style={styles.featureText}>Know where your maintenance money goes</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: colors.danger + '20' }]}>
              <Ionicons name="cloud-offline" size={24} color={colors.danger} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Works Offline</Text>
              <Text style={styles.featureText}>Your data stays on your device</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <Card style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to get started?</Text>
          <Text style={styles.ctaText}>
            Add your first item and we'll automatically create maintenance schedules for you.
          </Text>
        </Card>

        {/* Footer */}
        <Text style={styles.footer}>
          Made with ❤️ for people who take care of their stuff
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  featureText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  ctaCard: {
    marginBottom: 32,
    backgroundColor: colors.primary + '10',
  },
  ctaTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});

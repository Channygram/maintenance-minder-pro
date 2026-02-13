import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { commonStyles } from '../../theme/styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

export const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<string | null>(null);

  const handleSendFeedback = async () => {
    if (rating === 0 && !feedbackType) {
      Alert.alert('Feedback', 'Please select a rating or feedback type');
      return;
    }

    const feedbackMessage = `
📱 Maintenance Minder Pro Feedback

Rating: ${rating}/5 stars
Type: ${feedbackType || 'General'}

---
Sent via Maintenance Minder Pro App
    `.trim();

    await Share.share({
      message: feedbackMessage,
      title: 'Send Feedback',
    });
  };

  const feedbackOptions = [
    { id: 'bug', label: '🐛 Report a Bug', icon: 'bug' },
    { id: 'feature', label: '💡 Feature Request', icon: 'bulb' },
    { id: 'improvement', label: '✨ Suggest Improvement', icon: 'star' },
    { id: 'other', label: '💬 Other', icon: 'chatbubble' },
  ];

  return (
    <View style={commonStyles.container}>
      <ScrollView
        style={commonStyles.scrollContainer}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 100 }}
      >
        <Text style={styles.title}>Send Feedback</Text>
        <Text style={styles.subtitle}>
          Help us improve Maintenance Minder Pro!
        </Text>

        {/* Rating */}
        <Text style={styles.sectionTitle}>How would you rate the app?</Text>
        <Card>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? colors.warning : colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating === 0 ? 'Tap to rate' : 
             rating === 1 ? 'Poor' :
             rating === 2 ? 'Fair' :
             rating === 3 ? 'Good' :
             rating === 4 ? 'Very Good' : 'Excellent!'}
          </Text>
        </Card>

        {/* Feedback Type */}
        <Text style={styles.sectionTitle}>What would you like to tell us?</Text>
        <Card>
          {feedbackOptions.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionRow,
                index < feedbackOptions.length - 1 && styles.optionBorder,
                feedbackType === option.id && styles.optionSelected,
              ]}
              onPress={() => setFeedbackType(option.id)}
            >
              <Ionicons name={option.icon as any} size={24} color={feedbackType === option.id ? colors.primary : colors.textMuted} />
              <Text style={[
                styles.optionText,
                feedbackType === option.id && styles.optionTextSelected,
              ]}>
                {option.label}
              </Text>
              {feedbackType === option.id && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>App Statistics</Text>
        <Card>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{state.items.length}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{state.tasks.filter(t => t.isActive).length}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{state.logs.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </Card>

        {/* Send Button */}
        <Button
          title="Send Feedback"
          onPress={handleSendFeedback}
          style={{ marginTop: 24 }}
          icon={<Ionicons name="send" size={20} color={colors.white} />}
        />

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for using Maintenance Minder Pro! ❤️
        </Text>
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
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.primary + '10',
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  optionText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '500',
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
  footer: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
});

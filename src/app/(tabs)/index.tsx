/**
 * CECUREUS — Home Screen
 *
 * Welcomes user, interactive mood check-in, emergency helpline,
 * daily wellness recommendations, and recent activity.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmergencyBanner } from '../../components/ui/EmergencyBanner';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { moodApi } from '../../services/api';

const MOODS = [
  { key: 'great', emoji: '😄', label: 'Great', color: '#10B981' },
  { key: 'good', emoji: '🙂', label: 'Good', color: '#00A99D' },
  { key: 'okay', emoji: '😐', label: 'Okay', color: '#F59E0B' },
  { key: 'low', emoji: '😔', label: 'Low', color: '#8B5CF6' },
  { key: 'bad', emoji: '😫', label: 'Stressed', color: '#EF4444' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSaved, setMoodSaved] = useState<boolean>(false);

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const handleMoodSelect = async (moodKey: 'great' | 'good' | 'okay' | 'low' | 'bad') => {
    setSelectedMood(moodKey);
    setMoodSaved(true);
    try {
      await moodApi.logMood({ mood: moodKey });
    } catch {
      // offline silent log
    }
  };

  return (
    <ScreenContainer>
      {/* Greeting Header */}
      <View style={styles.headerSection}>
        <View>
          <Text style={styles.greetingSub}>Welcome back,</Text>
          <Text style={styles.greetingTitle}>Hi, {firstName} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.allyShortcut}
          onPress={() => router.push('/(tabs)/ally')}
          activeOpacity={0.8}
        >
          <View style={styles.allyIconBadge}>
            <Text style={styles.allyIconBadgeText}>🤖</Text>
          </View>
          <Text style={styles.allyShortcutText}>Talk to Ally</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Helpline Banner */}
      <EmergencyBanner />

      {/* Daily Mood Check-In */}
      <Card style={styles.moodCard}>
        <Text style={styles.sectionTitle}>How are you feeling today?</Text>
        <Text style={styles.sectionSubtitle}>
          {moodSaved ? 'Thank you for checking in today!' : 'Track your daily mood to help Ally understand you.'}
        </Text>

        <View style={styles.moodRow}>
          {MOODS.map((item) => {
            const isSelected = selectedMood === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => handleMoodSelect(item.key)}
                style={[
                  styles.moodButton,
                  isSelected && {
                    backgroundColor: colors.primaryMuted,
                    borderColor: colors.primary,
                    borderWidth: 2,
                    transform: [{ scale: 1.08 }],
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{item.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    isSelected && { color: colors.primaryDark, fontWeight: '700' },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Quick Action Hub */}
      <View style={styles.quickHubGrid}>
        <Card
          style={styles.quickCard}
          onPress={() => router.push('/(tabs)/counsellor')}
        >
          <View style={[styles.quickIconBg, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="calendar-outline" size={24} color="#0284C7" />
          </View>
          <Text style={styles.quickCardTitle}>Book Session</Text>
          <Text style={styles.quickCardDesc}>Speak 1-on-1 with a psychologist</Text>
        </Card>

        <Card
          style={styles.quickCard}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <View style={[styles.quickIconBg, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="clipboard-outline" size={24} color="#7C3AED" />
          </View>
          <Text style={styles.quickCardTitle}>Assessments</Text>
          <Text style={styles.quickCardDesc}>Check stress, burnout & anxiety</Text>
        </Card>
      </View>

      {/* Daily Wellness Quote / Tip */}
      <Card style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Badge label="Daily Mindful Tip" variant="primary" />
          <Text style={styles.tipTime}>2 min read</Text>
        </View>
        <Text style={styles.tipTitle}>The Power of the 4-7-8 Breathing Reset</Text>
        <Text style={styles.tipBody}>
          When tension mounts, inhale quietly through your nose for 4 seconds, hold your breath for 7 seconds, and exhale completely with a whoosh for 8 seconds.
        </Text>
        <TouchableOpacity
          style={styles.tryExerciseButton}
          onPress={() => router.push('/(tabs)/ally')}
          activeOpacity={0.8}
        >
          <Text style={styles.tryExerciseText}>Try Exercise with Ally →</Text>
        </TouchableOpacity>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  greetingSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  greetingTitle: {
    ...typography.h1,
    color: colors.text,
  },
  allyShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F5',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#B2EBF2',
  },
  allyIconBadge: {
    marginRight: 6,
  },
  allyIconBadgeText: {
    fontSize: 16,
  },
  allyShortcutText: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  moodCard: {
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceSubtle,
    width: '18%',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  quickHubGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
    gap: spacing.md,
  },
  quickCard: {
    flex: 1,
    padding: spacing.md,
  },
  quickIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickCardTitle: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: 2,
  },
  quickCardDesc: {
    ...typography.small,
    color: colors.textMuted,
    lineHeight: 16,
  },
  tipCard: {
    marginVertical: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tipTime: {
    ...typography.small,
    color: colors.textMuted,
  },
  tipTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  tipBody: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tryExerciseButton: {
    alignSelf: 'flex-start',
  },
  tryExerciseText: {
    ...typography.captionBold,
    color: colors.primary,
  },
});

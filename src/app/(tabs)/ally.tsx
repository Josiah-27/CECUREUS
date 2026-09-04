/**
 * CECUREUS — Ally AI Wellness Companion Screen
 *
 * Faithfully matches the Figma Ally prototype:
 * - Ally mascot header & warm introduction
 * - 6 structured help topics
 * - "Ask Ally anything..." quick query bar with send button
 * - Confidentiality & privacy reassurance banner
 * - Quick wellness activities
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

const TOPICS = [
  {
    id: 'talk',
    title: 'I need to talk',
    description: "Talk about what's bothering you",
    emoji: '💬',
    topicParam: 'General Talk',
  },
  {
    id: 'stressed',
    title: 'Feeling stressed',
    description: 'Help me manage stress better',
    emoji: '😤',
    topicParam: 'Stress Management',
  },
  {
    id: 'anxiety',
    title: 'Anxiety support',
    description: 'Ways to calm my anxiety',
    emoji: '😟',
    topicParam: 'Anxiety Support',
  },
  {
    id: 'sleep',
    title: 'Sleep better',
    description: 'Tips for improved sleep',
    emoji: '🌙',
    topicParam: 'Sleep Better',
  },
  {
    id: 'work',
    title: 'Work concerns',
    description: 'Support for work related issues',
    emoji: '💼',
    topicParam: 'Work Concerns',
  },
  {
    id: 'mood',
    title: 'Mood support',
    description: "I'm feeling low or overwhelmed",
    emoji: '💖',
    topicParam: 'Mood Support',
  },
];

const ACTIVITIES = [
  { id: '1', title: 'Box Breathing', duration: '3 mins', icon: '🧘' },
  { id: '2', title: 'Morning Affirmations', duration: '2 mins', icon: '☀️' },
  { id: '3', title: 'Thought Defusion', duration: '5 mins', icon: '📝' },
  { id: '4', title: 'Forest Ambience', duration: '10 mins', icon: '🎧' },
];

export default function AllyScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');

  const handleTopicPress = (topic: typeof TOPICS[0]) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: `ally_${topic.id}`, topic: topic.topicParam, initialMessage: `I'd like support with: ${topic.title}` },
    });
  };

  const handleSendQuery = () => {
    if (!inputText.trim()) return;
    const query = inputText;
    setInputText('');
    router.push({
      pathname: '/chat/[id]',
      params: { id: `ally_custom_${Date.now()}`, topic: 'Ally Chat', initialMessage: query },
    });
  };

  return (
    <ScreenContainer>
      {/* Ally Companion Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTextCol}>
          <Text style={styles.allyGreeting}>Hi, I'm Ally 👋</Text>
          <Text style={styles.allySubtitle}>Your mental wellness companion.</Text>
          <View style={styles.reassuranceRow}>
            <Ionicons name="heart-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.reassuranceText}>
              I'm here to listen, understand and support you.
            </Text>
          </View>
        </View>

        {/* Ally Mascot Robot Face Card */}
        <View style={styles.mascotContainer}>
          <View style={styles.mascotEarLeft} />
          <View style={styles.mascotEarRight} />
          <View style={styles.mascotFace}>
            <View style={styles.mascotEyeRow}>
              <View style={styles.mascotEye} />
              <View style={styles.mascotEye} />
            </View>
            <View style={styles.mascotMouth} />
          </View>
        </View>
      </View>

      {/* How Can I Help Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>How can I help you today?</Text>
        <Text style={styles.sectionSub}>Select a topic or ask me anything that's on your mind.</Text>
      </View>

      {/* 2-Column Topic Grid */}
      <View style={styles.topicGrid}>
        {TOPICS.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            onPress={() => handleTopicPress(topic)}
            style={styles.topicCard}
            activeOpacity={0.8}
          >
            <Text style={styles.topicEmoji}>{topic.emoji}</Text>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.topicDesc}>{topic.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ask Ally Input Box with Send Button */}
      <View style={styles.askBarContainer}>
        <TextInput
          style={styles.askInput}
          placeholder="Ask Ally anything..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendQuery}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendQuery}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Privacy Guarantee Reassurance Banner */}
      <View style={styles.privacyBanner}>
        <Ionicons name="lock-closed-outline" size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.privacyTitle}>Your conversations with Ally are safe and private.</Text>
          <Text style={styles.privacySub}>Ally is here 24/7 to support you.</Text>
        </View>
      </View>

      {/* Quick Activities */}
      <View style={[styles.sectionHeaderRow, { marginTop: spacing.lg }]}>
        <Text style={styles.sectionTitle}>Quick Activities</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All &gt;</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activitiesRow}>
        {ACTIVITIES.map((act) => (
          <TouchableOpacity
            key={act.id}
            style={styles.activityCard}
            onPress={() =>
              router.push({
                pathname: '/chat/[id]',
                params: { id: `activity_${act.id}`, topic: act.title, initialMessage: `Let's start the ${act.title} exercise.` },
              })
            }
            activeOpacity={0.8}
          >
            <View style={styles.activityIconBg}>
              <Text style={styles.activityIcon}>{act.icon}</Text>
            </View>
            <Text style={styles.activityTitle} numberOfLines={1}>
              {act.title}
            </Text>
            <Text style={styles.activityDuration}>{act.duration}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  allyGreeting: {
    ...typography.h1,
    color: colors.text,
    fontSize: 22,
    marginBottom: 2,
  },
  allySubtitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  reassuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reassuranceText: {
    ...typography.small,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  mascotContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mascotFace: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#38B2AC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotEarLeft: {
    position: 'absolute',
    top: 0,
    left: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38B2AC',
  },
  mascotEarRight: {
    position: 'absolute',
    top: 0,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38B2AC',
  },
  mascotEyeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  mascotEye: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  mascotMouth: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  topicCard: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  topicEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  topicTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
    marginBottom: 2,
  },
  topicDesc: {
    ...typography.small,
    color: colors.textMuted,
    lineHeight: 15,
  },
  askBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.full,
    paddingLeft: spacing.lg,
    paddingRight: 6,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.md,
    ...shadows.sm,
  },
  askInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F5',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#B2EBF2',
    marginVertical: spacing.sm,
  },
  privacyTitle: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  privacySub: {
    ...typography.small,
    color: '#00796B',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  viewAllText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  activitiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  activityIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FAF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activityIcon: {
    fontSize: 18,
  },
  activityTitle: {
    ...typography.small,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  activityDuration: {
    ...typography.small,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
});

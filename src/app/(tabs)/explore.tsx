/**
 * CECUREUS — Explore Screen
 *
 * Faithfully matches the Figma Explore prototype:
 * - Search bar with filter toggle
 * - Category filter chips (All, Stress, Anxiety, Sleep, Workplace)
 * - 2x2 Self Assessments grid (Stress Level Check, Burnout, Anxiety, Work-Life)
 * - Curated Blogs & Articles
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'apps-outline' },
  { key: 'stress', label: 'Stress', emoji: '😐' },
  { key: 'anxiety', label: 'Anxiety', emoji: '😟' },
  { key: 'sleep', label: 'Sleep', emoji: '🌙' },
  { key: 'workplace', label: 'Workplace', emoji: '💼' },
];

const ASSESSMENTS = [
  {
    id: 'stress_check',
    title: 'Stress Level\nCheck',
    description: 'Find out your stress levels',
    duration: '5 mins',
    dotColor: '#00A99D',
    category: 'stress',
  },
  {
    id: 'burnout_eval',
    title: 'Burnout\nAssessment',
    description: "Check if you're experiencing burnout",
    duration: '7 mins',
    dotColor: '#F59E0B',
    category: 'workplace',
  },
  {
    id: 'anxiety_screen',
    title: 'Anxiety\nScreening',
    description: 'Screen your anxiety levels',
    duration: '5 mins',
    dotColor: '#8B5CF6',
    category: 'anxiety',
  },
  {
    id: 'work_life_score',
    title: 'Work-Life\nBalance Score',
    description: 'Evaluate your work life balance',
    duration: '6 mins',
    dotColor: '#10B981',
    category: 'workplace',
  },
];

const ARTICLES = [
  {
    id: 'art_1',
    title: 'Overcoming Workplace Imposter Syndrome',
    readTime: '4 min read',
    author: 'Dr. Neha Sharma',
    category: 'Workplace',
  },
  {
    id: 'art_2',
    title: 'Understanding the Gut-Brain Connection & Anxiety',
    readTime: '6 min read',
    author: 'Dr. Ayesha Khan',
    category: 'Anxiety',
  },
  {
    id: 'art_3',
    title: '5 Micro-Habits for Restorative Deep Sleep',
    readTime: '3 min read',
    author: 'Mr. Rohan Verma',
    category: 'Sleep',
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredAssessments = ASSESSMENTS.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      return (
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <ScreenContainer>
      {/* Page Title & Subtitle */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover resources to understand, heal and grow.</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Input
            placeholder="Search blogs, assessments, exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Ionicons name="search-outline" size={20} color={colors.textMuted} />}
            rightIcon={
              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            }
            containerStyle={{ marginBottom: 0 }}
          />
        </View>
      </View>

      {/* Category Pills Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipSelected,
              ]}
              activeOpacity={0.8}
            >
              {cat.icon ? (
                <Ionicons
                  name={cat.icon as any}
                  size={18}
                  color={isSelected ? colors.primary : colors.textSecondary}
                  style={styles.chipIcon}
                />
              ) : (
                <Text style={styles.chipEmoji}>{cat.emoji}</Text>
              )}
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Self Assessments Section */}
      <View style={styles.sectionHeaderRow}>
        <View>
          <View style={styles.sectionTitleWithIcon}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Self Assessments</Text>
          </View>
          <Text style={styles.sectionSub}>Understand your current mental well-being.</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* 2x2 Assessments Grid */}
      <View style={styles.assessmentGrid}>
        {filteredAssessments.map((item) => (
          <Card
            key={item.id}
            style={styles.assessmentCard}
            onPress={() => router.push(`/assessment/${item.id}`)}
          >
            <Text style={styles.assessmentTitle}>{item.title}</Text>
            <View style={[styles.assessmentDot, { backgroundColor: item.dotColor }]} />
            <Text style={styles.assessmentDesc}>{item.description}</Text>
            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={14} color={colors.textMuted} />
              <Text style={styles.durationText}>{item.duration}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
            </View>
          </Card>
        ))}
      </View>

      {/* Blogs & Articles Section */}
      <View style={[styles.sectionHeaderRow, { marginTop: spacing.xl }]}>
        <View>
          <Text style={styles.sectionTitle}>Blogs &amp; Articles</Text>
          <Text style={styles.sectionSub}>Curated reads by experts to support your journey.</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Articles List */}
      <View style={styles.articleList}>
        {ARTICLES.map((art) => (
          <Card key={art.id} style={styles.articleCard}>
            <View style={styles.articleContent}>
              <View style={styles.articleMeta}>
                <Text style={styles.articleCategory}>{art.category}</Text>
                <Text style={styles.articleDot}>·</Text>
                <Text style={styles.articleReadTime}>{art.readTime}</Text>
              </View>
              <Text style={styles.articleTitle}>{art.title}</Text>
              <Text style={styles.articleAuthor}>By {art.author}</Text>
            </View>
            <View style={styles.articleArrow}>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  searchRow: {
    marginBottom: spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
  },
  categoryList: {
    paddingVertical: spacing.xs,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    minWidth: 72,
  },
  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  chipIcon: {
    marginBottom: 4,
  },
  chipEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryChipText: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
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
  viewAllText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  assessmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  assessmentCard: {
    width: '47.5%',
    padding: spacing.md,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  assessmentTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  assessmentDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginVertical: spacing.xs,
  },
  assessmentDesc: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  durationText: {
    ...typography.small,
    color: colors.textMuted,
    marginLeft: 4,
  },
  articleList: {
    gap: spacing.sm,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  articleContent: {
    flex: 1,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  articleCategory: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
  },
  articleDot: {
    marginHorizontal: 4,
    color: colors.textMuted,
  },
  articleReadTime: {
    ...typography.small,
    color: colors.textMuted,
  },
  articleTitle: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 15,
    marginBottom: 4,
  },
  articleAuthor: {
    ...typography.small,
    color: colors.textSecondary,
  },
  articleArrow: {
    marginLeft: spacing.sm,
  },
});

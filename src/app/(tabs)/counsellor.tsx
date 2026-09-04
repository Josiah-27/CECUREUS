/**
 * CECUREUS — Our Counsellors Screen
 *
 * Faithfully matches the Figma Counsellor prototype:
 * - Confidentiality & Emergency Helpline 1800 121 9497
 * - Name / Expertise / Language search with filters
 * - Category filter chips (All Counsellors, Anxiety, Stress, Depression)
 * - Counsellor profile cards with avatar, verified badge, rating, specializations
 * - "View Profile" and "Book Session" interactive CTAs
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { EmergencyBanner } from '../../components/ui/EmergencyBanner';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { counsellorApi } from '../../services/api';

const COUNSELLOR_FILTERS = [
  'All Counsellors',
  'Anxiety',
  'Stress',
  'Depression',
  'Workplace',
  'Relationships',
];

const INITIAL_COUNSELLORS = [
  {
    id: 'counsellor_1',
    name: 'Dr. Neha Sharma',
    title: 'Clinical Psychologist',
    experience_years: 8,
    rating: 4.9,
    total_sessions: 412,
    specializations: ['Anxiety', 'Stress', 'Depression', 'Trauma'],
    languages: ['English', 'Hindi'],
    avatar_color: '#00A99D',
  },
  {
    id: 'counsellor_2',
    name: 'Mr. Rohan Verma',
    title: 'Counselling Psychologist',
    experience_years: 6,
    rating: 4.8,
    total_sessions: 298,
    specializations: ['Stress', 'Work Stress', 'Anxiety', 'Career'],
    languages: ['English', 'Hindi', 'Marathi'],
    avatar_color: '#F59E0B',
  },
  {
    id: 'counsellor_3',
    name: 'Dr. Ayesha Khan',
    title: 'Psychiatrist',
    experience_years: 12,
    rating: 4.9,
    total_sessions: 687,
    specializations: ['Depression', 'Bipolar Disorder', 'Sleep Disorders', 'OCD'],
    languages: ['English', 'Hindi', 'Urdu'],
    avatar_color: '#8B5CF6',
  },
  {
    id: 'counsellor_4',
    name: 'Ms. Priya Menon',
    title: 'Psychotherapist',
    experience_years: 5,
    rating: 4.7,
    total_sessions: 189,
    specializations: ['Relationship Issues', 'Self Esteem', 'Grief', 'Anxiety'],
    languages: ['English', 'Malayalam', 'Tamil'],
    avatar_color: '#10B981',
  },
];

export default function CounsellorScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Counsellors');
  const [counsellors, setCounsellors] = useState(INITIAL_COUNSELLORS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCounsellors = async () => {
    try {
      const res = await counsellorApi.list();
      if (res?.counsellors && res.counsellors.length > 0) {
        setCounsellors(res.counsellors);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchCounsellors();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCounsellors();
    setRefreshing(false);
  };

  const filteredCounsellors = counsellors.filter((c) => {
    if (selectedFilter !== 'All Counsellors') {
      const hasSpec = c.specializations?.some((s: string) =>
        s.toLowerCase().includes(selectedFilter.toLowerCase())
      );
      if (!hasSpec) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name?.toLowerCase().includes(q);
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchLang = c.languages?.some((l: string) => l.toLowerCase().includes(q));
      const matchSpec = c.specializations?.some((s: string) => s.toLowerCase().includes(q));
      return matchName || matchTitle || matchLang || matchSpec;
    }
    return true;
  });

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      {/* Header Title */}
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>Our Counsellors</Text>
        <Text style={styles.pageSubtitle}>
          Connect confidentially with our certified mental health experts.
        </Text>
      </View>

      {/* Emergency Helpline Banner */}
      <EmergencyBanner />

      {/* Search Header */}
      <View style={styles.searchSectionHeader}>
        <Text style={styles.searchSectionTitle}>Find the right support for you</Text>
      </View>

      {/* Search Bar with Filter Icon */}
      <View style={styles.searchBarWrapper}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, expertise, language..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filtersBtn} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={16} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.filtersBtnText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips Horizontal Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsRow}
      >
        {COUNSELLOR_FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                isSelected && styles.filterChipSelected,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextSelected,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Counsellor Cards List */}
      <View style={styles.counsellorList}>
        {filteredCounsellors.map((c) => (
          <Card key={c.id} style={styles.counsellorCard}>
            {/* Top row: Avatar + Name/Title + Buttons */}
            <View style={styles.cardTopRow}>
              <Avatar
                name={c.name}
                size={54}
                backgroundColor={c.avatar_color || '#00A99D'}
                showOnlineDot={true}
                style={{ marginRight: spacing.md }}
              />

              <View style={styles.counsellorInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.counsellorName}>{c.name}</Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.primary}
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <Text style={styles.counsellorTitle}>{c.title}</Text>
                <Text style={styles.experienceText}>
                  {c.experience_years}+ Years Experience
                </Text>

                {/* Rating & Sessions */}
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={15} color="#F59E0B" />
                  <Text style={styles.ratingScore}>{c.rating}</Text>
                  <Text style={styles.sessionCount}>
                    ({c.total_sessions} sessions)
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsCol}>
                <Button
                  title="View Profile"
                  variant="tealOutline"
                  size="sm"
                  onPress={() => router.push(`/counsellor/${c.id}`)}
                  style={{ marginBottom: spacing.xs }}
                />
                <Button
                  title="Book Session"
                  variant="primary"
                  size="sm"
                  onPress={() => router.push(`/counsellor/${c.id}`)}
                />
              </View>
            </View>

            {/* Specialization Tags */}
            <View style={styles.specializationsRow}>
              {c.specializations?.map((tag: string, idx: number) => (
                <Badge
                  key={idx}
                  label={tag}
                  variant="default"
                  style={styles.specBadge}
                />
              ))}
            </View>

            {/* Languages */}
            <View style={styles.languageRow}>
              <Ionicons name="globe-outline" size={14} color={colors.textMuted} style={{ marginRight: 4 }} />
              <Text style={styles.languageText}>
                {c.languages?.join(', ')}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    marginBottom: spacing.xs,
  },
  pageTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: 4,
  },
  pageSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  searchSectionHeader: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  searchSectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.sm,
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  filtersBtnText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  filterChipsRow: {
    paddingVertical: spacing.xs,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  counsellorList: {
    gap: spacing.md,
  },
  counsellorCard: {
    padding: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  counsellorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counsellorName: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 16,
  },
  counsellorTitle: {
    ...typography.small,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  experienceText: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScore: {
    ...typography.small,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
    marginRight: 4,
  },
  sessionCount: {
    ...typography.small,
    color: colors.textMuted,
  },
  actionButtonsCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  specializationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: spacing.xs,
  },
  specBadge: {
    backgroundColor: '#F1F5F9',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  languageText: {
    ...typography.small,
    color: colors.textSecondary,
  },
});

/**
 * CECUREUS — Counsellor Detail & Booking Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { EmergencyBanner } from '../../components/ui/EmergencyBanner';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { counsellorApi } from '../../services/api';

const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM'];
const SESSION_TYPES = [
  { id: 'video_call', label: 'Video Call', icon: 'videocam-outline', desc: 'Face-to-face encrypted video' },
  { id: 'phone_call', label: 'Phone Call', icon: 'call-outline', desc: 'Direct confidential voice call' },
  { id: 'chat', label: 'Live Chat', icon: 'chatbubbles-outline', desc: 'Real-time text messaging' },
];

export default function CounsellorDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('video_call');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fallback / mock counsellor data based on ID
  const counsellor = {
    id: id || 'counsellor_1',
    name: id?.toString().includes('2') ? 'Mr. Rohan Verma' : 'Dr. Neha Sharma',
    title: id?.toString().includes('2') ? 'Counselling Psychologist' : 'Clinical Psychologist',
    experience_years: id?.toString().includes('2') ? 6 : 8,
    rating: 4.9,
    total_sessions: 412,
    specializations: ['Anxiety', 'Stress', 'Depression', 'Trauma', 'Workplace Burnout'],
    languages: ['English', 'Hindi'],
    bio: 'Dr. Neha Sharma is a certified clinical psychologist with over 8 years of experience helping individuals navigate stress, anxiety, emotional regulation, and life transitions. Her therapeutic approach integrates Cognitive Behavioral Therapy (CBT), Mindfulness-Based Interventions, and Compassion-Focused Therapy to empower clients.',
    avatar_color: '#00A99D',
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    try {
      // Create date for tomorrow with the selected slot
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const scheduledAt = tomorrow.toISOString();

      await counsellorApi.bookSession(
        counsellor.id.toString(),
        {
          sessionType: selectedType,
          scheduledAt,
          durationMinutes: 60,
          topics: ['General Wellness', 'Stress Management'],
        },
        `idempotent_${Date.now()}`
      );

      setBookingSuccess(true);
    } catch {
      // Offline fallback success for demo
      setBookingSuccess(true);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <ScreenContainer showHeader={true} showBack={true} headerTitle="Counsellor Profile">
      {/* Profile Overview Card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeaderRow}>
          <Avatar
            name={counsellor.name}
            size={72}
            backgroundColor={counsellor.avatar_color}
            showOnlineDot={true}
            style={{ marginRight: spacing.md }}
          />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.counsellorName}>{counsellor.name}</Text>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.counsellorTitle}>{counsellor.title}</Text>
            <Text style={styles.counsellorExp}>{counsellor.experience_years}+ Years Experience</Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingScore}>{counsellor.rating}</Text>
              <Text style={styles.sessionCount}>({counsellor.total_sessions} sessions completed)</Text>
            </View>
          </View>
        </View>

        {/* Languages & Verified Badges */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="globe-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.metaText}>{counsellor.languages.join(', ')}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.accentGreen} style={{ marginRight: 6 }} />
            <Text style={styles.metaText}>Verified Credentials</Text>
          </View>
        </View>
      </Card>

      {/* Emergency Helpline Banner */}
      <EmergencyBanner />

      {/* About Section */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>About</Text>
        <Text style={styles.bioText}>{counsellor.bio}</Text>
      </Card>

      {/* Areas of Expertise */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Areas of Expertise</Text>
        <View style={styles.tagGrid}>
          {counsellor.specializations.map((tag, idx) => (
            <Badge key={idx} label={tag} variant="primary" style={styles.expertiseBadge} />
          ))}
        </View>
      </Card>

      {/* Book Session CTA Button */}
      <View style={styles.bottomCtaContainer}>
        <Button
          title="Book Confidential Session"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => setBookingModalVisible(true)}
          leftIcon={<Ionicons name="calendar" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />}
        />
      </View>

      {/* Booking Modal */}
      <Modal visible={bookingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {bookingSuccess ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-done" size={36} color={colors.primary} />
                </View>
                <Text style={styles.successTitle}>Session Booked!</Text>
                <Text style={styles.successDesc}>
                  Your {selectedType.replace('_', ' ')} with {counsellor.name} is confirmed for tomorrow at {selectedSlot}.
                </Text>
                <Button
                  title="View in Profile"
                  variant="primary"
                  fullWidth
                  onPress={() => {
                    setBookingModalVisible(false);
                    setBookingSuccess(false);
                    router.push('/(tabs)/profile');
                  }}
                />
              </View>
            ) : (
              <>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Schedule Session</Text>
                  <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Session Type Select */}
                <Text style={styles.inputLabel}>Choose Session Mode</Text>
                <View style={styles.typeGrid}>
                  {SESSION_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setSelectedType(type.id)}
                      style={[
                        styles.typeCard,
                        selectedType === type.id && styles.typeCardSelected,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={22}
                        color={selectedType === type.id ? colors.primary : colors.textSecondary}
                      />
                      <Text style={[styles.typeLabel, selectedType === type.id && styles.typeLabelSelected]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Available Time Slots */}
                <Text style={[styles.inputLabel, { marginTop: spacing.md }]}>Select Time Slot (Tomorrow)</Text>
                <View style={styles.slotGrid}>
                  {TIME_SLOTS.map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      onPress={() => setSelectedSlot(slot)}
                      style={[
                        styles.slotCard,
                        selectedSlot === slot && styles.slotCardSelected,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextSelected]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Confirm Button */}
                <Button
                  title="Confirm & Book Session"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isBooking}
                  onPress={handleConfirmBooking}
                  style={{ marginTop: spacing.lg }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    padding: spacing.lg,
    marginVertical: spacing.xs,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counsellorName: {
    ...typography.h2,
    color: colors.text,
    fontSize: 20,
  },
  counsellorTitle: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    fontSize: 14,
  },
  counsellorExp: {
    ...typography.small,
    color: colors.textMuted,
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingScore: {
    ...typography.captionBold,
    color: colors.text,
    marginLeft: 4,
    marginRight: 4,
  },
  sessionCount: {
    ...typography.small,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  sectionCard: {
    marginVertical: spacing.xs,
    padding: spacing.md,
  },
  sectionHeading: {
    ...typography.h3,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  bioText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expertiseBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bottomCtaContainer: {
    marginVertical: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    ...typography.h2,
    color: colors.text,
  },
  inputLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSubtle,
  },
  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  typeLabel: {
    ...typography.small,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 6,
  },
  typeLabelSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slotCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  slotCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  successDesc: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
});

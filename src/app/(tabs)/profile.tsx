/**
 * CECUREUS — My Profile Screen
 *
 * Faithfully matches the Figma Profile prototype:
 * - User card with avatar, name, email, phone, verified badge, and "Edit Profile"
 * - Emergency helpline banner 1800 121 9497
 * - My Wellness Overview 4 metric cards (Sessions, Blogs, Assessments, Goals)
 * - Recent Sessions list with date/format/topics and "View Summary"
 * - Google Play / App Store compliant Delete Account & Logout flows
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { EmergencyBanner } from '../../components/ui/EmergencyBanner';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, deleteAccount } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccountConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Unable to delete account. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out from CecureUs?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.pageTitle}>My Profile</Text>
        <Text style={styles.pageSubtitle}>
          Manage your account and wellness journey.
        </Text>
      </View>

      {/* User Info Card */}
      <Card style={styles.userCard}>
        <View style={styles.userCardRow}>
          <Avatar
            name={user?.name || 'Harsha Verma'}
            size={64}
            backgroundColor="#00A99D"
            style={{ marginRight: spacing.md }}
          />

          <View style={styles.userInfoCol}>
            <Text style={styles.userName}>{user?.name || 'Harsha Verma'}</Text>
            <Text style={styles.userEmail}>
              {user?.email || 'harsha.verma@example.com'}
            </Text>
            <Text style={styles.userPhone}>
              {user?.phone || '+91 98765 43210'}
            </Text>
            <View style={styles.verifiedBadgeRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <Button
            title="Edit Profile"
            variant="tealOutline"
            size="sm"
            leftIcon={<Ionicons name="create-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />}
            onPress={() => Alert.alert('Edit Profile', 'Profile editing options.')}
          />
        </View>
      </Card>

      {/* Emergency Helpline Banner */}
      <EmergencyBanner />

      {/* My Wellness Overview */}
      <View style={styles.overviewSection}>
        <Text style={styles.sectionTitle}>My Wellness Overview</Text>

        <View style={styles.overviewGrid}>
          {/* Card 1: Sessions Taken */}
          <Card style={styles.overviewCard}>
            <View style={styles.overviewIconHeader}>
              <Text style={styles.overviewEmoji}>📅</Text>
              <Text style={styles.overviewNumber}>12</Text>
            </View>
            <Text style={styles.overviewLabel}>Sessions Taken</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.overviewLink}>
              <Text style={styles.overviewLinkText}>View History &gt;</Text>
            </TouchableOpacity>
          </Card>

          {/* Card 2: Blogs Completed */}
          <Card style={styles.overviewCard}>
            <View style={styles.overviewIconHeader}>
              <Text style={styles.overviewEmoji}>📖</Text>
              <Text style={styles.overviewNumber}>18</Text>
            </View>
            <Text style={styles.overviewLabel}>Blogs Completed</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.overviewLink}>
              <Text style={styles.overviewLinkText}>View All &gt;</Text>
            </TouchableOpacity>
          </Card>

          {/* Card 3: Assessments Done */}
          <Card style={styles.overviewCard}>
            <View style={styles.overviewIconHeader}>
              <Text style={styles.overviewEmoji}>📋</Text>
              <Text style={styles.overviewNumber}>5</Text>
            </View>
            <Text style={styles.overviewLabel}>Assessments Done</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.overviewLink}>
              <Text style={styles.overviewLinkText}>View Results &gt;</Text>
            </TouchableOpacity>
          </Card>

          {/* Card 4: Goals Achieved */}
          <Card style={styles.overviewCard}>
            <View style={styles.overviewIconHeader}>
              <Text style={styles.overviewEmoji}>🎯</Text>
              <Text style={styles.overviewNumber}>8</Text>
            </View>
            <Text style={styles.overviewLabel}>Goals Achieved</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.overviewLink}>
              <Text style={styles.overviewLinkText}>View Goals &gt;</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </View>

      {/* Recent Sessions */}
      <View style={styles.recentSessionsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All &gt;</Text>
          </TouchableOpacity>
        </View>

        {/* Session 1 */}
        <Card style={styles.sessionCard}>
          <View style={styles.sessionTopRow}>
            <Avatar name="Dr. Neha Sharma" size={44} backgroundColor="#00A99D" showOnlineDot={true} />
            <View style={styles.sessionDetails}>
              <Text style={styles.counsellorSessionName}>Dr. Neha Sharma</Text>
              <Text style={styles.sessionTimeInfo}>15 May 2025 · 11:00 AM · Video Call</Text>
              <Badge label="Stress & Anxiety" variant="default" style={{ marginTop: 4 }} />
            </View>
            <TouchableOpacity style={styles.summaryButton} activeOpacity={0.7}>
              <Ionicons name="book-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.summaryButtonText}>View Summary</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Session 2 */}
        <Card style={styles.sessionCard}>
          <View style={styles.sessionTopRow}>
            <Avatar name="Mr. Rohan Verma" size={44} backgroundColor="#F59E0B" showOnlineDot={true} />
            <View style={styles.sessionDetails}>
              <Text style={styles.counsellorSessionName}>Mr. Rohan Verma</Text>
              <Text style={styles.sessionTimeInfo}>02 May 2025 · 04:00 PM · Phone Call</Text>
              <Badge label="Work Stress" variant="default" style={{ marginTop: 4 }} />
            </View>
            <TouchableOpacity style={styles.summaryButton} activeOpacity={0.7}>
              <Ionicons name="book-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.summaryButtonText}>View Summary</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>

      {/* Account Settings & Compliance */}
      <View style={styles.accountActionsSection}>
        <Button
          title="Log Out"
          variant="outline"
          fullWidth
          onPress={handleLogout}
          style={{ marginBottom: spacing.md }}
          leftIcon={<Ionicons name="log-out-outline" size={18} color={colors.textSecondary} style={{ marginRight: 6 }} />}
        />

        <TouchableOpacity
          onPress={() => setShowDeleteModal(true)}
          style={styles.deleteAccountBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteAccountText}>Delete Account &amp; Data</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Account Confirmation Modal (App Store / Google Play Compliance) */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalCard}>
            <View style={styles.deleteModalIconCircle}>
              <Ionicons name="warning-outline" size={28} color={colors.error} />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Account?</Text>
            <Text style={styles.deleteModalDesc}>
              This action will permanently anonymize your account, revoke all active sessions, and remove personal identifiable records in compliance with data privacy regulations.
            </Text>
            <View style={styles.deleteModalBtnRow}>
              <Button
                title="Cancel"
                variant="outline"
                size="md"
                onPress={() => setShowDeleteModal(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Delete Account"
                variant="danger"
                size="md"
                loading={isDeleting}
                onPress={handleDeleteAccountConfirm}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  userCard: {
    marginVertical: spacing.sm,
    padding: spacing.md,
  },
  userCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    fontSize: 17,
  },
  userEmail: {
    ...typography.small,
    color: colors.textSecondary,
  },
  userPhone: {
    ...typography.small,
    color: colors.textMuted,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  verifiedText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
    marginLeft: 4,
  },
  overviewSection: {
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    fontSize: 17,
    marginBottom: spacing.sm,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  overviewCard: {
    width: '48%',
    padding: spacing.md,
  },
  overviewIconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  overviewEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  overviewNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  overviewLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  overviewLink: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 4,
  },
  overviewLinkText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  recentSessionsSection: {
    marginVertical: spacing.sm,
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
  sessionCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  counsellorSessionName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  sessionTimeInfo: {
    ...typography.small,
    color: colors.textMuted,
  },
  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  summaryButtonText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  accountActionsSection: {
    marginVertical: spacing.lg,
    alignItems: 'center',
  },
  deleteAccountBtn: {
    paddingVertical: spacing.sm,
  },
  deleteAccountText: {
    ...typography.captionBold,
    color: colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  deleteModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  deleteModalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  deleteModalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  deleteModalDesc: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  deleteModalBtnRow: {
    flexDirection: 'row',
    width: '100%',
  },
});

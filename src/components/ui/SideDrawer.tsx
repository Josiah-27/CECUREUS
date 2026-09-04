/**
 * CECUREUS — Side Navigation Drawer Component
 *
 * Full-featured slide-out navigation menu:
 * - User profile banner (Avatar, Name, Email/Phone)
 * - Navigation links to all major tabs
 * - Quick emergency helpline dialer
 * - Sign Out button with full session purge
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path as any);
  };

  const handleCallHelpline = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() => {
      Alert.alert('Emergency Helpline', `Call ${number} for 24/7 confidential support.`);
    });
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of CecureUs?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          onClose();
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const displayName = user?.name || 'Sainimal GE';
  const displayEmail = user?.email || 'sainimal1ba@gmail.com';
  const displayPhone = user?.phone || '9840893911';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop touch to dismiss */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Drawer Content Panel */}
        <View style={styles.drawerPanel}>
          {/* User Profile Header */}
          <View style={styles.profileSection}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarBadge}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userSubtitle} numberOfLines={1}>
              {displayEmail || displayPhone}
            </Text>

            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusPillText}>Active Member · Verified</Text>
            </View>
          </View>

          {/* Navigation Menu */}
          <ScrollView
            style={styles.menuScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuScrollContent}
          >
            <Text style={styles.sectionHeader}>EXPLORE CECUREUS</Text>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#F0FDFA' }]}>
                <Ionicons name="home-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Home Dashboard</Text>
                <Text style={styles.menuItemSub}>Daily check-in &amp; activity overview</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/ally')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="chatbubbles-outline" size={20} color="#2563EB" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Ally AI Companion</Text>
                <Text style={styles.menuItemSub}>24/7 confidential chat &amp; grounding</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/counsellor')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="calendar-outline" size={20} color="#059669" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Book Counsellor</Text>
                <Text style={styles.menuItemSub}>1-on-1 sessions with psychologists</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/explore')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#FAF5FF' }]}>
                <Ionicons name="clipboard-outline" size={20} color="#7C3AED" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Self-Assessments</Text>
                <Text style={styles.menuItemSub}>PHQ-9, GAD-7, Burnout checks</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('/(tabs)/profile')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="person-outline" size={20} color="#D97706" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>My Profile &amp; Settings</Text>
                <Text style={styles.menuItemSub}>Account details &amp; preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </TouchableOpacity>

            {/* Emergency Crisis Section */}
            <Text style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
              24/7 CRISIS SUPPORT
            </Text>

            <View style={styles.helplineCard}>
              <View style={styles.helplineHeader}>
                <Ionicons name="warning-outline" size={18} color="#DC2626" />
                <Text style={styles.helplineTitle}>Need immediate help?</Text>
              </View>
              <Text style={styles.helplineDesc}>
                Free, confidential, 24/7 government crisis helplines:
              </Text>

              <View style={styles.helplineButtons}>
                <TouchableOpacity
                  style={styles.helplineBtn}
                  onPress={() => handleCallHelpline('14416')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.helplineBtnText}>Tele-MANAS: 14416</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.helplineBtn, { backgroundColor: '#475569' }]}
                  onPress={() => handleCallHelpline('18005990019')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.helplineBtnText}>KIRAN: 1800-599-0019</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Drawer Footer with Logout */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.logoutButtonText}>Sign Out</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>CecureUs v1.0.0 · Production</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  drawerPanel: {
    width: '82%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    borderTopRightRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  profileSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 6,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    fontSize: 18,
  },
  userSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  statusPillText: {
    ...typography.small,
    fontSize: 11,
    color: '#15803D',
    fontWeight: '600',
  },
  menuScroll: {
    flex: 1,
  },
  menuScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.small,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  menuItemSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  helplineCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: spacing.xs,
  },
  helplineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  helplineTitle: {
    ...typography.bodyBold,
    fontSize: 13,
    color: '#991B1B',
    marginLeft: 6,
  },
  helplineDesc: {
    ...typography.small,
    fontSize: 11,
    color: '#7F1D1D',
    marginBottom: spacing.sm,
  },
  helplineButtons: {
    gap: 6,
  },
  helplineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
  },
  helplineBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  drawerFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: '#FAFAFA',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.lg,
    marginBottom: 8,
  },
  logoutButtonText: {
    ...typography.captionBold,
    color: '#DC2626',
  },
  versionText: {
    ...typography.small,
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

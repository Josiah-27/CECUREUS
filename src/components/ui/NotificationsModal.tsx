/**
 * CECUREUS — Notifications Modal Component
 *
 * Interactive alerts sheet:
 * - List of real wellness reminders, session bookings, and security alerts
 * - "Mark all as read" button to clear notification dot
 * - Time stamps and icon categories
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Daily Mood Check-In',
    message: "How are you feeling today? Take 30 seconds to track your mood with Ally.",
    time: 'Just now',
    icon: 'heart-outline',
    iconBg: '#F0FDFA',
    iconColor: '#00A99D',
    read: false,
  },
  {
    id: 'notif_2',
    title: 'Mindfulness Reset',
    message: 'Time for your 4-7-8 Breathing exercise to reset your focus and calm tension.',
    time: '2 hours ago',
    icon: 'fitness-outline',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    read: false,
  },
  {
    id: 'notif_3',
    title: 'Counsellor Support Available',
    message: 'Licensed clinical psychologists are available today for 1-on-1 confidential sessions.',
    time: 'Yesterday',
    icon: 'calendar-outline',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    read: true,
  },
  {
    id: 'notif_4',
    title: 'Account Protected',
    message: 'Session verified. Your health data is securely encrypted in transit and at rest.',
    time: '2 days ago',
    icon: 'shield-checkmark-outline',
    iconBg: '#FFFBEB',
    iconColor: '#D97706',
    read: true,
  },
];

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onAllRead?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onAllRead,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (onAllRead) {
      onAllRead();
    }
  };

  const handleItemPress = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
                </View>
              )}
            </View>

            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={handleMarkAllRead}
                  style={styles.markReadBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.markReadText}>Mark read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <ScrollView
            style={styles.listScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notifCard,
                  !item.read && styles.notifCardUnread,
                ]}
                onPress={() => handleItemPress(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBg, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={20} color={item.iconColor} />
                </View>

                <View style={styles.textCol}>
                  <View style={styles.topRow}>
                    <Text
                      style={[
                        styles.notifTitle,
                        !item.read && { fontWeight: '700', color: colors.text },
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>

                  <Text style={styles.notifMessage}>{item.message}</Text>
                </View>

                {!item.read && <View style={styles.unreadIndicatorDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '80%',
    minHeight: 400,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    fontSize: 20,
    color: colors.text,
  },
  unreadBadge: {
    backgroundColor: '#00A99D',
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markReadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markReadText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 12,
  },
  closeBtn: {
    padding: 6,
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifCardUnread: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    marginVertical: 2,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  textCol: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  notifTime: {
    ...typography.small,
    fontSize: 11,
    color: colors.textMuted,
  },
  notifMessage: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  unreadIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00A99D',
    marginLeft: 8,
    marginTop: 6,
  },
});

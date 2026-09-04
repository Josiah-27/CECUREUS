/**
 * CECUREUS — App Header Component
 *
 * Top bar matching Figma:
 * - Hamburger menu icon on left
 * - CecureUs Brand logo in center
 * - Notification bell with active red badge on right
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { Logo } from './Logo';
import { SideDrawer } from './SideDrawer';
import { NotificationsModal } from './NotificationsModal';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  style,
}) => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <>
      <View style={[styles.container, style]}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => setDrawerOpen(true)}
          >
            <Ionicons name="menu-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        )}

        {title ? (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <Logo size={28} variant="horizontal" />
        )}

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => setNotificationsOpen(true)}
        >
          <View style={styles.bellWrapper}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {hasUnread && <View style={styles.notificationDot} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* Interactive Side Drawer */}
      <SideDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Interactive Notifications Sheet */}
      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onAllRead={() => setHasUnread(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  logoBadgeLetter: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: colors.primary,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  bellWrapper: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});

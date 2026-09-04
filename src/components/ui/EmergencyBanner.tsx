/**
 * CECUREUS — SOS / Emergency Helpline Banner
 *
 * Prominently shown across screens (Counsellors, Profile, Home) in Figma:
 * "If anyone touches you or makes you uncomfortable, get help immediately. 1800 121 9497"
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, borderRadius, spacing } from '../../constants/theme';

interface EmergencyBannerProps {
  style?: ViewStyle;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ style }) => {
  const handleCall = () => {
    Linking.openURL('tel:18001219497').catch(() => {});
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleCall}
      style={[styles.container, style]}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="call-outline" size={22} color={colors.emergencyPhone} />
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>
          If anyone touches you or makes you uncomfortable, get help immediately.
        </Text>
        <Text style={styles.phoneNumber}>1800 121 9497</Text>
        <Text style={styles.subtext}>Available 24/7 · Confidential · Free</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  message: {
    ...typography.captionBold,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.5,
    marginVertical: 2,
  },
  subtext: {
    ...typography.small,
    color: '#64748B',
  },
});

/**
 * CECUREUS — Avatar Component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Image } from 'react-native';
import { colors, borderRadius, typography } from '../../constants/theme';

interface AvatarProps {
  name?: string;
  imageUrl?: string | null;
  size?: number;
  showOnlineDot?: boolean;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  imageUrl,
  size = 48,
  showOnlineDot = false,
  backgroundColor,
  textColor = '#FFFFFF',
  style,
}) => {
  // Generate initials (e.g. "Dr. Neha Sharma" -> "DN" or "Harsha Verma" -> "HV")
  const getInitials = (str: string): string => {
    const clean = str.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '');
    const parts = clean.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  // Deterministic avatar color if not provided
  const getDefaultBg = (str: string): string => {
    if (backgroundColor) return backgroundColor;
    const palette = ['#00A99D', '#F59E0B', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  };

  const bg = getDefaultBg(name);
  const initials = getInitials(name);
  const dotSize = Math.max(size * 0.25, 10);

  return (
    <View style={[{ width: size, height: size, position: 'relative' }, style]}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: textColor,
              fontWeight: '700',
              fontSize: size * 0.38,
            }}
          >
            {initials}
          </Text>
        </View>
      )}
      {showOnlineDot && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: colors.online,
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        />
      )}
    </View>
  );
};

/**
 * CECUREUS — Badge / Tag Component
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../constants/theme';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'purple' | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  style,
  textStyle,
  icon,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: borderRadius.full,
      alignSelf: 'flex-start',
    };

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: colors.primaryMuted };
      case 'success':
        return { ...base, backgroundColor: colors.accentGreenMuted };
      case 'warning':
        return { ...base, backgroundColor: colors.secondaryMuted };
      case 'purple':
        return { ...base, backgroundColor: colors.accentPurpleMuted };
      case 'outline':
        return { ...base, backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border };
      default:
        return { ...base, backgroundColor: colors.surfaceSubtle };
    }
  };

  const getTextStyle = (): TextStyle => {
    let color = colors.textSecondary;

    switch (variant) {
      case 'primary':
        color = colors.primaryDark;
        break;
      case 'success':
        color = colors.accentGreen;
        break;
      case 'warning':
        color = '#B45309';
        break;
      case 'purple':
        color = colors.accentPurple;
        break;
    }

    return {
      ...typography.small,
      fontWeight: '600',
      color,
      marginLeft: icon ? spacing.xs : 0,
    };
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      {icon}
      <Text style={[getTextStyle(), textStyle]}>{label}</Text>
    </View>
  );
};

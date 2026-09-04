/**
 * CECUREUS — Reusable Button Component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'tealOutline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.full,
      opacity: disabled || loading ? 0.6 : 1,
    };

    // Size
    if (size === 'sm') {
      base.paddingVertical = 8;
      base.paddingHorizontal = 16;
    } else if (size === 'lg') {
      base.paddingVertical = 16;
      base.paddingHorizontal = 28;
    } else {
      base.paddingVertical = 12;
      base.paddingHorizontal = 20;
    }

    if (fullWidth) {
      base.width = '100%';
    }

    // Variant
    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: colors.primary };
      case 'secondary':
        return { ...base, backgroundColor: colors.secondary };
      case 'outline':
        return { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border };
      case 'tealOutline':
        return { ...base, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      case 'danger':
        return { ...base, backgroundColor: colors.error };
      default:
        return base;
    }
  };

  const getTextStyle = (): TextStyle => {
    let color = colors.textInverse;

    if (variant === 'outline') color = colors.textSecondary;
    if (variant === 'tealOutline') color = colors.primary;
    if (variant === 'ghost') color = colors.primary;

    const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;

    return {
      fontSize,
      fontWeight: '600',
      color,
      marginHorizontal: leftIcon || rightIcon ? spacing.xs : 0,
    };
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'tealOutline' ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

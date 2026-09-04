/**
 * CECUREUS — Official Brand Logo Component
 *
 * Uses the official transparent CecureUs brand image asset directly:
 * - Top dual-swoosh ribbon icon (Turquoise Cyan + Golden Amber)
 * - Wordmark: "Cecure" + "Us"
 */

import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';

const LOGO_FULL = require('../../../assets/images/cecureus_logo.png');
const LOGO_ICON = require('../../../assets/images/cecureus_icon.png');

export interface LogoProps {
  size?: number;
  variant?: 'icon' | 'horizontal' | 'vertical';
  showText?: boolean;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

export const Logo: React.FC<LogoProps> = ({
  size = 48,
  variant = 'horizontal',
  showText = true,
  style,
  imageStyle,
}) => {
  const isIconOnly = variant === 'icon' || !showText;

  if (isIconOnly) {
    // Aspect ratio of icon is ~ 50 x 62 (width:height ~ 0.8)
    const iconHeight = size;
    const iconWidth = Math.round(size * 0.8);

    return (
      <View style={[styles.container, style]}>
        <Image
          source={LOGO_ICON}
          style={[{ width: iconWidth, height: iconHeight }, imageStyle]}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Aspect ratio of full logo is ~ 107 x 92 (width:height ~ 1.16)
  const fullHeight = size;
  const fullWidth = Math.round(size * 1.16);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={LOGO_FULL}
        style={[{ width: fullWidth, height: fullHeight }, imageStyle]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

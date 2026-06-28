import React, { type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../theme';

type CardProps = {
  children: ReactNode;
  /** When provided the whole card becomes pressable. */
  onPress?: () => void;
  style?: ViewStyle;
  /** Removes inner padding for cards that manage their own sections. */
  flush?: boolean;
};

/**
 * Bordered surface with consistent radius and padding. Use for list rows and
 * grouped content so cards share one shape across screens.
 */
export function Card({
  children,
  onPress,
  style,
  flush = false,
}: CardProps): React.JSX.Element {
  const cardStyle = [styles.card, flush ? styles.flush : styles.padded, style];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  padded: {
    padding: spacing.lg,
  },
  flush: {
    padding: 0,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});

import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { spacing } from '../theme';

type RowProps = {
  children: ReactNode;
  justify?: ViewStyle['justifyContent'];
  align?: ViewStyle['alignItems'];
  gap?: number;
  style?: ViewStyle;
};

/**
 * Horizontal flex container with a default gap. Use for side-by-side fields
 * (price + rating), header rows (title / date), and footer rows (summary /
 * total) so horizontal alignment is consistent instead of per-file flexbox.
 */
export function Row({
  children,
  justify = 'flex-start',
  align = 'center',
  gap = spacing.md,
  style,
}: RowProps): React.JSX.Element {
  return (
    <View
      style={[
        styles.row,
        { justifyContent: justify, alignItems: align, gap },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
});

import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screen } from '../theme';

type ScreenContainerProps = {
  children: ReactNode;
  /** Apply the standard screen edge padding (horizontal + top). */
  padded?: boolean;
  style?: ViewStyle;
};

export function ScreenContainer({
  children,
  padded = false,
  style,
}: ScreenContainerProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        padded && {
          paddingTop: insets.top + screen.paddingTop,
          paddingLeft: insets.left + screen.paddingHorizontal,
          paddingRight: insets.right + screen.paddingHorizontal,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});

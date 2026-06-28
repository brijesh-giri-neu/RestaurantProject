import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screen, spacing } from '../theme';

type FormScreenProps = {
  children: ReactNode;
  /**
   * Center the content vertically when it fits, while still allowing it to
   * scroll once it grows past the viewport (e.g. keyboard open, long errors).
   */
  center?: boolean;
  contentContainerStyle?: ViewStyle;
};

/**
 * Screen wrapper for forms. Combines safe-area insets, a scroll view, and
 * keyboard avoidance so the focused field and the submit button always stay
 * reachable instead of hiding behind the keyboard.
 */
export function FormScreen({
  children,
  center = false,
  contentContainerStyle,
}: FormScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          center && styles.centered,
          {
            paddingTop: insets.top + screen.paddingTop,
            paddingBottom: insets.bottom + spacing.xl,
          },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: screen.paddingHorizontal,
  },
  centered: {
    justifyContent: 'center',
  },
  inner: {
    gap: spacing.lg,
  },
});

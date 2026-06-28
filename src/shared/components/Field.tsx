import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing, typography } from '../theme';

type FieldProps = TextInputProps & {
  /** Optional label shown above the input. */
  label?: string;
  /** Inline validation message shown below the input. */
  error?: string;
  containerStyle?: ViewStyle;
};

/**
 * Labeled text input with consistent spacing and an inline error slot, so every
 * form field aligns the same way instead of re-styling a bare TextInput.
 */
export const Field = forwardRef<TextInput, FieldProps>(function FieldInput(
  { label, error, style, containerStyle, multiline, ...rest },
  ref,
) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          multiline && styles.multiline,
          !!error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    fontSize: typography.body.fontSize,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: typography.caption.fontSize,
  },
});

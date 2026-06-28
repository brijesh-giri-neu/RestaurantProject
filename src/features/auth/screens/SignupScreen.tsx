import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthProvider';
import { signupSchema, type SignupFormValues } from '../validation/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormScreen, Field } from '../../../shared/components';
import { colors, radii, spacing, typography } from '../../../shared/theme';

type SignupScreenProps = {
  onNavigateToLogin?: () => void;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function SignupScreen({ onNavigateToLogin }: SignupScreenProps): React.JSX.Element {
  const { signUp } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAuthError(null);
    setInfoMessage(null);
    try {
      await signUp(values.email, values.password);
      setInfoMessage('Account created. Check your email if confirmation is required.');
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  });

  return (
    <FormScreen center>
      <Text style={styles.title}>Create account</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Field
            label="Email"
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Field
            label="Password"
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <Field
            label="Confirm password"
            placeholder="Confirm password"
            secureTextEntry
            autoCapitalize="none"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      {authError ? <Text style={styles.authError}>{authError}</Text> : null}
      {infoMessage ? <Text style={styles.info}>{infoMessage}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          isSubmitting && styles.buttonDisabled,
        ]}
        onPress={onSubmit}
        disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Create account</Text>
        )}
      </Pressable>

      <Pressable onPress={onNavigateToLogin} disabled={!onNavigateToLogin}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
  },
  authError: {
    ...typography.secondary,
    color: colors.error,
  },
  info: {
    ...typography.secondary,
    color: colors.success,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.sectionTitle,
    color: colors.onPrimary,
  },
  link: {
    ...typography.secondary,
    color: colors.primary,
    textAlign: 'center',
  },
});

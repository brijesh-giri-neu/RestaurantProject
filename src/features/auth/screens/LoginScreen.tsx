import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthProvider';
import { loginSchema, type LoginFormValues } from '../validation/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormScreen, Field } from '../../../shared/components';
import { colors, radii, spacing, typography } from '../../../shared/theme';

type LoginScreenProps = {
  onNavigateToSignup?: () => void;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function LoginScreen({ onNavigateToSignup }: LoginScreenProps): React.JSX.Element {
  const { signIn } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setAuthError(null);
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  });

  return (
    <FormScreen center>
      <Text style={styles.title}>Log in</Text>

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

      {authError ? <Text style={styles.authError}>{authError}</Text> : null}

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
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

      <Pressable onPress={onNavigateToSignup} disabled={!onNavigateToSignup}>
        <Text style={styles.link}>Need an account? Sign up</Text>
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

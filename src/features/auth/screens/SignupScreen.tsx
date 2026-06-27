import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthProvider';
import { signupSchema, type SignupFormValues } from '../validation/authSchema';
import { zodResolver } from '@hookform/resolvers/zod';

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
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
      />
      {errors.email ? <Text style={styles.fieldError}>{errors.email.message}</Text> : null}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
      />
      {errors.password ? (
        <Text style={styles.fieldError}>{errors.password.message}</Text>
      ) : null}

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            secureTextEntry
            autoCapitalize="none"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
      />
      {errors.confirmPassword ? (
        <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text>
      ) : null}

      {authError ? <Text style={styles.authError}>{authError}</Text> : null}
      {infoMessage ? <Text style={styles.info}>{infoMessage}</Text> : null}

      <Pressable
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create account</Text>
        )}
      </Pressable>

      <Pressable onPress={onNavigateToLogin} disabled={!onNavigateToLogin}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  fieldError: {
    color: '#c0392b',
    fontSize: 13,
  },
  authError: {
    color: '#c0392b',
    fontSize: 14,
    marginVertical: 4,
  },
  info: {
    color: '#1e7e34',
    fontSize: 14,
    marginVertical: 4,
  },
  button: {
    backgroundColor: '#2d6cdf',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#2d6cdf',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 15,
  },
});

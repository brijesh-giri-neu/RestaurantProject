import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/types';
import { ScreenContainer, Card } from '../../../shared/components';
import { colors, radii, spacing, typography } from '../../../shared/theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

type HomeAction = {
  key: string;
  label: string;
  helper: string;
  onPress: () => void;
};

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const primaryAction: HomeAction = {
    key: 'add-visit',
    label: 'Add a visit',
    helper: 'Log a restaurant and what you ordered.',
    onPress: () => navigation.navigate('AddVisit'),
  };

  const secondaryActions: HomeAction[] = [
    {
      key: 'browse-visits',
      label: 'Browse past visits',
      helper: 'See everywhere you have eaten.',
      onPress: () => navigation.navigate('BrowseVisits'),
    },
    {
      key: 'lookup',
      label: 'Lookup by restaurant',
      helper: 'Find what you ordered at a place.',
      onPress: () => navigation.navigate('Lookup'),
    },
  ];

  return (
    <ScreenContainer padded>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurant Log</Text>
        <Text style={styles.subtitle}>
          Log where you ate and what you ordered.
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          key={primaryAction.key}
          onPress={primaryAction.onPress}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
          ]}>
          <Text style={styles.primaryLabel}>{primaryAction.label}</Text>
          <Text style={styles.primaryHelper}>{primaryAction.helper}</Text>
        </Pressable>

        {secondaryActions.map((action) => (
          <Card key={action.key} onPress={action.onPress}>
            <Text style={styles.cardLabel}>{action.label}</Text>
            <Text style={styles.cardHelper}>{action.helper}</Text>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  subtitle: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryLabel: {
    ...typography.sectionTitle,
    color: colors.onPrimary,
  },
  primaryHelper: {
    ...typography.secondary,
    color: colors.onPrimary,
    marginTop: spacing.xs,
  },
  cardLabel: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  cardHelper: {
    ...typography.secondary,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

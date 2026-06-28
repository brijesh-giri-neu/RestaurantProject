import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { PlaceCandidate } from '../../../services/places';
import { Card, Row } from '../../../shared/components';
import { colors, spacing, typography } from '../../../shared/theme';

type RestaurantSuggestionListProps = {
  candidates: PlaceCandidate[];
  loading: boolean;
  onSelect: (candidate: PlaceCandidate) => void;
};

export function RestaurantSuggestionList({
  candidates,
  loading,
  onSelect,
}: RestaurantSuggestionListProps): React.JSX.Element | null {
  if (loading) {
    return (
      <Row gap={spacing.sm}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.statusText}>Finding nearby restaurants…</Text>
      </Row>
    );
  }

  if (candidates.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nearby restaurants</Text>
      {candidates.map((candidate, index) => (
        <Card
          key={candidate.osmId ?? `${candidate.name}-${index}`}
          onPress={() => onSelect(candidate)}
          style={styles.item}>
          <Text style={styles.itemName}>{candidate.name}</Text>
          {candidate.address ? (
            <Text style={styles.itemAddress}>{candidate.address}</Text>
          ) : null}
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  heading: {
    ...typography.secondary,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusText: {
    ...typography.secondary,
    color: colors.textSecondary,
  },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderColor: colors.accentBorder,
    backgroundColor: colors.accentSurface,
    gap: spacing.xs,
  },
  itemName: {
    ...typography.secondary,
    fontWeight: '600',
    color: colors.text,
  },
  itemAddress: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

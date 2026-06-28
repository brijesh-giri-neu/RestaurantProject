import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import {
  Controller,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import type { VisitFormValues } from '../validation/visitSchema';
import { Card, Field, Row } from '../../../shared/components';
import { colors, hitSlop, spacing, typography } from '../../../shared/theme';

type ItemErrors = NonNullable<FieldErrors<VisitFormValues>['items']>[number];

type OrderedItemRowProps = {
  control: Control<VisitFormValues>;
  index: number;
  errors?: ItemErrors;
  onRemove: () => void;
  removable: boolean;
};

function parseNumber(text: string): number | undefined {
  const trimmed = text.trim();
  if (trimmed === '') {
    return undefined;
  }
  const value = Number(trimmed);
  return Number.isNaN(value) ? undefined : value;
}

function toText(value: number | undefined): string {
  return value == null ? '' : String(value);
}

export function OrderedItemRow({
  control,
  index,
  errors,
  onRemove,
  removable,
}: OrderedItemRowProps): React.JSX.Element {
  return (
    <Card style={styles.card}>
      <Row justify="space-between">
        <Text style={styles.itemLabel}>Item {index + 1}</Text>
        {removable ? (
          <Pressable onPress={onRemove} hitSlop={hitSlop}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        ) : null}
      </Row>

      <Controller
        control={control}
        name={`items.${index}.name`}
        render={({ field: { onChange, onBlur, value } }) => (
          <Field
            label="Name"
            placeholder="Name"
            error={errors?.name?.message}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value ?? ''}
          />
        )}
      />

      <Row align="flex-start">
        <Controller
          control={control}
          name={`items.${index}.price`}
          render={({ field: { onChange, onBlur, value } }) => (
            <Field
              containerStyle={styles.flex}
              label="Price"
              placeholder="Optional"
              keyboardType="decimal-pad"
              error={errors?.price?.message}
              onChangeText={(text) => onChange(parseNumber(text))}
              onBlur={onBlur}
              value={toText(value)}
            />
          )}
        />
        <Controller
          control={control}
          name={`items.${index}.rating`}
          render={({ field: { onChange, onBlur, value } }) => (
            <Field
              containerStyle={styles.flex}
              label="Rating 1-5"
              placeholder="Optional"
              keyboardType="number-pad"
              error={errors?.rating?.message}
              onChangeText={(text) => onChange(parseNumber(text))}
              onBlur={onBlur}
              value={toText(value)}
            />
          )}
        />
      </Row>

      <Controller
        control={control}
        name={`items.${index}.notes`}
        render={({ field: { onChange, onBlur, value } }) => (
          <Field
            label="Notes"
            placeholder="Notes (optional)"
            multiline
            onChangeText={onChange}
            onBlur={onBlur}
            value={value ?? ''}
          />
        )}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  flex: {
    flex: 1,
  },
  itemLabel: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  remove: {
    ...typography.secondary,
    fontWeight: '600',
    color: colors.error,
  },
});

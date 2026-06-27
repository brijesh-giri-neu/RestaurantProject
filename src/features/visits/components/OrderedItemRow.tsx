import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  Controller,
  type Control,
  type FieldErrors,
} from 'react-hook-form';
import type { VisitFormValues } from '../validation/visitSchema';

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
    <View style={styles.row}>
      <View style={styles.headerRow}>
        <Text style={styles.itemLabel}>Item {index + 1}</Text>
        {removable ? (
          <Pressable onPress={onRemove} hitSlop={8}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        ) : null}
      </View>

      <Controller
        control={control}
        name={`items.${index}.name`}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Name"
            onChangeText={onChange}
            onBlur={onBlur}
            value={value ?? ''}
          />
        )}
      />
      {errors?.name ? (
        <Text style={styles.fieldError}>{errors.name.message}</Text>
      ) : null}

      <Controller
        control={control}
        name={`items.${index}.price`}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Price (optional)"
            keyboardType="decimal-pad"
            onChangeText={(text) => onChange(parseNumber(text))}
            onBlur={onBlur}
            value={toText(value)}
          />
        )}
      />
      {errors?.price ? (
        <Text style={styles.fieldError}>{errors.price.message}</Text>
      ) : null}

      <Controller
        control={control}
        name={`items.${index}.rating`}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Rating 1-5 (optional)"
            keyboardType="number-pad"
            onChangeText={(text) => onChange(parseNumber(text))}
            onBlur={onBlur}
            value={toText(value)}
          />
        )}
      />
      {errors?.rating ? (
        <Text style={styles.fieldError}>{errors.rating.message}</Text>
      ) : null}

      <Controller
        control={control}
        name={`items.${index}.notes`}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Notes (optional)"
            multiline
            onChangeText={onChange}
            onBlur={onBlur}
            value={value ?? ''}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    backgroundColor: '#fafafa',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  remove: {
    color: '#c0392b',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  fieldError: {
    color: '#c0392b',
    fontSize: 13,
  },
});

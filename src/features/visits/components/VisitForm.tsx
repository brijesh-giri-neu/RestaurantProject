import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormScreen, Field, Row } from '../../../shared/components';
import {
  colors,
  hitSlop,
  radii,
  spacing,
  typography,
} from '../../../shared/theme';
import type { PlaceCandidate } from '../../../services/places';
import { visitSchema, type VisitFormValues } from '../validation/visitSchema';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useNearbyRestaurants } from '../hooks/useNearbyRestaurants';
import { OrderedItemRow } from './OrderedItemRow';
import { RestaurantSuggestionList } from './RestaurantSuggestionList';

const emptyItem = { name: '', price: undefined, rating: undefined, notes: undefined };

export const defaultVisitFormValues: VisitFormValues = {
  restaurant: {
    name: '',
    latitude: 0,
    longitude: 0,
    address: undefined,
    osmId: undefined,
    source: 'manual',
  },
  items: [{ ...emptyItem }],
  notes: undefined,
};

type VisitFormProps = {
  title: string;
  submitLabel: string;
  initialValues: VisitFormValues;
  /**
   * Whether the restaurant section is editable. When `false` (edit mode) the
   * restaurant name is shown read-only and GPS/nearby suggestions are skipped.
   */
  restaurantEditable: boolean;
  saving: boolean;
  saveError: string | null;
  onSubmit: (values: VisitFormValues) => void | Promise<void>;
  /** Optional content rendered below the submit button (e.g. a Delete action). */
  footer?: React.ReactNode;
};

export function VisitForm({
  title,
  submitLabel,
  initialValues,
  restaurantEditable,
  saving,
  saveError,
  onSubmit,
  footer,
}: VisitFormProps): React.JSX.Element {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // Keep the form in sync when initial values arrive/change (e.g. async load
  // in edit mode).
  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <FormScreen>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restaurant</Text>
        {restaurantEditable ? (
          <EditableRestaurant
            control={control}
            setValue={setValue}
            getValues={getValues}
            errors={errors}
          />
        ) : (
          <Controller
            control={control}
            name="restaurant.name"
            render={({ field: { value } }) => (
              <Text style={styles.readOnly}>{value}</Text>
            )}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ordered items</Text>
        {fields.map((field, index) => (
          <OrderedItemRow
            key={field.id}
            control={control}
            index={index}
            errors={errors.items?.[index]}
            onRemove={() => remove(index)}
            removable={fields.length > 1}
          />
        ))}
        {typeof errors.items?.message === 'string' ? (
          <Text style={styles.fieldError}>{errors.items.message}</Text>
        ) : null}

        <Pressable
          style={styles.secondaryButton}
          onPress={() => append({ ...emptyItem })}>
          <Text style={styles.secondaryButtonText}>+ Add item</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visit notes</Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <Field
              placeholder="Notes (optional)"
              multiline
              onChangeText={onChange}
              onBlur={onBlur}
              value={value ?? ''}
            />
          )}
        />
      </View>

      {saveError ? <Text style={styles.authError}>{saveError}</Text> : null}

      <Pressable
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={submit}
        disabled={saving}>
        {saving ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>{submitLabel}</Text>
        )}
      </Pressable>

      {footer}
    </FormScreen>
  );
}

type EditableRestaurantProps = {
  control: ReturnType<typeof useForm<VisitFormValues>>['control'];
  setValue: ReturnType<typeof useForm<VisitFormValues>>['setValue'];
  getValues: ReturnType<typeof useForm<VisitFormValues>>['getValues'];
  errors: ReturnType<typeof useForm<VisitFormValues>>['formState']['errors'];
};

/**
 * Restaurant picker used in add mode: pulls the GPS fix and nearby OSM
 * suggestions, and lets the user type a manual name.
 */
function EditableRestaurant({
  control,
  setValue,
  getValues,
  errors,
}: EditableRestaurantProps): React.JSX.Element {
  const { coords, loading: locationLoading, error: locationError, refresh } =
    useCurrentLocation();
  const { candidates, loading: candidatesLoading } = useNearbyRestaurants(coords);
  const [coordsApplied, setCoordsApplied] = useState<boolean>(false);

  // Fill GPS coordinates into the form once a fix is available.
  useEffect(() => {
    if (coords && !coordsApplied) {
      setValue('restaurant.latitude', coords.latitude, { shouldValidate: false });
      setValue('restaurant.longitude', coords.longitude, { shouldValidate: false });
      setCoordsApplied(true);
    }
  }, [coords, coordsApplied, setValue]);

  const handleSelectSuggestion = (candidate: PlaceCandidate): void => {
    setValue('restaurant.name', candidate.name, { shouldValidate: true });
    setValue('restaurant.latitude', candidate.latitude, { shouldValidate: false });
    setValue('restaurant.longitude', candidate.longitude, { shouldValidate: false });
    setValue('restaurant.osmId', candidate.osmId, { shouldValidate: false });
    setValue('restaurant.address', candidate.address, { shouldValidate: false });
    setValue('restaurant.source', 'osm', { shouldValidate: false });
  };

  return (
    <>
      {locationLoading ? (
        <Row gap={spacing.sm}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.statusText}>Getting your location…</Text>
        </Row>
      ) : null}

      {locationError ? (
        <Row gap={spacing.sm}>
          <Text style={styles.warning}>{locationError}</Text>
          <Pressable onPress={refresh} hitSlop={hitSlop}>
            <Text style={styles.link}>Retry</Text>
          </Pressable>
        </Row>
      ) : null}

      <Controller
        control={control}
        name="restaurant.name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Field
            placeholder="Restaurant name"
            error={errors.restaurant?.name?.message}
            onChangeText={(text) => {
              onChange(text);
              // Manual edit => source manual; OSM linkage cleared.
              if (getValues('restaurant.source') !== 'manual') {
                setValue('restaurant.source', 'manual');
                setValue('restaurant.osmId', undefined);
              }
            }}
            onBlur={onBlur}
            value={value ?? ''}
          />
        )}
      />
      {errors.restaurant?.latitude || errors.restaurant?.longitude ? (
        <Text style={styles.fieldError}>
          A GPS location is required. Tap Retry to fetch it.
        </Text>
      ) : null}

      <RestaurantSuggestionList
        candidates={candidates}
        loading={candidatesLoading}
        onSelect={handleSelectSuggestion}
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.text,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  statusText: {
    ...typography.secondary,
    color: colors.textSecondary,
  },
  warning: {
    ...typography.secondary,
    color: colors.warning,
    flexShrink: 1,
  },
  readOnly: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  fieldError: {
    ...typography.caption,
    color: colors.error,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.secondary,
    fontWeight: '600',
    color: colors.primary,
  },
  link: {
    ...typography.secondary,
    fontWeight: '600',
    color: colors.primary,
  },
});

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
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
};

export function VisitForm({
  title,
  submitLabel,
  initialValues,
  restaurantEditable,
  saving,
  saveError,
  onSubmit,
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
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
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

        {saveError ? <Text style={styles.authError}>{saveError}</Text> : null}

        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={submit}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{submitLabel}</Text>
          )}
        </Pressable>
      </ScrollView>
    </ScreenContainer>
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
        <View style={styles.statusRow}>
          <ActivityIndicator color="#2d6cdf" />
          <Text style={styles.statusText}>Getting your location…</Text>
        </View>
      ) : null}

      {locationError ? (
        <View style={styles.statusRow}>
          <Text style={styles.warning}>{locationError}</Text>
          <Pressable onPress={refresh} hitSlop={8}>
            <Text style={styles.link}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <Controller
        control={control}
        name="restaurant.name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Restaurant name"
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
      {errors.restaurant?.name ? (
        <Text style={styles.fieldError}>{errors.restaurant.name.message}</Text>
      ) : null}
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
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#555',
    fontSize: 14,
  },
  warning: {
    color: '#b9770e',
    fontSize: 14,
    flexShrink: 1,
  },
  readOnly: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  fieldError: {
    color: '#c0392b',
    fontSize: 13,
  },
  authError: {
    color: '#c0392b',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2d6cdf',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2d6cdf',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2d6cdf',
    fontSize: 15,
    fontWeight: '600',
  },
  link: {
    color: '#2d6cdf',
    fontSize: 14,
    fontWeight: '600',
  },
});

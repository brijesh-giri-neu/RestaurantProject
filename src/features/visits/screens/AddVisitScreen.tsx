import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import type { AppStackParamList } from '../../../app/navigation/types';
import type { PlaceCandidate } from '../../../services/places';
import type { AddVisitPayload } from '../../../data';
import { visitSchema, type VisitFormValues } from '../validation/visitSchema';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useNearbyRestaurants } from '../hooks/useNearbyRestaurants';
import { useAddVisit } from '../hooks/useAddVisit';
import { OrderedItemRow } from '../components/OrderedItemRow';
import { RestaurantSuggestionList } from '../components/RestaurantSuggestionList';

type AddVisitScreenProps = NativeStackScreenProps<AppStackParamList, 'AddVisit'>;

const emptyItem = { name: '', price: undefined, rating: undefined, notes: undefined };

const defaultValues: VisitFormValues = {
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

function toPayload(values: VisitFormValues): AddVisitPayload {
  const restaurant: AddVisitPayload['restaurant'] = {
    name: values.restaurant.name,
    latitude: values.restaurant.latitude,
    longitude: values.restaurant.longitude,
    source: values.restaurant.source,
  };
  if (values.restaurant.address) {
    restaurant.address = values.restaurant.address;
  }
  if (values.restaurant.osmId) {
    restaurant.osmId = values.restaurant.osmId;
  }

  const items: AddVisitPayload['items'] = values.items.map((item) => {
    const next: AddVisitPayload['items'][number] = { name: item.name };
    if (item.price != null) {
      next.price = item.price;
    }
    if (item.rating != null) {
      next.rating = item.rating;
    }
    if (item.notes) {
      next.notes = item.notes;
    }
    return next;
  });

  const payload: AddVisitPayload = { restaurant, items };
  if (values.notes) {
    payload.notes = values.notes;
  }
  return payload;
}

export function AddVisitScreen({
  navigation,
}: AddVisitScreenProps): React.JSX.Element {
  const { coords, loading: locationLoading, error: locationError, refresh } =
    useCurrentLocation();
  const { candidates, loading: candidatesLoading } = useNearbyRestaurants(coords);
  const { submit, saving, error: saveError } = useAddVisit();
  const [coordsApplied, setCoordsApplied] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

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

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submit(toPayload(values));
      Alert.alert('Visit saved', 'Your visit was recorded.');
      navigation.navigate('Lookup');
    } catch {
      // error surfaced via saveError below
    }
  });

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add Visit</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Restaurant</Text>

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
          onPress={onSubmit}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save visit</Text>
          )}
        </Pressable>
      </ScrollView>
    </ScreenContainer>
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

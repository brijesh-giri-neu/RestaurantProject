import React from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/types';
import type { AddVisitPayload } from '../../../data';
import type { VisitFormValues } from '../validation/visitSchema';
import { useAddVisit } from '../hooks/useAddVisit';
import { VisitForm, defaultVisitFormValues } from '../components/VisitForm';

type AddVisitScreenProps = NativeStackScreenProps<AppStackParamList, 'AddVisit'>;

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
  const { submit, saving, error: saveError } = useAddVisit();

  const onSubmit = async (values: VisitFormValues): Promise<void> => {
    try {
      await submit(toPayload(values));
      Alert.alert('Visit saved', 'Your visit was recorded.');
      navigation.navigate('Lookup');
    } catch {
      // error surfaced via saveError below
    }
  };

  return (
    <VisitForm
      title="Add Visit"
      submitLabel="Save visit"
      initialValues={defaultVisitFormValues}
      restaurantEditable
      saving={saving}
      saveError={saveError}
      onSubmit={onSubmit}
    />
  );
}

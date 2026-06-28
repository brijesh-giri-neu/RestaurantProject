import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import type { AppStackParamList } from '../../../app/navigation/types';
import type { VisitWithContext } from '../../../data/visits';
import { getVisit } from '../../../data/visits';
import { updateVisitWithItems } from '../../../data/updateVisitWithItems';
import type { VisitFormValues } from '../validation/visitSchema';
import { VisitForm } from '../components/VisitForm';

type EditVisitScreenProps = NativeStackScreenProps<AppStackParamList, 'EditVisit'>;

function toFormValues(data: VisitWithContext): VisitFormValues {
  const { visit, restaurant, items } = data;
  return {
    restaurant: {
      name: restaurant.name,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      address: restaurant.address,
      osmId: restaurant.osmId,
      source: restaurant.source,
    },
    items:
      items.length > 0
        ? items.map((item) => ({
            name: item.name,
            price: item.price,
            rating: item.rating,
            notes: item.notes,
          }))
        : [{ name: '', price: undefined, rating: undefined, notes: undefined }],
    notes: visit.notes,
  };
}

function toUpdatePayload(values: VisitFormValues): {
  visitedAt?: string;
  notes?: string;
  items: Array<{ name: string; price?: number; rating?: number; notes?: string }>;
} {
  const items = values.items.map((item) => {
    const next: { name: string; price?: number; rating?: number; notes?: string } = {
      name: item.name,
    };
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

  const payload: {
    visitedAt?: string;
    notes?: string;
    items: Array<{ name: string; price?: number; rating?: number; notes?: string }>;
  } = { items };
  if (values.notes) {
    payload.notes = values.notes;
  }
  return payload;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function EditVisitScreen({
  route,
  navigation,
}: EditVisitScreenProps): React.JSX.Element {
  const { visitId } = route.params;

  const [initialValues, setInitialValues] = useState<VisitFormValues | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getVisit(visitId);
      setInitialValues(toFormValues(data));
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = async (values: VisitFormValues): Promise<void> => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateVisitWithItems(visitId, toUpdatePayload(values));
      Alert.alert('Visit updated', 'Your changes were saved.');
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('BrowseVisits');
      }
    } catch (err) {
      setSaveError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <ActivityIndicator color="#2d6cdf" />
          <Text style={styles.statusText}>Loading visit…</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (loadError || !initialValues) {
    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.error}>{loadError ?? 'Visit not found.'}</Text>
          <Pressable onPress={() => void load()} hitSlop={8}>
            <Text style={styles.link}>Retry</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <VisitForm
      title="Edit Visit"
      submitLabel="Save changes"
      initialValues={initialValues}
      restaurantEditable={false}
      saving={saving}
      saveError={saveError}
      onSubmit={onSubmit}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  statusText: {
    color: '#555',
    fontSize: 14,
  },
  error: {
    color: '#c0392b',
    fontSize: 15,
    textAlign: 'center',
  },
  link: {
    color: '#2d6cdf',
    fontSize: 15,
    fontWeight: '600',
  },
});

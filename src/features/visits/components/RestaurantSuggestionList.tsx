import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { PlaceCandidate } from '../../../services/places';

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
      <View style={styles.statusRow}>
        <ActivityIndicator color="#2d6cdf" />
        <Text style={styles.statusText}>Finding nearby restaurants…</Text>
      </View>
    );
  }

  if (candidates.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nearby restaurants</Text>
      {candidates.map((candidate, index) => (
        <Pressable
          key={candidate.osmId ?? `${candidate.name}-${index}`}
          style={styles.item}
          onPress={() => onSelect(candidate)}>
          <Text style={styles.itemName}>{candidate.name}</Text>
          {candidate.address ? (
            <Text style={styles.itemAddress}>{candidate.address}</Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  heading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
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
  item: {
    borderWidth: 1,
    borderColor: '#d6e0f5',
    backgroundColor: '#f3f7ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  itemAddress: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/types';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import {
  useRestaurantHistory,
  type VisitHistoryRow,
} from '../hooks/useRestaurantHistory';
import type { OrderedItem, Restaurant } from '../../../data';

type Props = NativeStackScreenProps<AppStackParamList, 'Lookup'>;

const END_REACHED_THRESHOLD = 0.5;

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPrice(price?: number): string | null {
  if (price == null) {
    return null;
  }
  return `$${price.toFixed(2)}`;
}

function formatRating(rating?: number): string | null {
  if (rating == null) {
    return null;
  }
  return `${rating}★`;
}

function ListFooterSpinner({ loading }: { loading: boolean }): React.JSX.Element | null {
  if (!loading) {
    return null;
  }
  return (
    <View style={styles.footer}>
      <ActivityIndicator />
    </View>
  );
}

function OrderedItemRow({ item }: { item: OrderedItem }): React.JSX.Element {
  const price = formatPrice(item.price);
  const rating = formatRating(item.rating);
  return (
    <View style={styles.itemRow}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.itemMeta}>
        {price ? <Text style={styles.itemMetaText}>{price}</Text> : null}
        {rating ? <Text style={styles.itemMetaText}>{rating}</Text> : null}
      </View>
    </View>
  );
}

function VisitCard({ entry }: { entry: VisitHistoryRow }): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const itemCount = entry.items.length;

  return (
    <View style={styles.visitCard}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.visitHeader}>
        <View style={styles.visitHeaderText}>
          <Text style={styles.visitDate}>{formatDate(entry.visit.visitedAt)}</Text>
          <Text style={styles.visitSubtitle}>
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
      </Pressable>
      {expanded ? (
        <View style={styles.visitItems}>
          {itemCount === 0 ? (
            <Text style={styles.emptyInline}>No items recorded for this visit.</Text>
          ) : (
            entry.items.map((item) => <OrderedItemRow key={item.id} item={item} />)
          )}
          {entry.visit.notes ? (
            <Text style={styles.visitNotes}>{entry.visit.notes}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function LookupScreen(_props: Props): React.JSX.Element {
  const {
    search,
    setSearch,
    restaurants,
    restaurantsLoading,
    restaurantsLoadingMore,
    restaurantsRefreshing,
    loadMoreRestaurants,
    refreshRestaurants,
    selectedId,
    selectRestaurant,
    clearSelection,
    history,
    historyLoading,
    historyLoadingMore,
    historyRefreshing,
    loadMoreHistory,
    refreshHistory,
  } = useRestaurantHistory();

  // Refresh on focus so newly added visits/restaurants appear.
  useFocusEffect(
    useCallback(() => {
      void refreshRestaurants();
      if (selectedId) {
        void refreshHistory();
      }
      // selectedId intentionally read at focus time; refresh fns are stable.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshRestaurants, refreshHistory, selectedId]),
  );

  const selectedRestaurant = restaurants.find((r) => r.id === selectedId);

  const renderRestaurant = useCallback(
    ({ item }: { item: Restaurant }) => (
      <Pressable
        onPress={() => selectRestaurant(item.id)}
        style={styles.restaurantRow}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        {item.address ? (
          <Text style={styles.restaurantAddress} numberOfLines={1}>
            {item.address}
          </Text>
        ) : null}
      </Pressable>
    ),
    [selectRestaurant],
  );

  const renderVisit = useCallback(
    ({ item }: { item: VisitHistoryRow }) => <VisitCard entry={item} />,
    [],
  );

  // --- History view (a restaurant is selected) ---
  if (selectedId) {
    return (
      <ScreenContainer style={styles.container}>
        <View style={styles.historyHeader}>
          <Pressable onPress={clearSelection} hitSlop={8}>
            <Text style={styles.backLink}>‹ Restaurants</Text>
          </Pressable>
          <Text style={styles.historyTitle} numberOfLines={1}>
            {selectedRestaurant?.name ?? 'Visits'}
          </Text>
        </View>
        {historyLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(entry) => entry.visit.id}
            renderItem={renderVisit}
            onEndReached={() => {
              void loadMoreHistory();
            }}
            onEndReachedThreshold={END_REACHED_THRESHOLD}
            onRefresh={() => {
              void refreshHistory();
            }}
            refreshing={historyRefreshing}
            contentContainerStyle={
              history.length === 0 ? styles.emptyContent : styles.listContent
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No visits recorded for this restaurant yet.
              </Text>
            }
            ListFooterComponent={<ListFooterSpinner loading={historyLoadingMore} />}
          />
        )}
      </ScreenContainer>
    );
  }

  // --- Restaurant list view ---
  return (
    <ScreenContainer style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search restaurants"
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {restaurantsLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          onEndReached={() => {
            void loadMoreRestaurants();
          }}
          onEndReachedThreshold={END_REACHED_THRESHOLD}
          onRefresh={() => {
            void refreshRestaurants();
          }}
          refreshing={restaurantsRefreshing}
          contentContainerStyle={
            restaurants.length === 0 ? styles.emptyContent : styles.listContent
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {search
                ? 'No restaurants match your search.'
                : 'No restaurants yet. Add a visit to get started.'}
            </Text>
          }
          ListFooterComponent={<ListFooterSpinner loading={restaurantsLoadingMore} />}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
  },
  emptyInline: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  footer: {
    paddingVertical: 16,
  },
  restaurantRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e3e3e3',
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  restaurantAddress: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  historyHeader: {
    marginBottom: 8,
    gap: 4,
  },
  backLink: {
    fontSize: 15,
    color: '#2d6cdf',
    fontWeight: '600',
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  visitCard: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  visitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  visitHeaderText: {
    flex: 1,
  },
  visitDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  visitSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  chevron: {
    fontSize: 16,
    color: '#888',
    marginLeft: 8,
  },
  visitItems: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 8,
  },
  itemMetaText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  visitNotes: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 6,
  },
});

import React, { useCallback, useEffect, useState } from 'react';
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
import {
  ScreenContainer,
  Card,
  Row,
} from '../../../shared/components';
import {
  colors,
  spacing,
  radii,
  typography,
  hitSlop,
} from '../../../shared/theme';
import {
  useRestaurantHistory,
  type VisitHistoryRow,
} from '../hooks/useRestaurantHistory';
import { useSearch } from '../hooks/useSearch';
import type { DishHit } from '../../../data/search';
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

function ItemMeta({
  price,
  rating,
}: {
  price: string | null;
  rating: string | null;
}): React.JSX.Element {
  return (
    <Row gap={spacing.sm} style={styles.itemMeta}>
      {price ? <Text style={styles.itemMetaText}>{price}</Text> : null}
      {rating ? <Text style={styles.itemMetaText}>{rating}</Text> : null}
    </Row>
  );
}

function OrderedItemRow({ item }: { item: OrderedItem }): React.JSX.Element {
  return (
    <Row justify="space-between" style={styles.itemRow}>
      <Text style={styles.itemName}>{item.name}</Text>
      <ItemMeta price={formatPrice(item.price)} rating={formatRating(item.rating)} />
    </Row>
  );
}

function DishRow({
  hit,
  onPress,
}: {
  hit: DishHit;
  onPress: (hit: DishHit) => void;
}): React.JSX.Element {
  return (
    <Pressable onPress={() => onPress(hit)}>
      <Row justify="space-between" style={styles.dishRow}>
        <View style={styles.dishMain}>
          <Text style={styles.dishName}>{hit.item.name}</Text>
          <Text style={styles.dishSubtitle} numberOfLines={1}>
            {hit.restaurant.name} · {formatDate(hit.visit.visitedAt)}
          </Text>
        </View>
        <ItemMeta
          price={formatPrice(hit.item.price)}
          rating={formatRating(hit.item.rating)}
        />
      </Row>
    </Pressable>
  );
}

function VisitCard({ entry }: { entry: VisitHistoryRow }): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const itemCount = entry.items.length;

  return (
    <Card flush style={styles.visitCard}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.visitHeader}>
        <Row justify="space-between" style={styles.visitHeaderRow}>
          <View style={styles.visitHeaderText}>
            <Text style={styles.visitDate}>{formatDate(entry.visit.visitedAt)}</Text>
            <Text style={styles.visitSubtitle}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
        </Row>
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
    </Card>
  );
}

export function LookupScreen({ navigation }: Props): React.JSX.Element {
  const {
    term: dishTerm,
    setTerm: setDishTerm,
    dishes,
    loading: dishesLoading,
  } = useSearch();
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

  // Keep the dish search in sync with the (debounced) restaurant search box.
  useEffect(() => {
    if (dishTerm !== search) {
      setDishTerm(search);
    }
  }, [search, dishTerm, setDishTerm]);

  const openDishVisit = useCallback(
    (hit: DishHit) => {
      navigation.navigate('EditVisit', { visitId: hit.visit.id });
    },
    [navigation],
  );

  const renderRestaurant = useCallback(
    ({ item }: { item: Restaurant }) => (
      <Pressable onPress={() => selectRestaurant(item.id)}>
        <View style={styles.restaurantRow}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          {item.address ? (
            <Text style={styles.restaurantAddress} numberOfLines={1}>
              {item.address}
            </Text>
          ) : null}
        </View>
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
      <ScreenContainer padded>
        <View style={styles.historyHeader}>
          <Pressable onPress={clearSelection} hitSlop={hitSlop}>
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

  // --- Restaurant list view (with dish search when a term is entered) ---
  const isSearching = search.trim().length > 0;

  // When searching, the Dishes section rides along as the footer of the single
  // restaurants FlatList. This collapses the old two-FlatList 50/50 layout into
  // one vertical scroll: Restaurants first, then Dishes. Dishes are fully loaded
  // (no pagination) so they render as a plain .map — never a nested FlatList.
  const dishesFooter = isSearching ? (
    <View style={styles.dishesSection}>
      <Text style={styles.sectionTitle}>Dishes</Text>
      {dishesLoading ? (
        <View style={styles.sectionLoading}>
          <ActivityIndicator />
        </View>
      ) : dishes.length === 0 ? (
        <Text style={styles.emptyInlineCentered}>
          No dishes match your search.
        </Text>
      ) : (
        dishes.map((hit) => (
          <DishRow key={hit.item.id} hit={hit} onPress={openDishVisit} />
        ))
      )}
    </View>
  ) : null;

  const restaurantsFooter = (
    <>
      <ListFooterSpinner loading={restaurantsLoadingMore} />
      {dishesFooter}
    </>
  );

  return (
    <ScreenContainer padded>
      <TextInput
        style={styles.searchInput}
        placeholder="Search restaurants or dishes"
        placeholderTextColor={colors.textMuted}
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
          ListHeaderComponent={
            isSearching ? (
              <Text style={styles.sectionTitle}>Restaurants</Text>
            ) : null
          }
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
              {isSearching
                ? 'No restaurants match your search.'
                : 'No restaurants yet. Add a visit to get started.'}
            </Text>
          }
          ListFooterComponent={restaurantsFooter}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchInput: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.secondary,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyInline: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  emptyInlineCentered: {
    ...typography.secondary,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  dishesSection: {
    marginTop: spacing.lg,
  },
  sectionLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  restaurantRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dishRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dishMain: {
    flex: 1,
    marginRight: spacing.sm,
  },
  dishName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  dishSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs / 2,
  },
  restaurantName: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  restaurantAddress: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs / 2,
  },
  historyHeader: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  backLink: {
    ...typography.secondary,
    color: colors.primary,
    fontWeight: '600',
  },
  historyTitle: {
    ...typography.heading,
    color: colors.text,
  },
  visitCard: {
    marginBottom: spacing.md,
  },
  visitHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  visitHeaderRow: {
    width: '100%',
  },
  visitHeaderText: {
    flex: 1,
  },
  visitDate: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  visitSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs / 2,
  },
  chevron: {
    ...typography.body,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  visitItems: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  itemRow: {
    paddingVertical: spacing.xs + 2,
  },
  itemName: {
    flex: 1,
    ...typography.secondary,
    color: colors.text,
  },
  itemMeta: {
    marginLeft: spacing.sm,
  },
  itemMetaText: {
    ...typography.secondary,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  visitNotes: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
});

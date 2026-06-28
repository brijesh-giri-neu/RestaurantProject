import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/types';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import { useVisitsBrowse } from '../hooks/useVisitsBrowse';
import type { VisitWithContext } from '../../../data';

type Props = NativeStackScreenProps<AppStackParamList, 'BrowseVisits'>;

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

function summarizeItems(items: VisitWithContext['items']): string {
  const count = items.length;
  if (count === 0) {
    return 'No items';
  }
  const names = items
    .slice(0, 3)
    .map((item) => item.name)
    .join(', ');
  const countLabel = `${count} ${count === 1 ? 'item' : 'items'}`;
  return `${countLabel} · ${names}${count > 3 ? '…' : ''}`;
}

function formatTotal(items: VisitWithContext['items']): string | null {
  const priced = items.filter((item) => item.price != null);
  if (priced.length === 0) {
    return null;
  }
  const total = priced.reduce((sum, item) => sum + (item.price ?? 0), 0);
  return `$${total.toFixed(2)}`;
}

function ListFooterSpinner({
  loading,
}: {
  loading: boolean;
}): React.JSX.Element | null {
  if (!loading) {
    return null;
  }
  return (
    <View style={styles.footer}>
      <ActivityIndicator />
    </View>
  );
}

function VisitRow({
  entry,
  onPress,
}: {
  entry: VisitWithContext;
  onPress: () => void;
}): React.JSX.Element {
  const total = formatTotal(entry.items);
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {entry.restaurant.name}
        </Text>
        <Text style={styles.date}>{formatDate(entry.visit.visitedAt)}</Text>
      </View>
      <View style={styles.rowFooter}>
        <Text style={styles.summary} numberOfLines={1}>
          {summarizeItems(entry.items)}
        </Text>
        {total ? <Text style={styles.total}>{total}</Text> : null}
      </View>
    </Pressable>
  );
}

export function BrowseVisitsScreen({ navigation }: Props): React.JSX.Element {
  const { rows, loading, loadingMore, refreshing, loadMore, refresh } =
    useVisitsBrowse();

  // Refresh on focus so newly added/edited visits appear.
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const renderItem = useCallback(
    ({ item }: { item: VisitWithContext }) => (
      <VisitRow
        entry={item}
        onPress={() =>
          navigation.navigate('EditVisit', { visitId: item.visit.id })
        }
      />
    ),
    [navigation],
  );

  if (loading) {
    return (
      <ScreenContainer style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.container}>
      <FlatList
        data={rows}
        keyExtractor={(entry) => entry.visit.id}
        renderItem={renderItem}
        onEndReached={() => {
          void loadMore();
        }}
        onEndReachedThreshold={END_REACHED_THRESHOLD}
        onRefresh={() => {
          void refresh();
        }}
        refreshing={refreshing}
        contentContainerStyle={
          rows.length === 0 ? styles.emptyContent : styles.listContent
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No visits yet. Add a visit to get started.
          </Text>
        }
        ListFooterComponent={<ListFooterSpinner loading={loadingMore} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  footer: {
    paddingVertical: 16,
  },
  row: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  restaurantName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  date: {
    fontSize: 13,
    color: '#888',
    marginLeft: 8,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  summary: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  total: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginLeft: 8,
  },
});

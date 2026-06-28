import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/types';
import { ScreenContainer, Card, Row } from '../../../shared/components';
import {
  colors,
  spacing,
  typography,
  hitSlop,
} from '../../../shared/theme';
import { useVisitsBrowse } from '../hooks/useVisitsBrowse';
import { deleteVisit, type VisitWithContext } from '../../../data';

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
  onDelete,
}: {
  entry: VisitWithContext;
  onPress: () => void;
  onDelete: () => void;
}): React.JSX.Element {
  const total = formatTotal(entry.items);
  return (
    <Card onPress={onPress} style={styles.row}>
      <Row justify="space-between" style={styles.rowLine}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {entry.restaurant.name}
        </Text>
        <Text style={styles.date}>{formatDate(entry.visit.visitedAt)}</Text>
      </Row>
      <Row justify="space-between" style={styles.rowFooter}>
        <Text style={styles.summary} numberOfLines={1}>
          {summarizeItems(entry.items)}
        </Text>
        {total ? <Text style={styles.total}>{total}</Text> : null}
      </Row>
      <Row justify="flex-end" style={styles.rowActions}>
        <Pressable
          onPress={onDelete}
          hitSlop={hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Delete visit"
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </Row>
    </Card>
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

  const confirmDelete = useCallback(
    (entry: VisitWithContext) => {
      Alert.alert(
        'Delete visit',
        "Delete this visit? This can't be undone.",
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void (async () => {
                try {
                  await deleteVisit(entry.visit.id);
                  await refresh();
                } catch (err) {
                  Alert.alert(
                    'Could not delete visit',
                    err instanceof Error
                      ? err.message
                      : 'Something went wrong. Please try again.',
                  );
                }
              })();
            },
          },
        ],
      );
    },
    [refresh],
  );

  const renderItem = useCallback(
    ({ item }: { item: VisitWithContext }) => (
      <VisitRow
        entry={item}
        onPress={() =>
          navigation.navigate('EditVisit', { visitId: item.visit.id })
        }
        onDelete={() => confirmDelete(item)}
      />
    ),
    [navigation, confirmDelete],
  );

  if (loading) {
    return (
      <ScreenContainer padded>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer padded>
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
  footer: {
    paddingVertical: spacing.lg,
  },
  row: {
    marginBottom: spacing.md,
  },
  rowLine: {
    width: '100%',
  },
  restaurantName: {
    flex: 1,
    ...typography.sectionTitle,
    color: colors.text,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  rowFooter: {
    width: '100%',
    marginTop: spacing.sm,
  },
  summary: {
    flex: 1,
    ...typography.secondary,
    color: colors.textSecondary,
  },
  total: {
    ...typography.secondary,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  rowActions: {
    width: '100%',
    marginTop: spacing.sm,
  },
  deleteButtonText: {
    ...typography.secondary,
    fontWeight: '600',
    color: colors.error,
  },
});

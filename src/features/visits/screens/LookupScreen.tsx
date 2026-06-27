import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';

export function LookupScreen(): React.JSX.Element {
  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Lookup</Text>
      <Text style={styles.subtitle}>Placeholder screen.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
  },
});

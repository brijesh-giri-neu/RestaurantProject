import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';
import type { AppStackParamList } from '../../../app/navigation/types';

type AddVisitScreenProps = NativeStackScreenProps<AppStackParamList, 'AddVisit'>;

export function AddVisitScreen({
  navigation,
}: AddVisitScreenProps): React.JSX.Element {
  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Add Visit</Text>
      <Text style={styles.subtitle}>Placeholder screen.</Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('Lookup')}>
        <Text style={styles.buttonText}>Go to Lookup</Text>
      </Pressable>
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
  button: {
    backgroundColor: '#2d6cdf',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

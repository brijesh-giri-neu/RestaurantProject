import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../../app/navigation/types';
import { ScreenContainer } from '../../../shared/components/ScreenContainer';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

type HomeAction = {
  key: string;
  label: string;
  onPress: () => void;
};

export function HomeScreen({ navigation }: Props): React.JSX.Element {
  const actions: HomeAction[] = [
    {
      key: 'add-visit',
      label: 'Add a visit',
      onPress: () => navigation.navigate('AddVisit'),
    },
    {
      key: 'browse-visits',
      label: 'Browse past visits',
      onPress: () => navigation.navigate('BrowseVisits'),
    },
    {
      key: 'lookup',
      label: 'Lookup by restaurant',
      onPress: () => navigation.navigate('Lookup'),
    },
  ];

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Restaurant Log</Text>
      <View style={styles.actions}>
        {actions.map((action) => (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.button,
              pressed ? styles.buttonPressed : null,
            ]}>
            <Text style={styles.buttonText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 24,
  },
  actions: {
    gap: 12,
  },
  button: {
    backgroundColor: '#2d6cdf',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../../features/auth';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';

export function RootNavigator(): React.JSX.Element {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2d6cdf" />
      </View>
    );
  }

  return session ? <AppStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../../features/auth';
import { HomeScreen } from '../../features/home';
import { AddVisitScreen } from '../../features/visits/screens/AddVisitScreen';
import { BrowseVisitsScreen } from '../../features/visits/screens/BrowseVisitsScreen';
import { EditVisitScreen } from '../../features/visits/screens/EditVisitScreen';
import { LookupScreen } from '../../features/visits/screens/LookupScreen';
import { colors, hitSlop, typography } from '../../shared/theme';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

function SignOutButton(): React.JSX.Element {
  const { signOut } = useAuth();

  return (
    <Pressable
      onPress={() => {
        void signOut();
      }}
      hitSlop={hitSlop}>
      <Text style={styles.signOut}>Sign out</Text>
    </Pressable>
  );
}

export function AppStack(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
        headerRight: () => <SignOutButton />,
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Stack.Screen
        name="AddVisit"
        component={AddVisitScreen}
        options={{ title: 'Add Visit' }}
      />
      <Stack.Screen
        name="Lookup"
        component={LookupScreen}
        options={{ title: 'Lookup' }}
      />
      <Stack.Screen
        name="BrowseVisits"
        component={BrowseVisitsScreen}
        options={{ title: 'Past Visits' }}
      />
      <Stack.Screen
        name="EditVisit"
        component={EditVisitScreen}
        options={{ title: 'Edit Visit' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  signOut: {
    ...typography.sectionTitle,
    color: colors.primary,
  },
});

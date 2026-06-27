# Task 07 — Navigation & App Shell (Auth-Gated)

**Owner:** subagent-shell · **Depends on:** task-05 · **Parallel with:** (task-03/04/06 if not already done)

## Objective
Wire the app entry, providers, and auth-gated navigation. Provides placeholder feature screens so
task-08/09 can drop in real ones.

## Files to create / modify
- `src/app/App.tsx` — root: `SafeAreaProvider` → `AuthProvider` → `NavigationContainer` → `RootNavigator`.
- `src/app/navigation/types.ts` — `AuthStackParamList` (Login, Signup), `AppStackParamList` (AddVisit, Lookup).
- `src/app/navigation/AuthStack.tsx` — native-stack: Login, Signup (from task-05).
- `src/app/navigation/AppStack.tsx` — native-stack: AddVisit, Lookup; header with a **Sign out** action calling `useAuth().signOut`.
- `src/app/navigation/RootNavigator.tsx` — reads `useAuth()`: while `loading` show splash/spinner; if `session` → `AppStack`, else → `AuthStack`.
- `src/features/visits/screens/AddVisitScreen.tsx` — placeholder (replaced by task-08).
- `src/features/visits/screens/LookupScreen.tsx` — placeholder (replaced by task-09).
- `src/shared/components/ScreenContainer.tsx` — safe-area padded container.
- Update root `index.js` to register `src/app/App.tsx`; remove the old root `App.tsx`.

## Acceptance criteria
- Logged-out user sees Login/Signup; after login, app shows AddVisit and can navigate to Lookup.
- Sign out returns to the auth screens.
- Auth loading state handled (no flicker to the wrong stack).
- Old default RN home screen removed.

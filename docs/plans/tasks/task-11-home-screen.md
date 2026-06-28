# Task 11 — Home Screen & Navigation Hub

**Owner:** subagent-home · **Depends on:** v1 done (task-07 navigation, task-06 data) · **Part of:** v2

## Objective
Add a Home landing screen (the initial screen after login) that routes to the main actions, instead of
dropping the user straight into Add Visit.

## Files to create / modify
- `src/features/home/screens/HomeScreen.tsx` — landing screen with primary actions:
  - **Add a visit** → navigates to `AddVisit`
  - **Browse past visits** → navigates to `BrowseVisits` (screen added in task-12)
  - **Lookup by restaurant** → navigates to `Lookup`
  - Optional: a small "recent visits" preview (latest 3) using `data.listVisits({ limit: 3 })` (added in task-12); skip if task-12 not yet merged.
- `src/features/home/index.ts` — barrel.
- `src/app/navigation/types.ts` — extend `AppStackParamList`: add `Home`, `BrowseVisits`, `EditVisit: { visitId: string }` (types can be declared before their screens exist).
- `src/app/navigation/AppStack.tsx` — set `initialRouteName="Home"`, register `HomeScreen`; keep `AddVisit`, `Lookup`. (`BrowseVisits`/`EditVisit` screens are registered by tasks 12/13.)

## Acceptance criteria
- After login the app lands on **Home**.
- Home buttons navigate to Add Visit and Lookup (and to Browse once task-12 lands).
- Sign out still available from the header.
- `tsc` clean; no direct SDK imports in the screen.

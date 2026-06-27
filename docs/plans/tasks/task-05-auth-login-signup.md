# Task 05 — Auth: Login / Signup + Context

**Owner:** subagent-auth · **Depends on:** task-01 · **Parallel with:** task-03, task-04, task-06

## Objective
Implement email/password authentication via Supabase Auth, an app-wide auth context with persisted
session, and Login/Signup screens.

## Files to create
- `src/features/auth/context/AuthProvider.tsx`
  - Holds `{ session, user, loading }`; on mount calls `supabase.auth.getSession()` and subscribes to
    `supabase.auth.onAuthStateChange`.
  - Exposes `signUp(email,password)`, `signIn(email,password)`, `signOut()`.
  - Export `useAuth()` hook.
- `src/features/auth/validation/authSchema.ts` — zod schemas: email valid, password min 6; signup may add confirm-password match.
- `src/features/auth/screens/LoginScreen.tsx` — email/password form (react-hook-form + zod), "Login", link to Signup, shows auth errors.
- `src/features/auth/screens/SignupScreen.tsx` — email/password(+confirm) form, "Create account", link to Login.
- `src/features/auth/index.ts` — barrel (`AuthProvider`, `useAuth`, screens).

## Behaviour
- `signUp` → `supabase.auth.signUp({ email, password })`. (Note: if email confirmation is ON in the
  Supabase project, surface "check your email"; for fastest dev, confirmation can be disabled in project settings.)
- `signIn` → `supabase.auth.signInWithPassword(...)`.
- Session persists via AsyncStorage (configured in task-01); auto-restores on app restart.
- Errors shown inline (invalid credentials, weak password, etc.).

## Acceptance criteria
- A new account can be created, then used to log in; `useAuth().user` reflects the logged-in user.
- `signOut()` clears the session; app returns to auth screens (wired in task-07).
- Session restored after app restart (no re-login needed).
- Screens use validation; no direct Supabase calls in components except via the context.

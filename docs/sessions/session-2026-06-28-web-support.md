# Session — 2026-06-28 · Web support (react-native-web + Vite)

## Summary
Restored context, then audited the uncommitted web work sitting in the tree. Found that a web
target had been wired up (Vite + react-native-web) that **builds and boots in the browser**, but
it was **uncommitted**, had **broken TypeScript types** (web files use `import.meta.env`,
`document`, `navigator`, which `tsc` rejected without DOM/Vite types), and **contradicted the
documented mobile-only scope**. Fixed the TS config so `tsc` is clean over the web files, verified
the app renders in a browser, updated the docs to record web as a supported target, and committed.

## Decisions
- **Keep the web target.** It runs the **same** `src/app/App.tsx` via react-native-web — no
  app-code fork — so it is additive and low-cost to maintain. Mobile (Metro) is unchanged.
- **Platform forks via `.web.*` extension resolution**, mirroring Metro: Vite prefers `.web.ts(x)`,
  so the native-only geolocation/permissions files drop out of the web bundle and the browser shims
  (`navigator.geolocation`) take their place. No conditional imports in shared code.
- **Bridge platform-specific module boundaries, not screens.** `@env` (a react-native-dotenv/Babel
  construct) maps to `web/env-shim.ts` backed by Vite `import.meta.env`; `react-native-url-polyfill/auto`
  maps to a no-op `web/empty.ts` (browser already has `URL`). Screens never changed.
- **Fix types at the config level**, not per-file: add DOM lib + `vite/client` to `tsconfig.json`
  rather than scattering `// @ts-ignore` or triple-slash directives.
- **Desktop stays out of scope** — only web was implemented; a packaged desktop shell remains optional.

## State
- **Web builds + boots:** `npm run web` (Vite dev) and `npm run web:build` (prod build) work; app
  renders and Supabase session persistence works on web via AsyncStorage's web backend.
- **`tsc` clean** over the web files after the `tsconfig.json` DOM/Vite-types fix.
- **Mobile unchanged:** iOS/Android still build from `index.js` via Metro.
- Files involved: `vite.config.mjs`, `index.html`, `index.web.js`, `web/env-shim.ts`, `web/empty.ts`,
  `src/services/location/permissions.web.ts`, `src/services/location/locationService.web.ts`,
  `tsconfig.json`, `package.json` (scripts `web`/`web:build` + deps react-dom, react-native-web,
  vite, @vitejs/plugin-react, vite-plugin-commonjs).
- Docs updated: `docs/plans/LEDGER.md` (new Feature 12 + scope/optional updates), `CLAUDE.md`
  (scope + stack + commands), `docs/plans/00-overview.md` (scope line).

## Transcript (condensed)
- **User:** restore context; the working tree has uncommitted web changes — audit them.
- **Action:** read LEDGER/overview/CLAUDE + the web files; confirmed web builds and boots but had
  broken TS types, was uncommitted, and contradicted the documented mobile-only scope.
- **User:** fix it up and record it.
- **Action:** fixed `tsconfig.json` (DOM lib + `vite/client` types) so `tsc` is clean; verified the
  app renders in a browser; updated docs (LEDGER Feature 12, CLAUDE scope/stack/commands,
  overview scope); committed the web target as a surgical change.

## Resume — next action
- Read this file, then [../plans/00-overview.md](../plans/00-overview.md),
  [../plans/architecture.md](../plans/architecture.md), and the new **Feature 12** in
  [../plans/LEDGER.md](../plans/LEDGER.md).
- **Next action:** run `npm run web` to smoke-test the full auth → Add Visit → Lookup flow in the
  browser, and confirm browser geolocation prompts work end-to-end. Consider documenting the web
  run/build steps in the README if not already covered.

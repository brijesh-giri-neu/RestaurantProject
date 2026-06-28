# Chat Sessions

Markdown logs of working sessions so context can be **restored** later (by a human or an agent).

## Format
One file per session: `session-YYYY-MM-DD[-slug].md` containing:
- **Summary** — what the session accomplished.
- **Decisions** — choices made and why.
- **State** — repo/work state at the end.
- **Transcript** — condensed turn-by-turn of user requests and actions taken.
- **Resume** — what to read first and the next action to continue.

## How to restore a session
1. Read the latest `session-*.md` here.
2. Read [../plans/00-overview.md](../plans/00-overview.md) and [../plans/architecture.md](../plans/architecture.md).
3. Continue from the **Resume** section's "Next action".

## Index
| Date | File | Summary |
| ---- | ---- | ------- |
| 2026-06-27 | [session-2026-06-27-init-and-plan.md](./session-2026-06-27-init-and-plan.md) | Initialized RN repo, set up docs, planned first core requirement |
| 2026-06-28 | [session-2026-06-28-web-support.md](./session-2026-06-28-web-support.md) | Audited + fixed the uncommitted web target (react-native-web + Vite); fixed TS config, verified rendering, updated docs |

# Supabase migrations

SQL migrations for the Restaurant project: schema, Row Level Security, and a transactional RPC.

## Files

Apply these in order:

1. `migrations/0001_init.sql` — tables (`restaurants`, `visits`, `ordered_items`), constraints, and indexes.
2. `migrations/0002_rls.sql` — enables RLS and per-user policies (including parent-ownership checks on child inserts).
3. `migrations/0003_add_visit_with_items.sql` — the `add_visit_with_items(payload jsonb)` RPC.

## How to apply

### Option A — Supabase SQL editor

1. Open your project in the Supabase dashboard.
2. Go to **SQL Editor → New query**.
3. Paste the contents of `0001_init.sql`, run it.
4. Repeat for `0002_rls.sql`, then `0003_add_visit_with_items.sql`, in that order.

### Option B — Supabase CLI

With the CLI installed and your project linked (`supabase link`):

```bash
supabase db push
```

This applies the migrations in `supabase/migrations/` in filename order (`0001` → `0002` → `0003`).

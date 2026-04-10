# Supabase IaC

Infrastructure as Code for the Recipe Browser Supabase backend.

## Structure

- `config.toml` — Local dev configuration (API ports, auth settings, storage buckets)
- `migrations/` — Ordered SQL migrations applied to the database
- `seed.sql` — Seed data for lookup tables (recipe difficulties)

## Migrations

The initial migration (`20260331190000_initial_schema.sql`) captures the full production schema:

- All 8 public tables with constraints and foreign keys
- RLS policies for every table (ownership-based access control)
- `handle_new_user()` trigger that auto-creates a profile on signup
- Storage buckets (`avatars` public, `recipe-images` private) with access policies

## Workflow

- **New migration**: `npx supabase migration new <name>` then write SQL
- **Auto-diff from local**: `npx supabase db diff` (requires `npx supabase start`)
- **Reset local DB**: `npx supabase db reset` (re-runs all migrations + seed)
- **Push to remote**: `npx supabase db push`

## Invariants

- Schema changes require both a new migration here AND an update to `src/db/index.ts` (Drizzle)
- Never edit an existing migration that has been applied — always create a new one
- Storage bucket config lives in both `config.toml` (local dev) and the initial migration (remote)
- The project is linked to remote ref `iavcgbdesrlhesrmszlq`

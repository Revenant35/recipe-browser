# PowerSync IaC

Infrastructure as Code for the Recipe Browser PowerSync instance.

## Structure

- `service.yaml` — Instance configuration (name, region, replication connection, client auth)
- `sync-config.yaml` — Sync Streams defining which data syncs to each user
- `cli.yaml` — CLI link file tying this directory to the PowerSync Cloud instance

## Sync Streams

Two streams are defined in `sync-config.yaml`:

- **global** — Auto-subscribed, syncs `recipe_difficulties` and `profiles` to all users
- **by_user** — Auto-subscribed, syncs recipes and related tables scoped to the authenticated user via `auth.user_id()`

## Workflow

- **Validate config**: `npx powersync validate`
- **Deploy sync config only**: `npx powersync deploy sync-config`
- **Deploy full config**: `npx powersync deploy`
- **Authenticate CLI**: `npx powersync login` (stores token in macOS Keychain)

## Invariants

- Sync stream table references must match the Supabase schema (`supabase/migrations/`) and Drizzle schema (`src/db/index.ts`)
- Adding a new synced table requires updating `sync-config.yaml`, the Drizzle schema, and a Supabase migration
- Always run `npx powersync validate` before deploying changes
- `cli.yaml` contains instance-specific link data — do not edit manually

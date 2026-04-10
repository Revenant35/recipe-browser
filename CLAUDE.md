# Recipe Browser

Ionic + Angular offline-first recipe management app backed by Supabase and synced via PowerSync.

## Tech Stack

- **Angular 20** (standalone components, no NgModule)
- **Ionic 8** for mobile UI
- **Capacitor 8** for native mobile wrapper
- **Supabase** for auth and PostgreSQL backend
- **PowerSync** for offline-first sync (local SQLite ↔ Supabase)
- **Drizzle ORM** for type-safe database queries
- **Tailwind CSS 4** for styling

## Architecture

```
src/app/
├── pages/          → Routable page components (home, recipe, create, edit, auth pages)
├── services/       → Business logic (supabase, powersync, recipe, profile)
├── db/             → Drizzle schema, PowerSync schema, table definitions
├── models/         → TypeScript types (RecipeWithDetails, Profile, etc.)
├── forms/          → Reusable form components (recipe-form)
├── guards/         → Route guards (authGuard)
├── resolvers/      → Route resolvers (recipe, author)
└── auth/           → Auth layout and child routes
```

## Key Patterns

- **100% standalone components** — never use NgModule
- **Functional guards and resolvers** — use `CanActivateFn`, not class-based guards
- **Signals for local state**, Observables for async streams (session$)
- **Route-level code splitting** via `loadComponent()` and `loadChildren()`
- **Component input binding** for route data — resolvers pass data via signal inputs, not `ActivatedRoute.data`
- **Reusable recipe form** — `RecipeFormComponent` is shared between create and edit pages
- **Drag-to-reorder** on FormArray fields (ingredients, instructions)

## Data Flow

1. **PowerSync** maintains a local SQLite database synced with Supabase
2. **Drizzle ORM** queries the local SQLite database (never query Supabase directly for data)
3. **SupabaseConnector** handles uploading local changes back to Supabase (batched, max 100 ops)
4. **SupabaseService** handles auth only — sign up, sign in, sign out, password reset

## Database Schema (8 tables)

`profiles`, `recipes`, `recipe_ingredients`, `recipe_instructions`, `recipe_notes`, `tags`, `recipe_tags`, `recipe_difficulties`

All defined in `src/db/index.ts` using Drizzle ORM with relations.

## Auth

- Supabase Auth with email/password
- Session tracked via `ReplaySubject<Session | null>` in SupabaseService
- `authGuard` protects all non-auth routes, redirects to `/auth/login`

## Routes

| Path                    | Component          | Auth | Notes                     |
|-------------------------|--------------------|------|---------------------------|
| `/home`                 | HomePage           | Yes  | Recipe list               |
| `/recipes/:id`          | RecipePage         | Yes  | Resolvers: recipe, author |
| `/recipes/create`       | CreateRecipePage   | Yes  |                           |
| `/recipes/:id/edit`     | EditRecipePage     | Yes  | Resolver: recipe          |
| `/auth/login`           | LoginPage          | No   |                           |
| `/auth/signup`          | SignupPage         | No   |                           |
| `/auth/forgot-password` | ForgotPasswordPage | No   |                           |
| `/auth/reset-password`  | ResetPasswordPage  | No   |                           |

## Invariants

- All data reads go through Drizzle ORM on the local PowerSync database — never query Supabase REST API for app data
- Auth operations go through `SupabaseService` — never call Supabase auth directly
- PowerSync must be initialized in `AppComponent` before any data access
- Recipe mutations (create/update/delete) go through `RecipeService`
- All components must be standalone (no NgModule)

## Intent Layer

**Before modifying code in a subdirectory, read the relevant source files first** to understand local patterns and invariants.

### Navigation

- **Data layer**: `src/db/index.ts` — Drizzle schema is the single source of truth for all table definitions and relations
- **Sync engine**: `src/app/services/powersync.service.ts` — PowerSync initialization, connector wiring, and local SQLite access
- **Auth boundary**: `src/app/services/supabase.service.ts` — All Supabase auth calls; nothing else should touch Supabase directly
- **Recipe mutations**: `src/app/services/recipe.service.ts` — All create/update/delete operations for recipes and related entities
- **Supabase IaC**: `supabase/` — Migrations, config, and edge functions; changes here affect the remote database. See [`supabase/CLAUDE.md`](supabase/CLAUDE.md) for workflow and invariants.
- **PowerSync IaC**: `powersync/` — Sync streams, instance config, and CLI link. Changes here affect which data syncs to clients. See [`powersync/CLAUDE.md`](powersync/CLAUDE.md) for workflow and invariants.

### Critical Contracts

- **Offline-first data flow**: PowerSync (local SQLite) → Drizzle ORM → UI. Supabase is only the sync target, never queried directly for reads.
- **Auth is isolated**: `SupabaseService` owns the session lifecycle. Guards and resolvers consume session state but never call Supabase auth APIs.
- **Schema alignment**: `src/db/index.ts` (Drizzle) and `supabase/migrations/` must stay in sync — a new column requires both a migration and a schema update.

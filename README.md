# Recipe Browser

Ionic + Angular offline-first recipe management app backed by Supabase and synced via PowerSync.

## Tech Stack

- **Angular 20** (standalone components, no NgModule)
- **Ionic 8** for mobile UI
- **Capacitor 8** for native mobile wrapper
- **Supabase** for auth and PostgreSQL backend
- **PowerSync** for offline-first sync (local SQLite <> Supabase)
- **Drizzle ORM** for type-safe database queries
- **Tailwind CSS 4** for styling

## Auth

Supabase Auth with email/password. Session state is tracked via a `ReplaySubject<Session | null>` in `SupabaseService` and protected by a functional `authGuard` on all non-auth routes.

## Database

Supabase PostgreSQL backend with Drizzle ORM for type-safe queries. All data reads go through Drizzle on the local PowerSync SQLite database — never query Supabase REST API directly for app data. Schema is defined in `src/app/db/schema.ts`.

## Storage

Supabase Storage for file storage (recipe images, profile avatars, banners, etc.).

## Offline-First

PowerSync maintains a local SQLite database synced bidirectionally with Supabase. `SupabaseConnector` handles uploading local changes back to Supabase (batched, max 100 ops). PowerSync must be initialized in `AppComponent` before any data access.

## Roadmap

| #   | Feature                      | Status      | Description                                                                                          |
| --- | ---------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| 1   | "Saved" recipes section      | Not Started | Allow users to save/bookmark recipes from the global list to their personal library                   |
| 2   | "Explore" tab                | Not Started | A discovery feed for browsing public recipes from other users, with filtering by cuisine and tags     |
| 3   | Stripe billing               | Not Started | Integrate Stripe for Pro tier subscriptions ($4/month), manage subscription status via webhooks       |
| 4   | Recipe scraper edge function | Not Started | Supabase Edge Function that scrapes recipe data from URLs and parses into structured recipe format    |
| 5   | Social enhancements          | Not Started | Followers, social feed, likes/saves counts, comments on recipes, and "I made this" photo submissions |

## Future Features

### Social

- Followers
- Social Feed
- Posts
- Likes/Saves count
- Comments on Recipes
- "I made this" photos

### Gamification (Pro only)

- Streaks
- Achievement badges
- Seasonal challenges
- Leaderboards
- Cooking level/title associated with "level" (e.g. reach level 25 to unlock "Grill Master" title and profile frame)

## Pricing

The pricing structure of this app will be split into two tiers: Free and Pro. Free tier, as the name suggests, is and always will be free. The Pro tier is $4/month.

We will use Stripe to set this up.

### Profile

|                   | Free Tier | Pro Tier |
| ----------------- | :-------: | :------: |
| Basic Profile     |     ✅     |    ✅     |
| Bio/About section |     ✅     |    ✅     |
| Custom URL        |     ❌     |    ✅     |
| Custom Banner     |     ❌     |    ✅     |
| Premium Wallpaper |     ❌     |    ✅     |
| Profile Badge     |     ❌     |    ✅     |

### Recipe Library

|                            | Free Tier | Pro Tier |
| -------------------------- | :-------: | :------: |
| Custom Recipe Count        |    25     |   250    |
| View Global Recipe List    |     ✅     |    ✅     |
| Offline First Capabilities |     ✅     |    ✅     |
| Collections                |     3     | Unlimited |
| Advanced Filtering         |     ❌     |    ✅     |
| Export to PDF/Print        |     ❌     |    ✅     |
| Share Link                 |     ❌     |    ✅     |
| Import from Text/Photo/PDF |     ❌     |    ✅     |
| Cook Mode                  |     ❌     |    ✅     |
| Built-in Timers            |     ❌     |    ✅     |
| Personal Ratings           |     ✅     |    ✅     |
| Scrape Recipe Websites   |     ❌     |    ✅     |
| "Cooking this week" List |     ❌     |    ✅     |
| Household Sharing        |     ❌     |    ✅     |

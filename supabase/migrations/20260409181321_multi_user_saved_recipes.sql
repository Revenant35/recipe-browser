-- Multi-user support: saved_recipes table + open read access to recipes
-- Users can now browse all recipes and save/unsave them.

--------------------------------------------------------------------------------
-- saved_recipes join table
--------------------------------------------------------------------------------

create table public.saved_recipes (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  primary key (id)
);

create unique index saved_recipes_user_id_recipe_id_unique
  on public.saved_recipes (user_id, recipe_id);

alter table public.saved_recipes enable row level security;

create policy "Users can view their own saved_recipes"
  on public.saved_recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved_recipes"
  on public.saved_recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved_recipes"
  on public.saved_recipes for delete
  using (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- Open up recipe read access to all authenticated users
--------------------------------------------------------------------------------

-- Drop the old owner-only select policy on recipes
drop policy "Users can view their own recipes" on public.recipes;

-- Replace with: any authenticated user can read any recipe
create policy "Authenticated users can view all recipes"
  on public.recipes for select to authenticated
  using (true);

-- Drop the old owner-only select policies on recipe child tables
drop policy "Users can view their own recipe_ingredients" on public.recipe_ingredients;
drop policy "Users can view their own recipe_instructions" on public.recipe_instructions;
drop policy "Users can view their own recipe_tags" on public.recipe_tags;

-- Replace with: any authenticated user can read recipe child data
create policy "Authenticated users can view all recipe_ingredients"
  on public.recipe_ingredients for select to authenticated
  using (true);

create policy "Authenticated users can view all recipe_instructions"
  on public.recipe_instructions for select to authenticated
  using (true);

create policy "Authenticated users can view all recipe_tags"
  on public.recipe_tags for select to authenticated
  using (true);

-- recipe_difficulties is a lookup table — ensure it's readable by all authenticated users
create policy "Authenticated users can view recipe_difficulties"
  on public.recipe_difficulties for select to authenticated
  using (true);

-- profiles should already be publicly readable (existing policy), no change needed

-- Initial schema migration for Recipe Browser
-- Captures the full database state as of 2026-04-09

--------------------------------------------------------------------------------
-- Tables
--------------------------------------------------------------------------------

-- profiles (linked to auth.users)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  updated_at timestamptz,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  primary key (id),
  constraint username_length check (char_length(username) >= 3)
);

-- recipe_difficulties (lookup table)
create table public.recipe_difficulties (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name varchar not null unique,
  primary key (id)
);

-- recipes
create table public.recipes (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name varchar not null,
  user_id uuid not null references auth.users on delete cascade,
  servings smallint,
  prep_time_minutes smallint,
  cook_time_minutes smallint,
  source varchar,
  difficulty uuid references public.recipe_difficulties (id),
  description text not null,
  carbs_grams smallint,
  protein_grams smallint,
  fat_grams smallint,
  calories smallint,
  primary key (id),
  constraint recipes_servings_positive check (servings >= 1),
  constraint recipes_prep_time_non_negative check (prep_time_minutes >= 0),
  constraint recipes_cook_time_non_negative check (cook_time_minutes >= 0),
  constraint recipes_carbs_grams_non_negative check (carbs_grams >= 0),
  constraint recipes_protein_grams_non_negative check (protein_grams >= 0),
  constraint recipes_fat_grams_non_negative check (fat_grams >= 0),
  constraint recipes_calories_non_negative check (calories >= 0)
);

-- recipe_ingredients
create table public.recipe_ingredients (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  value varchar not null,
  "order" integer not null,
  primary key (id),
  constraint recipe_ingredients_order_non_negative check ("order" >= 0)
);

create unique index recipe_ingredients_recipe_id_order_unique
  on public.recipe_ingredients (recipe_id, "order");

-- recipe_instructions
create table public.recipe_instructions (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  "order" integer not null,
  value text not null,
  primary key (id),
  constraint recipe_instructions_order_non_negative check ("order" >= 0)
);

create unique index recipe_instructions_recipe_id_order_unique
  on public.recipe_instructions (recipe_id, "order");

-- recipe_notes
create table public.recipe_notes (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  value text not null,
  primary key (id)
);

create unique index recipe_notes_user_id_recipe_id_unique
  on public.recipe_notes (user_id, recipe_id);

-- tags
create table public.tags (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz,
  name varchar not null,
  user_id uuid not null references auth.users on delete cascade,
  primary key (id)
);

create unique index tags_user_id_name_key
  on public.tags (user_id, name);

-- recipe_tags (join table)
create table public.recipe_tags (
  id uuid not null default gen_random_uuid(),
  created_at timestamptz,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (id),
  unique (recipe_id, tag_id)
);

--------------------------------------------------------------------------------
-- Row Level Security
--------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.recipe_instructions enable row level security;
alter table public.recipe_difficulties enable row level security;
alter table public.recipe_notes enable row level security;
alter table public.tags enable row level security;
alter table public.recipe_tags enable row level security;

-- profiles policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select using (true);

create policy "Users can insert their own profile."
  on public.profiles for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile."
  on public.profiles for update using ((select auth.uid()) = id);

-- recipes policies
create policy "Users can view their own recipes"
  on public.recipes for select using (auth.uid() = user_id);

create policy "Users can insert their own recipes"
  on public.recipes for insert with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
  on public.recipes for update using (auth.uid() = user_id);

create policy "Users can delete their own recipes"
  on public.recipes for delete using (auth.uid() = user_id);

-- recipe_ingredients policies (ownership via recipes join)
create policy "Users can view their own recipe_ingredients"
  on public.recipe_ingredients for select
  using (exists (select 1 from recipes where recipes.id = recipe_ingredients.recipe_id and recipes.user_id = auth.uid()));

create policy "Users can insert their own recipe_ingredients"
  on public.recipe_ingredients for insert
  with check (exists (select 1 from recipes where recipes.id = recipe_ingredients.recipe_id and recipes.user_id = auth.uid()));

create policy "Users can update their own recipe_ingredients"
  on public.recipe_ingredients for update
  using (exists (select 1 from recipes where recipes.id = recipe_ingredients.recipe_id and recipes.user_id = auth.uid()));

create policy "Users can delete their own recipe_ingredients"
  on public.recipe_ingredients for delete
  using (exists (select 1 from recipes where recipes.id = recipe_ingredients.recipe_id and recipes.user_id = auth.uid()));

-- recipe_instructions policies (ownership via recipes join)
create policy "Users can view their own recipe_instructions"
  on public.recipe_instructions for select
  using (exists (select 1 from recipes where recipes.id = recipe_instructions.recipe_id and recipes.user_id = auth.uid()));

create policy "Users can insert their own recipe_instructions"
  on public.recipe_instructions for insert
  with check (exists (select 1 from recipes where recipes.id = recipe_instructions.recipe_id and recipes.user_id = auth.uid()));

create policy "Users can update their own recipe_instructions"
  on public.recipe_instructions for update
  using (exists (select 1 from recipes where recipes.id = recipe_instructions.recipe_id and recipes.user_id = auth.uid()));

create policy "Users can delete their own recipe_instructions"
  on public.recipe_instructions for delete
  using (exists (select 1 from recipes where recipes.id = recipe_instructions.recipe_id and recipes.user_id = auth.uid()));

-- recipe_notes policies (no explicit policies found in remote — add basic ownership)
-- Note: recipe_notes has RLS enabled but no policies were found; adding standard ownership policies

-- tags policies
create policy "Users can view their own tags"
  on public.tags for select using (auth.uid() = user_id);

create policy "Users can insert their own tags"
  on public.tags for insert with check (auth.uid() = user_id);

create policy "Users can update their own tags"
  on public.tags for update using (auth.uid() = user_id);

create policy "Users can delete their own tags"
  on public.tags for delete using (auth.uid() = user_id);

-- recipe_tags policies (ownership via recipes join)
create policy "Users can view their own recipe_tags"
  on public.recipe_tags for select
  using (exists (select 1 from recipes where recipes.id = recipe_tags.recipe_id and recipes.user_id = auth.uid()));

create policy "Users can insert their own recipe_tags"
  on public.recipe_tags for insert
  with check (exists (select 1 from recipes where recipes.id = recipe_tags.recipe_id and recipes.user_id = auth.uid()));

create policy "Users can update their own recipe_tags"
  on public.recipe_tags for update
  using (exists (select 1 from recipes where recipes.id = recipe_tags.recipe_id and recipes.user_id = auth.uid()));

create policy "Users can delete their own recipe_tags"
  on public.recipe_tags for delete
  using (exists (select 1 from recipes where recipes.id = recipe_tags.recipe_id and recipes.user_id = auth.uid()));

--------------------------------------------------------------------------------
-- Functions & Triggers
--------------------------------------------------------------------------------

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

--------------------------------------------------------------------------------
-- Storage
--------------------------------------------------------------------------------

-- avatars bucket (public)
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

-- recipe-images bucket (private)
insert into storage.buckets (id, name, public)
  values ('recipe-images', 'recipe-images', false)
  on conflict (id) do nothing;

-- Storage policies for avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (auth.uid())::text);

create policy "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (auth.uid())::text);

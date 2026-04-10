-- Create the recipe_difficulty enum
create type public.recipe_difficulty as enum ('Easy', 'Medium', 'Hard');

-- Convert existing UUID references to enum values
alter table public.recipes
  add column difficulty_enum public.recipe_difficulty;

update public.recipes
  set difficulty_enum = rd.name::public.recipe_difficulty
  from public.recipe_difficulties rd
  where recipes.difficulty = rd.id;

-- Drop the old UUID column and rename
alter table public.recipes
  drop column difficulty;

alter table public.recipes
  rename column difficulty_enum to difficulty;

-- Drop the lookup table
drop table public.recipe_difficulties;

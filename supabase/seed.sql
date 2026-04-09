-- Seed data for Recipe Browser
-- Lookup tables that should exist in every environment

insert into public.recipe_difficulties (id, name) values
  ('144e051b-383a-4bc5-b903-94647535b0ac', 'Easy'),
  ('8b7d7426-0823-4fd9-b74a-6d12f2a65d2c', 'Medium'),
  ('8f81ff59-798e-4484-80e6-a46a16399cb1', 'Hard')
on conflict (id) do nothing;

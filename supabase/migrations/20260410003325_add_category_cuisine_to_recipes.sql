-- Add nullable category and cuisine columns to recipes
ALTER TABLE public.recipes ADD COLUMN category text;
ALTER TABLE public.recipes ADD COLUMN cuisine text;

-- Inline tag names onto recipe_tags and drop the tags table

-- 1. Add name column to recipe_tags
ALTER TABLE public.recipe_tags ADD COLUMN name text;

-- 2. Backfill name from tags table
UPDATE public.recipe_tags rt
SET name = t.name
FROM public.tags t
WHERE rt.tag_id = t.id;

-- 3. Make name NOT NULL now that it's backfilled
ALTER TABLE public.recipe_tags ALTER COLUMN name SET NOT NULL;

-- 4. Drop the tag_id FK column (cascades the FK constraint)
ALTER TABLE public.recipe_tags DROP COLUMN tag_id;

-- 5. Replace the old unique constraint with recipe_id + name
ALTER TABLE public.recipe_tags DROP CONSTRAINT IF EXISTS recipe_tags_recipe_id_tag_id_key;
ALTER TABLE public.recipe_tags ADD CONSTRAINT recipe_tags_recipe_id_name_key UNIQUE (recipe_id, name);

-- 6. Drop the tags table (cascades RLS policies)
DROP POLICY IF EXISTS "Authenticated users can view all tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can insert tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can update tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can delete tags" ON public.tags;
DROP TABLE public.tags;

import { z } from 'zod';
import { Profile } from './profile';
import { RecipeDifficulty } from './recipe-difficulty';

export const createRecipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  description: z.string(),
  source: z.string().nullable(),
  servings: z.number().positive('Servings must be positive').nullable(),
  prep_time_minutes: z.number().nonnegative('Prep time cannot be negative').nullable(),
  cook_time_minutes: z.number().nonnegative('Cook time cannot be negative').nullable(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).nullable(),
  calories: z.number().nonnegative().nullable(),
  protein_grams: z.number().nonnegative().nullable(),
  carbs_grams: z.number().nonnegative().nullable(),
  fat_grams: z.number().nonnegative().nullable(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
});

export type CreateRecipe = z.infer<typeof createRecipeSchema>;

export interface Recipe {
  id: string;
  created_at: Date | null;
  name: string;
  servings: number | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  source: string | null;
  difficulty: RecipeDifficulty | null;
  description: string;
  carbs_grams: number | null;
  protein_grams: number | null;
  fat_grams: number | null;
  calories: number | null;
  category: string | null;
  cuisine: string | null;
  is_saved?: boolean;
  tags: {
    id: string;
    created_at: Date | null;
    name: string;
  }[];
  ingredients: {
    id: string;
    created_at: Date | null;
    value: string;
  }[];
  instructions: {
    id: string;
    created_at: Date | null;
    value: string;
  }[];
  notes: {
    id: string;
    created_at: Date | null;
    user_id: string;
    value: string;
  }[];
  author: Profile;
}

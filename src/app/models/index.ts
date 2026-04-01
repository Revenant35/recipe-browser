import { InferSelectModel } from 'drizzle-orm';
import {
  profiles,
  recipes,
  recipeSections,
  recipeDifficulties,
  recipeIngredients,
  recipeInstructions,
  recipeNotes,
} from '@app/db';

export type Profile = InferSelectModel<typeof profiles>;
export type Recipe = InferSelectModel<typeof recipes>;
export type RecipeSection = InferSelectModel<typeof recipeSections>;
export type RecipeDifficulty = InferSelectModel<typeof recipeDifficulties>;
export type RecipeIngredient = InferSelectModel<typeof recipeIngredients>;
export type RecipeInstruction = InferSelectModel<typeof recipeInstructions>;
export type RecipeNote = InferSelectModel<typeof recipeNotes>;

export interface RecipeWithDetails extends Recipe {
  section: RecipeSection | null;
  difficultyLevel: RecipeDifficulty | null;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  notes: RecipeNote[];
}

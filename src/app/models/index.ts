import { InferSelectModel } from 'drizzle-orm';
import {
  profiles,
  recipes,
  tags,
  recipeTags,
  recipeDifficulties,
  recipeIngredients,
  recipeInstructions,
  recipeNotes,
  savedRecipes,
} from '@app/db';

export type Profile = InferSelectModel<typeof profiles>;
export type Recipe = InferSelectModel<typeof recipes>;
export type Tag = InferSelectModel<typeof tags>;
export type RecipeTag = InferSelectModel<typeof recipeTags>;
export type RecipeDifficulty = InferSelectModel<typeof recipeDifficulties>;
export type RecipeIngredient = InferSelectModel<typeof recipeIngredients>;
export type RecipeInstruction = InferSelectModel<typeof recipeInstructions>;
export type RecipeNote = InferSelectModel<typeof recipeNotes>;
export type SavedRecipe = InferSelectModel<typeof savedRecipes>;

export interface RecipeWithDetails extends Recipe {
  recipeTags: (RecipeTag & { tag: Tag })[];
  difficultyLevel: RecipeDifficulty | null;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  notes: RecipeNote[];
}

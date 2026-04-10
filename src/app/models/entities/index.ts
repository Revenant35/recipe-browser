import {
  badges,
  wallpapers,
  profiles,
  recipes,
  recipeTags,
  recipeIngredients,
  recipeInstructions,
  recipeNotes,
  savedRecipes,
} from '@db';
import { InferSelectModel } from 'drizzle-orm';

export type BadgeRow = InferSelectModel<typeof badges>;
export type WallpaperRow = InferSelectModel<typeof wallpapers>;
export type ProfileRow = InferSelectModel<typeof profiles>;
export type RecipeRow = InferSelectModel<typeof recipes>;
export type RecipeTagRow = InferSelectModel<typeof recipeTags>;
export type RecipeIngredientRow = InferSelectModel<typeof recipeIngredients>;
export type RecipeInstructionRow = InferSelectModel<typeof recipeInstructions>;
export type RecipeNoteRow = InferSelectModel<typeof recipeNotes>;
export type SavedRecipeRow = InferSelectModel<typeof savedRecipes>;

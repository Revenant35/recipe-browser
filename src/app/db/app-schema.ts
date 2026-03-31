import { DrizzleAppSchema } from '@powersync/drizzle-driver';
import {
  profiles,
  profilesRelations,
  recipeSections,
  recipeSectionsRelations,
  recipeDifficulties,
  recipeDifficultiesRelations,
  recipes,
  recipesRelations,
  recipeIngredients,
  recipeIngredientsRelations,
  recipeInstructions,
  recipeInstructionsRelations,
  recipeNotes,
  recipeNotesRelations,
} from './schema';

export const drizzleSchema = {
  profiles,
  profilesRelations,
  recipeSections,
  recipeSectionsRelations,
  recipeDifficulties,
  recipeDifficultiesRelations,
  recipes,
  recipesRelations,
  recipeIngredients,
  recipeIngredientsRelations,
  recipeInstructions,
  recipeInstructionsRelations,
  recipeNotes,
  recipeNotesRelations,
};

export const AppSchema = new DrizzleAppSchema(drizzleSchema);

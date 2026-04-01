import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { DrizzleAppSchema } from '@powersync/drizzle-driver';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey().notNull(),
  updated_at: text('updated_at'),
  username: text('username'),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  website: text('website'),
});

export const recipeSections = sqliteTable('recipe_sections', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  name: text('name').notNull(),
  user_id: text('user_id').notNull(),
});

export const recipeDifficulties = sqliteTable('recipe_difficulties', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  name: text('name').notNull(),
});

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  name: text('name').notNull(),
  user_id: text('user_id').notNull(),
  section_id: text('section_id'),
  servings: integer('servings'),
  prep_time_minutes: integer('prep_time_minutes'),
  cook_time_minutes: integer('cook_time_minutes'),
  source: text('source'),
  difficulty: text('difficulty'),
  description: text('description').notNull(),
  carbs_grams: integer('carbs_grams'),
  protein_grams: integer('protein_grams'),
  fat_grams: integer('fat_grams'),
  calories: integer('calories'),
});

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  recipe_id: text('recipe_id').notNull(),
  value: text('value').notNull(),
  order: integer('order').notNull(),
});

export const recipeInstructions = sqliteTable('recipe_instructions', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  recipe_id: text('recipe_id').notNull(),
  order: integer('order').notNull(),
  value: text('value').notNull(),
});

export const recipeNotes = sqliteTable('recipe_notes', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  user_id: text('user_id').notNull(),
  recipe_id: text('recipe_id').notNull(),
  value: text('value').notNull(),
});

// Relations

export const profilesRelations = relations(profiles, () => ({}));

export const recipeSectionsRelations = relations(recipeSections, ({ many }) => ({
  recipes: many(recipes),
}));

export const recipeDifficultiesRelations = relations(recipeDifficulties, ({ many }) => ({
  recipes: many(recipes),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  section: one(recipeSections, {
    fields: [recipes.section_id],
    references: [recipeSections.id],
  }),
  difficultyLevel: one(recipeDifficulties, {
    fields: [recipes.difficulty],
    references: [recipeDifficulties.id],
  }),
  ingredients: many(recipeIngredients),
  instructions: many(recipeInstructions),
  notes: many(recipeNotes),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipe_id],
    references: [recipes.id],
  }),
}));

export const recipeInstructionsRelations = relations(recipeInstructions, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeInstructions.recipe_id],
    references: [recipes.id],
  }),
}));

export const recipeNotesRelations = relations(recipeNotes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeNotes.recipe_id],
    references: [recipes.id],
  }),
}));

// DrizzleAppSchema

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

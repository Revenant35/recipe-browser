import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { DrizzleAppSchema, type DrizzleTableWithPowerSyncOptions } from '@powersync/drizzle-driver';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey().notNull(),
  updated_at: text('updated_at'),
  username: text('username'),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  website: text('website'),
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  name: text('name').notNull(),
  user_id: text('user_id').notNull(),
});

export const recipeTags = sqliteTable('recipe_tags', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  recipe_id: text('recipe_id').notNull(),
  tag_id: text('tag_id').notNull(),
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

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey().notNull(),
  filename: text('filename').notNull(),
  local_uri: text('local_uri'),
  timestamp: integer('timestamp'),
  size: integer('size'),
  media_type: text('media_type'),
  state: integer('state').notNull(),
  has_synced: integer('has_synced'),
  meta_data: text('meta_data'),
});

// Relations

export const profilesRelations = relations(profiles, () => ({}));

export const tagsRelations = relations(tags, ({ many }) => ({
  recipeTags: many(recipeTags),
}));

export const recipeTagsRelations = relations(recipeTags, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeTags.recipe_id],
    references: [recipes.id],
  }),
  tag: one(tags, {
    fields: [recipeTags.tag_id],
    references: [tags.id],
  }),
}));

export const recipeDifficultiesRelations = relations(recipeDifficulties, ({ many }) => ({
  recipes: many(recipes),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  recipeTags: many(recipeTags),
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
  tags,
  tagsRelations,
  recipeTags,
  recipeTagsRelations,
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

const attachmentsWithOptions: DrizzleTableWithPowerSyncOptions = {
  tableDefinition: attachments,
  options: { localOnly: true },
};

export const powerSyncSchema = {
  ...drizzleSchema,
  attachments: attachmentsWithOptions,
};

export const AppSchema = new DrizzleAppSchema(powerSyncSchema);

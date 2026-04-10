import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { DrizzleAppSchema, type DrizzleTableWithPowerSyncOptions } from '@powersync/drizzle-driver';

export { SupabaseSchema } from './supabase';

export const badges = sqliteTable('badges', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  name: text('name').notNull(),
  storage_path: text('storage_path').notNull(),
});

export const wallpapers = sqliteTable('wallpapers', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  name: text('name').notNull(),
  storage_path: text('storage_path').notNull(),
});

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey().notNull(),
  updated_at: text('updated_at'),
  username: text('username'),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  bio: text('bio'),
  wallpaper_id: text('wallpaper_id'),
  badge_id: text('badge_id'),
});

export const recipeTags = sqliteTable('recipe_tags', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  recipe_id: text('recipe_id').notNull(),
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
  difficulty: text('difficulty', { enum: ['Easy', 'Medium', 'Hard'] }),
  description: text('description').notNull(),
  carbs_grams: integer('carbs_grams'),
  protein_grams: integer('protein_grams'),
  fat_grams: integer('fat_grams'),
  calories: integer('calories'),
  category: text('category'),
  cuisine: text('cuisine'),
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

export const savedRecipes = sqliteTable('saved_recipes', {
  id: text('id').primaryKey().notNull(),
  created_at: text('created_at'),
  user_id: text('user_id').notNull(),
  recipe_id: text('recipe_id').notNull(),
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

export const badgesRelations = relations(badges, ({ many }) => ({
  profiles: many(profiles),
}));

export const wallpapersRelations = relations(wallpapers, ({ many }) => ({
  profiles: many(profiles),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  wallpaper: one(wallpapers, {
    fields: [profiles.wallpaper_id],
    references: [wallpapers.id],
  }),
  badge: one(badges, {
    fields: [profiles.badge_id],
    references: [badges.id],
  }),
  recipes: many(recipes),
}));

export const recipeTagsRelations = relations(recipeTags, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeTags.recipe_id],
    references: [recipes.id],
  }),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [recipes.user_id],
    references: [profiles.id],
  }),
  recipeTags: many(recipeTags),
  ingredients: many(recipeIngredients),
  instructions: many(recipeInstructions),
  notes: many(recipeNotes),
  savedRecipes: many(savedRecipes),
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

export const savedRecipesRelations = relations(savedRecipes, ({ one }) => ({
  recipe: one(recipes, {
    fields: [savedRecipes.recipe_id],
    references: [recipes.id],
  }),
}));

export const drizzleSchema = {
  badges,
  badgesRelations,
  wallpapers,
  wallpapersRelations,
  profiles,
  profilesRelations,
  recipeTags,
  recipeTagsRelations,
  recipes,
  recipesRelations,
  recipeIngredients,
  recipeIngredientsRelations,
  recipeInstructions,
  recipeInstructionsRelations,
  recipeNotes,
  recipeNotesRelations,
  savedRecipes,
  savedRecipesRelations,
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

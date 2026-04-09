import { Injectable, inject } from '@angular/core';
import { asc, eq } from 'drizzle-orm';
import { PowerSyncService } from './powersync.service';
import { recipes, recipeIngredients, recipeInstructions, recipeNotes, recipeTags, recipeDifficulties, savedRecipes } from '@app/db/schema';
import { RecipeWithDetails, RecipeDifficulty } from '@app/models';
import { SUPABASE_CLIENT } from '@app/supabase/supabase-client.token';

export interface CreateRecipeInput {
  name: string;
  description: string;
  user_id: string;
  servings?: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  source?: string;
  difficulty?: string;
  carbs_grams?: number;
  protein_grams?: number;
  fat_grams?: number;
  calories?: number;
  ingredients?: string[];
  instructions?: string[];
}

export interface UpdateRecipeInput {
  id: string;
  name: string;
  description: string;
  servings?: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  source?: string;
  difficulty?: string;
  carbs_grams?: number;
  protein_grams?: number;
  fat_grams?: number;
  calories?: number;
  ingredients?: string[];
  instructions?: string[];
}

export interface ExploreRecipe {
  id: string;
  created_at: string;
  name: string;
  user_id: string;
  description: string;
  servings: number | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  difficulty: string | null;
  recipe_difficulties: { name: string } | null;
  profiles: { full_name: string | null; username: string | null; avatar_url: string | null } | null;
}

export interface ExploreResult {
  recipes: ExploreRecipe[];
  count: number;
}

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private powerSync = inject(PowerSyncService);
  private supabase = inject(SUPABASE_CLIENT);

  private get db() {
    return this.powerSync.drizzle;
  }

  getRecipes(): Promise<RecipeWithDetails[]> {
    return this.db.query.recipes.findMany({
      with: {
        recipeTags: { with: { tag: true } },
        difficultyLevel: true,
        ingredients: { orderBy: asc(recipeIngredients.order) },
        instructions: { orderBy: asc(recipeInstructions.order) },
        notes: true,
      },
    });
  }

  getRecipe(id: string): Promise<RecipeWithDetails | undefined> {
    return this.db.query.recipes.findFirst({
      where: eq(recipes.id, id),
      with: {
        recipeTags: { with: { tag: true } },
        difficultyLevel: true,
        ingredients: { orderBy: asc(recipeIngredients.order) },
        instructions: { orderBy: asc(recipeInstructions.order) },
        notes: true,
      },
    });
  }

  async createRecipe(input: CreateRecipeInput): Promise<string> {
    const recipeId = crypto.randomUUID();
    const now = new Date().toISOString();

    const { ingredients, instructions, ...recipeData } = input;

    await this.db.insert(recipes).values({
      id: recipeId,
      created_at: now,
      ...recipeData,
    });

    if (ingredients?.length) {
      await this.db.insert(recipeIngredients).values(
        ingredients.map((value, index) => ({
          id: crypto.randomUUID(),
          created_at: now,
          recipe_id: recipeId,
          value,
          order: index,
        })),
      );
    }

    if (instructions?.length) {
      await this.db.insert(recipeInstructions).values(
        instructions.map((value, index) => ({
          id: crypto.randomUUID(),
          created_at: now,
          recipe_id: recipeId,
          value,
          order: index,
        })),
      );
    }

    return recipeId;
  }

  async updateRecipe(input: UpdateRecipeInput): Promise<void> {
    const { id, ingredients, instructions, ...recipeData } = input;
    const now = new Date().toISOString();

    await this.db
      .update(recipes)
      .set(recipeData)
      .where(eq(recipes.id, id));

    await this.db.delete(recipeIngredients).where(eq(recipeIngredients.recipe_id, id));
    await this.db.delete(recipeInstructions).where(eq(recipeInstructions.recipe_id, id));

    if (ingredients?.length) {
      await this.db.insert(recipeIngredients).values(
        ingredients.map((value, index) => ({
          id: crypto.randomUUID(),
          created_at: now,
          recipe_id: id,
          value,
          order: index,
        })),
      );
    }

    if (instructions?.length) {
      await this.db.insert(recipeInstructions).values(
        instructions.map((value, index) => ({
          id: crypto.randomUUID(),
          created_at: now,
          recipe_id: id,
          value,
          order: index,
        })),
      );
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    await this.db.delete(recipeIngredients).where(eq(recipeIngredients.recipe_id, id));
    await this.db.delete(recipeInstructions).where(eq(recipeInstructions.recipe_id, id));
    await this.db.delete(recipeNotes).where(eq(recipeNotes.recipe_id, id));
    await this.db.delete(recipeTags).where(eq(recipeTags.recipe_id, id));
    await this.db.delete(recipes).where(eq(recipes.id, id));
  }

  getDifficulties(): Promise<RecipeDifficulty[]> {
    return this.db.query.recipeDifficulties.findMany();
  }

  // --- Saved Recipes (PowerSync local DB) ---

  /** Get all recipes the user has saved (includes own recipes via saved_recipes join) */
  async getSavedRecipes(): Promise<RecipeWithDetails[]> {
    const saved = await this.db.query.savedRecipes.findMany({
      with: {
        recipe: {
          with: {
            recipeTags: { with: { tag: true } },
            difficultyLevel: true,
            ingredients: { orderBy: asc(recipeIngredients.order) },
            instructions: { orderBy: asc(recipeInstructions.order) },
            notes: true,
          },
        },
      },
    });
    return saved.map((s) => s.recipe);
  }

  /** Check if a recipe is saved by the current user (local DB) */
  async isRecipeSaved(recipeId: string): Promise<boolean> {
    const row = await this.db.query.savedRecipes.findFirst({
      where: eq(savedRecipes.recipe_id, recipeId),
    });
    return !!row;
  }

  /** Save a recipe for the current user */
  async saveRecipe(userId: string, recipeId: string): Promise<void> {
    await this.db.insert(savedRecipes).values({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: userId,
      recipe_id: recipeId,
    });
  }

  /** Unsave a recipe for the current user */
  async unsaveRecipe(recipeId: string): Promise<void> {
    await this.db.delete(savedRecipes).where(eq(savedRecipes.recipe_id, recipeId));
  }

  // --- Explore (Supabase direct queries) ---

  /** Search all recipes via Supabase (not local DB) with pagination */
  async exploreRecipes(query: string, page: number, pageSize: number): Promise<ExploreResult> {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let request = this.supabase
      .from('recipes')
      .select(
        'id, created_at, name, user_id, description, servings, prep_time_minutes, cook_time_minutes, difficulty, recipe_difficulties(name), profiles!recipes_user_id_fkey(full_name, username, avatar_url)',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (query.trim()) {
      request = request.ilike('name', `%${query.trim()}%`);
    }

    const { data, count, error } = await request;
    if (error) throw error;

    return {
      recipes: (data ?? []) as unknown as ExploreRecipe[],
      count: count ?? 0,
    };
  }

  /** Get a single recipe with full details from Supabase (for when it's not in local DB) */
  async getRecipeFromSupabase(id: string): Promise<RecipeWithDetails | undefined> {
    const { data: recipe, error: recipeError } = await this.supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (recipeError || !recipe) return undefined;

    const [ingredientsRes, instructionsRes, notesRes, tagsRes] = await Promise.all([
      this.supabase
        .from('recipe_ingredients')
        .select('*')
        .eq('recipe_id', id)
        .order('order', { ascending: true }),
      this.supabase
        .from('recipe_instructions')
        .select('*')
        .eq('recipe_id', id)
        .order('order', { ascending: true }),
      this.supabase
        .from('recipe_notes')
        .select('*')
        .eq('recipe_id', id),
      this.supabase
        .from('recipe_tags')
        .select('*, tags(*)')
        .eq('recipe_id', id),
    ]);

    let difficultyLevel = null;
    if (recipe.difficulty) {
      const { data: diff } = await this.supabase
        .from('recipe_difficulties')
        .select('*')
        .eq('id', recipe.difficulty)
        .single();
      difficultyLevel = diff ?? null;
    }

    return {
      ...recipe,
      ingredients: ingredientsRes.data ?? [],
      instructions: instructionsRes.data ?? [],
      notes: notesRes.data ?? [],
      recipeTags: (tagsRes.data ?? []).map((rt: any) => ({
        ...rt,
        tag: rt.tags,
      })),
      difficultyLevel,
    } as unknown as RecipeWithDetails;
  }

  /** Get saved recipe IDs from Supabase (for showing bookmark state on Explore page) */
  async getSavedRecipeIds(): Promise<Set<string>> {
    const { data, error } = await this.supabase
      .from('saved_recipes')
      .select('recipe_id');

    if (error) throw error;
    return new Set((data ?? []).map((r: { recipe_id: string }) => r.recipe_id));
  }
}

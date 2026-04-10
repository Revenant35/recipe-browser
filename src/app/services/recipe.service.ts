import { Injectable, inject, OnDestroy } from '@angular/core';
import { asc, eq } from 'drizzle-orm';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import {
  recipes,
  recipeIngredients,
  recipeInstructions,
  recipeNotes,
  recipeTags,
  savedRecipes,
} from '@db';
import { Recipe, CreateRecipe, CountedResult } from '@types';
import { SUPABASE_CLIENT } from '@tokens/supabase-client.token';
import { RecipeMapper } from '@mappers';
import { AuthService } from './auth.service';
import { DATABASE } from './tokens/database.token';
import { POWERSYNC_DATABASE } from './tokens/powersync-database.token';

export interface UpdateRecipeInput extends CreateRecipe {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class RecipeService implements OnDestroy {
  private readonly database = inject(DATABASE);
  private readonly powersync = inject(POWERSYNC_DATABASE);
  private readonly supabase = inject(SUPABASE_CLIENT);
  private readonly auth = inject(AuthService);
  private readonly mapper = inject(RecipeMapper);
  private readonly abortController = new AbortController();

  private readonly _recipes$ = new ReplaySubject<Recipe[]>(1);
  public readonly recipes$ = this._recipes$.asObservable();

  constructor() {
    this.watchRecipes();
  }

  ngOnDestroy(): void {
    this.abortController.abort();
    this._recipes$.complete();
  }

  private async watchRecipes(): Promise<void> {
    const watch = this.powersync.watch('SELECT id FROM recipes', [], {
      signal: this.abortController.signal,
    });

    for await (const _ of watch) {
      const recipes = await this.getRecipes();
      this._recipes$.next(recipes);
    }
  }

  async getRecipes(): Promise<Recipe[]> {
    const session = await firstValueFrom(this.auth.session$);
    const userId = session?.user?.id;

    let savedRecipeWhereClause;
    if (userId) {
      savedRecipeWhereClause = eq(savedRecipes.user_id, userId);
    } else {
      savedRecipeWhereClause = undefined;
    }

    const rows = await this.database.query.recipes.findMany({
      with: {
        recipeTags: true,
        ingredients: { orderBy: asc(recipeIngredients.order) },
        instructions: { orderBy: asc(recipeInstructions.order) },
        notes: true,
        savedRecipes: {
          where: savedRecipeWhereClause,
        },
        profile: { with: { badge: true, wallpaper: true } },
      },
    });

    return rows.map((row) => this.mapper.fromEntity(row));
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const session = await firstValueFrom(this.auth.session$);
    const userId = session?.user?.id;

    let savedRecipeWhereClause;
    if (userId) {
      savedRecipeWhereClause = eq(savedRecipes.user_id, userId);
    } else {
      savedRecipeWhereClause = undefined;
    }

    const row = await this.database.query.recipes.findFirst({
      where: eq(recipes.id, id),
      with: {
        recipeTags: true,
        ingredients: { orderBy: asc(recipeIngredients.order) },
        instructions: { orderBy: asc(recipeInstructions.order) },
        notes: true,
        profile: { with: { badge: true, wallpaper: true } },
        savedRecipes: {
          where: savedRecipeWhereClause,
        },
      },
    });

    if (!row) {
      return undefined;
    }

    return this.mapper.fromEntity(row);
  }

  async createRecipe(recipe: CreateRecipe): Promise<string> {
    const session = await firstValueFrom(this.auth.session$);
    if (!session?.user) throw new Error('You must be logged in to create a recipe.');

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const { ingredients, instructions, ...recipeData } = recipe;

    await this.database.insert(recipes).values({
      id,
      created_at: now,
      user_id: session.user.id,
      ...recipeData,
    });

    if (ingredients?.length) {
      await this.database.insert(recipeIngredients).values(
        ingredients.map((value: string, index: number) => ({
          id: crypto.randomUUID(),
          created_at: now,
          recipe_id: id,
          value,
          order: index,
        })),
      );
    }

    if (instructions?.length) {
      await this.database.insert(recipeInstructions).values(
        instructions.map((value: string, index: number) => ({
          id: crypto.randomUUID(),
          created_at: now,
          recipe_id: id,
          value,
          order: index,
        })),
      );
    }

    return id;
  }

  async updateRecipe(input: UpdateRecipeInput): Promise<void> {
    const { id, ingredients, instructions, ...recipeData } = input;
    const now = new Date().toISOString();

    await this.database.update(recipes).set(recipeData).where(eq(recipes.id, id));

    await this.database.delete(recipeIngredients).where(eq(recipeIngredients.recipe_id, id));
    await this.database.delete(recipeInstructions).where(eq(recipeInstructions.recipe_id, id));

    if (ingredients?.length) {
      await this.database.insert(recipeIngredients).values(
        ingredients.map((value: string, index: number) => ({
          id: crypto.randomUUID(),
          created_at: now,
          recipe_id: id,
          value,
          order: index,
        })),
      );
    }

    if (instructions?.length) {
      await this.database.insert(recipeInstructions).values(
        instructions.map((value: string, index: number) => ({
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
    await this.database.delete(savedRecipes).where(eq(savedRecipes.recipe_id, id));
    await this.database.delete(recipeIngredients).where(eq(recipeIngredients.recipe_id, id));
    await this.database.delete(recipeInstructions).where(eq(recipeInstructions.recipe_id, id));
    await this.database.delete(recipeNotes).where(eq(recipeNotes.recipe_id, id));
    await this.database.delete(recipeTags).where(eq(recipeTags.recipe_id, id));
    await this.database.delete(recipes).where(eq(recipes.id, id));
  }

  // --- Saved Recipes (PowerSync local DB) ---

  /** Save a recipe for the current user */
  async saveRecipe(userId: string, recipeId: string): Promise<void> {
    await this.database.insert(savedRecipes).values({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      user_id: userId,
      recipe_id: recipeId,
    });
  }

  /** Unsave a recipe for the current user */
  async unsaveRecipe(recipeId: string): Promise<void> {
    await this.database.delete(savedRecipes).where(eq(savedRecipes.recipe_id, recipeId));
  }

  // --- Explore (Supabase direct queries) ---

  /** Search all recipes via Supabase (not local DB) with pagination */
  async exploreRecipes(query: string, page: number, pageSize: number): Promise<CountedResult<Recipe>> {
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
      items: (data ?? []).map((row) => ({
        id: row.id,
        created_at: row.created_at ? new Date(row.created_at) : null,
        name: row.name,
        description: row.description,
        servings: row.servings,
        prep_time_minutes: row.prep_time_minutes,
        cook_time_minutes: row.cook_time_minutes,
        difficulty: row.difficulty,
        source: null,
        calories: null,
        protein_grams: null,
        carbs_grams: null,
        fat_grams: null,
        category: null,
        cuisine: null,
        tags: [],
        ingredients: [],
        instructions: [],
        notes: [],
        author: {
          id: row.user_id,
          updated_at: null,
          username: row.profiles?.username ?? null,
          full_name: row.profiles?.full_name ?? null,
          avatar_url: row.profiles?.avatar_url ?? null,
          bio: null,
          badge: null,
          wallpaper: null,
        },
      })) as Recipe[],
      count: count ?? 0,
    };
  }

  /** Get a single recipe with full details from Supabase (for when it's not in local DB) */
  async getRecipeFromSupabase(id: string): Promise<Recipe | undefined> {
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
      this.supabase.from('recipe_notes').select('*').eq('recipe_id', id),
      this.supabase.from('recipe_tags').select('*').eq('recipe_id', id),
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
      tags: (tagsRes.data ?? []).map(({ id, created_at, name }: any) => ({ id, created_at, name })),
      difficultyLevel,
    } as unknown as Recipe;
  }

  /** Get saved recipe IDs from Supabase (for showing bookmark state on Explore page) */
  async getSavedRecipeIds(): Promise<Set<string>> {
    const { data, error } = await this.supabase.from('saved_recipes').select('recipe_id');

    if (error) throw error;
    return new Set((data ?? []).map((r) => r.recipe_id));
  }
}

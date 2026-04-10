import { Injectable, inject, OnDestroy } from '@angular/core';
import { asc, eq, isNull } from 'drizzle-orm';
import { firstValueFrom, ReplaySubject } from 'rxjs';
import {
  recipes,
  recipeIngredients,
  recipeInstructions,
  recipeNotes,
  recipeTags,
  savedRecipes,
} from '@db';
import { Recipe } from '@types';
import { SUPABASE_CLIENT } from '@tokens/supabase-client.token';
import { RecipeMapper } from '@mappers';
import { AuthService } from './auth.service';
import { DATABASE } from './tokens/database.token';

@Injectable({ providedIn: 'root' })
export class RecipeService implements OnDestroy {
  private readonly database = inject(DATABASE);
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
    const watch = this.database.watch('SELECT id FROM recipes', [], {
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
      savedRecipeWhereClause = isNull(savedRecipes.user_id);
    }

    const rows = await this.database.query.recipes.findMany({
      with: {
        recipeTags: true,
        ingredients: { orderBy: asc(recipeIngredients.order) },
        instructions: { orderBy: asc(recipeInstructions.order) },
        notes: true,
        savedRecipes: {
          where: savedRecipeWhereClause,
          limit: 1,
        },
      },
    });

    return rows.map(this.mapper.fromEntity);
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const session = await firstValueFrom(this.auth.session$);
    const userId = session?.user?.id;

    let savedRecipeWhereClause;
    if (userId) {
      savedRecipeWhereClause = eq(savedRecipes.user_id, userId);
    } else {
      savedRecipeWhereClause = isNull(savedRecipes.user_id);
    }

    const row = await this.database.query.recipes.findFirst({
      where: eq(recipes.id, id),
      with: {
        recipeTags: true,
        ingredients: { orderBy: asc(recipeIngredients.order) },
        instructions: { orderBy: asc(recipeInstructions.order) },
        notes: true,
        savedRecipes: {
          where: savedRecipeWhereClause,
          limit: 1,
        },
      },
    });

    if (!row) {
      return undefined;
    }

    return this.mapper.fromEntity(row);
  }

  async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const row = this.mapper.toEntity({
      recipe
    });

    const { ingredients, instructions, ...recipeData } = recipe;

    await this.database.insert(recipes).values({
      id: id,
      created_at: now,
      ...recipeData,
    });

    if (ingredients?.length) {
      await this.database.insert(recipeIngredients).values(
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
      await this.database.insert(recipeInstructions).values(
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

    await this.database.update(recipes).set(recipeData).where(eq(recipes.id, id));

    await this.database.delete(recipeIngredients).where(eq(recipeIngredients.recipe_id, id));
    await this.database.delete(recipeInstructions).where(eq(recipeInstructions.recipe_id, id));

    if (ingredients?.length) {
      await this.database.insert(recipeIngredients).values(
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
      await this.database.insert(recipeInstructions).values(
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
    return new Set((data ?? []).map((r: { recipe_id: string }) => r.recipe_id));
  }
}

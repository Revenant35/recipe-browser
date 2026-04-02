import { Injectable, inject } from '@angular/core';
import { asc, eq } from 'drizzle-orm';
import { PowerSyncService } from './powersync.service';
import { recipes, recipeIngredients, recipeInstructions, recipeDifficulties } from '@app/db/schema';
import { RecipeWithDetails, RecipeDifficulty } from '@app/models';

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

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private powerSync = inject(PowerSyncService);

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

  getDifficulties(): Promise<RecipeDifficulty[]> {
    return this.db.query.recipeDifficulties.findMany();
  }
}

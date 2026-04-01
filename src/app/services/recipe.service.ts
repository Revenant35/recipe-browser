import { Injectable, inject } from '@angular/core';
import { asc, eq } from 'drizzle-orm';
import { PowerSyncService } from './powersync.service';
import { recipes, recipeIngredients, recipeInstructions } from '@app/db/schema';
import { RecipeWithDetails } from '@app/models';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private powerSync = inject(PowerSyncService);

  private get db() {
    return this.powerSync.drizzle;
  }

  getRecipes(): Promise<RecipeWithDetails[]> {
    return this.db.query.recipes.findMany({
      with: {
        section: true,
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
        section: true,
        difficultyLevel: true,
        ingredients: { orderBy: asc(recipeIngredients.order) },
        instructions: { orderBy: asc(recipeInstructions.order) },
        notes: true,
      },
    });
  }
}

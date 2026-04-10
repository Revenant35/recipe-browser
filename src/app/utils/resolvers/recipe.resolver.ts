import { inject } from '@angular/core';
import { RecipeService } from '@services/recipe.service';
import { Recipe } from '@types';
import { ResolveFn } from '@angular/router';

export const recipeResolver: ResolveFn<Recipe> = async (route) => {
  const recipeService = inject(RecipeService);

  const id = route.paramMap.get('id');

  if (!id) {
    throw new Error('Missing required route parameter: id');
  }

  // Try local PowerSync DB first (recipe is saved/owned), fall back to Supabase
  const recipe =
    (await recipeService.getRecipe(id)) ?? (await recipeService.getRecipeFromSupabase(id));

  if (!recipe) {
    throw new Error(`Recipe not found: ${id}`);
  }

  return recipe;
};

import { inject } from '@angular/core';
import { RecipeService } from '@app/services/recipe.service';
import { RecipeWithDetails } from '@app/models';
import { ResolveFn } from '@angular/router';

export const recipeResolver: ResolveFn<RecipeWithDetails> = async (route) => {
  const id = route.paramMap.get('id');

  if (!id) {
    throw new Error('Missing required route parameter: id');
  }

  const recipeService = inject(RecipeService);
  const recipe = await recipeService.getRecipe(id);

  if (!recipe) {
    throw new Error(`Recipe not found: ${route.paramMap.get('id')}`);
  }

  return recipe;
};

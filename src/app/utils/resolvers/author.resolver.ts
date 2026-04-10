import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { RecipeService } from '@services/recipe.service';
import { ProfileService } from '@services/profile.service';
import { Profile } from '@types';

export const authorResolver: ResolveFn<Profile> = async (route) => {
  const recipeService = inject(RecipeService);
  const profileService = inject(ProfileService);

  const id = route.paramMap.get('id');

  if (!id) {
    throw new Error('Missing required route parameter: id');
  }

  // Try local PowerSync DB first, fall back to Supabase
  const recipe =
    (await recipeService.getRecipe(id)) ?? (await recipeService.getRecipeFromSupabase(id));

  if (!recipe) {
    throw new Error(`Recipe not found: ${id}`);
  }

  const profile =
    (await profileService.getProfile(recipe.user_id)) ??
    (await profileService.getProfileFromSupabase(recipe.user_id));

  if (!profile) {
    throw new Error(`Profile not found for user: ${recipe.user_id}`);
  }

  return profile;
};

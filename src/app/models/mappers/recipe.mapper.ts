import { inject, Injectable } from '@angular/core';
import { Recipe } from '@types';
import {
  RecipeRow,
  RecipeIngredientRow,
  RecipeInstructionRow,
  RecipeNoteRow,
  RecipeTagRow,
  SavedRecipeRow,
  ProfileRow,
  BadgeRow,
  WallpaperRow,
} from '@entities';
import { ProfileMapper } from './profile.mapper';

@Injectable({ providedIn: 'root' })
export class RecipeMapper {
  private readonly profileMapper = inject(ProfileMapper);

  toEntity(recipe: Recipe): {
    ingredients: RecipeIngredientRow[];
    instructions: RecipeInstructionRow[];
    recipeTags: RecipeTagRow[];
    notes: RecipeNoteRow[];
    profile: ProfileRow & { badge: BadgeRow | null; wallpaper: WallpaperRow | null };
  } & RecipeRow {
    return {
      id: recipe.id,
      created_at: recipe.created_at?.toLocaleString() ?? null,
      name: recipe.name,
      user_id: recipe.author.id,
      servings: recipe.servings,
      prep_time_minutes: recipe.prep_time_minutes,
      cook_time_minutes: recipe.cook_time_minutes,
      source: recipe.source,
      difficulty: recipe.difficulty,
      description: recipe.description,
      carbs_grams: recipe.carbs_grams,
      protein_grams: recipe.protein_grams,
      fat_grams: recipe.fat_grams,
      calories: recipe.calories,
      category: recipe.category,
      cuisine: recipe.cuisine,
      ingredients: recipe.ingredients.map((ingredient, index) => ({
        ...ingredient,
        created_at: ingredient.created_at?.toLocaleString() ?? null,
        order: index,
        recipe_id: recipe.id,
      })),
      instructions: recipe.instructions.map((instruction, index) => ({
        ...instruction,
        created_at: instruction.created_at?.toLocaleString() ?? null,
        order: index,
        recipe_id: recipe.id,
      })),
      recipeTags: recipe.tags.map((tag) => ({
        ...tag,
        created_at: tag.created_at?.toLocaleString() ?? null,
        recipe_id: recipe.id,
      })),
      notes: recipe.notes.map((note) => ({
        ...note,
        created_at: note.created_at?.toLocaleString() ?? null,
        recipe_id: recipe.id,
      })),
      profile: this.profileMapper.toEntity(recipe.author),
    };
  }

  fromEntity(
    row: {
      ingredients: RecipeIngredientRow[];
      instructions: RecipeInstructionRow[];
      recipeTags: RecipeTagRow[];
      notes: RecipeNoteRow[];
      savedRecipes: SavedRecipeRow[];
      profile: ProfileRow & { badge: BadgeRow | null; wallpaper: WallpaperRow | null };
    } & RecipeRow,
  ): Recipe {
    return {
      id: row.id,
      created_at: row.created_at ? new Date(row.created_at) : null,
      name: row.name,
      servings: row.servings,
      prep_time_minutes: row.prep_time_minutes,
      cook_time_minutes: row.cook_time_minutes,
      source: row.source,
      difficulty: row.difficulty,
      description: row.description,
      carbs_grams: row.carbs_grams,
      protein_grams: row.protein_grams,
      fat_grams: row.fat_grams,
      calories: row.calories,
      category: row.category,
      cuisine: row.cuisine,
      is_saved: row.savedRecipes.length > 0,
      tags: row.recipeTags
        .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
        .map((tag) => ({
          id: tag.id,
          created_at: tag.created_at ? new Date(tag.created_at) : null,
          name: tag.name,
        })),
      ingredients: row.ingredients
        .sort((a, b) => a.order - b.order)
        .map((ingredient) => ({
          id: ingredient.id,
          created_at: ingredient.created_at ? new Date(ingredient.created_at) : null,
          value: ingredient.value,
        })),
      instructions: row.instructions
        .sort((a, b) => a.order - b.order)
        .map((instruction) => ({
          id: instruction.id,
          created_at: instruction.created_at ? new Date(instruction.created_at) : null,
          value: instruction.value,
        })),
      notes: row.notes
        .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
        .map((note) => ({
          id: note.id,
          created_at: note.created_at ? new Date(note.created_at) : null,
          user_id: note.user_id,
          value: note.value,
        })),
      author: this.profileMapper.fromEntity(row.profile),
    };
  }
}

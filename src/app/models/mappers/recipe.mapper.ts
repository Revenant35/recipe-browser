import { Injectable } from '@angular/core';
import { Recipe } from '@types';
import {
  RecipeRow,
  RecipeIngredientRow,
  RecipeInstructionRow,
  RecipeNoteRow,
  RecipeTagRow,
  SavedRecipeRow,
} from '@entities';

@Injectable({ providedIn: 'root' })
export class RecipeMapper {
  toEntity(row: Recipe): {
    ingredients: RecipeIngredientRow[];
    instructions: RecipeInstructionRow[];
    recipeTags: RecipeTagRow[];
    notes: RecipeNoteRow[];
  } & RecipeRow {
    return {
      id: row.id,
      created_at: row.created_at?.toLocaleString() ?? null,
      name: row.name,
      user_id: row.user_id,
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
      ingredients: row.ingredients.map((ingredient, index) => ({
        ...ingredient,
        created_at: ingredient.created_at?.toLocaleString() ?? null,
        order: index,
        recipe_id: row.id,
      })),
      instructions: row.instructions.map((instruction, index) => ({
        ...instruction,
        created_at: instruction.created_at?.toLocaleString() ?? null,
        order: index,
        recipe_id: row.id,
      })),
      recipeTags: row.tags.map((tag) => ({
        ...tag,
        created_at: tag.created_at?.toLocaleString() ?? null,
        recipe_id: row.id,
      })),
      notes: row.notes.map((note) => ({
        ...note,
        created_at: note.created_at?.toLocaleString() ?? null,
        recipe_id: row.id,
      })),
    };
  }

  fromEntity(
    entity: {
      ingredients: RecipeIngredientRow[];
      instructions: RecipeInstructionRow[];
      recipeTags: RecipeTagRow[];
      notes: RecipeNoteRow[];
      savedRecipes: SavedRecipeRow[];
    } & RecipeRow,
  ): Recipe {
    return {
      id: entity.id,
      created_at: entity.created_at ? new Date(entity.created_at) : null,
      name: entity.name,
      user_id: entity.user_id,
      servings: entity.servings,
      prep_time_minutes: entity.prep_time_minutes,
      cook_time_minutes: entity.cook_time_minutes,
      source: entity.source,
      difficulty: entity.difficulty,
      description: entity.description,
      carbs_grams: entity.carbs_grams,
      protein_grams: entity.protein_grams,
      fat_grams: entity.fat_grams,
      calories: entity.calories,
      category: entity.category,
      cuisine: entity.cuisine,
      is_saved: entity.savedRecipes.length > 0,
      tags: entity.recipeTags
        .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
        .map((tag) => ({
          id: tag.id,
          created_at: tag.created_at ? new Date(tag.created_at) : null,
          name: tag.name,
        })),
      ingredients: entity.ingredients
        .sort((a, b) => a.order - b.order)
        .map((ingredient) => ({
          id: ingredient.id,
          created_at: ingredient.created_at ? new Date(ingredient.created_at) : null,
          value: ingredient.value,
        })),
      instructions: entity.instructions
        .sort((a, b) => a.order - b.order)
        .map((instruction) => ({
          id: instruction.id,
          created_at: instruction.created_at ? new Date(instruction.created_at) : null,
          value: instruction.value,
        })),
      notes: entity.notes
        .sort((a, b) => (a.created_at ?? '').localeCompare(b.created_at ?? ''))
        .map((note) => ({
          id: note.id,
          created_at: note.created_at ? new Date(note.created_at) : null,
          user_id: note.user_id,
          value: note.value,
        })),
    };
  }
}

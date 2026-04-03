import { Routes } from '@angular/router';
import { recipeResolver } from '@app/resolvers/recipe.resolver';
import { authorResolver } from '@app/resolvers/author.resolver';

export const recipesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./recipes.page').then((p) => p.RecipesPage),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./create-recipe/create-recipe.page').then((p) => p.CreateRecipePage),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./edit-recipe/edit-recipe.page').then((p) => p.EditRecipePage),
    resolve: { recipe: recipeResolver },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./recipe-details/recipe-details.page').then((p) => p.RecipeDetailsPage),
    resolve: { recipe: recipeResolver, author: authorResolver },
  },
];

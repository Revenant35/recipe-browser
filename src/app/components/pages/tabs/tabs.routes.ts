import { Routes } from '@angular/router';
import { recipeResolver } from '@resolvers';

export const tabsRoutes: Routes = [
  {
    path: 'saved',
    loadComponent: () => import('./saved/saved.page').then((p) => p.SavedPage),
  },
  {
    path: 'explore',
    loadComponent: () => import('./explore/explore.page').then((p) => p.ExplorePage),
  },
  {
    path: 'recipes/create',
    loadComponent: () =>
      import('./recipes/create-recipe/create-recipe.page').then((p) => p.CreateRecipePage),
  },
  {
    path: 'recipes/:id/edit',
    loadComponent: () =>
      import('./recipes/edit-recipe/edit-recipe.page').then((p) => p.EditRecipePage),
    resolve: { recipe: recipeResolver },
  },
  {
    path: 'recipes/:id',
    loadComponent: () =>
      import('./recipes/recipe-details/recipe-details.page').then((p) => p.RecipeDetailsPage),
    resolve: { recipe: recipeResolver },
  },
  {
    path: 'more',
    loadChildren: () => import('./more/more.routes').then((r) => r.moreRoutes),
  },
  {
    path: '',
    redirectTo: 'saved',
    pathMatch: 'full',
  },
];

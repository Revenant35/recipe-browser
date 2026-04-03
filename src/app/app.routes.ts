import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { recipeResolver } from './resolvers/recipe.resolver';
import { authorResolver } from './resolvers/author.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    canActivate: [authGuard],
    loadChildren: () => import('./pages/tabs/tabs.routes').then((m) => m.tabsRoutes),
  },
  {
    path: 'recipes/create',
    loadComponent: () => import('./pages/create-recipe/create-recipe.page').then((m) => m.CreateRecipePage),
    canActivate: [authGuard],
  },
  {
    path: 'recipes/:id/edit',
    loadComponent: () => import('./pages/edit-recipe/edit-recipe.page').then((m) => m.EditRecipePage),
    canActivate: [authGuard],
    resolve: { recipe: recipeResolver },
  },
  {
    path: 'recipes/:id',
    loadComponent: () => import('./pages/recipe/recipe.page').then((m) => m.RecipePage),
    canActivate: [authGuard],
    resolve: { recipe: recipeResolver, author: authorResolver },
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes),
  },
];

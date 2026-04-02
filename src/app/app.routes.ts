import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { recipeResolver } from './resolvers/recipe.resolver';
import { authorResolver } from './resolvers/author.resolver';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'recipes/create',
    loadComponent: () => import('./pages/create-recipe/create-recipe.page').then((m) => m.CreateRecipePage),
    canActivate: [authGuard],
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
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

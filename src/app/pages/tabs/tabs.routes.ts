import { Routes } from '@angular/router';

export const tabsRoutes: Routes = [
  {
    path: 'recipes',
    loadChildren: () => import('./recipes/recipes.routes').then((r) => r.recipesRoutes),
  },
  {
    path: 'explore',
    loadComponent: () => import('./explore/explore.page').then((p) => p.ExplorePage),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then((p) => p.SettingsPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

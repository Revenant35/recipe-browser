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
    loadChildren: () => import('./settings/settings.routes').then((r) => r.settingsRoutes),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

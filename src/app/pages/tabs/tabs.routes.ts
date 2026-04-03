import { Routes } from '@angular/router';

export const tabsRoutes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('../home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'explore',
    loadComponent: () => import('../explore/explore.page').then((m) => m.ExplorePage),
  },
  {
    path: 'settings',
    loadComponent: () => import('../settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

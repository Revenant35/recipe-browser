import { Routes } from '@angular/router';

export const settingsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./settings.page').then((p) => p.SettingsPage),
  },
  {
    path: 'account',
    loadComponent: () => import('./account/account.page').then((p) => p.AccountPage),
  },
];

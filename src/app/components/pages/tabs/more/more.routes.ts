import { Routes } from '@angular/router';

export const moreRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./more.page').then((p) => p.MorePage),
  },
  {
    path: 'account',
    loadComponent: () => import('./account/account.page').then((p) => p.AccountPage),
  },
];

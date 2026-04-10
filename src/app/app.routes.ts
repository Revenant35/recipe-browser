import { Routes } from '@angular/router';
import { authGuard } from '@guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/pages/tabs/tabs.page').then((m) => m.TabsPage),
    canActivate: [authGuard],
    loadChildren: () => import('./components/pages/tabs/tabs.routes').then((m) => m.tabsRoutes),
  },
  {
    path: 'auth',
    loadChildren: () => import('./components/pages/auth/auth.routes').then((m) => m.authRoutes),
  },
];

import { Routes } from '@angular/router';
import { AuthLayout } from './auth.layout';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () => import('../pages/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'signup',
        loadComponent: () => import('../pages/signup/signup.page').then((m) => m.SignupPage),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('../pages/forgot-password/forgot-password.page').then((m) => m.ForgotPasswordPage),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('../pages/reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];

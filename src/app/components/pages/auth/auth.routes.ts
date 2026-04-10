import { Routes } from '@angular/router';
import { AuthPage } from './auth.page';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthPage,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'signup',
        loadComponent: () => import('./signup/signup.page').then((m) => m.SignupPage),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./forgot-password/forgot-password.page').then((m) => m.ForgotPasswordPage),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];

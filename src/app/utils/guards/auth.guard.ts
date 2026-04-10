import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.session$.pipe(
    take(1),
    map((session) => {
      if (session) {
        return true;
      }
      return router.createUrlTree(['/auth/login']);
    }),
  );
};

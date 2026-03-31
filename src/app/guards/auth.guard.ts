import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  return supabase.session$.pipe(
    take(1),
    map(session => {
      if (session) {
        return true;
      }
      return router.createUrlTree(['/auth/login']);
    })
  );
};

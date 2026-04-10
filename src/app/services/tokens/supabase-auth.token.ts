import { inject, InjectionToken } from '@angular/core';
import { SUPABASE_CLIENT } from './supabase-client.token';

export const SUPABASE_AUTH = new InjectionToken('SUPABASE_AUTH', {
  providedIn: 'root',
  factory: () => {
    const supabase = inject(SUPABASE_CLIENT);

    return supabase.auth;
  },
});

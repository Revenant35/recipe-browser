import { inject, InjectionToken } from '@angular/core';
import { SUPABASE_CLIENT } from './supabase-client.token';

export const SUPABASE_STORAGE = new InjectionToken('SUPABASE_STORAGE', {
  providedIn: 'root',
  factory: () => {
    const supabase = inject(SUPABASE_CLIENT);

    return supabase.storage;
  },
});

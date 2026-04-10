import { InjectionToken } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '@environment';
import { SupabaseSchema } from '@db';

export const SUPABASE_CLIENT = new InjectionToken('SUPABASE_CLIENT', {
  providedIn: 'root',
  factory: () =>
    createClient<SupabaseSchema>(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        lock: async (_name: string, _acquireTimeout: number, fn) => {
          return await fn();
        },
      },
    }),
});

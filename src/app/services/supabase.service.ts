import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { ReplaySubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly supabase: SupabaseClient;
  private readonly _session$ = new ReplaySubject<Session | null>(1);

  public readonly session$ = this._session$.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
          return await fn();
        },
      },
    });

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._session$.next(session);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session$.next(session);
    });
  }

  public get client(): SupabaseClient {
    return this.supabase;
  }

  public signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  public signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  public signOut() {
    return this.supabase.auth.signOut();
  }

  public resetPasswordForEmail(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email);
  }

  public updatePassword(password: string) {
    return this.supabase.auth.updateUser({ password });
  }
}

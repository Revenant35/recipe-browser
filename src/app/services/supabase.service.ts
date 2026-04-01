import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  private readonly _session$ = new BehaviorSubject<Session | null>(null);

  public readonly session$ = this._session$.asObservable();

  constructor() {
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

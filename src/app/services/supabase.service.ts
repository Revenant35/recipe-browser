import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private _session$ = new BehaviorSubject<Session | null>(null);

  session$: Observable<Session | null> = this._session$.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._session$.next(session);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session$.next(session);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get currentUser() {
    return this._session$.value?.user ?? null;
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  resetPasswordForEmail(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email);
  }

  updatePassword(password: string) {
    return this.supabase.auth.updateUser({ password });
  }
}

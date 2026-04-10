import { inject, Injectable } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { ReplaySubject } from 'rxjs';
import { SUPABASE_AUTH } from './tokens/supabase-auth.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(SUPABASE_AUTH);

  private readonly _session$ = new ReplaySubject<Session | null>(1);
  public readonly session$ = this._session$.asObservable();

  constructor() {
    this.auth.getSession().then(({ data: { session } }) => {
      this._session$.next(session);
    });

    this.auth.onAuthStateChange((_event, session) => {
      this._session$.next(session);
    });
  }

  public signUp(email: string, password: string) {
    return this.auth.signUp({ email, password });
  }

  public signIn(email: string, password: string) {
    return this.auth.signInWithPassword({ email, password });
  }

  public signOut() {
    return this.auth.signOut();
  }

  public resetPasswordForEmail(email: string) {
    return this.auth.resetPasswordForEmail(email);
  }

  public updatePassword(password: string) {
    return this.auth.updateUser({ password });
  }
}

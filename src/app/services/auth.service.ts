import { inject, Injectable } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { ReplaySubject } from 'rxjs';
import { SUPABASE_CLIENT } from '@app/supabase/supabase-client.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SUPABASE_CLIENT);

  private readonly _session$ = new ReplaySubject<Session | null>(1);
  public readonly session$ = this._session$.asObservable();

  constructor() {
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this._session$.next(session);
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session$.next(session);
    });
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

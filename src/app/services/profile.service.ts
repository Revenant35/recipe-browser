import { Injectable, inject, OnDestroy } from '@angular/core';
import { eq } from 'drizzle-orm';
import { ReplaySubject } from 'rxjs';
import { profiles } from '@db';
import { Profile } from '@types';
import { SUPABASE_CLIENT } from '@tokens/supabase-client.token';
import { DATABASE } from './tokens/database.token';
import { POWERSYNC_DATABASE } from './tokens/powersync-database.token';
import { ProfileMapper } from '@mappers';

@Injectable({ providedIn: 'root' })
export class ProfileService implements OnDestroy {
  private readonly mapper = inject(ProfileMapper);
  private readonly database = inject(DATABASE);
  private readonly powersync = inject(POWERSYNC_DATABASE);
  private readonly supabase = inject(SUPABASE_CLIENT);
  private readonly abortController = new AbortController();

  private readonly _profiles$ = new ReplaySubject<Profile[]>(1);
  public readonly profiles$ = this._profiles$.asObservable();

  constructor() {
    this.watchProfiles();
  }

  ngOnDestroy(): void {
    this.abortController.abort();
    this._profiles$.complete();
  }

  private async watchProfiles(): Promise<void> {
    const watch = this.powersync.watch('SELECT id FROM profiles', [], {
      signal: this.abortController.signal,
    });

    for await (const _ of watch) {
      const profiles = await this.getProfiles();
      this._profiles$.next(profiles);
    }
  }

  private async getProfiles(): Promise<Profile[]> {
    const rows = await this.database.query.profiles.findMany({
      with: { badge: true, wallpaper: true },
    });

    return rows.map((row) => this.mapper.fromEntity(row));
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const row = await this.database.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      with: { badge: true, wallpaper: true },
    });

    if (row === undefined) {
      return await this.getRemoteProfile(userId);
    }

    return this.mapper.fromEntity(row);
  }

  async getRemoteProfile(userId: string): Promise<Profile | undefined> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*, badges(*), wallpapers(*)')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return undefined;
    }

    return this.mapper.fromEntity({
      ...data,
      wallpaper: data.wallpapers,
      badge: data.badges,
    });
  }

  // TODO: This doesn't update the updated_at field on the profile...
  async updateProfile(profile: Profile): Promise<void> {
    const row = this.mapper.toEntity(profile);

    await this.database
      .update(profiles)
      .set({
        ...row,
        updated_at: new Date().toISOString(),
      })
      .where(eq(profiles.id, profile.id));
  }
}

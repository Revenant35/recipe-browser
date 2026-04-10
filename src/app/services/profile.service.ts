import { Injectable, inject } from '@angular/core';
import { eq } from 'drizzle-orm';
import { profiles } from '@db';
import { Profile } from '@types';
import { SUPABASE_CLIENT } from '@tokens/supabase-client.token';
import { ProfileRow } from '@entities';
import { DATABASE } from './tokens/database.token';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly database = inject(DATABASE);
  private readonly supabase = inject(SUPABASE_CLIENT);

  getProfile(userId: string): Promise<Profile | undefined> {
    return this.database.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      with: { badge: true, wallpaper: true },
    });
  }

  async getProfileFromSupabase(userId: string): Promise<Profile | undefined> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*, badges(*), wallpapers(*)')
      .eq('id', userId)
      .single();

    if (error || !data) return undefined;
    const { badges: badge, wallpapers: wallpaper, ...rest } = data;
    return { ...rest, badge: badge ?? null, wallpaper: wallpaper ?? null } as Profile;
  }

  async updateProfile(
    userId: string,
    data: Partial<
      Pick<
        ProfileRow,
        'full_name' | 'username' | 'bio' | 'avatar_url' | 'wallpaper_id' | 'badge_id'
      >
    >,
  ): Promise<void> {
    await this.database
      .update(profiles)
      .set({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .where(eq(profiles.id, userId));
  }
}

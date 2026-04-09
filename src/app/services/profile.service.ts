import { Injectable, inject } from '@angular/core';
import { eq } from 'drizzle-orm';
import { PowerSyncService } from './powersync.service';
import { profiles } from '@app/db/schema';
import { Profile } from '@app/models';
import { SUPABASE_CLIENT } from '@app/supabase/supabase-client.token';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private powerSync = inject(PowerSyncService);
  private supabase = inject(SUPABASE_CLIENT);

  private get db() {
    return this.powerSync.drizzle;
  }

  getProfile(userId: string): Promise<Profile | undefined> {
    return this.db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });
  }

  async getProfileFromSupabase(userId: string): Promise<Profile | undefined> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return undefined;
    return data as unknown as Profile;
  }

  async updateProfile(
    userId: string,
    data: Partial<Pick<Profile, 'full_name' | 'username' | 'website' | 'avatar_url'>>,
  ): Promise<void> {
    await this.db
      .update(profiles)
      .set({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .where(eq(profiles.id, userId));
  }
}

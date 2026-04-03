import { Injectable, inject } from '@angular/core';
import { eq } from 'drizzle-orm';
import { PowerSyncService } from './powersync.service';
import { profiles } from '@app/db/schema';
import { Profile } from '@app/models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private powerSync = inject(PowerSyncService);

  private get db() {
    return this.powerSync.drizzle;
  }

  getProfile(userId: string): Promise<Profile | undefined> {
    return this.db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });
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

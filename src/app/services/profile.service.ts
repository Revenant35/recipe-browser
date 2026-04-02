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
}

import { inject, Injectable } from '@angular/core';
import { PowerSyncDatabase } from '@powersync/capacitor';
import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { AppSchema, drizzleSchema } from '../db';
import { SupabaseConnector } from './supabase-connector';

@Injectable({ providedIn: 'root' })
export class PowerSyncService {
  private readonly connector = inject(SupabaseConnector);
  private initPromise: Promise<void> | null = null;

  public readonly db = new PowerSyncDatabase({
    schema: AppSchema,
    database: { dbFilename: 'recipe-browser.db' },
  });

  public readonly drizzle = wrapPowerSyncWithDrizzle(this.db, { schema: drizzleSchema });

  async init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.doInit();
    }
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    await this.db.connect(this.connector);
  }

  async disconnect(): Promise<void> {
    await this.db.disconnect();
    this.initPromise = null;
  }
}

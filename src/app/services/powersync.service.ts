import { Injectable } from '@angular/core';
import { PowerSyncDatabase } from '@powersync/web';
import { wrapPowerSyncWithDrizzle, type PowerSyncSQLiteDatabase } from '@powersync/drizzle-driver';
import { AppSchema, drizzleSchema } from '../db/app-schema';
import { SupabaseConnector } from './supabase-connector';
import { SupabaseService } from './supabase.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PowerSyncService {
  db: PowerSyncDatabase;
  drizzle: PowerSyncSQLiteDatabase<typeof drizzleSchema>;

  private initialized = false;

  constructor(private supabaseService: SupabaseService) {
    this.db = new PowerSyncDatabase({
      schema: AppSchema,
      database: { dbFilename: 'recipe-browser.db' },
    });
    this.drizzle = wrapPowerSyncWithDrizzle(this.db, { schema: drizzleSchema });
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    const connector = new SupabaseConnector(this.supabaseService.client, environment.powerSyncUrl);
    await this.db.connect(connector);
    this.initialized = true;
    console.log('PowerSync connected');
  }

  async disconnect(): Promise<void> {
    await this.db.disconnect();
    this.initialized = false;
  }
}

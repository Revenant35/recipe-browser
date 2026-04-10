import { inject, Injectable } from '@angular/core';
import { SupabaseConnector } from './supabase-connector';
import { POWERSYNC_DATABASE } from './tokens/powersync-database.token';

@Injectable({ providedIn: 'root' })
export class PowerSyncService {
  private readonly database = inject(POWERSYNC_DATABASE);

  private readonly connector = inject(SupabaseConnector);
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.doInit();
    }
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    await this.database.connect(this.connector);
  }

  async disconnect(): Promise<void> {
    await this.database.disconnect();
    this.initPromise = null;
  }
}

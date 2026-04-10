import { inject, InjectionToken } from '@angular/core';
import { drizzleSchema } from '@db';
import { wrapPowerSyncWithDrizzle } from '@powersync/drizzle-driver';
import { POWERSYNC_DATABASE } from './powersync-database.token';

export const DATABASE = new InjectionToken('DATABASE', {
  providedIn: 'root',
  factory: () => {
    const powersync = inject(POWERSYNC_DATABASE);

    return wrapPowerSyncWithDrizzle(powersync, { schema: drizzleSchema });
  },
});

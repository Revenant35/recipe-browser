import { InjectionToken } from '@angular/core';
import { AppSchema } from '@db';
import { PowerSyncDatabase } from '@powersync/web';

export const POWERSYNC_DATABASE = new InjectionToken('POWERSYNC_DATABASE', {
  providedIn: 'root',
  factory: () => {
    return new PowerSyncDatabase({
      schema: AppSchema,
      database: { dbFilename: 'recipe-browser.db' },
    });
  },
});

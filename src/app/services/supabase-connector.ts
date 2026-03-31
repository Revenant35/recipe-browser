import {
  AbstractPowerSyncDatabase,
  CrudEntry,
  PowerSyncBackendConnector,
  UpdateType,
} from '@powersync/web';
import { SupabaseClient } from '@supabase/supabase-js';

const FATAL_RESPONSE_CODES = [
  /^22...$/, // data exception
  /^23...$/, // integrity constraint violation
  /^42...$/, // syntax error or access rule violation
];

export class SupabaseConnector implements PowerSyncBackendConnector {
  constructor(
    private client: SupabaseClient,
    private powerSyncUrl: string,
  ) {}

  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await this.client.auth.getSession();

    if (!session || error) {
      throw new Error(`Could not fetch Supabase credentials: ${error?.message ?? 'No session'}`);
    }

    return {
      endpoint: this.powerSyncUrl,
      token: session.access_token,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : undefined,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();
    if (!transaction) {
      return;
    }

    const MERGE_BATCH_LIMIT = 100;
    let batchedOps: CrudEntry[] = [];

    try {
      console.log(`Processing transaction with ${transaction.crud.length} operations`);

      for (let i = 0; i < transaction.crud.length; i++) {
        const cruds = transaction.crud;
        const op = cruds[i];
        const table = this.client.from(op.table);
        batchedOps.push(op);

        let result: any;
        let batched = 1;

        switch (op.op) {
          case UpdateType.PUT:
            const records = [{ ...cruds[i].opData, id: cruds[i].id }];
            while (
              i + 1 < cruds.length &&
              cruds[i + 1].op === op.op &&
              cruds[i + 1].table === op.table &&
              batched < MERGE_BATCH_LIMIT
            ) {
              i++;
              records.push({ ...cruds[i].opData, id: cruds[i].id });
              batchedOps.push(cruds[i]);
              batched++;
            }
            result = await table.upsert(records);
            break;
          case UpdateType.PATCH:
            batchedOps = [op];
            result = await table.update(op.opData).eq('id', op.id);
            break;
          case UpdateType.DELETE:
            batchedOps = [op];
            const ids = [op.id];
            while (
              i + 1 < cruds.length &&
              cruds[i + 1].op === op.op &&
              cruds[i + 1].table === op.table &&
              batched < MERGE_BATCH_LIMIT
            ) {
              i++;
              ids.push(cruds[i].id);
              batchedOps.push(cruds[i]);
              batched++;
            }
            result = await table.delete().in('id', ids);
            break;
        }
        if (batched > 1) {
          console.log(`Merged ${batched} ${op.op} operations for table ${op.table}`);
        }
      }
      await transaction.complete();
    } catch (ex: any) {
      console.debug(ex);
      if (typeof ex.code == 'string' && FATAL_RESPONSE_CODES.some((regex) => regex.test(ex.code))) {
        console.error('Data upload error - discarding:', ex);
        await transaction.complete();
      } else {
        throw ex;
      }
    }
  }
}

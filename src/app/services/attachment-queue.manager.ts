import { inject, Injectable } from '@angular/core';
import { AttachmentQueue } from '@powersync/web';
import { POWERSYNC_DATABASE } from './tokens/powersync-database.token';
import { LocalStorageAdapterFactory } from './local-storage-adapter.factory';
import { RemoteStorageAdapterFactory } from './remote-storage-adapter.factory';

export const ATTACHMENT_BUCKETS = ['profiles'] as const;
export type AttachmentBucket = (typeof ATTACHMENT_BUCKETS)[number];

/**
 * Manages {@link AttachmentQueue} instances for each configured {@link AttachmentBucket}.
 * Queues are created at construction time and must be started via {@link init} before use.
 */
@Injectable({ providedIn: 'root' })
export class AttachmentQueueManager {
  private readonly database = inject(POWERSYNC_DATABASE);
  private readonly localStorageFactory = inject(LocalStorageAdapterFactory);
  private readonly remoteStorageFactory = inject(RemoteStorageAdapterFactory);

  private readonly queues = new Map<AttachmentBucket, AttachmentQueue>();

  constructor() {
    this.addQueues(ATTACHMENT_BUCKETS);
  }

  /**
   * Returns the {@link AttachmentQueue} for the given bucket.
   *
   * @param key - The bucket to retrieve.
   * @throws If the bucket has not been registered.
   */
  public get(key: AttachmentBucket): AttachmentQueue {
    const queue = this.queues.get(key);

    if (!queue) {
      throw new Error(`Attachment queue '${key}' not found`);
    }

    return queue;
  }

  /** Initializes local storage and starts sync for all registered queues. */
  public async init() {
    return await Promise.all(
      [...this.queues.values()].map(async (queue) => {
        await queue.localStorage.initialize();
        await queue.startSync();
      }),
    );
  }

  /** Stops sync for all registered queues. */
  public async stop() {
    return await Promise.all([...this.queues.values()].map((queue) => queue.stopSync()));
  }

  private addQueues(keys: readonly AttachmentBucket[]) {
    for (const key of keys) {
      this.addQueue(key);
    }
  }

  // Note: Do NOT call after `init()` has been called!
  private addQueue(key: AttachmentBucket) {
    const queue = new AttachmentQueue({
      db: this.database,
      localStorage: this.localStorageFactory.create(key),
      remoteStorage: this.remoteStorageFactory.create(key),
      watchAttachments: () => {
        // No-op: features will register their own watchers when they need attachment tracking
      },
    });

    this.queues.set(key, queue);
  }
}

import { inject, Injectable } from '@angular/core';
import { AttachmentQueue, type AttachmentRecord } from '@powersync/common';
import { PowerSyncService } from './powersync.service';
import { SupabaseService } from './supabase.service';
import { SupabaseStorageAdapter } from './supabase-storage-adapter';
import { CapacitorStorageAdapter } from './capacitor-storage-adapter';

export interface SaveFileOptions {
  data: ArrayBuffer | string;
  fileExtension: string;
  bucket: string;
  path: string;
  mediaType?: string;
}

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly powerSyncService = inject(PowerSyncService);
  private readonly supabaseService = inject(SupabaseService);

  private readonly localStorage = new CapacitorStorageAdapter();
  private readonly remoteStorage = new SupabaseStorageAdapter(this.supabaseService);

  private readonly queue = new AttachmentQueue({
    db: this.powerSyncService.db,
    localStorage: this.localStorage,
    remoteStorage: this.remoteStorage,
    watchAttachments: () => {
      // No-op: features will register their own watchers when they need attachment tracking
    },
  });

  async init(): Promise<void> {
    await this.localStorage.initialize();
    await this.queue.startSync();
  }

  async saveFile(options: SaveFileOptions): Promise<AttachmentRecord> {
    const metaData = JSON.stringify({ bucket: options.bucket, path: options.path });
    return this.queue.saveFile({
      data: options.data,
      fileExtension: options.fileExtension,
      mediaType: options.mediaType,
      metaData,
    });
  }

  async deleteFile(id: string, updateHook?: (transaction: any, attachment: AttachmentRecord) => Promise<void>): Promise<void> {
    await this.queue.deleteFile({ id, updateHook });
  }

  async stopSync(): Promise<void> {
    await this.queue.stopSync();
  }

  getQueue(): AttachmentQueue {
    return this.queue;
  }
}

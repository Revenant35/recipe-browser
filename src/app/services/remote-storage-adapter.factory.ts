import type { AttachmentRecord, RemoteStorageAdapter } from '@powersync/common';
import type { StorageClient } from '@supabase/storage-js';
import { inject, Injectable } from '@angular/core';
import { SUPABASE_STORAGE } from './tokens/supabase-storage.token';

/** Factory for creating {@link RemoteStorageAdapter} instances backed by Supabase Storage. */
@Injectable({ providedIn: 'root' })
export class RemoteStorageAdapterFactory {
  private readonly storage = inject(SUPABASE_STORAGE);

  /**
   * Creates a new {@link RemoteStorageAdapter} scoped to the given storage bucket.
   *
   * @param bucket - The Supabase Storage bucket name to use for all file operations.
   */
  public create(bucket: string): RemoteStorageAdapter {
    return new SupabaseStorageAdapter(this.storage, bucket);
  }
}

/**
 * {@link RemoteStorageAdapter} implementation that delegates to a single Supabase Storage bucket.
 * Files are keyed by {@link AttachmentRecord.filename}.
 */
export class SupabaseStorageAdapter implements RemoteStorageAdapter {
  constructor(
    private readonly storage: StorageClient,
    private readonly bucket: string,
  ) {}

  async uploadFile(fileData: ArrayBuffer, attachment: AttachmentRecord): Promise<void> {
    const { error } = await this.storage.from(this.bucket).upload(attachment.filename, fileData, {
      upsert: true,
      contentType: attachment.mediaType,
    });

    if (error) {
      throw error;
    }
  }

  async downloadFile(attachment: AttachmentRecord): Promise<ArrayBuffer> {
    const { data, error } = await this.storage.from(this.bucket).download(attachment.filename);

    if (error) {
      throw error;
    }

    return await data.arrayBuffer();
  }

  async deleteFile(attachment: AttachmentRecord): Promise<void> {
    const { error } = await this.storage.from(this.bucket).remove([attachment.filename]);

    if (error) {
      throw error;
    }
  }
}

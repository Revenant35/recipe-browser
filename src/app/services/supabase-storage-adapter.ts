import type { AttachmentRecord, RemoteStorageAdapter } from '@powersync/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseService } from './supabase.service';

interface AttachmentMetaData {
  bucket: string;
  path: string;
}

function parseMetaData(attachment: AttachmentRecord): AttachmentMetaData {
  if (!attachment.metaData) {
    throw new Error(`Attachment ${attachment.id} is missing metaData`);
  }
  const parsed = JSON.parse(attachment.metaData) as AttachmentMetaData;
  if (!parsed.bucket || !parsed.path) {
    throw new Error(`Attachment ${attachment.id} metaData must contain bucket and path`);
  }
  return parsed;
}

export function getPublicUrl(client: SupabaseClient, bucket: string, path: string): string {
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export class SupabaseStorageAdapter implements RemoteStorageAdapter {
  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadFile(fileData: ArrayBuffer, attachment: AttachmentRecord): Promise<void> {
    const { bucket, path } = parseMetaData(attachment);
    const { error } = await this.supabaseService.client.storage
      .from(bucket)
      .upload(path, fileData, {
        upsert: true,
        contentType: attachment.mediaType ?? undefined,
      });
    if (error) {
      throw error;
    }
  }

  async downloadFile(attachment: AttachmentRecord): Promise<ArrayBuffer> {
    const { bucket, path } = parseMetaData(attachment);
    const { data, error } = await this.supabaseService.client.storage
      .from(bucket)
      .download(path);
    if (error) {
      throw error;
    }
    return await data.arrayBuffer();
  }

  async deleteFile(attachment: AttachmentRecord): Promise<void> {
    const { bucket, path } = parseMetaData(attachment);
    const { error } = await this.supabaseService.client.storage
      .from(bucket)
      .remove([path]);
    if (error) {
      throw error;
    }
  }
}

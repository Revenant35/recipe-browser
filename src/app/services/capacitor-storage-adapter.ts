import { LocalStorageAdapter } from '@powersync/web';
import { inject, Injectable } from '@angular/core';
import { Directory } from '@capacitor/filesystem';
import { FILESYSTEM } from './tokens/filesystem.token';

@Injectable()
export class CapacitorStorageAdapter implements LocalStorageAdapter {
  private readonly filesystem = inject(FILESYSTEM);
  private readonly directory = Directory.LibraryNoCloud;
  private readonly path = 'attachments';

  async initialize(): Promise<void> {
    try {
      await this.filesystem.mkdir({
        path: this.path,
        directory: this.directory,
        recursive: true,
      });
    } catch (e: any) {
      // Directory already exists
      if (!e?.message?.includes('exists')) {
        throw e;
      }
    }
  }

  async clear(): Promise<void> {
    try {
      await this.filesystem.rmdir({
        path: this.path,
        directory: this.directory,
        recursive: true,
      });
    } catch {
      // Directory may not exist
    }
    await this.filesystem.mkdir({
      path: this.path,
      directory: this.directory,
      recursive: true,
    });
  }

  getLocalUri(filename: string): string {
    return `${this.path}/${filename}`;
  }

  async saveFile(filePath: string, data: ArrayBuffer | string): Promise<number> {
    const base64 = typeof data === 'string' ? data : this.arrayBufferToBase64(data);

    await this.filesystem.writeFile({
      path: filePath,
      data: base64,
      directory: this.directory,
      recursive: true,
    });

    const stat = await this.filesystem.stat({
      path: filePath,
      directory: this.directory,
    });

    return stat.size;
  }

  async readFile(filePath: string): Promise<ArrayBuffer> {
    const result = await this.filesystem.readFile({
      path: filePath,
      directory: this.directory,
    });

    if (result.data instanceof Blob) {
      return result.data.arrayBuffer();
    }

    return this.base64ToArrayBuffer(result.data);
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.filesystem.deleteFile({
      path: filePath,
      directory: this.directory,
    });
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await this.filesystem.stat({
        path: filePath,
        directory: this.directory,
      });
      return true;
    } catch {
      return false;
    }
  }

  async makeDir(path: string): Promise<void> {
    try {
      await this.filesystem.mkdir({
        path,
        directory: this.directory,
        recursive: true,
      });
    } catch (e: any) {
      if (!e?.message?.includes('exists')) {
        throw e;
      }
    }
  }

  async rmDir(path: string): Promise<void> {
    await this.filesystem.rmdir({
      path,
      directory: this.directory,
      recursive: true,
    });
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

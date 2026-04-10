import { LocalStorageAdapter } from '@powersync/web';
import { inject, Injectable } from '@angular/core';
import { Directory, FilesystemPlugin } from '@capacitor/filesystem';
import { FILESYSTEM } from './tokens/filesystem.token';

// TODO: Document
@Injectable()
export class CapacitorStorageAdapterFactory {
  private readonly filesystem = inject(FILESYSTEM);

  // Note: Don't create multiple instances of the same location.
  public create(
    path: string,
    directory: Directory = Directory.LibraryNoCloud,
  ): CapacitorStorageAdapter {
    return new CapacitorStorageAdapter(this.filesystem, directory, path);
  }
}

// TODO: Document
class CapacitorStorageAdapter implements LocalStorageAdapter {
  constructor(
    private readonly filesystem: FilesystemPlugin,
    private readonly directory: Directory,
    private readonly path: string,
  ) {}

  async initialize(): Promise<void> {
    await this.makeDir(this.path);
  }

  async clear(): Promise<void> {
    await this.rmDir(this.path);
    await this.makeDir(this.path);
  }

  getLocalUri(filename: string): string {
    return `${this.path}/${filename}`;
  }

  // TODO: Overhaul
  async saveFile(filePath: string, data: ArrayBuffer | string): Promise<number> {
    try {
      const base64 = typeof data === 'string' ? data : this.arrayBufferToBase64(data);

      await this.filesystem.writeFile({
        path: filePath,
        data: base64,
        directory: this.directory,
        recursive: true,
      });
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }

      if (e?.message?.includes('--TODO--')) {
        // File already exists
        throw new Error('TODO');
      }

      throw e;
    }

    try {
      const stat = await this.filesystem.stat({
        path: filePath,
        directory: this.directory,
      });

      return stat.size;
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }

      if (e?.message?.includes('--TODO--')) {
        // File doesn't exist
        throw new Error('TODO');
      }

      throw e;
    }
  }

  // TODO: Overhaul
  async readFile(filePath: string): Promise<ArrayBuffer> {
    try {
      const result = await this.filesystem.readFile({
        path: filePath,
        directory: this.directory,
      });

      if (result.data instanceof Blob) {
        return result.data.arrayBuffer();
      }

      return this.base64ToArrayBuffer(result.data);
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }

      if (e?.message?.includes('--TODO--')) {
        // File doesn't exist
        throw new Error('TODO');
      }

      throw e;
    }
  }

  // TODO: Better error handling
  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.filesystem.deleteFile({
        path: filePath,
        directory: this.directory,
      });
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }

      if (e?.message?.includes('--TODO--')) {
        // File doesn't exist
        return;
      }

      throw e;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await this.filesystem.stat({
        path: filePath,
        directory: this.directory,
      });
      return true;
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }

      if (e?.message?.includes('--TODO--')) {
        // File doesn't exist
        return false;
      }

      throw e;
    }
  }

  async makeDir(path: string): Promise<void> {
    try {
      await this.filesystem.mkdir({
        path,
        directory: this.directory,
        recursive: true,
      });
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }

      if (e?.message?.includes('--TODO--')) {
        // Directory already exists
        return;
      }

      throw e;
    }
  }

  async rmDir(path: string): Promise<void> {
    try {
      await this.filesystem.rmdir({
        path,
        directory: this.directory,
        recursive: true,
      });
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }

      if (e?.message?.includes('--TODO--')) {
        // Directory doesn't exist
        return;
      }

      throw e;
    }
  }

  // TODO: Overhaul + move to separate class
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // TODO: Overhaul + move to separate class
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

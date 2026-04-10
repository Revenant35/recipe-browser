import { LocalStorageAdapter } from '@powersync/web';
import { inject, Injectable } from '@angular/core';
import { Directory, FilesystemPlugin } from '@capacitor/filesystem';
import { FILESYSTEM } from './tokens/filesystem.token';

/** Factory for creating {@link LocalStorageAdapter} instances backed by the Capacitor Filesystem API. */
@Injectable({ providedIn: 'root' })
export class LocalStorageAdapterFactory {
  private readonly filesystem = inject(FILESYSTEM);

  /**
   * Creates a new {@link LocalStorageAdapter} scoped to the given path and directory.
   *
   * @param path - The base directory path for storing files.
   * @param directory - The Capacitor {@link Directory} to use. Defaults to {@link Directory.LibraryNoCloud}.
   *
   * @remarks Do not create multiple instances targeting the same path.
   */
  public create(
    path: string,
    directory: Directory = Directory.LibraryNoCloud,
  ): LocalStorageAdapter {
    return new CapacitorStorageAdapter(this.filesystem, directory, path);
  }
}

/**
 * {@link LocalStorageAdapter} implementation that delegates to the Capacitor Filesystem plugin,
 * storing all files under a configured {@link Directory} and base path.
 */
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

  async saveFile(filePath: string, data: ArrayBuffer | string): Promise<number> {
    try {
      const base64 = await this.toBase64(data);

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
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }

      if (e?.message?.includes('Entry does not exist.')) {
        throw new Error('Failed to write file');
      }

      throw e;
    }
  }

  async readFile(filePath: string): Promise<ArrayBuffer> {
    try {
      const result = await this.filesystem.readFile({
        path: filePath,
        directory: this.directory,
      });

      if (result.data instanceof Blob) {
        return result.data.arrayBuffer();
      }

      return this.fromBase64(result.data);
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }

      if (e?.message?.includes('File does not exist.')) {
        throw new Error('Could not read file, file does not exist');
      }

      throw e;
    }
  }

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

      if (e?.message?.includes('File does not exist.')) {
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

      if (e?.message?.includes('Entry does not exist.')) {
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

      if (e?.message?.includes('Current directory does already exist.')) {
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

      if (e?.message?.includes('Folder does not exist.')) {
        return;
      }

      throw e;
    }
  }

  /** Encodes binary or string data to a base64 string for filesystem storage. */
  private async toBase64(data: ArrayBuffer | string): Promise<string> {
    const bytes =
      data instanceof ArrayBuffer ? new Uint8Array(data) : new TextEncoder().encode(data);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }

  /** Decodes a base64 string back to an ArrayBuffer. */
  private fromBase64(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

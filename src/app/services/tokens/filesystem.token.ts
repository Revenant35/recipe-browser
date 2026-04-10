import { InjectionToken } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';

export const FILESYSTEM = new InjectionToken('FILESYSTEM', {
  providedIn: 'root',
  factory: () => Filesystem,
});

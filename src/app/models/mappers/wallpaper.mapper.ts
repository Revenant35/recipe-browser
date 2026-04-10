import { Injectable } from '@angular/core';
import { Wallpaper } from '@types';
import { WallpaperRow } from '@entities';

@Injectable({ providedIn: 'root' })
export class WallpaperMapper {
  toEntity(wallpaper: Wallpaper): WallpaperRow {
    return {
      id: wallpaper.id,
      name: wallpaper.name,
      storage_path: wallpaper.storage_path,
      created_at: wallpaper.created_at,
    };
  }

  fromEntity(row: WallpaperRow): Wallpaper {
    return {
      id: row.id,
      created_at: row.created_at,
      name: row.name,
      storage_path: row.storage_path,
    };
  }
}

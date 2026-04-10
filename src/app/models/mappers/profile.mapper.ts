import { Injectable } from '@angular/core';
import { Profile } from '@types';
import { BadgeRow, ProfileRow, WallpaperRow } from '@entities';

@Injectable({ providedIn: 'root' })
export class ProfileMapper {
  toEntity(row: Profile): ProfileRow {
    return {
      id: row.id,
      updated_at: row.updated_at,
      username: row.username,
      full_name: row.full_name,
      avatar_url: row.avatar_url,
      bio: row.bio,
      wallpaper_id: row.wallpaper?.id ?? null,
      badge_id: row.badge?.id ?? null,
    };
  }

  fromEntity(entity: { profile: ProfileRow; badge: BadgeRow; wallpaper: WallpaperRow }): Profile {
    return {
      id: entity.profile.id,
      updated_at: entity.profile.updated_at,
      username: entity.profile.username,
      full_name: entity.profile.full_name,
      avatar_url: entity.profile.avatar_url,
      bio: entity.profile.bio,
      wallpaper: {
        id: entity.wallpaper.id,
        created_at: entity.wallpaper.created_at,
        name: entity.wallpaper.name,
        storage_path: entity.wallpaper.storage_path,
      },
      badge: {
        id: entity.badge.id,
        created_at: entity.badge.created_at,
        name: entity.badge.name,
        storage_path: entity.badge.storage_path,
      },
    };
  }
}

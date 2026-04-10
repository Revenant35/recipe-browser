import { inject, Injectable } from '@angular/core';
import { Profile } from '@types';
import { BadgeRow, ProfileRow, WallpaperRow } from '@entities';
import { BadgeMapper } from './badge.mapper';
import { WallpaperMapper } from './wallpaper.mapper';

@Injectable({ providedIn: 'root' })
export class ProfileMapper {
  private readonly badgeMapper = inject(BadgeMapper);
  private readonly wallpaperMapper = inject(WallpaperMapper);

  toEntity(
    profile: Profile,
  ): ProfileRow & { badge: BadgeRow | null; wallpaper: WallpaperRow | null } {
    return {
      id: profile.id,
      updated_at: profile.updated_at,
      username: profile.username,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      wallpaper_id: profile.wallpaper?.id ?? null,
      badge_id: profile.badge?.id ?? null,
      badge: profile.badge ? this.badgeMapper.toEntity(profile.badge) : null,
      wallpaper: profile.wallpaper ? this.wallpaperMapper.toEntity(profile.wallpaper) : null,
    };
  }

  fromEntity(
    row: ProfileRow & { badge: BadgeRow | null; wallpaper: WallpaperRow | null },
  ): Profile {
    return {
      id: row.id,
      updated_at: row.updated_at,
      username: row.username,
      full_name: row.full_name,
      avatar_url: row.avatar_url,
      bio: row.bio,
      wallpaper: row.wallpaper ? this.wallpaperMapper.fromEntity(row.wallpaper) : null,
      badge: row.badge ? this.badgeMapper.fromEntity(row.badge) : null,
    };
  }
}

import { Injectable } from '@angular/core';
import { Badge } from '@types';
import { BadgeRow } from '@entities';

@Injectable({ providedIn: 'root' })
export class BadgeMapper {
  toEntity(badge: Badge): BadgeRow {
    return {
      id: badge.id,
      name: badge.name,
      storage_path: badge.storage_path,
      created_at: badge.created_at,
    };
  }

  fromEntity(row: BadgeRow): Badge {
    return {
      id: row.id,
      created_at: row.created_at,
      name: row.name,
      storage_path: row.storage_path,
    };
  }
}

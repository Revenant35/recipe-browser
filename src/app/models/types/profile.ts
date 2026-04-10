import { z } from 'zod';
import { Badge } from './badge';
import { Wallpaper } from './wallpaper';

export interface Profile {
  id: string;
  updated_at: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  badge: Badge | null;
  wallpaper: Wallpaper | null;
}

export const createProfileSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .max(50, 'Username must be 50 characters or fewer'),
  full_name: z.string().min(1, 'Full name is required'),
  bio: z.string().max(500, 'Bio must be 500 characters or fewer'),
});

export type CreateProfile = z.infer<typeof createProfileSchema>;

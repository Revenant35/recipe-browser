export interface Badge {
  id: string;
  created_at: string | null;
  name: string;
  storage_path: string;
}

export interface Wallpaper {
  id: string;
  created_at: string | null;
  name: string;
  storage_path: string;
}

export type RecipeDifficulty = 'Easy' | 'Medium' | 'Hard';

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

export interface Recipe {
  id: string;
  created_at: Date | null;
  name: string;
  servings: number | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  source: string | null;
  difficulty: RecipeDifficulty | null;
  description: string;
  carbs_grams: number | null;
  protein_grams: number | null;
  fat_grams: number | null;
  calories: number | null;
  category: string | null;
  cuisine: string | null;
  is_saved?: boolean;
  tags: {
    id: string;
    created_at: Date | null;
    name: string;
  }[];
  ingredients: {
    id: string;
    created_at: Date | null;
    value: string;
  }[];
  instructions: {
    id: string;
    created_at: Date | null;
    value: string;
  }[];
  notes: {
    id: string;
    created_at: Date | null;
    user_id: string;
    value: string;
  }[];
  author: Profile;
}

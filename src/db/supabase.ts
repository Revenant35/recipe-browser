export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface SupabaseSchema {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4';
  };
  public: {
    Tables: {
      badges: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          storage_path?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          badge_id: string | null;
          bio: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          username: string | null;
          wallpaper_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          badge_id?: string | null;
          bio?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          username?: string | null;
          wallpaper_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          badge_id?: string | null;
          bio?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          wallpaper_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_badge_id_fkey';
            columns: ['badge_id'];
            isOneToOne: false;
            referencedRelation: 'badges';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'profiles_wallpaper_id_fkey';
            columns: ['wallpaper_id'];
            isOneToOne: false;
            referencedRelation: 'wallpapers';
            referencedColumns: ['id'];
          },
        ];
      };
      recipe_ingredients: {
        Row: {
          created_at: string;
          id: string;
          order: number;
          recipe_id: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order: number;
          recipe_id: string;
          value: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          order?: number;
          recipe_id?: string;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_ingredients_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      recipe_instructions: {
        Row: {
          created_at: string;
          id: string;
          order: number;
          recipe_id: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order: number;
          recipe_id: string;
          value: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          order?: number;
          recipe_id?: string;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_instructions_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      recipe_notes: {
        Row: {
          created_at: string;
          id: string;
          recipe_id: string;
          user_id: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          recipe_id: string;
          user_id: string;
          value: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          recipe_id?: string;
          user_id?: string;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_notes_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      recipe_tags: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          recipe_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          recipe_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          recipe_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_tags_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
        ];
      };
      recipes: {
        Row: {
          calories: number | null;
          carbs_grams: number | null;
          cook_time_minutes: number | null;
          created_at: string;
          description: string;
          difficulty: SupabaseSchema['public']['Enums']['recipe_difficulty'] | null;
          fat_grams: number | null;
          id: string;
          name: string;
          prep_time_minutes: number | null;
          protein_grams: number | null;
          servings: number | null;
          source: string | null;
          user_id: string;
        };
        Insert: {
          calories?: number | null;
          carbs_grams?: number | null;
          cook_time_minutes?: number | null;
          created_at?: string;
          description: string;
          difficulty?: SupabaseSchema['public']['Enums']['recipe_difficulty'] | null;
          fat_grams?: number | null;
          id?: string;
          name: string;
          prep_time_minutes?: number | null;
          protein_grams?: number | null;
          servings?: number | null;
          source?: string | null;
          user_id: string;
        };
        Update: {
          calories?: number | null;
          carbs_grams?: number | null;
          cook_time_minutes?: number | null;
          created_at?: string;
          description?: string;
          difficulty?: SupabaseSchema['public']['Enums']['recipe_difficulty'] | null;
          fat_grams?: number | null;
          id?: string;
          name?: string;
          prep_time_minutes?: number | null;
          protein_grams?: number | null;
          servings?: number | null;
          source?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      wallpapers: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          storage_path?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      recipe_difficulty: 'Easy' | 'Medium' | 'Hard';
    };
    CompositeTypes: Record<never, never>;
  };
}

type DatabaseWithoutInternals = Omit<SupabaseSchema, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof SupabaseSchema, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      recipe_difficulty: ['Easy', 'Medium', 'Hard'],
    },
  },
} as const;

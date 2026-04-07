export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    PostgrestVersion: '12';
    Tables: {
      posts: {
        Row: {
          id: string;
          title_en: string;
          title_zh: string | null;
          slug: string;
          content_en: string | null;
          content_zh: string | null;
          excerpt_en: string | null;
          excerpt_zh: string | null;
          published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          tags: string[];
          cover_image: string | null;
          reading_time_minutes: number;
        };
        Insert: {
          id?: string;
          title_en: string;
          title_zh?: string | null;
          slug: string;
          content_en?: string | null;
          content_zh?: string | null;
          excerpt_en?: string | null;
          excerpt_zh?: string | null;
          published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          cover_image?: string | null;
          reading_time_minutes?: number;
        };
        Update: {
          id?: string;
          title_en?: string;
          title_zh?: string | null;
          slug?: string;
          content_en?: string | null;
          content_zh?: string | null;
          excerpt_en?: string | null;
          excerpt_zh?: string | null;
          published?: boolean;
          published_at?: string | null;
          updated_at?: string;
          tags?: string[];
          cover_image?: string | null;
          reading_time_minutes?: number;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description_en: string | null;
          description_zh: string | null;
          url: string | null;
          github_url: string | null;
          tech: string[];
          status: 'live' | 'archived' | 'wip';
          featured: boolean;
          display_order: number;
          cover_image: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description_en?: string | null;
          description_zh?: string | null;
          url?: string | null;
          github_url?: string | null;
          tech?: string[];
          status?: 'live' | 'archived' | 'wip';
          featured?: boolean;
          display_order?: number;
          cover_image?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description_en?: string | null;
          description_zh?: string | null;
          url?: string | null;
          github_url?: string | null;
          tech?: string[];
          status?: 'live' | 'archived' | 'wip';
          featured?: boolean;
          display_order?: number;
          cover_image?: string | null;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          id: string;
          content: string | null;
          type: 'text' | 'voice';
          page_path: string | null;
          audio_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          content?: string | null;
          type?: 'text' | 'voice';
          page_path?: string | null;
          audio_url?: string | null;
          created_at?: string;
        };
        Update: {
          content?: string | null;
          type?: 'text' | 'voice';
          page_path?: string | null;
          audio_url?: string | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          meeting_type: 'online' | 'inperson';
          date: string;
          time: string;
          status: 'pending' | 'confirmed' | 'rejected';
          admin_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          message: string;
          meeting_type: 'online' | 'inperson';
          date: string;
          time: string;
          status?: 'pending' | 'confirmed' | 'rejected';
          admin_note?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'rejected';
          admin_note?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

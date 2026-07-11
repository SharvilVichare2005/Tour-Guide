export interface Database {
  public: {
    Tables: {
      places: {
        Row: {
          id: string;
          name: string;
          type: string;
          rating: number;
          image: string;
          vicinity: string;
          description: string | null;
          location: { lat: number; lng: number };
          hours: string[] | null;
          phone: string | null;
          website: string | null;
          photos: string[] | null;
          distance: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          rating: number;
          image: string;
          vicinity: string;
          description?: string | null;
          location: { lat: number; lng: number };
          hours?: string[] | null;
          phone?: string | null;
          website?: string | null;
          photos?: string[] | null;
          distance?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["places"]["Insert"]>;
        Relationships: [];
      };
      destinations: {
        Row: {
          id: string;
          title: string;
          image: string;
          description: string;
          position: { lat: number; lng: number };
        };
        Insert: {
          id?: string;
          title: string;
          image: string;
          description: string;
          position: { lat: number; lng: number };
        };
        Update: Partial<Database["public"]["Tables"]["destinations"]["Insert"]>;
        Relationships: [];
      };
      saved_places: {
        Row: {
          id: string;
          user_id: string;
          place_id: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          place_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_places"]["Insert"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string;
        };
        Insert: {
          id: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type PlaceRow = Database["public"]["Tables"]["places"]["Row"];
export type DestinationRow =
  Database["public"]["Tables"]["destinations"]["Row"];

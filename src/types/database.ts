export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql: {
    Tables: {
      [key: string]: {
        Row: {
          [key: string]: Json
        }
        Insert: {
          [key: string]: Json
        }
        Update: {
          [key: string]: Json
        }
        Relationships: any[]
      }
    }
    Views: {
      [key: string]: never
    }
    Functions: {
      [key: string]: never
    }
    Enums: {
      [key: string]: never
    }
    CompositeTypes: {
      [key: string]: never
    }
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blackout_dates: {
        Row: {
          created_at: string | null
          date: string
          id: string
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          apt: string | null
          city: string
          created_at: string | null
          delivery_instructions: string | null
          id: string
          is_default: boolean | null
          label: string | null
          state: string
          street: string
          user_id: string | null
          zip: string
        }
        Insert: {
          apt?: string | null
          city: string
          created_at?: string | null
          delivery_instructions?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          state: string
          street: string
          user_id?: string | null
          zip: string
        }
        Update: {
          apt?: string | null
          city?: string
          created_at?: string | null
          delivery_instructions?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          state?: string
          street?: string
          user_id?: string | null
          zip?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          created_at: string | null
          default_address: Json | null
          first_name: string | null
          id: string
          last_name: string | null
          marketing_opt_in: boolean | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_address?: Json | null
          first_name?: string | null
          id: string
          last_name?: string | null
          marketing_opt_in?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_address?: Json | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          marketing_opt_in?: boolean | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          created_at: string | null
          delivery_fee: number
          description: string | null
          estimated_time_minutes: number | null
          free_delivery_threshold: number | null
          id: string
          is_active: boolean | null
          min_order: number
          name: string
          sort_order: number | null
          zip_codes: string[]
        }
        Insert: {
          created_at?: string | null
          delivery_fee: number
          description?: string | null
          estimated_time_minutes?: number | null
          free_delivery_threshold?: number | null
          id?: string
          is_active?: boolean | null
          min_order: number
          name: string
          sort_order?: number | null
          zip_codes: string[]
        }
        Update: {
          created_at?: string | null
          delivery_fee?: number
          description?: string | null
          estimated_time_minutes?: number | null
          free_delivery_threshold?: number | null
          id?: string
          is_active?: boolean | null
          min_order?: number
          name?: string
          sort_order?: number | null
          zip_codes?: string[]
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      loyalty_points: {
        Row: {
          id: string
          lifetime_points: number | null
          points: number | null
          tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          lifetime_points?: number | null
          points?: number | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          lifetime_points?: number | null
          points?: number | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          points: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          product_name: string
          product_variant_id: string | null
          quantity: number
          special_instructions: string | null
          total_price: number
          unit_price: number
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name: string
          product_variant_id?: string | null
          quantity: number
          special_instructions?: string | null
          total_price: number
          unit_price: number
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_name?: string
          product_variant_id?: string | null
          quantity?: number
          special_instructions?: string | null
          total_price?: number
          unit_price?: number
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          delivery_address: Json | null
          delivery_date: string
          delivery_fee: number | null
          delivery_window: string
          delivery_zone_id: string | null
          discount_amount: number | null
          discount_code_id: string | null
          fulfillment_type: string
          guest_email: string | null
          guest_phone: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_number: string
          payment_status: string | null
          pickup_location: string | null
          status: string | null
          stripe_charge_id: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax_amount: number | null
          time_slot_id: string | null
          tip_amount: number | null
          total: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_date: string
          delivery_fee?: number | null
          delivery_window: string
          delivery_zone_id?: string | null
          discount_amount?: number | null
          discount_code_id?: string | null
          fulfillment_type: string
          guest_email?: string | null
          guest_phone?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number?: string
          payment_status?: string | null
          pickup_location?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal: number
          tax_amount?: number | null
          time_slot_id?: string | null
          tip_amount?: number | null
          total: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          delivery_address?: Json | null
          delivery_date?: string
          delivery_fee?: number | null
          delivery_window?: string
          delivery_zone_id?: string | null
          discount_amount?: number | null
          discount_code_id?: string | null
          fulfillment_type?: string
          guest_email?: string | null
          guest_phone?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_number?: string
          payment_status?: string | null
          pickup_location?: string | null
          status?: string | null
          stripe_charge_id?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number | null
          time_slot_id?: string | null
          tip_amount?: number | null
          total?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_locations: {
        Row: {
          address: string
          city: string
          created_at: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          name: string
          operating_hours: Json | null
          sort_order: number | null
          state: string
          updated_at: string | null
          zip: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name: string
          operating_hours?: Json | null
          sort_order?: number | null
          state: string
          updated_at?: string | null
          zip: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          name?: string
          operating_hours?: Json | null
          sort_order?: number | null
          state?: string
          updated_at?: string | null
          zip?: string
        }
        Relationships: []
      }
      product_availability: {
        Row: {
          available_from: string | null
          available_until: string | null
          day_of_week: number | null
          id: string
          is_available: boolean | null
          product_id: string | null
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          day_of_week?: number | null
          id?: string
          is_available?: boolean | null
          product_id?: string | null
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          day_of_week?: number | null
          id?: string
          is_available?: boolean | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_availability_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string | null
          id: string
          inventory_count: number | null
          is_available: boolean | null
          is_default: boolean | null
          name: string
          price_adjustment: number | null
          product_id: string | null
          sku: string | null
          sort_order: number | null
          track_inventory: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inventory_count?: number | null
          is_available?: boolean | null
          is_default?: boolean | null
          name: string
          price_adjustment?: number | null
          product_id?: string | null
          sku?: string | null
          sort_order?: number | null
          track_inventory?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inventory_count?: number | null
          is_available?: boolean | null
          is_default?: boolean | null
          name?: string
          price_adjustment?: number | null
          product_id?: string | null
          sku?: string | null
          sort_order?: number | null
          track_inventory?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allergens: string[] | null
          base_price: number
          category: string
          created_at: string | null
          description: string | null
          dietary_info: string[] | null
          gallery_urls: string[] | null
          id: string
          image_url: string | null
          ingredients: string | null
          is_available: boolean | null
          is_featured: boolean | null
          lead_time_hours: number | null
          max_per_order: number | null
          name: string
          nutrition_info: Json | null
          short_description: string | null
          slug: string
          sort_order: number | null
          subcategory: string | null
          updated_at: string | null
        }
        Insert: {
          allergens?: string[] | null
          base_price: number
          category: string
          created_at?: string | null
          description?: string | null
          dietary_info?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          lead_time_hours?: number | null
          max_per_order?: number | null
          name: string
          nutrition_info?: Json | null
          short_description?: string | null
          slug: string
          sort_order?: number | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Update: {
          allergens?: string[] | null
          base_price?: number
          category?: string
          created_at?: string | null
          description?: string | null
          dietary_info?: string[] | null
          gallery_urls?: string[] | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          lead_time_hours?: number | null
          max_per_order?: number | null
          name?: string
          nutrition_info?: Json | null
          short_description?: string | null
          slug?: string
          sort_order?: number | null
          subcategory?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      time_slots: {
        Row: {
          created_at: string | null
          current_orders: number | null
          date: string
          id: string
          is_available: boolean | null
          max_orders: number
          slot_type: string | null
          window_end: string
          window_start: string
        }
        Insert: {
          created_at?: string | null
          current_orders?: number | null
          date: string
          id?: string
          is_available?: boolean | null
          max_orders?: number
          slot_type?: string | null
          window_end: string
          window_start: string
        }
        Update: {
          created_at?: string | null
          current_orders?: number | null
          date?: string
          id?: string
          is_available?: boolean | null
          max_orders?: number
          slot_type?: string | null
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_loyalty_points_on_completion: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      calculate_loyalty_points_earned: {
        Args: {
          user_id_param: string
          order_total: number
        }
        Returns: number
      }
      decrement_inventory_for_order: {
        Args: {
          order_id_param: string
        }
        Returns: boolean
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_business_setting: {
        Args: {
          setting_key: string
        }
        Returns: Json
      }
      increment_slot_orders: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      redeem_loyalty_points: {
        Args: {
          user_id_param: string
          points_to_redeem: number
        }
        Returns: Json
      }
      restore_inventory_for_order: {
        Args: {
          order_id_param: string
        }
        Returns: boolean
      }
      trigger_decrement_inventory_on_confirmation: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_business_setting: {
        Args: {
          setting_key: string
          new_value: Json
        }
        Returns: boolean
      }
      update_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_user_tier: {
        Args: {
          user_id_param: string
        }
        Returns: undefined
      }
      validate_inventory: {
        Args: {
          variant_ids: string[]
          quantities: number[]
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
    Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
    Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database["public"]["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

// Export specific table types
export type Product = Tables<'products'>;
export type ProductVariant = Tables<'product_variants'>;
export type DeliveryZone = Tables<'delivery_zones'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type TimeSlot = Tables<'time_slots'>;
export type DiscountCode = Tables<'discount_codes'>;
export type PickupLocation = Tables<'pickup_locations'>;
export type LoyaltyPoint = Tables<'loyalty_points'>;
export type LoyaltyTransaction = Tables<'loyalty_transactions'>;

// Business Types
export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessInfo {
  business_name: string;
  business_phone: string;
  business_email: string;
  business_address: string;
}

export interface WebsiteContent {
  hero_headline: string;
  hero_subheadline: string;
  hero_cta_text: string;
  about_text: string;
  tagline: string;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  twitter: string;
  tiktok: string;
  yelp: string;
}

export interface Branding {
  primary_color: string;
  accent_color: string;
  logo_url: string;
}

export interface EmailTemplates {
  confirmation_header: string;
  confirmation_footer: string;
  status_update_header: string;
  ready_for_pickup_message: string;
  out_for_delivery_message: string;
}

// Order status type matching database enum
export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'baking'
  | 'decorating'
  | 'quality_check'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'picked_up'
  | 'cancelled'
  | 'refunded';

// Fulfillment/delivery type
export type DeliveryType = 'pickup' | 'delivery';
export type FulfillmentType = 'pickup' | 'delivery';

// Convenience type aliases for database tables
export type CustomerProfile = Database['public']['Tables']['customer_profiles']['Row'];
export type CustomerAddress = Database['public']['Tables']['customer_addresses']['Row'];
export type BlackoutDate = Database['public']['Tables']['blackout_dates']['Row'];
export type OrderStatusHistory = Database['public']['Tables']['order_status_history']['Row'];

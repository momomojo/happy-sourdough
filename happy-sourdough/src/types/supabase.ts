export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          category: string
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
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
        Relationships: []
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
        Relationships: []
      }
      orders: {
        Row: {
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
          order_number: string
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
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          inventory_count: number | null
          is_available: boolean | null
          is_default: boolean | null
          name: string
          price_adjustment: number | null
          product_id: string | null
          sku: string | null
          sort_order: number | null
          stripe_price_id: string | null
          track_inventory: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          inventory_count?: number | null
          is_available?: boolean | null
          is_default?: boolean | null
          name: string
          price_adjustment?: number | null
          product_id?: string | null
          sku?: string | null
          sort_order?: number | null
          stripe_price_id?: string | null
          track_inventory?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          inventory_count?: number | null
          is_available?: boolean | null
          is_default?: boolean | null
          name?: string
          price_adjustment?: number | null
          product_id?: string | null
          sku?: string | null
          sort_order?: number | null
          stripe_price_id?: string | null
          track_inventory?: boolean | null
        }
        Relationships: []
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
          stripe_price_id: string | null
          stripe_product_id: string | null
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
          stripe_price_id?: string | null
          stripe_product_id?: string | null
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
          stripe_price_id?: string | null
          stripe_product_id?: string | null
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
      decrement_slot_orders: { Args: { slot_id: string }; Returns: void }
      generate_order_number: { Args: Record<string, never>; Returns: string }
      get_admin_role: { Args: { check_user_id?: string }; Returns: string }
      get_business_setting: { Args: { setting_key: string }; Returns: Json }
      increment_slot_orders: { Args: { slot_id: string }; Returns: void }
      is_admin: { Args: { check_user_id?: string }; Returns: boolean }
      update_business_setting: {
        Args: { new_value: Json; setting_key: string }
        Returns: boolean
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

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type DbFunctions = Database['public']['Functions']

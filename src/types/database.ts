// Database types for Happy Sourdough
// These types match the Supabase schema from supabase/migrations/001_schema.sql

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

export type FulfillmentType = 'pickup' | 'delivery';

// Legacy alias for backwards compatibility during migration
export type DeliveryType = FulfillmentType;

export type ProductCategory = 'bread' | 'pastry' | 'cake' | 'cookie' | 'seasonal' | 'merchandise';

export type SlotType = 'pickup' | 'delivery' | 'both';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: number;
  category: ProductCategory;
  subcategory: string | null;
  is_available: boolean;
  is_featured: boolean;
  lead_time_hours: number;
  max_per_order: number | null;
  allergens: string[];
  dietary_info: string[];
  ingredients: string | null;
  nutrition_info: Record<string, unknown> | null;
  image_url: string | null;
  gallery_urls: string[];
  sort_order: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  description: string | null;
  price_adjustment: number;
  inventory_count: number | null;
  track_inventory: boolean;
  sku: string | null;
  is_available: boolean;
  is_default: boolean;
  sort_order: number;
  stripe_price_id: string | null;
  created_at: string;
}

export interface ProductAvailability {
  id: string;
  product_id: string;
  day_of_week: number;
  available_from: string | null;
  available_until: string | null;
  is_available: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  description: string | null;
  zip_codes: string[];
  min_order: number;
  delivery_fee: number;
  free_delivery_threshold: number | null;
  estimated_time_minutes: number | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  window_start: string;
  window_end: string;
  slot_type: SlotType;
  max_orders: number;
  current_orders: number;
  is_available: boolean;
  created_at: string;
}

export interface BlackoutDate {
  id: string;
  date: string;
  reason: string | null;
  created_at: string;
}

export interface DeliveryAddress {
  street: string;
  apt?: string | null;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  delivery_date: string;
  delivery_window: string;
  time_slot_id: string | null;
  delivery_zone_id: string | null;
  delivery_address: DeliveryAddress | null;
  pickup_location: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  discount_code_id: string | null;
  tax_amount: number;
  tip_amount: number;
  total: number;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_checkout_session_id: string | null;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface CustomerProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  default_address: DeliveryAddress | null;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  id: string;
  user_id: string;
  label: string | null;
  street: string;
  apt: string | null;
  city: string;
  state: string;
  zip: string;
  delivery_instructions: string | null;
  is_default: boolean;
  created_at: string;
}

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  points: number;
  lifetime_points: number;
  tier: 'bronze' | 'silver' | 'gold';
  updated_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  order_id: string | null;
  points: number;
  description: string | null;
  created_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | 'free_delivery';
  discount_value: number | null;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'staff';

export interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  display_name: string | null;
  is_active: boolean | null;
  permissions: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BusinessSetting {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  category: string;
  updated_at: string | null;
  updated_by: string | null;
}

// Typed business settings values
export interface BusinessInfo {
  business_name: string;
  business_phone: string;
  business_email: string;
  business_address: string;
}

export interface OperatingHours {
  monday: { open: string; close: string; closed: boolean };
  tuesday: { open: string; close: string; closed: boolean };
  wednesday: { open: string; close: string; closed: boolean };
  thursday: { open: string; close: string; closed: boolean };
  friday: { open: string; close: string; closed: boolean };
  saturday: { open: string; close: string; closed: boolean };
  sunday: { open: string; close: string; closed: boolean };
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

// Supabase Database type helper
export interface Database {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      product_variants: {
        Row: ProductVariant;
        Insert: Omit<ProductVariant, 'id' | 'created_at'>;
        Update: Partial<Omit<ProductVariant, 'id' | 'created_at'>>;
      };
      product_availability: {
        Row: ProductAvailability;
        Insert: Omit<ProductAvailability, 'id'>;
        Update: Partial<Omit<ProductAvailability, 'id'>>;
      };
      delivery_zones: {
        Row: DeliveryZone;
        Insert: Omit<DeliveryZone, 'id' | 'created_at'>;
        Update: Partial<Omit<DeliveryZone, 'id' | 'created_at'>>;
      };
      time_slots: {
        Row: TimeSlot;
        Insert: Omit<TimeSlot, 'id' | 'created_at'>;
        Update: Partial<Omit<TimeSlot, 'id' | 'created_at'>>;
      };
      blackout_dates: {
        Row: BlackoutDate;
        Insert: Omit<BlackoutDate, 'id' | 'created_at'>;
        Update: Partial<Omit<BlackoutDate, 'id' | 'created_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>;
      };
      order_status_history: {
        Row: OrderStatusHistory;
        Insert: Omit<OrderStatusHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderStatusHistory, 'id' | 'created_at'>>;
      };
      customer_profiles: {
        Row: CustomerProfile;
        Insert: Omit<CustomerProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CustomerProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      customer_addresses: {
        Row: CustomerAddress;
        Insert: Omit<CustomerAddress, 'id' | 'created_at'>;
        Update: Partial<Omit<CustomerAddress, 'id' | 'created_at'>>;
      };
      loyalty_points: {
        Row: LoyaltyPoints;
        Insert: Omit<LoyaltyPoints, 'id' | 'updated_at'>;
        Update: Partial<Omit<LoyaltyPoints, 'id' | 'updated_at'>>;
      };
      loyalty_transactions: {
        Row: LoyaltyTransaction;
        Insert: Omit<LoyaltyTransaction, 'id' | 'created_at'>;
        Update: Partial<Omit<LoyaltyTransaction, 'id' | 'created_at'>>;
      };
      discount_codes: {
        Row: DiscountCode;
        Insert: Omit<DiscountCode, 'id' | 'created_at'>;
        Update: Partial<Omit<DiscountCode, 'id' | 'created_at'>>;
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>>;
      };
      business_settings: {
        Row: BusinessSetting;
        Insert: Omit<BusinessSetting, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BusinessSetting, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      decrement_slot_orders: {
        Args: { slot_id: string };
        Returns: void;
      };
      generate_order_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_admin_role: {
        Args: { check_user_id?: string };
        Returns: string;
      };
      get_business_setting: {
        Args: { setting_key: string };
        Returns: unknown;
      };
      increment_discount_usage: {
        Args: { discount_code_id: string };
        Returns: void;
      };
      increment_slot_orders: {
        Args: { slot_id: string };
        Returns: void;
      };
      is_admin: {
        Args: { check_user_id?: string };
        Returns: boolean;
      };
      update_business_setting: {
        Args: { new_value: unknown; setting_key: string };
        Returns: boolean;
      };
      decrement_inventory_for_order: {
        Args: { order_id_param: string };
        Returns: boolean;
      };
      validate_inventory: {
        Args: { variant_ids: string[]; quantities: number[] };
        Returns: {
          valid: boolean;
          errors: Array<{
            variant_id?: string;
            product_name?: string;
            variant_name?: string;
            requested?: number;
            available?: number;
            error: string;
          }>;
        };
      };
      restore_inventory_for_order: {
        Args: { order_id_param: string };
        Returns: boolean;
      };
    };
    Enums: {
      order_status: OrderStatus;
      fulfillment_type: FulfillmentType;
      product_category: ProductCategory;
      slot_type: SlotType;
      admin_role: AdminRole;
    };
  };
}

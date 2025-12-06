// Database types for Happy Sourdough
// These types match the Supabase schema from bakery-schema skill

export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'baking'
  | 'decorating'
  | 'quality_check'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type DeliveryType = 'pickup' | 'delivery';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: number;
  category: string;
  subcategory: string | null;
  image_url: string | null;
  gallery_urls: string[];
  is_available: boolean;
  is_featured: boolean;
  allergens: string[];
  dietary_info: string[];
  prep_time_hours: number;
  lead_time_hours: number;
  max_per_order: number | null;
  ingredients: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  is_available: boolean;
  sort_order: number;
}

export interface DeliveryZone {
  id: number;
  name: string;
  description: string | null;
  zip_codes: string[];
  min_order_amount: number;
  delivery_fee: number;
  free_delivery_threshold: number | null;
  estimated_time_minutes: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  window_start: string;
  window_end: string;
  slot_type: 'pickup' | 'delivery' | 'both';
  max_orders: number;
  current_orders: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlackoutDate {
  id: string;
  date: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  delivery_zone_id: number | null;
  time_slot_id: string | null;
  delivery_address: string | null;
  delivery_instructions: string | null;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  default_address: string | null;
  default_delivery_zone_id: number | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyAccount {
  id: string;
  user_id: string;
  points_balance: number;
  lifetime_points: number;
  tier: 'bronze' | 'silver' | 'gold';
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
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
        Insert: Omit<ProductVariant, 'id'>;
        Update: Partial<Omit<ProductVariant, 'id'>>;
      };
      delivery_zones: {
        Row: DeliveryZone;
        Insert: Omit<DeliveryZone, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DeliveryZone, 'id' | 'created_at' | 'updated_at'>>;
      };
      time_slots: {
        Row: TimeSlot;
        Insert: Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>>;
      };
      blackout_dates: {
        Row: BlackoutDate;
        Insert: Omit<BlackoutDate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BlackoutDate, 'id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id'>;
        Update: Partial<Omit<OrderItem, 'id'>>;
      };
      customer_profiles: {
        Row: CustomerProfile;
        Insert: Omit<CustomerProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CustomerProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      loyalty: {
        Row: LoyaltyAccount;
        Insert: Omit<LoyaltyAccount, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LoyaltyAccount, 'id' | 'created_at' | 'updated_at'>>;
      };
      order_status_history: {
        Row: OrderStatusHistory;
        Insert: Omit<OrderStatusHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<OrderStatusHistory, 'id' | 'created_at'>>;
      };
    };
    Enums: {
      order_status: OrderStatus;
      delivery_type: DeliveryType;
    };
  };
}

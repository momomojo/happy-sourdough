import { createClient } from '@/lib/supabase/server';

interface TaxSettings {
  type: 'flat' | 'by_zone' | 'by_distance';
  rate: number;
  name: string;
  zones?: { zone_id: string; rate: number }[];
}

const DEFAULT_TAX_RATE = 0.08; // 8% fallback

/**
 * Get the current tax rate from business settings
 * Falls back to 8% if not configured
 */
export async function getTaxRate(deliveryZoneId?: string | null): Promise<number> {
  try {
    const supabase = await createClient();

    // Get tax settings from business_settings table
    const { data, error } = await (supabase
      .from('business_settings') as ReturnType<typeof supabase.from>)
      .select('value')
      .eq('key', 'tax_settings')
      .single() as { data: { value: unknown } | null; error: unknown };

    if (error || !data) {
      console.warn('Tax settings not found, using default rate:', DEFAULT_TAX_RATE);
      return DEFAULT_TAX_RATE;
    }

    const taxSettings = data.value as TaxSettings;

    // Handle different tax calculation types
    switch (taxSettings.type) {
      case 'by_zone':
        // If zones are configured and we have a delivery zone, use zone-specific rate
        if (deliveryZoneId && taxSettings.zones && taxSettings.zones.length > 0) {
          const zoneRate = taxSettings.zones.find(z => z.zone_id === deliveryZoneId);
          if (zoneRate) {
            return zoneRate.rate;
          }
        }
        // Fall through to flat rate if zone not found
        return taxSettings.rate || DEFAULT_TAX_RATE;

      case 'by_distance':
        // Future implementation: calculate based on distance
        // For now, use flat rate
        return taxSettings.rate || DEFAULT_TAX_RATE;

      case 'flat':
      default:
        return taxSettings.rate || DEFAULT_TAX_RATE;
    }
  } catch (err) {
    console.error('Error fetching tax rate:', err);
    return DEFAULT_TAX_RATE;
  }
}

/**
 * Calculate tax amount based on subtotal and optional delivery zone
 */
export async function calculateTax(
  subtotal: number,
  deliveryZoneId?: string | null
): Promise<number> {
  const taxRate = await getTaxRate(deliveryZoneId);
  return subtotal * taxRate;
}

/**
 * Get tax settings for display purposes
 */
export async function getTaxSettings(): Promise<TaxSettings | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase
      .from('business_settings') as ReturnType<typeof supabase.from>)
      .select('value')
      .eq('key', 'tax_settings')
      .single() as { data: { value: unknown } | null; error: unknown };

    if (error || !data) {
      return null;
    }

    return data.value as TaxSettings;
  } catch (err) {
    console.error('Error fetching tax settings:', err);
    return null;
  }
}

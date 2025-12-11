import { createClient } from '@/lib/supabase/server';
import type { BusinessInfo, OperatingHours } from '@/types/database';

// Default values as fallback (should match migration 013)
const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  business_name: 'Happy Sourdough',
  business_phone: '+1 (555) 123-4567',
  business_email: 'hello@happysourdough.com',
  business_address: '123 Bakery Lane, San Francisco, CA 94102',
};

const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday: { open: '07:00', close: '19:00', closed: false },
  tuesday: { open: '07:00', close: '19:00', closed: false },
  wednesday: { open: '07:00', close: '19:00', closed: false },
  thursday: { open: '07:00', close: '19:00', closed: false },
  friday: { open: '07:00', close: '19:00', closed: false },
  saturday: { open: '08:00', close: '17:00', closed: false },
  sunday: { open: '08:00', close: '14:00', closed: false },
};

// Cache for business settings to avoid repeated database calls
let cachedBusinessInfo: BusinessInfo | null = null;
let cachedOperatingHours: OperatingHours | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get business information from settings
 * Returns cached value if available and fresh, otherwise fetches from database
 */
export async function getBusinessInfo(): Promise<BusinessInfo> {
  // Return cache if valid
  if (cachedBusinessInfo && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedBusinessInfo;
  }

  try {
    const supabase = await createClient();

    // Fetch all business info settings at once
    const { data, error } = await (supabase
      .from('business_settings') as ReturnType<typeof supabase.from>)
      .select('key, value')
      .in('key', ['business_name', 'business_phone', 'business_email', 'business_address']) as {
      data: Array<{ key: string; value: unknown }> | null;
      error: unknown;
    };

    if (error || !data || data.length === 0) {
      console.warn('Business settings not found, using defaults');
      cachedBusinessInfo = DEFAULT_BUSINESS_INFO;
      cacheTimestamp = Date.now();
      return DEFAULT_BUSINESS_INFO;
    }

    // Build business info object from settings
    const businessInfo: BusinessInfo = {
      business_name: DEFAULT_BUSINESS_INFO.business_name,
      business_phone: DEFAULT_BUSINESS_INFO.business_phone,
      business_email: DEFAULT_BUSINESS_INFO.business_email,
      business_address: DEFAULT_BUSINESS_INFO.business_address,
    };

    data.forEach((setting) => {
      if (setting.key in businessInfo) {
        // Extract string value from JSONB (it's stored as a JSON string)
        const value = setting.value as string;
        businessInfo[setting.key as keyof BusinessInfo] = value;
      }
    });

    cachedBusinessInfo = businessInfo;
    cacheTimestamp = Date.now();
    return businessInfo;
  } catch (err) {
    console.error('Error fetching business info:', err);
    return DEFAULT_BUSINESS_INFO;
  }
}

/**
 * Get operating hours from settings
 * Returns cached value if available and fresh, otherwise fetches from database
 */
export async function getOperatingHours(): Promise<OperatingHours> {
  // Return cache if valid
  if (cachedOperatingHours && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedOperatingHours;
  }

  try {
    const supabase = await createClient();

    const { data, error } = await (supabase
      .from('business_settings') as ReturnType<typeof supabase.from>)
      .select('value')
      .eq('key', 'operating_hours')
      .single() as { data: { value: unknown } | null; error: unknown };

    if (error || !data) {
      console.warn('Operating hours not found, using defaults');
      cachedOperatingHours = DEFAULT_OPERATING_HOURS;
      cacheTimestamp = Date.now();
      return DEFAULT_OPERATING_HOURS;
    }

    cachedOperatingHours = data.value as OperatingHours;
    cacheTimestamp = Date.now();
    return cachedOperatingHours;
  } catch (err) {
    console.error('Error fetching operating hours:', err);
    return DEFAULT_OPERATING_HOURS;
  }
}

/**
 * Format operating hours as a human-readable string for emails
 * Example: "Monday - Saturday: 7:00 AM - 7:00 PM\nSunday: 8:00 AM - 5:00 PM"
 */
export function formatOperatingHours(hours: OperatingHours): string {
  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Group consecutive days with same hours
  const lines: string[] = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  let currentGroup: string[] = [];
  let currentHours = '';

  for (const day of days) {
    const dayHours = hours[day];
    const hoursStr = dayHours.closed
      ? 'Closed'
      : `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;

    if (hoursStr === currentHours) {
      // Same hours, add to group
      currentGroup.push(day.charAt(0).toUpperCase() + day.slice(1));
    } else {
      // Different hours, finalize previous group
      if (currentGroup.length > 0) {
        const daysStr = currentGroup.length > 1
          ? `${currentGroup[0]} - ${currentGroup[currentGroup.length - 1]}`
          : currentGroup[0];
        lines.push(`${daysStr}: ${currentHours}`);
      }
      // Start new group
      currentGroup = [day.charAt(0).toUpperCase() + day.slice(1)];
      currentHours = hoursStr;
    }
  }

  // Add final group
  if (currentGroup.length > 0) {
    const daysStr = currentGroup.length > 1
      ? `${currentGroup[0]} - ${currentGroup[currentGroup.length - 1]}`
      : currentGroup[0];
    lines.push(`${daysStr}: ${currentHours}`);
  }

  return lines.join('\n');
}

/**
 * Clear the cache (useful for tests or after settings update)
 */
export function clearBusinessSettingsCache(): void {
  cachedBusinessInfo = null;
  cachedOperatingHours = null;
  cacheTimestamp = 0;
}

/**
 * Client-side tax utilities
 * Note: These are for display purposes only.
 * Actual tax calculation happens server-side in checkout API.
 */

const DEFAULT_TAX_RATE = 0.08; // 8% fallback

// TaxSettings interface for future use when we implement zone-based taxes
// interface TaxSettings {
//   type: 'flat' | 'by_zone' | 'by_distance';
//   rate: number;
//   name: string;
//   zones?: { zone_id: string; rate: number }[];
// }

let cachedTaxRate: number | null = null;

/**
 * Fetch tax rate from the server for display purposes
 * This is cached in memory for the session
 */
export async function fetchTaxRate(): Promise<number> {
  // Return cached value if available
  if (cachedTaxRate !== null) {
    return cachedTaxRate;
  }

  try {
    // Fetch from a new API endpoint that returns just the tax rate
    const response = await fetch('/api/settings/tax-rate');

    if (!response.ok) {
      console.warn('Failed to fetch tax rate, using default:', DEFAULT_TAX_RATE);
      return DEFAULT_TAX_RATE;
    }

    const data = await response.json();
    const rate = data.rate || DEFAULT_TAX_RATE;
    cachedTaxRate = rate;
    return rate;
  } catch (error) {
    console.error('Error fetching tax rate:', error);
    return DEFAULT_TAX_RATE;
  }
}

/**
 * Calculate estimated tax for display purposes
 * Note: Actual tax is calculated server-side
 */
export function calculateEstimatedTax(subtotal: number, taxRate: number): number {
  return subtotal * taxRate;
}

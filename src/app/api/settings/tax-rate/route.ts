import { NextResponse } from 'next/server';
import { getTaxRate } from '@/lib/tax';

/**
 * GET /api/settings/tax-rate
 * Returns the current configured tax rate for display purposes
 * This is a public endpoint as tax rates are not sensitive information
 */
export async function GET() {
  try {
    const rate = await getTaxRate();

    return NextResponse.json({
      rate,
      percentage: (rate * 100).toFixed(2),
    });
  } catch (error) {
    console.error('Error fetching tax rate:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax rate', rate: 0.08 },
      { status: 500 }
    );
  }
}

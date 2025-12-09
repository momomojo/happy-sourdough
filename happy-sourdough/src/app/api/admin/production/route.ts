import { NextRequest, NextResponse } from 'next/server';
import { getProductionList, markItemComplete } from '@/lib/supabase/admin/production';

/**
 * GET /api/admin/production?date=YYYY-MM-DD
 * Fetch production list for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const productionList = await getProductionList(date);

    return NextResponse.json(productionList);
  } catch (error) {
    console.error('Error fetching production list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production list' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/production
 * Mark production items as complete
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, variantId, date, completed } = body;

    if (!productId || !date || typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: productId, date, completed' },
        { status: 400 }
      );
    }

    const result = await markItemComplete(productId, variantId || null, date, completed);

    return NextResponse.json({ success: result });
  } catch (error) {
    console.error('Error updating production item:', error);
    return NextResponse.json(
      { error: 'Failed to update production item' },
      { status: 500 }
    );
  }
}

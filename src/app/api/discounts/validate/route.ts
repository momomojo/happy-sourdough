import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { discountLimiter, rateLimitResponse } from '@/lib/rate-limit';

interface ValidateDiscountRequest {
  code: string;
  subtotal: number;
}

export async function POST(request: NextRequest) {
  // Rate limiting: 20 discount validations per minute per IP (stricter to prevent brute force)
  const rateLimitResult = await discountLimiter.check(request, 20, 'DISCOUNT');
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  try {
    const body: ValidateDiscountRequest = await request.json();
    const { code, subtotal } = body;

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json(
        { error: 'Code and subtotal are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find the discount code (case-insensitive)
    interface DiscountCode {
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
    }
    const { data: discountCode, error: discountError } = await (supabase
      .from('discount_codes') as ReturnType<typeof supabase.from>)
      .select('*')
      .ilike('code', code)
      .single() as { data: DiscountCode | null; error: unknown };

    if (discountError || !discountCode) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 404 }
      );
    }

    // Validate discount code is active
    if (!discountCode.is_active) {
      return NextResponse.json(
        { error: 'This discount code is no longer active' },
        { status: 400 }
      );
    }

    // Check if code has reached max uses
    if (discountCode.max_uses !== null && discountCode.current_uses >= discountCode.max_uses) {
      return NextResponse.json(
        { error: 'This discount code has reached its usage limit' },
        { status: 400 }
      );
    }

    // Check if code is within valid date range
    const now = new Date();
    if (discountCode.valid_from && new Date(discountCode.valid_from) > now) {
      return NextResponse.json(
        { error: 'This discount code is not yet valid' },
        { status: 400 }
      );
    }

    if (discountCode.valid_until && new Date(discountCode.valid_until) < now) {
      return NextResponse.json(
        { error: 'This discount code has expired' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (discountCode.min_order_amount !== null && subtotal < discountCode.min_order_amount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of $${discountCode.min_order_amount.toFixed(2)} required for this code`,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;

    if (discountCode.discount_type === 'percentage') {
      // Percentage discount (discount_value is percentage, e.g., 10 for 10%)
      discountAmount = subtotal * (discountCode.discount_value || 0) / 100;
    } else if (discountCode.discount_type === 'fixed') {
      // Fixed amount discount (discount_value is in dollars)
      discountAmount = discountCode.discount_value || 0;
    }
    // Note: 'free_delivery' type will be handled in checkout by setting delivery fee to 0

    // Return valid discount information
    return NextResponse.json({
      valid: true,
      discountCodeId: discountCode.id,
      code: discountCode.code,
      description: discountCode.description,
      discountType: discountCode.discount_type,
      discountAmount: Math.min(discountAmount, subtotal), // Don't exceed subtotal
      discountValue: discountCode.discount_value,
    });

  } catch (error) {
    console.error('Discount validation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

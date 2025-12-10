import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check here if you have admin_users table
    // For now, we'll allow any authenticated user to create discount codes

    const body = await request.json();
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_uses,
      valid_from,
      valid_until,
      is_active,
    } = body;

    // Validate required fields
    if (!code || !discount_type) {
      return NextResponse.json(
        { error: 'Code and discount type are required' },
        { status: 400 }
      );
    }

    // Validate discount_value is provided for percentage and fixed types
    if ((discount_type === 'percentage' || discount_type === 'fixed') && !discount_value) {
      return NextResponse.json(
        { error: 'Discount value is required for percentage and fixed discounts' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const { data: existingCode } = await (supabase
      .from('discount_codes') as ReturnType<typeof supabase.from>)
      .select('id')
      .ilike('code', code)
      .single();

    if (existingCode) {
      return NextResponse.json(
        { error: 'A discount code with this code already exists' },
        { status: 409 }
      );
    }

    // Create discount code
    const { data: discountCode, error: createError } = await (supabase
      .from('discount_codes') as ReturnType<typeof supabase.from>)
      .insert({
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        min_order_amount,
        max_uses,
        current_uses: 0,
        valid_from,
        valid_until,
        is_active,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating discount code:', createError);
      return NextResponse.json(
        { error: 'Failed to create discount code' },
        { status: 500 }
      );
    }

    return NextResponse.json(discountCode, { status: 201 });

  } catch (error) {
    console.error('Error in discount creation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

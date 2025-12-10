import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncProductToStripe, archiveStripeProduct } from '@/lib/stripe/products';

/**
 * Sync a product to Stripe (create or update)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, name, description, imageUrl, basePrice, stripeProductId, stripePriceId } = body;

    if (!productId || !name || basePrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Sync to Stripe
    const result = await syncProductToStripe({
      productId,
      name,
      description,
      imageUrl,
      basePrice,
      stripeProductId,
      stripePriceId,
    });

    // Update Supabase with Stripe IDs
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stripe_product_id: result.stripeProductId,
        stripe_price_id: result.stripePriceId,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product with Stripe IDs:', updateError);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stripeProductId: result.stripeProductId,
      stripePriceId: result.stripePriceId,
    });
  } catch (error) {
    console.error('Stripe sync error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync with Stripe' },
      { status: 500 }
    );
  }
}

/**
 * Archive a product in Stripe (when deleted)
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stripeProductId = searchParams.get('stripeProductId');

    if (!stripeProductId) {
      return NextResponse.json({ error: 'Missing stripeProductId' }, { status: 400 });
    }

    // Archive in Stripe
    await archiveStripeProduct(stripeProductId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stripe archive error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to archive in Stripe' },
      { status: 500 }
    );
  }
}

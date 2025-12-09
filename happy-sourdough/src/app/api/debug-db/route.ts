import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Check 1: Products
        const { count: productsCount, error: productsError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        // Check 2: Variants
        const { count: variantsCount, error: variantsError } = await supabase
            .from('product_variants')
            .select('*', { count: 'exact', head: true });

        // Check 3: Time Slots
        const { count: slotsCount, error: slotsError } = await supabase
            .from('time_slots')
            .select('*', { count: 'exact', head: true });

        // Check 4: Delivery Zones
        const { count: zonesCount, error: zonesError } = await supabase
            .from('delivery_zones')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            status: 'check_complete',
            tables: {
                products: { exists: !productsError, count: productsCount, error: productsError },
                variants: { exists: !variantsError, count: variantsCount, error: variantsError },
                time_slots: { exists: !slotsError, count: slotsCount, error: slotsError },
                delivery_zones: { exists: !zonesError, count: zonesCount, error: zonesError },
            },
            env: {
                url_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                key_configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'crash',
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

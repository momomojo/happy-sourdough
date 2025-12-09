
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    const supabase = await createClient();
    const results: any = {};

    try {
        // 1. Delivery Zones
        const zones = [
            { name: 'Zone 1', description: '0-3 miles from bakery', zip_codes: ['90210', '90211', '90212'], min_order: 25.00, delivery_fee: 0.00, estimated_time_minutes: 30, sort_order: 1 },
            { name: 'Zone 2', description: '3-7 miles from bakery', zip_codes: ['90213', '90214', '90215', '90216'], min_order: 40.00, delivery_fee: 5.00, free_delivery_threshold: 75.00, estimated_time_minutes: 45, sort_order: 2 },
            { name: 'Zone 3', description: '7-12 miles from bakery', zip_codes: ['90217', '90218', '90219', '90220', '90221'], min_order: 60.00, delivery_fee: 10.00, free_delivery_threshold: 100.00, estimated_time_minutes: 60, sort_order: 3 }
        ];
        // Upsert zones based on name to avoid duplicates
        const { data: zData, error: zError } = await supabase.from('delivery_zones').upsert(zones, { onConflict: 'name' }).select();
        results.zones = { count: zData?.length, error: zError };

        // 2. Products
        const products = [
            { name: 'Classic Sourdough Loaf', slug: 'classic-sourdough-loaf', description: 'Our signature sourdough, crafted with a 10-year-old starter. Crispy crust, tangy flavor, and perfect crumb structure.', short_description: 'Our signature 10-year starter sourdough', base_price: 8.50, category: 'bread', lead_time_hours: 24, allergens: ['wheat'], dietary_info: ['vegan'], is_featured: true, image_url: '/images/products/classic-sourdough.jpg' },
            { name: 'Whole Wheat Sourdough', slug: 'whole-wheat-sourdough', description: 'Hearty whole wheat sourdough with a nutty flavor and dense, satisfying texture.', short_description: 'Hearty whole wheat with nutty flavor', base_price: 9.00, category: 'bread', lead_time_hours: 24, allergens: ['wheat'], dietary_info: ['vegan'], is_featured: false, image_url: '/images/products/whole-wheat-sourdough.jpg' },
            { name: 'Olive Rosemary Sourdough', slug: 'olive-rosemary-sourdough', description: 'Mediterranean-inspired sourdough studded with kalamata olives and fresh rosemary.', short_description: 'Mediterranean olives and fresh rosemary', base_price: 11.00, category: 'bread', lead_time_hours: 24, allergens: ['wheat'], dietary_info: ['vegan'], is_featured: true, image_url: '/images/products/olive-rosemary.jpg' },
            { name: 'Cinnamon Raisin Sourdough', slug: 'cinnamon-raisin-sourdough', description: 'Sweet and aromatic sourdough swirled with cinnamon and plump raisins. Perfect for breakfast toast.', short_description: 'Sweet cinnamon swirl with raisins', base_price: 10.50, category: 'bread', lead_time_hours: 24, allergens: ['wheat'], dietary_info: ['vegan'], is_featured: false, image_url: '/images/products/cinnamon-raisin.jpg' },
            { name: 'Jalapeño Cheddar Sourdough', slug: 'jalapeno-cheddar-sourdough', description: 'Spicy jalapeños and sharp cheddar cheese folded into our classic sourdough.', short_description: 'Spicy jalapeños with sharp cheddar', base_price: 12.00, category: 'bread', lead_time_hours: 24, allergens: ['wheat', 'dairy'], dietary_info: [], is_featured: false, image_url: '/images/products/jalapeno-cheddar.jpg' },
            { name: 'Sourdough Croissant', slug: 'sourdough-croissant', description: 'Flaky, buttery croissant made with sourdough for extra depth of flavor. 72-hour fermentation process.', short_description: 'Flaky butter croissant with sourdough tang', base_price: 4.50, category: 'pastry', lead_time_hours: 24, allergens: ['wheat', 'dairy', 'eggs'], dietary_info: [], is_featured: true, image_url: '/images/products/croissant.jpg' }
        ];

        // Upsert products
        const { data: pData, error: pError } = await supabase.from('products').upsert(products, { onConflict: 'slug' }).select();
        results.products = { count: pData?.length, error: pError };

        // 3. Variants (Need product IDs)
        if (pData) {
            const loaf = pData.find(p => p.slug === 'classic-sourdough-loaf');
            const croissant = pData.find(p => p.slug === 'sourdough-croissant');

            const variants = [];
            if (loaf) {
                variants.push({ product_id: loaf.id, name: 'Regular (1.5 lb)', price_adjustment: 0, is_default: true, sort_order: 1 });
                variants.push({ product_id: loaf.id, name: 'Large (2.5 lb)', price_adjustment: 4.00, sort_order: 2 });
            }
            if (croissant) {
                variants.push({ product_id: croissant.id, name: 'Plain', price_adjustment: 0, is_default: true, sort_order: 1 });
                variants.push({ product_id: croissant.id, name: 'Ham & Cheese', price_adjustment: 2.50, sort_order: 2 });
            }

            if (variants.length > 0) {
                // Cannot easily upsert variants without unique key other than ID, but assuming clean slate or just insert
                // Using delete then insert for variants to avoid duplicates if possible, or just insert
                const { error: vError } = await supabase.from('product_variants').insert(variants);
                results.variants = { error: vError };
            }
        }

        // 4. Time Slots (Next 7 days)
        const slots = [];
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            slots.push({ date: dateStr, window_start: '08:00', window_end: '10:00', slot_type: 'pickup', max_orders: 15 });
            slots.push({ date: dateStr, window_start: '10:00', window_end: '12:00', slot_type: 'both', max_orders: 12 });
            slots.push({ date: dateStr, window_start: '14:00', window_end: '16:00', slot_type: 'both', max_orders: 12 });
        }
        const { count: sCount, error: sError } = await supabase.from('time_slots').insert(slots).select();
        results.slots = { count: sCount, error: sError };

        return NextResponse.json({ status: 'success', results });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

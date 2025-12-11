import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createAdminClient();
        const { data, error } = await supabase.from('orders').select('*').limit(1);

        if (error) {
            return NextResponse.json({ success: false, error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message, stack: err.stack }, { status: 500 });
    }
}

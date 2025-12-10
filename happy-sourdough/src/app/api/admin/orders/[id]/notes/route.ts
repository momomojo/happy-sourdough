import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { internal_notes } = body;

    if (typeof internal_notes !== 'string') {
      return NextResponse.json(
        { error: 'Invalid notes format' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    const { error } = await (supabase
      .from('orders') as ReturnType<typeof supabase.from>)
      .update({ internal_notes })
      .eq('id', id);

    if (error) {
      console.error('Error updating order notes:', error);
      return NextResponse.json(
        { error: 'Failed to update order notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in order notes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

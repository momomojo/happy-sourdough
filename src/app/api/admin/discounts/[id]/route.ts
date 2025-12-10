import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/supabase/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // SECURITY: Check if user is admin (verified against admin_users table)
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { is_active } = body;

    // Update discount code
    const { data: discountCode, error: updateError } = await (supabase
      .from('discount_codes') as ReturnType<typeof supabase.from>)
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating discount code:', updateError);
      return NextResponse.json(
        { error: 'Failed to update discount code' },
        { status: 500 }
      );
    }

    return NextResponse.json(discountCode);

  } catch (error) {
    console.error('Error in discount update:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // SECURITY: Check if user is admin (verified against admin_users table)
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete discount code
    const { error: deleteError } = await (supabase
      .from('discount_codes') as ReturnType<typeof supabase.from>)
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting discount code:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete discount code' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in discount deletion:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
